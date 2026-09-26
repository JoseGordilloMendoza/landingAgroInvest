<?php
/**
 * POST /api/registro.php — recibe el formulario de la landing.
 *
 * 1) valida y protege la petición,  2) guarda en MySQL (fuente de verdad),
 * 3) responde al visitante,          4) copia la fila a Google Sheets en segundo plano.
 */
define('REGISTRO_APP', true);
require __DIR__ . '/lib.php';

ob_start();
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
header('Referrer-Policy: no-referrer');

function respond($status, array $body)
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
}

/** Cierra la conexión con el visitante para poder seguir trabajando (Sheets) sin que espere. */
function finish_response()
{
    ignore_user_abort(true);
    header('Content-Length: ' . ob_get_length());
    header('Connection: close');
    ob_end_flush();
    flush();
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    } elseif (function_exists('litespeed_finish_request')) {
        litespeed_finish_request();
    }
}

$cfg = load_config();

// ---- 1. Petición válida -------------------------------------------------------
if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, array('ok' => false, 'error' => 'method'));
    exit;
}
if (empty($cfg['db']['dsn'])) {
    log_line($cfg, 'config_missing');
    respond(500, array('ok' => false, 'error' => 'server'));
    exit;
}
if (!origin_allowed($cfg)) {
    respond(403, array('ok' => false, 'error' => 'origin'));
    exit;
}
$length = isset($_SERVER['CONTENT_LENGTH']) ? (int) $_SERVER['CONTENT_LENGTH'] : 0;
if ($length > 16384) {
    respond(413, array('ok' => false, 'error' => 'too_large'));
    exit;
}

try {
    $pdo = db_connect($cfg);
    $ip = client_ip($cfg);
    $now = date('Y-m-d H:i:s');

    // ---- 2. Límite por IP ------------------------------------------------------
    if (mt_rand(1, 20) === 1) { // limpieza ocasional
        $pdo->prepare('DELETE FROM intentos WHERE created_at < ?')->execute(array(date('Y-m-d H:i:s', time() - 86400)));
    }
    $hourAgo = date('Y-m-d H:i:s', time() - 3600);
    $st = $pdo->prepare('SELECT COUNT(*) FROM intentos WHERE ip = ? AND created_at >= ?');
    $st->execute(array($ip, $hourAgo));
    $maxAttempts = isset($cfg['max_intentos_hora']) ? (int) $cfg['max_intentos_hora'] : 20;
    if ((int) $st->fetchColumn() >= $maxAttempts) {
        respond(429, array('ok' => false, 'error' => 'rate_limited'));
        exit;
    }
    $pdo->prepare('INSERT INTO intentos (ip, created_at) VALUES (?, ?)')->execute(array($ip, $now));

    $st = $pdo->prepare('SELECT COUNT(*) FROM registros WHERE ip = ? AND created_at >= ?');
    $st->execute(array($ip, $hourAgo));
    $maxRegs = isset($cfg['max_registros_hora']) ? (int) $cfg['max_registros_hora'] : 5;
    if ((int) $st->fetchColumn() >= $maxRegs) {
        respond(429, array('ok' => false, 'error' => 'rate_limited'));
        exit;
    }

    // ---- 3. Anti-bots (responden "ok" para no darles pistas) -----------------------
    $honeypot = isset($_POST['website']) ? $_POST['website'] : '';
    $elapsed = isset($_POST['t']) && is_string($_POST['t']) && ctype_digit($_POST['t']) ? (int) $_POST['t'] : -1;
    if ($honeypot !== '' || $elapsed < 2000 || $elapsed > 604800000) {
        log_line($cfg, 'bot_suspect ip=' . $ip . ' hp=' . ($honeypot !== '' ? 1 : 0) . ' t=' . $elapsed);
        respond(200, array('ok' => true));
        exit;
    }
    if (!turnstile_ok($cfg)) {
        respond(400, array('ok' => false, 'error' => 'captcha'));
        exit;
    }

    // ---- 4. Validación y normalización -------------------------------------------
    $errors = array();

    $nombre = clean_text(isset($_POST['nombre']) ? $_POST['nombre'] : '', 100);
    if (mb_strlen($nombre, 'UTF-8') < 2 || !preg_match('/\p{L}/u', $nombre)) {
        $errors['nombre'] = 'Escribe tu nombre y apellido.';
    }

    $whatsapp = normalize_phone(isset($_POST['whatsapp']) ? $_POST['whatsapp'] : '');
    if ($whatsapp === null) {
        $errors['whatsapp'] = 'Escribe un número de WhatsApp válido (ej. +51 999 999 999).';
    }

    $email = strtolower(clean_text(isset($_POST['email']) ? $_POST['email'] : '', 120));
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Escribe un correo válido.';
    }

    $interesKey = isset($_POST['interes']) && is_string($_POST['interes']) ? $_POST['interes'] : '';
    if ($interesKey !== '' && !isset(INTERESES[$interesKey])) {
        $errors['interes'] = 'Elige una opción de la lista.';
    }

    $consent = isset($_POST['consentimiento']) && is_string($_POST['consentimiento'])
        && in_array(strtolower($_POST['consentimiento']), array('1', 'on', 'true', 'si', 'sí'), true);
    if (!$consent) {
        $errors['consentimiento'] = 'Debes aceptar la Política de Privacidad para registrarte.';
    }

    $fuente = clean_text(isset($_POST['fuente']) ? $_POST['fuente'] : '', 60);
    $fuente = preg_replace('/[^\w\-. ]/u', '', $fuente);

    if ($errors) {
        respond(422, array('ok' => false, 'error' => 'validation', 'fields' => $errors));
        exit;
    }

    // ---- 5. Guardar (el correo es único: un duplicado no crea otra fila) -------------
    $row = array(
        'nombre' => $nombre,
        'whatsapp' => $whatsapp,
        'email' => $email,
        'interes' => $interesKey !== '' ? INTERESES[$interesKey] : '',
        'fuente' => $fuente,
    );
    $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? substr(clean_text($_SERVER['HTTP_USER_AGENT'], 255), 0, 255) : '';

    try {
        $pdo->prepare(
            'INSERT INTO registros (created_at, nombre, whatsapp, email, interes, consentimiento_at, fuente, ip, user_agent, sheet_synced, sheet_attempts, sheet_error)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, \'\')'
        )->execute(array($now, $nombre, $whatsapp, $email, $row['interes'], $now, $fuente, $ip, $userAgent));
        $row['id'] = (int) $pdo->lastInsertId();
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') { // correo ya registrado: se responde igual, sin revelarlo
            respond(200, array('ok' => true));
            exit;
        }
        throw $e;
    }

    // ---- 6. Responder ya y copiar a Sheets en segundo plano ------------------------
    respond(200, array('ok' => true));
    finish_response();
    // Solo se habla con Google si el visitante ya quedó libre; si no, lo recoge sync-pendientes.php (cron).
    $canDetach = function_exists('fastcgi_finish_request') || function_exists('litespeed_finish_request');
    if ($canDetach || !empty($cfg['force_inline_sync'])) {
        sync_row($pdo, $cfg, $row);
    }
} catch (Throwable $e) {
    log_line($cfg, 'error ' . get_class($e) . ': ' . $e->getMessage());
    if (!headers_sent()) {
        ob_clean();
        respond(500, array('ok' => false, 'error' => 'server'));
    }
}

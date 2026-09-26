<?php
/**
 * Funciones compartidas del backend de registro.
 * No se puede abrir desde el navegador: solo lo incluyen registro.php y sync-pendientes.php.
 */
if (!defined('REGISTRO_APP')) {
    http_response_code(403);
    exit;
}

date_default_timezone_set('America/Lima');

/** Opciones válidas del campo "interés" (clave del formulario => texto que se guarda). */
const INTERESES = array(
    'inmobiliario' => 'Tierra y Agro (Patrimonio Tangible)',
    'finanzas'     => 'Finanzas e Inteligencia de Capital',
    'crecimiento'  => 'Crecimiento Personal y Liderazgo',
    'inversion'    => 'Inversión y Estrategia Patrimonial',
);

/**
 * Busca la configuración FUERA de la carpeta pública primero (más seguro):
 *   /home/USUARIO/registro-config.php
 * y como alternativa api/config.php (bloqueado por .htaccess).
 */
function load_config()
{
    $candidates = array(
        getenv('REGISTRO_CONFIG') ?: '',
        dirname(__DIR__, 3) . '/registro-config.php',
        dirname(__DIR__, 2) . '/registro-config.php',
        __DIR__ . '/config.php',
    );
    foreach ($candidates as $path) {
        if ($path !== '' && is_file($path)) {
            $cfg = require $path;
            if (is_array($cfg)) {
                return $cfg;
            }
        }
    }
    return array();
}

function db_connect(array $cfg)
{
    $db = isset($cfg['db']) ? $cfg['db'] : array();
    return new PDO(
        isset($db['dsn']) ? $db['dsn'] : '',
        isset($db['user']) ? $db['user'] : null,
        isset($db['pass']) ? $db['pass'] : null,
        array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        )
    );
}

/** Registra un evento sin datos personales (solo ids y códigos). */
function log_line(array $cfg, $message)
{
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $message . "\n";
    $file = isset($cfg['log_file']) ? $cfg['log_file'] : '';
    if ($file !== '') {
        @file_put_contents($file, $line, FILE_APPEND | LOCK_EX);
    } else {
        error_log(trim($line));
    }
}

/** Texto plano de una sola línea: sin caracteres de control, espacios colapsados y con largo máximo. */
function clean_text($value, $max)
{
    if (!is_string($value)) {
        return '';
    }
    $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value);
    if ($s === null) {
        return '';
    }
    $s = trim(preg_replace('/\s+/u', ' ', $s));
    return mb_substr($s, 0, $max, 'UTF-8');
}

/**
 * Devuelve el teléfono en formato +51 999 999 999 o null si no es válido.
 * Con "+" acepta cualquier país (8-15 dígitos). Sin "+" solo acepta números peruanos.
 */
function normalize_phone($raw)
{
    if (!is_string($raw)) {
        return null;
    }
    $s = preg_replace('/[^\d+]/', '', $raw);
    $digits = preg_replace('/\D/', '', $s);
    if ($digits === '' || strlen($digits) > 15) {
        return null;
    }
    if (isset($s[0]) && $s[0] === '+') {
        if (strlen($digits) < 8) {
            return null;
        }
    } elseif (strlen($digits) === 9 && $digits[0] === '9') {
        $digits = '51' . $digits;
    } elseif (strlen($digits) === 11 && substr($digits, 0, 2) === '51') {
        // ya trae el código de país sin "+"
    } else {
        return null;
    }
    if (strlen($digits) === 11 && substr($digits, 0, 2) === '51') {
        return '+51 ' . substr($digits, 2, 3) . ' ' . substr($digits, 5, 3) . ' ' . substr($digits, 8, 3);
    }
    return '+' . $digits;
}

function client_ip(array $cfg)
{
    $header = isset($cfg['trusted_ip_header']) ? $cfg['trusted_ip_header'] : '';
    if ($header !== '' && !empty($_SERVER[$header])) {
        $ip = trim(explode(',', $_SERVER[$header])[0]);
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }
    return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
}

/** El navegador debe declarar que viene de nuestro propio sitio (Origin o Referer). */
function origin_allowed(array $cfg)
{
    $allowed = isset($cfg['allowed_hosts']) ? $cfg['allowed_hosts'] : array();
    if (!$allowed) {
        return true; // sin lista configurada (solo desarrollo)
    }
    $source = !empty($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN']
        : (!empty($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '');
    if ($source === '') {
        return false;
    }
    $host = parse_url($source, PHP_URL_HOST);
    if (!is_string($host)) {
        return false;
    }
    return in_array(strtolower($host), array_map('strtolower', $allowed), true);
}

/** Verificación opcional de Cloudflare Turnstile (solo si hay clave secreta en la configuración). */
function turnstile_ok(array $cfg)
{
    if (empty($cfg['turnstile_secret'])) {
        return true;
    }
    $response = isset($_POST['cf-turnstile-response']) ? $_POST['cf-turnstile-response'] : '';
    if (!is_string($response) || $response === '') {
        return false;
    }
    $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    curl_setopt_array($ch, array(
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query(array(
            'secret' => $cfg['turnstile_secret'],
            'response' => $response,
            'remoteip' => client_ip($cfg),
        )),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 8,
    ));
    $body = curl_exec($ch);
    curl_close($ch);
    $data = is_string($body) ? json_decode($body, true) : null;
    return is_array($data) && !empty($data['success']);
}

/**
 * Copia una fila a Google Sheets por medio de Apps Script (servidor a servidor).
 * Devuelve array(bool $ok, string $codigo).
 *
 * OJO: se usa CURLOPT_POST y NO CURLOPT_CUSTOMREQUEST. Google responde con una redirección
 * y cURL debe convertirla a GET; forzar "POST" en la redirección da error 411.
 */
function push_to_sheet(array $cfg, array $row)
{
    $url = isset($cfg['apps_script_url']) ? $cfg['apps_script_url'] : '';
    $token = isset($cfg['apps_script_token']) ? $cfg['apps_script_token'] : '';
    if ($url === '' || $token === '') {
        return array(false, 'not_configured');
    }
    $payload = json_encode(array(
        'token' => $token,
        'nombre' => $row['nombre'],
        'whatsapp' => $row['whatsapp'],
        'email' => $row['email'],
        'interes' => $row['interes'],
        'consentimiento' => true,
        'fuente' => $row['fuente'],
    ), JSON_UNESCAPED_UNICODE);

    $ch = curl_init($url);
    curl_setopt_array($ch, array(
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => array('Content-Type: application/json'),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ));
    $body = curl_exec($ch);
    $err = curl_errno($ch);
    curl_close($ch);

    if ($err !== 0 || !is_string($body)) {
        return array(false, 'curl_' . $err);
    }
    $data = json_decode($body, true);
    if (!is_array($data)) {
        return array(false, 'bad_response'); // Google a veces devuelve HTML si recibe ráfagas
    }
    if (!empty($data['ok'])) {
        return array(true, '');
    }
    return array(false, isset($data['error']) ? substr((string) $data['error'], 0, 40) : 'rejected');
}

/** Intenta sincronizar una fila y actualiza su estado en la base. */
function sync_row(PDO $pdo, array $cfg, array $row, $attempts = 2)
{
    $code = 'unknown';
    for ($i = 0; $i < $attempts; $i++) {
        list($ok, $code) = push_to_sheet($cfg, $row);
        if ($ok) {
            $pdo->prepare('UPDATE registros SET sheet_synced = 1, sheet_error = \'\' WHERE id = ?')
                ->execute(array($row['id']));
            return true;
        }
        if ($code === 'invalid_name' || $code === 'invalid_phone' || $code === 'invalid_email' || $code === 'unauthorized') {
            break; // reintentar no ayuda
        }
        if ($i + 1 < $attempts) {
            sleep(2);
        }
    }
    $pdo->prepare('UPDATE registros SET sheet_attempts = sheet_attempts + 1, sheet_error = ? WHERE id = ?')
        ->execute(array(substr($code, 0, 60), $row['id']));
    log_line($cfg, 'sheet_sync_failed id=' . $row['id'] . ' code=' . $code);
    return false;
}

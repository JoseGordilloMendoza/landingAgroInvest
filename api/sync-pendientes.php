<?php
/**
 * Reintenta enviar a Google Sheets los registros que no llegaron (Google falló o estaba saturado).
 * SOLO se ejecuta por consola / tarea programada (cPanel → Cron Jobs), nunca desde el navegador:
 *
 *   php /home/USUARIO/public_html/inversionista/api/sync-pendientes.php
 *
 * Recomendado: cada 15 minutos.
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
define('REGISTRO_APP', true);
require __DIR__ . '/lib.php';

$cfg = load_config();
$pdo = db_connect($cfg);

$rows = $pdo->query(
    'SELECT id, nombre, whatsapp, email, interes, fuente FROM registros
     WHERE sheet_synced = 0 AND sheet_attempts < 10 ORDER BY id LIMIT 50'
)->fetchAll();

$ok = 0;
foreach ($rows as $row) {
    if (sync_row($pdo, $cfg, $row, 1)) {
        $ok++;
    }
    sleep(2); // Apps Script responde mal a las ráfagas
}
echo 'Pendientes: ' . count($rows) . ' | enviados: ' . $ok . "\n";

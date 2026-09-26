<?php
/**
 * Plantilla de configuración. NO contiene secretos: cópiala así:
 *
 *   /home/USUARIO/registro-config.php      <- FUERA de public_html (lo más seguro)
 *
 * y completa los valores. Nunca subas el archivo real a git.
 */
return array(
    // Base de datos (cPanel → MySQL Databases). El nombre y el usuario llevan el prefijo de tu cuenta.
    'db' => array(
        'dsn'  => 'mysql:host=localhost;dbname=CUENTA_registros;charset=utf8mb4',
        'user' => 'CUENTA_registro',
        'pass' => 'CONTRASEÑA_LARGA',
    ),

    // Apps Script (Implementar → Aplicación web → URL que termina en /exec) y su TOKEN.
    'apps_script_url'   => 'https://script.google.com/macros/s/XXXXXXXX/exec',
    'apps_script_token' => 'TOKEN_LARGO_DEL_SCRIPT',

    // Solo se aceptan envíos que vengan de estos dominios.
    'allowed_hosts' => array('inversionista.agroinvest.pe'),

    // Límites por IP en una hora.
    'max_intentos_hora'  => 20,
    'max_registros_hora' => 5,

    // Registro de incidencias (sin datos personales). Ruta fuera de public_html.
    'log_file' => '/home/USUARIO/registro-errores.log',

    // Opcional: Cloudflare Turnstile (anti-bots). Déjalo vacío si no lo usas.
    'turnstile_secret' => '',

    // Opcional: solo si el sitio va detrás de un proxy (p. ej. Cloudflare): 'HTTP_CF_CONNECTING_IP'.
    'trusted_ip_header' => '',
);

/**
 * Arma el paquete para subir al hosting:  node scripts/build-deploy.js
 *
 * Resultado (carpeta ignorada por git):
 *   deploy/site/                    <- lo que se sube a la carpeta del subdominio
 *   deploy/inversionista-site.zip   <- lo mismo, comprimido (para "Extract" en el Administrador de archivos)
 *
 * Solo copia los archivos que la página realmente usa: recorre index.html, politica-privacidad.html,
 * el CSS y el JS buscando imágenes, así las fotos originales y otros restos de desarrollo se quedan fuera.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'deploy');
const SITE = path.join(OUT, 'site');

const PAGES = ['index.html', 'politica-privacidad.html'];
const CSS = ['css/styles.css', 'css/ambient.css', 'css/legal.css'];
const JS = ['js/gsap.min.js', 'js/ScrollTrigger.min.js', 'js/main.js', 'js/animations.js', 'js/ambient.js'];
const API = ['api/registro.php', 'api/lib.php', 'api/sync-pendientes.php', 'api/.htaccess'];

const HTACCESS = `# Sitio de la landing — generado por scripts/build-deploy.js
Options -Indexes
DirectoryIndex index.html

# Siempre por HTTPS
RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Nada que empiece con punto debe ser público
<FilesMatch "^\\.(?!htaccess$)">
    <IfModule mod_authz_core.c>
        Require all denied
    </IfModule>
</FilesMatch>

<IfModule mod_headers.c>
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>

<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml application/json
</IfModule>

<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/webp "access plus 7 days"
    ExpiresByType image/jpeg "access plus 7 days"
    ExpiresByType image/png "access plus 7 days"
    ExpiresByType image/svg+xml "access plus 7 days"
    ExpiresByType text/css "access plus 1 day"
    ExpiresByType application/javascript "access plus 1 day"
</IfModule>
`;

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// ---- 1. Recolectar imágenes/recursos referenciados -------------------------------
const used = new Set();
const add = (ref, baseDir) => {
  let p = ref.split('#')[0].split('?')[0];
  if (!p || /^(https?:|data:|mailto:|tel:|\/\/)/i.test(p)) return;
  try { p = decodeURIComponent(p); } catch (e) { /* tal cual */ }
  const rel = path.posix.normalize(path.posix.join(baseDir, p));
  if (rel.startsWith('..')) return;
  if (exists(rel) && fs.statSync(path.join(ROOT, rel)).isFile()) used.add(rel);
};

for (const page of PAGES) {
  const html = read(page);
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) add(m[1], '');
}
for (const css of CSS) {
  for (const m of read(css).matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) add(m[1], path.posix.dirname(css));
}
for (const js of JS) {
  for (const m of read(js).matchAll(/['"`]((?:images|assets)\/[^'"`\s]+\.(?:png|jpe?g|webp|svg|gif))['"`]/g)) add(m[1], '');
}

// ---- 2. Copiar ------------------------------------------------------------------
fs.rmSync(OUT, { recursive: true, force: true });
const files = new Set([...PAGES, ...CSS, ...JS, ...API, ...used]);
let bytes = 0;
const missing = [];
for (const rel of files) {
  if (!exists(rel)) { missing.push(rel); continue; }
  const dest = path.join(SITE, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(ROOT, rel), dest);
  bytes += fs.statSync(dest).size;
}
fs.writeFileSync(path.join(SITE, '.htaccess'), HTACCESS);

// ---- 2b. Versión automática (?v=hash) en CSS/JS: cada despliegue con cambios fuerza a los navegadores a bajar lo nuevo ----
const crypto = require('crypto');
function addCacheBusting(page) {
  const file = path.join(SITE, page);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/(href|src)="((?:css|js)\/[^"?]+)(?:\?[^"]*)?"/g, (m, attr, ref) => {
    const asset = path.join(SITE, ref);
    if (!fs.existsSync(asset)) return m;
    const hash = crypto.createHash('md5').update(fs.readFileSync(asset)).digest('hex').slice(0, 8);
    return attr + '="' + ref + '?v=' + hash + '"';
  });
  fs.writeFileSync(file, html);
}
PAGES.forEach(addCacheBusting);

// ---- 3. Comprimir (tar de Windows/macOS/Linux escribe zip con rutas "/" correctas) -------
const zip = path.join(OUT, 'inversionista-site.zip');
// En Windows se usa el tar del sistema (bsdtar): el de Git Bash toma "C:" por un servidor remoto.
const tarBin = process.platform === 'win32' ? path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe') : 'tar';
execFileSync(tarBin, ['-a', '-c', '-f', zip, '-C', SITE, '.'], { stdio: 'inherit' });

console.log(`Archivos: ${files.size - missing.length} | ${(bytes / 1048576).toFixed(1)} MB sin comprimir`);
console.log(`Zip: ${path.relative(ROOT, zip)} (${(fs.statSync(zip).size / 1048576).toFixed(1)} MB)`);
if (missing.length) console.log('AVISO, no existen:', missing.join(', '));
const dev = ['apps-script', 'node_modules', '.git', '.claude', 'api/config.php', 'api/schema.sql', 'api/config.sample.php'];
console.log('Excluido a propósito:', dev.join(', '));

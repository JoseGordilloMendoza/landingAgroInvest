/**
 * Registro de asistentes — Inversionista Imparable
 *
 * Recibe un POST JSON y agrega una fila a la hoja "Registros".
 * Está pensado para que lo llame SOLO el servidor (registro.php), nunca el navegador:
 * el token vive en las propiedades del script y en el config.php del servidor.
 *
 * Configuración (una sola vez):
 *   Configuración del proyecto → Propiedades del script → agregar
 *     TOKEN = <clave larga y aleatoria, la misma que usará registro.php>
 *   Ejecutar la función setup() y aceptar los permisos.
 *   Implementar → Nueva implementación → Aplicación web
 *     Ejecutar como: Yo   |   Quién tiene acceso: Cualquier persona
 *
 * IMPORTANTE: cada cambio de este código necesita "Administrar implementaciones →
 * Editar → Nueva versión" para que la URL /exec use el código nuevo.
 */

const SHEET_NAME = 'Registros';
const TIMEZONE = 'America/Lima';

// Las 6 primeras las escribe el script; "Estado" y "Notas" son para el equipo.
const HEADERS = ['Fecha', 'Nombre', 'WhatsApp', 'Correo', 'Interés', 'Consentimiento', 'Fuente', 'Estado', 'Notas'];
const COL_WHATSAPP = 3;
const COL_EMAIL = 4;
const AUTO_COLS = 7; // Fecha … Fuente: las escribe el script; Estado y Notas son del equipo

const INTERESES = {
  inmobiliario: 'Tierra y Agro (Patrimonio Tangible)',
  finanzas: 'Finanzas e Inteligencia de Capital',
  crecimiento: 'Crecimiento Personal y Liderazgo',
  inversion: 'Inversión y Estrategia Patrimonial',
};

/**
 * El servidor envía el TEXTO del interés ("Finanzas e Inteligencia de Capital"); el formulario usa
 * una clave ("finanzas"). Se aceptan ambas, pero solo valores de la lista: cualquier otra cosa queda vacía.
 */
function resolveInteres_(value) {
  const v = String(value == null ? '' : value).trim();
  if (INTERESES[v]) return INTERESES[v];
  const labels = Object.keys(INTERESES).map(function (k) { return INTERESES[k]; });
  return labels.indexOf(v) !== -1 ? v : '';
}

/** Comprobación de salud: no devuelve datos. */
function doGet() {
  return respond_({ ok: true, service: 'registro' });
}

function doPost(e) {
  let lock = null;
  try {
    const expected = PropertiesService.getScriptProperties().getProperty('TOKEN');
    const raw = e && e.postData && e.postData.contents;
    if (!expected || !raw || raw.length > 4000) return respond_({ ok: false, error: 'bad_request' });

    const body = JSON.parse(raw);
    if (!safeEqual_(String(body.token || ''), expected)) return respond_({ ok: false, error: 'unauthorized' });

    const nombre = clean_(body.nombre, 100);
    const whatsapp = clean_(body.whatsapp, 25);
    const email = clean_(body.email, 120).toLowerCase();
    const interes = resolveInteres_(body.interes);
    const fuente = clean_(String(body.fuente || '').replace(/[^\w\-. ]/g, ''), 60);

    if (nombre.length < 2) return respond_({ ok: false, error: 'invalid_name' });
    if (!/^\+?[0-9][0-9 ()\-]{6,20}$/.test(whatsapp)) return respond_({ ok: false, error: 'invalid_phone' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return respond_({ ok: false, error: 'invalid_email' });
    if (body.consentimiento !== true) return respond_({ ok: false, error: 'no_consent' });

    // Un solo registro a la vez: evita filas pisadas si llegan varios juntos.
    lock = LockService.getScriptLock();
    lock.waitLock(15000);

    const sheet = getSheet_();
    if (emailExists_(sheet, email)) return respond_({ ok: true, duplicate: true });

    const fecha = Utilities.formatDate(new Date(), TIMEZONE, 'dd/MM/yyyy HH:mm:ss');
    writeRow_(sheet, [fecha, nombre, whatsapp, email, interes, 'Sí (' + fecha + ')', fuente]);
    return respond_({ ok: true });
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return respond_({ ok: false, error: 'server' });
  } finally {
    if (lock) lock.releaseLock();
  }
}

/** Ejecutar una vez desde el editor: crea la hoja, los encabezados y el formato. */
function setup() {
  const sheet = getSheet_();
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setFontWeight('bold').setBackground('#0B1C38').setFontColor('#E8D9BD');
  sheet.setFrozenRows(1);
  sheet.getRange(2, 1, sheet.getMaxRows() - 1, AUTO_COLS).setNumberFormat('@'); // todo lo que escribe el script queda como texto
  sheet.setColumnWidths(1, HEADERS.length, 150);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(4, 240);
}

/** Ejecutar desde el editor para comprobar que escribe (fila de PRUEBA con datos falsos). */
function testInsert() {
  const sheet = getSheet_();
  const fecha = Utilities.formatDate(new Date(), TIMEZONE, 'dd/MM/yyyy HH:mm:ss');
  writeRow_(sheet, [fecha, 'PRUEBA Borrar', '+51 999 999 999', 'prueba+' + Date.now() + '@example.com', INTERESES.finanzas, 'Sí (' + fecha + ')', 'test']);
}

// ---------------------------------------------------------------- utilidades

/**
 * Escribe una fila como TEXTO PLANO. Se fija el formato "@" en las celdas antes de escribir:
 * si no, Sheets interpreta un "+51 999 999 999" como una fórmula incompleta (#ERROR!).
 * (appendRow no siempre respeta el formato de la columna, por eso no se usa.)
 */
function writeRow_(sheet, values) {
  const row = sheet.getLastRow() + 1;
  const range = sheet.getRange(row, 1, 1, AUTO_COLS);
  range.setNumberFormat('@');
  range.setValues([values]);

  // Red de seguridad: si el teléfono no quedó tal cual, se reescribe como texto.
  const phoneCell = sheet.getRange(row, COL_WHATSAPP);
  if (phoneCell.getDisplayValue() !== values[COL_WHATSAPP - 1]) {
    phoneCell.setNumberFormat('@').setValue(values[COL_WHATSAPP - 1]);
  }
}

/**
 * Ejecutar UNA vez desde el editor si ya hay filas con el teléfono en error (#ERROR!):
 * recupera el texto original de la fórmula y lo vuelve a guardar como texto.
 */
function repairPhones() {
  const sheet = getSheet_();
  const last = sheet.getLastRow();
  if (last < 2) return;
  const range = sheet.getRange(2, COL_WHATSAPP, last - 1, 1);
  const formulas = range.getFormulas();
  const values = range.getValues();
  let fixed = 0;
  for (let i = 0; i < formulas.length; i++) {
    const f = String(formulas[i][0] || '');
    if (f.charAt(0) === '=') {
      const cell = sheet.getRange(i + 2, COL_WHATSAPP);
      cell.setNumberFormat('@').setValue(f.slice(1).trim());
      fixed++;
    } else if (typeof values[i][0] === 'number') {
      sheet.getRange(i + 2, COL_WHATSAPP).setNumberFormat('@').setValue('+' + values[i][0]);
      fixed++;
    }
  }
  console.log('Teléfonos reparados: ' + fixed);
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

function emailExists_(sheet, email) {
  const last = sheet.getLastRow();
  if (last < 2) return false;
  const emails = sheet.getRange(2, COL_EMAIL, last - 1, 1).getValues();
  for (let i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).toLowerCase() === email) return true;
  }
  return false;
}

/**
 * Texto plano y seguro para la hoja: sin saltos de línea y sin fórmulas.
 * Un valor que empiece con = + - @ se ejecutaría como fórmula (p. ej. =HYPERLINK(...)),
 * así que se le antepone una comilla. Los teléfonos ("+51 999…") se dejan tal cual.
 */
function clean_(value, max) {
  let s = String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (s.length > max) s = s.slice(0, max);
  const looksLikePhone = /^\+?[0-9][0-9 ()\-]{5,}$/.test(s);
  if (/^[=+\-@]/.test(s) && !looksLikePhone) s = "'" + s;
  return s;
}

/** Comparación en tiempo constante para no filtrar el token por diferencias de tiempo. */
function safeEqual_(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function respond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

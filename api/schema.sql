-- Esquema de la base de datos del registro (MySQL / MariaDB).
-- Ejecutar UNA vez en phpMyAdmin, con la base de datos ya seleccionada.

CREATE TABLE IF NOT EXISTS registros (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_at        DATETIME NOT NULL,
  nombre            VARCHAR(100) NOT NULL,
  whatsapp          VARCHAR(20) NOT NULL,
  email             VARCHAR(120) NOT NULL,
  interes           VARCHAR(60) NOT NULL DEFAULT '',
  consentimiento_at DATETIME NOT NULL,
  fuente            VARCHAR(60) NOT NULL DEFAULT '',
  ip                VARCHAR(45) NOT NULL,
  user_agent        VARCHAR(255) NOT NULL DEFAULT '',
  sheet_synced      TINYINT(1) NOT NULL DEFAULT 0,
  sheet_attempts    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  sheet_error       VARCHAR(60) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  UNIQUE KEY uq_email (email),
  KEY idx_ip_created (ip, created_at),
  KEY idx_pending (sheet_synced, sheet_attempts)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Intentos de envío (para limitar por IP). Se limpia sola.
CREATE TABLE IF NOT EXISTS intentos (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ip         VARCHAR(45) NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_ip_created (ip, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

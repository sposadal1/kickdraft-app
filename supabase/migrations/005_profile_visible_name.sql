-- Migration 005: perfil público básico (nombre visible + avatar)

ALTER TABLE perfiles
  ADD COLUMN IF NOT EXISTS nombre_visible TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

UPDATE perfiles
SET nombre_visible = NULLIF(TRIM(CONCAT(nombre, ' ', apellido)), '')
WHERE nombre_visible IS NULL;

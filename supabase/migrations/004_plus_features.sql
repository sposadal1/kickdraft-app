-- ============================================================
-- Migration 004: Plus Features — Campeón/Goleador y Rachas
-- ============================================================

-- 1. Añadir columna opciones_plus a ligas (JSONB extensible, valor por defecto {})
ALTER TABLE ligas ADD COLUMN IF NOT EXISTS opciones_plus JSONB NOT NULL DEFAULT '{}';

-- 2. Tabla de predicciones por liga (campeón y goleador del torneo)
--    Una fila por (liga, usuario). INALTERABLE: no se permite UPDATE (ver trigger abajo).
CREATE TABLE IF NOT EXISTS predicciones_liga (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  liga_id UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  campeon_id INT REFERENCES equipos(id),
  goleador_nombre TEXT,
  puntos_campeon INT NOT NULL DEFAULT 0,
  puntos_goleador INT NOT NULL DEFAULT 0,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(liga_id, usuario_id)
);

-- 3. Tabla de configuración de rachas por liga
--    Columna params: JSONB para parámetros extra (ej. {"n_veces":3} para muro_defensivo)
CREATE TABLE IF NOT EXISTS rachas_config_liga (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  liga_id UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
  racha_id TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  puntos INT NOT NULL DEFAULT 5,
  params JSONB NOT NULL DEFAULT '{}',
  UNIQUE(liga_id, racha_id)
);

-- Añadir columna params si la tabla ya existía sin ella (idempotente)
ALTER TABLE rachas_config_liga ADD COLUMN IF NOT EXISTS params JSONB NOT NULL DEFAULT '{}';

-- 4. Tabla de rachas otorgadas a miembros
CREATE TABLE IF NOT EXISTS rachas_otorgadas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  liga_id UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  racha_id TEXT NOT NULL,
  partido_id INT REFERENCES partidos(id),
  puntos INT NOT NULL DEFAULT 5,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE predicciones_liga ENABLE ROW LEVEL SECURITY;
ALTER TABLE rachas_config_liga ENABLE ROW LEVEL SECURITY;
ALTER TABLE rachas_otorgadas ENABLE ROW LEVEL SECURITY;

-- predicciones_liga: todos los autenticados pueden ver; cada usuario inserta la suya (no actualiza)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'predicciones_liga' AND policyname = 'Ver predicciones de liga') THEN
    CREATE POLICY "Ver predicciones de liga" ON predicciones_liga FOR SELECT TO authenticated USING (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'predicciones_liga' AND policyname = 'Insertar propia prediccion') THEN
    CREATE POLICY "Insertar propia prediccion" ON predicciones_liga FOR INSERT WITH CHECK (auth.uid() = usuario_id);
  END IF;
END;
$$;

-- IMPORTANTE: No se crea policy de UPDATE para predicciones_liga (ni siquiera para service_role vía RLS).
-- El trigger abajo bloquea cualquier UPDATE, protegiendo la inmutabilidad de la predicción.
-- La función aplicarPuntosCampeonGoleador usa service_role y también es bloqueada por el trigger;
-- en su lugar, los puntos se aplican únicamente en la tabla miembros_liga.
CREATE OR REPLACE FUNCTION bloquear_update_predicciones_liga()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'predicciones_liga rows are immutable and cannot be updated after insertion. / Las predicciones de liga son inmutables y no pueden modificarse.';
END;
$$;

DROP TRIGGER IF EXISTS trigger_no_update_predicciones_liga ON predicciones_liga;
CREATE TRIGGER trigger_no_update_predicciones_liga
  BEFORE UPDATE ON predicciones_liga
  FOR EACH ROW EXECUTE FUNCTION bloquear_update_predicciones_liga();

-- rachas_config_liga: todos ven, sólo el creador de la liga gestiona
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rachas_config_liga' AND policyname = 'Ver config rachas') THEN
    CREATE POLICY "Ver config rachas" ON rachas_config_liga FOR SELECT TO authenticated USING (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rachas_config_liga' AND policyname = 'Creador gestiona config rachas') THEN
    CREATE POLICY "Creador gestiona config rachas" ON rachas_config_liga FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM ligas l WHERE l.id = liga_id AND l.creador_id = auth.uid()
        )
      );
  END IF;
END;
$$;

-- rachas_otorgadas: solo lectura para usuarios autenticados.
-- Los inserts se realizan exclusivamente via service_role (servidor/admin).
-- No se define policy de INSERT para el rol 'authenticated', lo que impide inserts desde el cliente.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rachas_otorgadas' AND policyname = 'Ver rachas otorgadas') THEN
    CREATE POLICY "Ver rachas otorgadas" ON rachas_otorgadas FOR SELECT TO authenticated USING (true);
  END IF;
END;
$$;

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_predicciones_liga_id ON predicciones_liga(liga_id);
CREATE INDEX IF NOT EXISTS idx_predicciones_usuario_id ON predicciones_liga(usuario_id);
CREATE INDEX IF NOT EXISTS idx_rachas_config_liga_id ON rachas_config_liga(liga_id);
CREATE INDEX IF NOT EXISTS idx_rachas_otorgadas_liga_id ON rachas_otorgadas(liga_id);
CREATE INDEX IF NOT EXISTS idx_rachas_otorgadas_usuario_id ON rachas_otorgadas(usuario_id);

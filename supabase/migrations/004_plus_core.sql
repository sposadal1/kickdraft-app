-- ============================================================
-- Migration 004: Plus Features — DB Core (opciones_plus, predicciones, rachas)
--
-- Scope (micro-PR 1):
--  - Add ligas.opciones_plus (jsonb)
--  - Create predicciones_liga (champion/scorer picks per liga/user)
--  - Create rachas_config_liga (per-liga streak configuration)
--  - Create rachas_otorgadas (awarded streak bonuses)
--  - Minimal RLS policies
--
-- Notes:
--  - predicciones_liga is immutable after INSERT (no UPDATE policy)
--  - streak awarding (rachas_otorgadas INSERT) should ideally be done server-side
--    (service role). For now, no public INSERT policy is created.
-- ============================================================

-- 1) ligas.opciones_plus
ALTER TABLE ligas
  ADD COLUMN IF NOT EXISTS opciones_plus JSONB NOT NULL DEFAULT '{}';

-- 2) predicciones_liga
CREATE TABLE IF NOT EXISTS predicciones_liga (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  liga_id UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  campeon_id INT REFERENCES equipos(id),
  goleador_nombre TEXT,
  puntos_campeon INT NOT NULL DEFAULT 0,
  puntos_goleador INT NOT NULL DEFAULT 0,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(liga_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_predicciones_liga_liga_id ON predicciones_liga(liga_id);
CREATE INDEX IF NOT EXISTS idx_predicciones_liga_usuario_id ON predicciones_liga(usuario_id);

-- 3) rachas_config_liga
CREATE TABLE IF NOT EXISTS rachas_config_liga (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  liga_id UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
  racha_id TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  puntos INT NOT NULL DEFAULT 5,
  UNIQUE(liga_id, racha_id)
);

CREATE INDEX IF NOT EXISTS idx_rachas_config_liga_liga_id ON rachas_config_liga(liga_id);

-- 4) rachas_otorgadas
CREATE TABLE IF NOT EXISTS rachas_otorgadas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  liga_id UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  racha_id TEXT NOT NULL,
  partido_id INT REFERENCES partidos(id),
  puntos INT NOT NULL DEFAULT 5,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rachas_otorgadas_liga_id ON rachas_otorgadas(liga_id);
CREATE INDEX IF NOT EXISTS idx_rachas_otorgadas_usuario_id ON rachas_otorgadas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_rachas_otorgadas_partido_id ON rachas_otorgadas(partido_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE predicciones_liga ENABLE ROW LEVEL SECURITY;
ALTER TABLE rachas_config_liga ENABLE ROW LEVEL SECURITY;
ALTER TABLE rachas_otorgadas ENABLE ROW LEVEL SECURITY;

-- predicciones_liga
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'predicciones_liga' AND policyname = 'predicciones_select_authed'
  ) THEN
    CREATE POLICY predicciones_select_authed
      ON predicciones_liga
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'predicciones_liga' AND policyname = 'predicciones_insert_own'
  ) THEN
    CREATE POLICY predicciones_insert_own
      ON predicciones_liga
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = usuario_id);
  END IF;
END;
$$;

-- No UPDATE policy on predicciones_liga => immutable after insert (from client)

-- rachas_config_liga
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'rachas_config_liga' AND policyname = 'rachas_config_select_authed'
  ) THEN
    CREATE POLICY rachas_config_select_authed
      ON rachas_config_liga
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'rachas_config_liga' AND policyname = 'rachas_config_manage_creator'
  ) THEN
    CREATE POLICY rachas_config_manage_creator
      ON rachas_config_liga
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM ligas l
          WHERE l.id = liga_id AND l.creador_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM ligas l
          WHERE l.id = liga_id AND l.creador_id = auth.uid()
        )
      );
  END IF;
END;
$$;

-- rachas_otorgadas (read-only for authenticated)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'rachas_otorgadas' AND policyname = 'rachas_otorgadas_select_authed'
  ) THEN
    CREATE POLICY rachas_otorgadas_select_authed
      ON rachas_otorgadas
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END;
$$;

-- NOTE: No INSERT policy for rachas_otorgadas (should be inserted by server/service role).

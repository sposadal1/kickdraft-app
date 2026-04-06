-- ============================================================
-- Migration 002: Liga Mundial + Tiebreak + Auth improvements
-- ============================================================

-- 1. Add tiebreak columns to miembros_liga
ALTER TABLE miembros_liga
  ADD COLUMN IF NOT EXISTS exactos INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS marcadores_acertados INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS peso_fase_ponderado NUMERIC(10,2) NOT NULL DEFAULT 0;

-- 2. Add es_global flag to ligas table
ALTER TABLE ligas
  ADD COLUMN IF NOT EXISTS es_global BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS premio_descripcion TEXT;

-- Ensure only one global league exists
CREATE UNIQUE INDEX IF NOT EXISTS ligas_es_global_unique ON ligas (es_global) WHERE es_global = TRUE;

-- 3. Create the Liga Mundial (global league) if it doesn't exist
DO $$
DECLARE
  v_liga_id UUID;
BEGIN
  SELECT id INTO v_liga_id FROM ligas WHERE es_global = TRUE LIMIT 1;

  IF v_liga_id IS NULL THEN
    INSERT INTO ligas (nombre, codigo_invitacion, creador_id, es_global, premio_descripcion)
    VALUES (
      'Liga Mundial',
      'MUNDIAL0',
      (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
      TRUE,
      'Premio por anunciar — ¡el mejor pronosticador del Mundial 2026!'
    )
    RETURNING id INTO v_liga_id;
  END IF;
END;
$$;

-- 4. Auto-join existing users to Liga Mundial
INSERT INTO miembros_liga (liga_id, usuario_id, total_puntos)
SELECT
  (SELECT id FROM ligas WHERE es_global = TRUE LIMIT 1),
  p.id,
  0
FROM perfiles p
WHERE NOT EXISTS (
  SELECT 1 FROM miembros_liga ml
  WHERE ml.liga_id = (SELECT id FROM ligas WHERE es_global = TRUE LIMIT 1)
    AND ml.usuario_id = p.id
);

-- 5. Trigger: auto-join new users to Liga Mundial on profile creation
CREATE OR REPLACE FUNCTION fn_auto_join_liga_mundial()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_liga_id UUID;
BEGIN
  SELECT id INTO v_liga_id FROM ligas WHERE es_global = TRUE LIMIT 1;
  IF v_liga_id IS NOT NULL THEN
    INSERT INTO miembros_liga (liga_id, usuario_id, total_puntos)
    VALUES (v_liga_id, NEW.id, 0)
    ON CONFLICT (liga_id, usuario_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_join_liga_mundial ON perfiles;
CREATE TRIGGER trg_auto_join_liga_mundial
  AFTER INSERT ON perfiles
  FOR EACH ROW EXECUTE FUNCTION fn_auto_join_liga_mundial();

-- 6. Add unique constraint on miembros_liga if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'miembros_liga_liga_id_usuario_id_key'
  ) THEN
    ALTER TABLE miembros_liga ADD CONSTRAINT miembros_liga_liga_id_usuario_id_key
      UNIQUE (liga_id, usuario_id);
  END IF;
END;
$$;

-- 7. RLS: Allow reading global league info without auth
CREATE POLICY IF NOT EXISTS "ligas_global_readable" ON ligas
  FOR SELECT USING (es_global = TRUE OR auth.uid() IS NOT NULL);

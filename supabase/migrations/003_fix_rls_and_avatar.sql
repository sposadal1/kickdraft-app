-- ============================================================
-- Migration 003: Corregir RLS políticas faltantes y asegurar
--               columna avatar_url en ligas
-- ============================================================

-- 1. Asegurar que avatar_url exista en la tabla ligas.
--    Si la BD fue creada sin schema.sql completo o con una versión
--    anterior del esquema, esta columna podría faltar, generando el
--    error "Could not find the 'avatar_url' column of 'ligas' in
--    the schema cache" al insertar/actualizar una liga con avatar.
ALTER TABLE ligas ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Política UPDATE para ligas.
--    Sin esta política el creador no puede editar el nombre ni el
--    avatar de su liga (el UPDATE devuelve 0 filas sin error visible).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ligas' AND policyname = 'Creadores actualizan sus ligas'
  ) THEN
    CREATE POLICY "Creadores actualizan sus ligas"
      ON ligas FOR UPDATE
      USING (auth.uid() = creador_id);
  END IF;
END;
$$;

-- 3. Política DELETE para ligas.
--    Sin esta política el creador no puede eliminar su propia liga.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ligas' AND policyname = 'Creadores eliminan sus ligas'
  ) THEN
    CREATE POLICY "Creadores eliminan sus ligas"
      ON ligas FOR DELETE
      USING (auth.uid() = creador_id);
  END IF;
END;
$$;

-- 4. Política DELETE para miembros_liga.
--    Permite que un miembro salga voluntariamente de una liga o que
--    el creador de la liga lo expulse. Sin esta política la función
--    "expulsar miembro" falla silenciosamente.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'miembros_liga'
      AND policyname = 'Miembros salen o son expulsados de liga'
  ) THEN
    CREATE POLICY "Miembros salen o son expulsados de liga"
      ON miembros_liga FOR DELETE
      USING (
        auth.uid() = usuario_id
        OR EXISTS (
          SELECT 1 FROM ligas l
          WHERE l.id = liga_id
            AND l.creador_id = auth.uid()
        )
      );
  END IF;
END;
$$;

-- 5. Política SELECT en perfiles para ver compañeros de liga.
--    La política original sólo permite ver el propio perfil, por lo
--    que al cargar la clasificación de una liga los perfiles de otros
--    miembros llegan como NULL. Esta política amplía el acceso de
--    forma segura: sólo puedes ver perfiles de personas que
--    comparten al menos una liga contigo.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'perfiles'
      AND policyname = 'Ver perfiles de compañeros de liga'
  ) THEN
    CREATE POLICY "Ver perfiles de compañeros de liga"
      ON perfiles FOR SELECT
      USING (
        id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM miembros_liga ml1
          JOIN miembros_liga ml2 ON ml1.liga_id = ml2.liga_id
          WHERE ml1.usuario_id = auth.uid()
            AND ml2.usuario_id = perfiles.id
        )
      );
  END IF;
END;
$$;

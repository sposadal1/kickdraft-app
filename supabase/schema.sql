-- =============================================
-- Kickdraft - Esquema de base de datos
-- Mundial FIFA 2026
-- =============================================

-- Perfiles de usuario
CREATE TABLE perfiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipos
CREATE TABLE equipos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  nombre_corto TEXT,
  codigo_pais TEXT,
  grupo_id TEXT
);

-- Partidos
CREATE TABLE partidos (
  id SERIAL PRIMARY KEY,
  numero_partido INT,
  fase TEXT NOT NULL,
  grupo_id TEXT,
  equipo_local_id INT REFERENCES equipos(id),
  equipo_visitante_id INT REFERENCES equipos(id),
  fecha_hora_utc TIMESTAMP WITH TIME ZONE,
  estadio TEXT,
  ciudad TEXT,
  pais_sede TEXT,
  goles_local INT,
  goles_visitante INT,
  estado TEXT DEFAULT 'programado',
  -- migration 001
  api_football_id INT,
  minuto_actual INT
);

-- Pronósticos
CREATE TABLE pronosticos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES perfiles(id),
  partido_id INT REFERENCES partidos(id),
  goles_local_pronosticado INT NOT NULL DEFAULT 0,
  goles_visitante_pronosticado INT NOT NULL DEFAULT 0,
  puntos_obtenidos INT DEFAULT 0,
  -- migration 001
  puntos_parciales INT DEFAULT 0,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, partido_id)
);

-- Ligas
CREATE TABLE ligas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  avatar_url TEXT,              -- migration 003 garantiza que exista
  codigo_invitacion TEXT UNIQUE NOT NULL,
  creador_id UUID REFERENCES perfiles(id),
  creada_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- migration 002
  es_global BOOLEAN NOT NULL DEFAULT FALSE,
  premio_descripcion TEXT
);

-- Miembros de ligas
CREATE TABLE miembros_liga (
  liga_id UUID REFERENCES ligas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  total_puntos INT DEFAULT 0,
  unido_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- migration 002
  exactos INTEGER NOT NULL DEFAULT 0,
  marcadores_acertados INTEGER NOT NULL DEFAULT 0,
  peso_fase_ponderado NUMERIC(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (liga_id, usuario_id)
);

-- Estadísticas en vivo (migration 001)
CREATE TABLE IF NOT EXISTS estadisticas_partido (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partido_id INT NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  tiros_local INT DEFAULT 0,
  tiros_puerta_local INT DEFAULT 0,
  tiros_visitante INT DEFAULT 0,
  tiros_puerta_visitante INT DEFAULT 0,
  posesion_local INT DEFAULT 50,
  posesion_visitante INT DEFAULT 50,
  corners_local INT DEFAULT 0,
  corners_visitante INT DEFAULT 0,
  faltas_local INT DEFAULT 0,
  faltas_visitante INT DEFAULT 0,
  tarjetas_amarillas_local INT DEFAULT 0,
  tarjetas_amarillas_visitante INT DEFAULT 0,
  tarjetas_rojas_local INT DEFAULT 0,
  tarjetas_rojas_visitante INT DEFAULT 0,
  minuto_actual INT,
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partido_id)
);

-- Eventos de partido (migration 001)
CREATE TABLE IF NOT EXISTS eventos_partido (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partido_id INT NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  minuto INT NOT NULL,
  tipo TEXT NOT NULL,
  equipo TEXT NOT NULL,
  jugador TEXT,
  detalle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pronosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ligas ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros_liga ENABLE ROW LEVEL SECURITY;
ALTER TABLE estadisticas_partido ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_partido ENABLE ROW LEVEL SECURITY;

-- Perfiles
CREATE POLICY "Usuarios ven su propio perfil"
  ON perfiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuarios editan su propio perfil"
  ON perfiles FOR ALL
  USING (auth.uid() = id);

-- migration 003: ver perfiles de compañeros de liga
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

-- Pronósticos
CREATE POLICY "Usuarios ven sus pronósticos"
  ON pronosticos FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios crean sus pronósticos"
  ON pronosticos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios editan sus pronósticos"
  ON pronosticos FOR UPDATE
  USING (auth.uid() = usuario_id);

-- Ligas
CREATE POLICY "Todos ven las ligas"
  ON ligas FOR SELECT
  USING (true);

CREATE POLICY "Usuarios crean ligas"
  ON ligas FOR INSERT
  WITH CHECK (auth.uid() = creador_id);

-- migration 003
CREATE POLICY "Creadores actualizan sus ligas"
  ON ligas FOR UPDATE
  USING (auth.uid() = creador_id);

CREATE POLICY "Creadores eliminan sus ligas"
  ON ligas FOR DELETE
  USING (auth.uid() = creador_id);

-- Miembros de ligas
CREATE POLICY "Todos ven miembros"
  ON miembros_liga FOR SELECT
  USING (true);

CREATE POLICY "Usuarios se unen a ligas"
  ON miembros_liga FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- migration 003
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

-- Estadísticas (migration 001)
CREATE POLICY "estadisticas_select" ON estadisticas_partido FOR SELECT TO authenticated USING (true);
CREATE POLICY "eventos_select" ON eventos_partido FOR SELECT TO authenticated USING (true);

-- =============================================
-- Índices
-- =============================================

CREATE INDEX IF NOT EXISTS idx_estadisticas_partido_id ON estadisticas_partido(partido_id);
CREATE INDEX IF NOT EXISTS idx_eventos_partido_id ON eventos_partido(partido_id);

-- =============================================
-- Función para actualizar actualizado_en automáticamente
-- =============================================

CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pronosticos_actualizado_en
  BEFORE UPDATE ON pronosticos
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();


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
  estado TEXT DEFAULT 'programado'
);

-- Pronósticos
CREATE TABLE pronosticos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES perfiles(id),
  partido_id INT REFERENCES partidos(id),
  goles_local_pronosticado INT NOT NULL DEFAULT 0,
  goles_visitante_pronosticado INT NOT NULL DEFAULT 0,
  puntos_obtenidos INT DEFAULT 0,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, partido_id)
);

-- Ligas
CREATE TABLE ligas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  avatar_url TEXT,
  codigo_invitacion TEXT UNIQUE NOT NULL,
  creador_id UUID REFERENCES perfiles(id),
  creada_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Miembros de ligas
CREATE TABLE miembros_liga (
  liga_id UUID REFERENCES ligas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  total_puntos INT DEFAULT 0,
  unido_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (liga_id, usuario_id)
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pronosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ligas ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros_liga ENABLE ROW LEVEL SECURITY;

-- Perfiles
CREATE POLICY "Usuarios ven su propio perfil"
  ON perfiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuarios editan su propio perfil"
  ON perfiles FOR ALL
  USING (auth.uid() = id);

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

-- Miembros de ligas
CREATE POLICY "Todos ven miembros"
  ON miembros_liga FOR SELECT
  USING (true);

CREATE POLICY "Usuarios se unen a ligas"
  ON miembros_liga FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

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

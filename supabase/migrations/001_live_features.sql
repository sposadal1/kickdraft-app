-- Tabla para estadísticas en vivo de cada partido
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

-- Tabla para eventos del partido (goles, tarjetas, sustituciones)
CREATE TABLE IF NOT EXISTS eventos_partido (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partido_id INT NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  minuto INT NOT NULL,
  tipo TEXT NOT NULL, -- 'gol', 'tarjeta_amarilla', 'tarjeta_roja', 'sustitucion'
  equipo TEXT NOT NULL, -- 'local' o 'visitante'
  jugador TEXT,
  detalle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar columna api_football_id a partidos para mapear con la API
ALTER TABLE partidos ADD COLUMN IF NOT EXISTS api_football_id INT;
ALTER TABLE partidos ADD COLUMN IF NOT EXISTS minuto_actual INT;

-- Agregar puntos_parciales a pronosticos
ALTER TABLE pronosticos ADD COLUMN IF NOT EXISTS puntos_parciales INT DEFAULT 0;

-- RLS para nuevas tablas
ALTER TABLE estadisticas_partido ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_partido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estadisticas_select" ON estadisticas_partido FOR SELECT TO authenticated USING (true);
CREATE POLICY "eventos_select" ON eventos_partido FOR SELECT TO authenticated USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_estadisticas_partido_id ON estadisticas_partido(partido_id);
CREATE INDEX IF NOT EXISTS idx_eventos_partido_id ON eventos_partido(partido_id);

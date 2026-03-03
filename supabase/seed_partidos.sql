-- =============================================
-- Kickdraft - Seed: equipos, partidos y pronosticos
-- Mundial FIFA 2026
-- =============================================

-- Equipos
CREATE TABLE IF NOT EXISTS equipos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  nombre_corto TEXT,
  codigo_pais TEXT,
  grupo_id TEXT
);

-- Partidos
CREATE TABLE IF NOT EXISTS partidos (
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
CREATE TABLE IF NOT EXISTS pronosticos (
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

-- RLS en pronosticos
ALTER TABLE pronosticos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pronosticos' AND policyname = 'Usuarios ven sus pronósticos'
  ) THEN
    CREATE POLICY "Usuarios ven sus pronósticos"
      ON pronosticos FOR SELECT
      USING (auth.uid() = usuario_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pronosticos' AND policyname = 'Usuarios crean sus pronósticos'
  ) THEN
    CREATE POLICY "Usuarios crean sus pronósticos"
      ON pronosticos FOR INSERT
      WITH CHECK (auth.uid() = usuario_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pronosticos' AND policyname = 'Usuarios editan sus pronósticos'
  ) THEN
    CREATE POLICY "Usuarios editan sus pronósticos"
      ON pronosticos FOR UPDATE
      USING (auth.uid() = usuario_id);
  END IF;
END $$;

-- =============================================
-- Seed: 48 equipos del Mundial 2026
-- =============================================

INSERT INTO equipos (id, nombre, nombre_corto, codigo_pais, grupo_id) VALUES
  -- Grupo A
  (1,  'México',                        'MEX', 'MX',     'A'),
  (2,  'Sudáfrica',                     'RSA', 'ZA',     'A'),
  (3,  'Corea del Sur',                 'KOR', 'KR',     'A'),
  (4,  'Playoff UEFA D',                'PLD', 'XX',     'A'),
  -- Grupo B
  (5,  'Canadá',                        'CAN', 'CA',     'B'),
  (6,  'Qatar',                         'QAT', 'QA',     'B'),
  (7,  'Suiza',                         'SUI', 'CH',     'B'),
  (8,  'Playoff UEFA A',                'PLA', 'XX',     'B'),
  -- Grupo C
  (9,  'Brasil',                        'BRA', 'BR',     'C'),
  (10, 'Marruecos',                     'MAR', 'MA',     'C'),
  (11, 'Haití',                         'HAI', 'HT',     'C'),
  (12, 'Escocia',                       'SCO', 'GB-SCT', 'C'),
  -- Grupo D
  (13, 'Estados Unidos',                'USA', 'US',     'D'),
  (14, 'Paraguay',                      'PAR', 'PY',     'D'),
  (15, 'Australia',                     'AUS', 'AU',     'D'),
  (16, 'Playoff UEFA C',                'PLC', 'XX',     'D'),
  -- Grupo E
  (17, 'Alemania',                      'GER', 'DE',     'E'),
  (18, 'Curazao',                       'CUW', 'CW',     'E'),
  (19, 'Costa de Marfil',               'CIV', 'CI',     'E'),
  (20, 'Ecuador',                       'ECU', 'EC',     'E'),
  -- Grupo F
  (21, 'Países Bajos',                  'NED', 'NL',     'F'),
  (22, 'Japón',                         'JPN', 'JP',     'F'),
  (23, 'Playoff UEFA B',                'PLB', 'XX',     'F'),
  (24, 'Túnez',                         'TUN', 'TN',     'F'),
  -- Grupo G
  (25, 'Bélgica',                       'BEL', 'BE',     'G'),
  (26, 'Egipto',                        'EGY', 'EG',     'G'),
  (27, 'Irán',                          'IRN', 'IR',     'G'),
  (28, 'Nueva Zelanda',                 'NZL', 'NZ',     'G'),
  -- Grupo H
  (29, 'España',                        'ESP', 'ES',     'H'),
  (30, 'Cabo Verde',                    'CPV', 'CV',     'H'),
  (31, 'Arabia Saudita',                'KSA', 'SA',     'H'),
  (32, 'Uruguay',                       'URU', 'UY',     'H'),
  -- Grupo I
  (33, 'Francia',                       'FRA', 'FR',     'I'),
  (34, 'Senegal',                       'SEN', 'SN',     'I'),
  (35, 'Playoff Intercontinental 2',    'PI2', 'XX',     'I'),
  (36, 'Noruega',                       'NOR', 'NO',     'I'),
  -- Grupo J
  (37, 'Argentina',                     'ARG', 'AR',     'J'),
  (38, 'Argelia',                       'ALG', 'DZ',     'J'),
  (39, 'Austria',                       'AUT', 'AT',     'J'),
  (40, 'Jordania',                      'JOR', 'JO',     'J'),
  -- Grupo K
  (41, 'Portugal',                      'POR', 'PT',     'K'),
  (42, 'Playoff Intercontinental 1',    'PI1', 'XX',     'K'),
  (43, 'Uzbekistán',                    'UZB', 'UZ',     'K'),
  (44, 'Colombia',                      'COL', 'CO',     'K'),
  -- Grupo L
  (45, 'Inglaterra',                    'ENG', 'GB-ENG', 'L'),
  (46, 'Croacia',                       'CRO', 'HR',     'L'),
  (47, 'Ghana',                         'GHA', 'GH',     'L'),
  (48, 'Panamá',                        'PAN', 'PA',     'L')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence after explicit ID inserts
SELECT setval('equipos_id_seq', 48, true);

-- =============================================
-- Seed: 36 partidos de fase grupos
-- =============================================

INSERT INTO partidos (id, numero_partido, fase, grupo_id, equipo_local_id, equipo_visitante_id, fecha_hora_utc, estadio, ciudad, pais_sede, estado) VALUES
  -- Jornada 1
  (1,  1,  'grupos', 'A', 1,  2,  '2026-06-11T22:00:00Z', 'Estadio Azteca',          'Ciudad de México',       'México',         'programado'),
  (2,  2,  'grupos', 'A', 3,  4,  '2026-06-12T01:00:00Z', 'SoFi Stadium',            'Los Ángeles',            'Estados Unidos', 'programado'),
  (3,  3,  'grupos', 'B', 5,  6,  '2026-06-12T18:00:00Z', 'BMO Field',               'Toronto',                'Canadá',         'programado'),
  (4,  4,  'grupos', 'B', 7,  8,  '2026-06-12T22:00:00Z', 'MetLife Stadium',         'Nueva York/Nueva Jersey','Estados Unidos', 'programado'),
  (5,  5,  'grupos', 'C', 9,  10, '2026-06-13T18:00:00Z', 'AT&T Stadium',            'Dallas',                 'Estados Unidos', 'programado'),
  (6,  6,  'grupos', 'C', 11, 12, '2026-06-13T22:00:00Z', 'Hard Rock Stadium',       'Miami',                  'Estados Unidos', 'programado'),
  (7,  7,  'grupos', 'D', 13, 14, '2026-06-14T18:00:00Z', 'SoFi Stadium',            'Los Ángeles',            'Estados Unidos', 'programado'),
  (8,  8,  'grupos', 'D', 15, 16, '2026-06-14T22:00:00Z', 'Lumen Field',             'Seattle',                'Estados Unidos', 'programado'),
  (9,  9,  'grupos', 'E', 17, 18, '2026-06-15T16:00:00Z', 'MetLife Stadium',         'Nueva York/Nueva Jersey','Estados Unidos', 'programado'),
  (10, 10, 'grupos', 'E', 19, 20, '2026-06-15T20:00:00Z', 'Mercedes-Benz Stadium',   'Atlanta',                'Estados Unidos', 'programado'),
  (11, 11, 'grupos', 'F', 21, 22, '2026-06-16T16:00:00Z', 'Lincoln Financial Field', 'Filadelfia',             'Estados Unidos', 'programado'),
  (12, 12, 'grupos', 'F', 23, 24, '2026-06-16T20:00:00Z', 'NRG Stadium',             'Houston',                'Estados Unidos', 'programado'),
  (13, 13, 'grupos', 'G', 25, 26, '2026-06-17T16:00:00Z', 'BC Place',                'Vancouver',              'Canadá',         'programado'),
  (14, 14, 'grupos', 'G', 27, 28, '2026-06-17T20:00:00Z', 'Arrowhead Stadium',       'Kansas City',            'Estados Unidos', 'programado'),
  (15, 15, 'grupos', 'H', 29, 30, '2026-06-18T16:00:00Z', 'Estadio Akron',           'Guadalajara',            'México',         'programado'),
  (16, 16, 'grupos', 'H', 31, 32, '2026-06-18T20:00:00Z', 'Estadio BBVA',            'Monterrey',              'México',         'programado'),
  (17, 17, 'grupos', 'I', 33, 34, '2026-06-19T16:00:00Z', 'Gillette Stadium',        'Boston',                 'Estados Unidos', 'programado'),
  (18, 18, 'grupos', 'I', 35, 36, '2026-06-19T20:00:00Z', 'Levi''s Stadium',         'San Francisco',          'Estados Unidos', 'programado'),
  (19, 19, 'grupos', 'J', 37, 38, '2026-06-20T16:00:00Z', 'Hard Rock Stadium',       'Miami',                  'Estados Unidos', 'programado'),
  (20, 20, 'grupos', 'J', 39, 40, '2026-06-20T20:00:00Z', 'AT&T Stadium',            'Dallas',                 'Estados Unidos', 'programado'),
  (21, 21, 'grupos', 'K', 41, 42, '2026-06-21T16:00:00Z', 'MetLife Stadium',         'Nueva York/Nueva Jersey','Estados Unidos', 'programado'),
  (22, 22, 'grupos', 'K', 43, 44, '2026-06-21T20:00:00Z', 'SoFi Stadium',            'Los Ángeles',            'Estados Unidos', 'programado'),
  (23, 23, 'grupos', 'L', 45, 46, '2026-06-22T16:00:00Z', 'Lincoln Financial Field', 'Filadelfia',             'Estados Unidos', 'programado'),
  (24, 24, 'grupos', 'L', 47, 48, '2026-06-22T20:00:00Z', 'Arrowhead Stadium',       'Kansas City',            'Estados Unidos', 'programado'),
  -- Jornada 2
  (25, 25, 'grupos', 'A', 1,  3,  '2026-06-15T22:00:00Z', 'Estadio Azteca',          'Ciudad de México',       'México',         'programado'),
  (26, 26, 'grupos', 'A', 2,  4,  '2026-06-16T00:00:00Z', 'Levi''s Stadium',         'San Francisco',          'Estados Unidos', 'programado'),
  (27, 27, 'grupos', 'B', 5,  7,  '2026-06-16T18:00:00Z', 'BC Place',                'Vancouver',              'Canadá',         'programado'),
  (28, 28, 'grupos', 'B', 6,  8,  '2026-06-17T18:00:00Z', 'NRG Stadium',             'Houston',                'Estados Unidos', 'programado'),
  (29, 29, 'grupos', 'C', 9,  11, '2026-06-17T22:00:00Z', 'Mercedes-Benz Stadium',   'Atlanta',                'Estados Unidos', 'programado'),
  (30, 30, 'grupos', 'C', 10, 12, '2026-06-18T18:00:00Z', 'Gillette Stadium',        'Boston',                 'Estados Unidos', 'programado'),
  (31, 31, 'grupos', 'D', 13, 15, '2026-06-19T18:00:00Z', 'Lumen Field',             'Seattle',                'Estados Unidos', 'programado'),
  (32, 32, 'grupos', 'D', 14, 16, '2026-06-20T18:00:00Z', 'BMO Field',               'Toronto',                'Canadá',         'programado'),
  (33, 33, 'grupos', 'E', 17, 19, '2026-06-21T18:00:00Z', 'Hard Rock Stadium',       'Miami',                  'Estados Unidos', 'programado'),
  (34, 34, 'grupos', 'E', 18, 20, '2026-06-22T18:00:00Z', 'Lincoln Financial Field', 'Filadelfia',             'Estados Unidos', 'programado'),
  (35, 35, 'grupos', 'F', 21, 23, '2026-06-23T16:00:00Z', 'AT&T Stadium',            'Dallas',                 'Estados Unidos', 'programado'),
  (36, 36, 'grupos', 'F', 22, 24, '2026-06-23T20:00:00Z', 'Arrowhead Stadium',       'Kansas City',            'Estados Unidos', 'programado')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence after explicit ID inserts
SELECT setval('partidos_id_seq', 36, true);

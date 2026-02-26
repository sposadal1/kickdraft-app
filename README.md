# ⚽ Kickdraft

**Kickdraft** es una plataforma web de pollas mundialistas para el **Mundial de Fútbol FIFA 2026**. Haz tus pronósticos, crea ligas con amigos y demuestra que sabes de fútbol.

## 🚀 Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **Next.js 14** | Framework con App Router |
| **TypeScript** | Tipado estático |
| **Tailwind CSS** | Estilos utilitarios |
| **Supabase** | Base de datos (PostgreSQL) + Autenticación |
| **lucide-react** | Iconos |
| **date-fns** | Manejo de fechas |
| **date-fns-tz** | Zona horaria Colombia (UTC-5) |

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/sposadal1/kickdraft-app.git
cd kickdraft-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa con tus credenciales de Supabase:

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 4. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`
3. Activa la autenticación por Google en **Authentication > Providers**
4. Copia la URL y la anon key del proyecto

### 5. Correr el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura de carpetas

```
kickdraft-app/
├── src/
│   ├── app/                    # Páginas (Next.js App Router)
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Layout principal
│   │   ├── partidos/           # Lista y detalle de partidos
│   │   ├── pronosticos/        # Pronósticos del usuario
│   │   ├── ligas/              # Ligas (crear, unirse, detalle)
│   │   └── auth/               # Login y registro
│   ├── components/             # Componentes reutilizables
│   │   ├── layout/             # Navbar
│   │   ├── partidos/           # TarjetaPartido, TablaGrupo
│   │   ├── pronosticos/        # InputMarcador
│   │   └── ligas/              # TarjetaLiga, TablaClasificacion
│   ├── data/                   # Datos estáticos
│   │   ├── equipos.ts          # 48 equipos del Mundial 2026
│   │   ├── estadios.ts         # 16 estadios sede
│   │   └── partidos.ts         # Partidos fase de grupos
│   ├── lib/                    # Lógica de negocio
│   │   ├── puntuacion.ts       # Sistema de puntos
│   │   ├── grupos.ts           # Tabla de posiciones
│   │   ├── utils.ts            # Utilidades (fechas, formato)
│   │   └── supabase.ts         # Cliente de Supabase
│   └── types/                  # Tipos TypeScript
│       ├── equipo.ts
│       ├── partido.ts
│       ├── pronostico.ts
│       ├── liga.ts
│       └── usuario.ts
├── supabase/
│   └── schema.sql              # Esquema de base de datos
├── .env.local.example
└── README.md
```

## 🏆 Sistema de Puntuación

Los puntos se asignan según la fase del torneo:

| Fase | Resultado correcto | Marcador exacto |
|------|--------------------|-----------------|
| Grupos | 1 punto | 2 puntos |
| Dieciseisavos | 2 puntos | 3 puntos |
| Octavos | 3 puntos | 6 puntos |
| Cuartos | 4 puntos | 8 puntos |
| Semifinal | 5 puntos | 10 puntos |
| 3er y 4to puesto | 6 puntos | 12 puntos |
| Final | 7 puntos | 14 puntos |

- **Resultado correcto:** acertaste quién ganó (o que hubo empate)
- **Marcador exacto:** acertaste el resultado y los goles exactos

## 🌍 Grupos del Mundial 2026

| Grupo | Equipos |
|-------|---------|
| A | México, Sudáfrica, Corea del Sur, Playoff UEFA D |
| B | Canadá, Qatar, Suiza, Playoff UEFA A |
| C | Brasil, Marruecos, Haití, Escocia |
| D | Estados Unidos, Paraguay, Australia, Playoff UEFA C |
| E | Alemania, Curazao, Costa de Marfil, Ecuador |
| F | Países Bajos, Japón, Playoff UEFA B, Túnez |
| G | Bélgica, Egipto, Irán, Nueva Zelanda |
| H | España, Cabo Verde, Arabia Saudita, Uruguay |
| I | Francia, Senegal, Playoff Intercontinental 2, Noruega |
| J | Argentina, Argelia, Austria, Jordania |
| K | Portugal, Playoff Intercontinental 1, Uzbekistán, Colombia |
| L | Inglaterra, Croacia, Ghana, Panamá |

## 🗺️ Roadmap

- [ ] Autenticación completa con Supabase (Google + email)
- [ ] Sistema de pronósticos conectado a base de datos
- [ ] Clasificación en tiempo real de ligas
- [ ] Fase eliminatoria (dieciseisavos en adelante)
- [ ] Notificaciones de resultados
- [ ] Estadísticas del usuario
- [ ] App móvil (React Native)

## 📄 Licencia

MIT

---

Hecho con ❤️ para los amantes del fútbol · Mundial 2026 🏆

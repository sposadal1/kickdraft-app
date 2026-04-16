# ⚽ Kickdraft — Polla Mundialista 2026

**Kickdraft** es una aplicación web **mobile-first** (lista para ser PWA) de polla mundialista para el **Mundial de Fútbol FIFA 2026**. Haz tus pronósticos, crea ligas privadas con amigos, únete automáticamente a la **Liga Mundial 🌍** y demuestra que eres el mejor pronosticador.

## 🚀 Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **Next.js 15** | Framework con App Router |
| **TypeScript** | Tipado estático |
| **Tailwind CSS** | Estilos utilitarios (diseño mobile-first) |
| **Supabase** | PostgreSQL + Auth + Storage |
| **Lucide React** | Iconos |

## ✨ Funcionalidades Principales

### 📱 Diseño Mobile-First
- Barra de navegación inferior para uso cómodo en móvil.
- Tarjetas de partidos compactas optimizadas para pantallas pequeñas.
- Interfaz lista para ser instalada como Progressive Web App (PWA).

### 🔐 Autenticación Estricta por Correo y Contraseña
- Registro con validación estricta: **mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número**.
- Flujo de **Olvidé mi contraseña** (envío de enlace de recuperación por correo).
- El Magic Link ha sido eliminado. Solo se permite Email/Password.

### 🌍 Liga Mundial (Global)
- Todos los usuarios registrados se unen automáticamente a la **Liga Mundial 🌍** al crear su cuenta.
- Gestionada mediante el trigger `handle_new_user` en la base de datos.

### 🔒 Ligas Privadas
- Crea ligas privadas con códigos de invitación para competir con amigos.
- Sube una foto de perfil personalizada para tu liga (almacenada en el bucket `avatars` de Supabase Storage).

### ⚙️ Administración de Ligas
El creador de cada liga tiene acceso a un panel de administración exclusivo donde puede:
- **Cambiar el nombre** de la liga.
- **Subir o cambiar la foto de perfil** de la liga (bucket `avatars` en Supabase Storage).
- **Expulsar miembros** de la liga.

### 📊 Seguimiento en Vivo y Puntuación
- Seguimiento de resultados de partidos en tiempo real.
- Puntos por **resultado correcto** (quién gana o empate) y por **marcador exacto**.

### 🩹 Sistema Auto-Sanador de Perfiles
- Al iniciar sesión, la app verifica silenciosamente si el usuario tiene un perfil (`perfiles`) y membresía en la Liga Mundial.
- Si falta alguno de los dos, los crea automáticamente. Esto evita errores de clave foránea (`fk_miembros_perfiles`) al unirse o crear ligas.

## 🏆 Sistema de Puntuación

| Fase | Resultado correcto | Marcador exacto |
|------|--------------------|-----------------|
| Grupos | 1 punto | 2 puntos |
| Dieciseisavos de final | 2 puntos | 3 puntos |
| Octavos | 3 puntos | 6 puntos |
| Cuartos | 4 puntos | 8 puntos |
| Semifinal | 5 puntos | 10 puntos |
| 3er y 4to puesto | 6 puntos | 12 puntos |
| Final | 7 puntos | 14 puntos |

- **Resultado correcto:** acertaste quién ganó (o que hubo empate).
- **Marcador exacto:** acertaste el resultado y los goles exactos.

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

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`.
3. Ejecuta también las migraciones en `supabase/migrations/`.
4. Copia la **Project URL** y la **anon key** en tu `.env.local`.

### 5. Correr el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🗄️ Notas de Configuración de Base de Datos (Supabase)

> ⚠️ **Importante para nuevos despliegues.** Estos pasos son necesarios para que todas las funciones de la app operen correctamente.

### Bucket de Storage: `avatars`

1. En tu panel de Supabase, ve a **Storage**.
2. Crea un nuevo bucket con el nombre exacto `avatars`.
3. Marca la opción **"Public bucket"** para que las fotos sean visibles públicamente.
4. Ejecuta las siguientes políticas en el **SQL Editor** para permitir la subida y visualización de imágenes:

```sql
-- Permitir que cualquier usuario vea las fotos
CREATE POLICY "Permitir ver avatares"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Permitir que usuarios autenticados suban fotos
CREATE POLICY "Permitir subida de avatares"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Permitir que usuarios autenticados actualicen fotos
CREATE POLICY "Permitir actualizar avatares"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');
```

### Trigger `handle_new_user`

Para que cada nuevo usuario reciba automáticamente su perfil y sea añadido a la **Liga Mundial 🌍** al registrarse, debes tener el trigger `handle_new_user` configurado en la base de datos. Asegúrate de que el trigger:

1. Crea una fila en `public.perfiles` para el nuevo usuario.
2. Busca la liga con `es_global = true` y crea una fila en `public.miembros_liga` para ese usuario.

Además, asegúrate de que exista al menos una liga con `es_global = true`:

```sql
DO $$
DECLARE
  v_liga_id uuid;
  v_admin_id uuid;
BEGIN
  SELECT id INTO v_liga_id FROM public.ligas WHERE es_global = true LIMIT 1;
  IF v_liga_id IS NULL THEN
    -- Nota: debe existir al menos un usuario registrado antes de correr este script
    SELECT id INTO v_admin_id FROM auth.users LIMIT 1;
    IF v_admin_id IS NOT NULL THEN
      INSERT INTO public.ligas (nombre, codigo_invitacion, creador_id, es_global)
      VALUES ('Liga Mundial 🌍', 'KICKDRAFT-GLOBAL', v_admin_id, true);
    ELSE
      RAISE NOTICE 'No hay usuarios en auth.users. Regístrate primero y luego vuelve a ejecutar este script.';
    END IF;
  END IF;
END;
$$;
```

### RLS (Row Level Security) para `ligas` y `miembros_liga`

Para que todos los usuarios autenticados puedan ver las ligas en las que participan y la tabla de clasificación, ejecuta las siguientes políticas (limpia primero las políticas antiguas si las hubiera):

```sql
-- ⚠️ ADVERTENCIA: Este script elimina TODAS las políticas RLS existentes en `ligas` y `miembros_liga`.
-- Revisa las políticas actuales antes de ejecutarlo en producción para no perder configuraciones personalizadas.

-- Limpiar políticas existentes
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('ligas', 'miembros_liga')) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Políticas para LIGAS
ALTER TABLE public.ligas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ligas_select" ON public.ligas FOR SELECT TO authenticated USING (true);
CREATE POLICY "ligas_insert" ON public.ligas FOR INSERT TO authenticated WITH CHECK (auth.uid() = creador_id);
CREATE POLICY "ligas_update" ON public.ligas FOR UPDATE TO authenticated USING (creador_id = auth.uid());
CREATE POLICY "ligas_delete" ON public.ligas FOR DELETE TO authenticated USING (creador_id = auth.uid());

-- Políticas para MIEMBROS_LIGA
ALTER TABLE public.miembros_liga ENABLE ROW LEVEL SECURITY;
CREATE POLICY "miembros_select" ON public.miembros_liga FOR SELECT TO authenticated USING (true);
CREATE POLICY "miembros_insert" ON public.miembros_liga FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "miembros_update" ON public.miembros_liga FOR UPDATE TO authenticated USING (true);
CREATE POLICY "miembros_delete" ON public.miembros_liga FOR DELETE TO authenticated
USING (auth.uid() = usuario_id OR EXISTS (
  SELECT 1 FROM public.ligas WHERE ligas.id = miembros_liga.liga_id AND ligas.creador_id = auth.uid()
));
```

## 📁 Estructura de carpetas

```
kickdraft-app/
├── src/
│   ├── app/                    # Páginas (Next.js App Router)
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Layout principal
│   │   ├── partidos/           # Lista y detalle de partidos
│   │   ├── pronosticos/        # Pronósticos del usuario
│   │   ├── ligas/              # Ligas (crear, unirse, detalle, administrar)
│   │   └── auth/               # Login, registro, olvidé contraseña, actualizar contraseña
│   ├── components/             # Componentes reutilizables
│   │   ├── layout/             # Navbar (con auto-sanador de perfiles)
│   │   ├── partidos/           # TarjetaPartido, TablaGrupo, EstadisticasEnVivo
│   │   ├── pronosticos/        # InputMarcador
│   │   └── ligas/              # TarjetaLiga, TablaClasificacion
│   ├── data/                   # Datos estáticos
│   │   ├── equipos.ts          # 48 equipos del Mundial 2026
│   │   ├── estadios.ts         # 16 estadios sede
│   │   └── partidos.ts         # Partidos fase de grupos
│   ├── hooks/                  # React hooks
│   │   ├── usePartidoEnVivo.ts # Datos en tiempo real de un partido
│   │   └── useRankingEnVivo.ts # Ranking en tiempo real de una liga
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
│   ├── schema.sql              # Esquema base de datos
│   └── migrations/             # Migraciones SQL
├── .env.local.example
└── README.md
```

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

## 📄 Licencia

MIT

---

Hecho con ❤️ para los amantes del fútbol · Mundial 2026 🏆

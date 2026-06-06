'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Trophy, CalendarDays, CheckSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { PerfilUsuario } from '@/lib/profile';
import { getNombreVisible } from '@/lib/profile';
import ProfileDropdown from '@/components/profile/ProfileDropdown';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);

  async function fetchPerfil(userId: string) {
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, nombre, apellido, email, nombre_visible, avatar_url, creado_en')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Navbar: error al cargar perfil:', error.message);
      return;
    }

    setPerfil(data as PerfilUsuario);
  }

  async function repararPerfil(user: User) {
    const { data: perfilExistente, error: perfilError } = await supabase
      .from('perfiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (perfilError?.code === 'PGRST116' || (!perfilError && !perfilExistente)) {
      const meta = user.user_metadata ?? {};
      const nombre = meta.nombre || meta.full_name?.split(' ')[0] || 'Usuario';
      const apellido = meta.apellido || (meta.full_name?.split(' ').slice(1).join(' ') ?? '');
      await supabase.from('perfiles').upsert({
        id: user.id,
        email: user.email,
        nombre,
        apellido,
        nombre_visible: `${nombre} ${apellido}`.trim(),
      });
    }

    const { data: ligaGlobal } = await supabase
      .from('ligas')
      .select('id')
      .eq('es_global', true)
      .single();

    if (ligaGlobal) {
      const { data: membresia } = await supabase
        .from('miembros_liga')
        .select('usuario_id')
        .eq('usuario_id', user.id)
        .eq('liga_id', ligaGlobal.id)
        .single();

      if (!membresia) {
        await supabase.from('miembros_liga').upsert({
          usuario_id: user.id,
          liga_id: ligaGlobal.id,
          total_puntos: 0,
        });
      }
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data.user) {
        setUsuario(data.user);
        fetchPerfil(data.user.id);
        repararPerfil(data.user);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUsuario(session.user);
        fetchPerfil(session.user.id);
        repararPerfil(session.user);
      } else {
        setUsuario(null);
        setPerfil(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const nombreUsuario = useMemo(
    () => getNombreVisible(perfil, usuario?.email),
    [perfil, usuario?.email]
  );

  return (
    <>
      <nav className="bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-verde-500 flex-none">
              <Trophy className="w-6 h-6" />
              Kickdraft
            </Link>

            <div className="hidden md:flex items-center gap-6 ml-8">
              <Link href="/partidos" className="hover:text-verde-400 transition-colors">
                Partidos
              </Link>
              <Link href="/pronosticos" className="hover:text-verde-400 transition-colors">
                Pronósticos
              </Link>
              <Link href="/ligas" className="hover:text-verde-400 transition-colors">
                Mis Ligas
              </Link>
            </div>

            <div className="flex-1" />

            <div className="hidden md:flex items-center gap-4">
              {usuario ? (
                <ProfileDropdown
                  name={nombreUsuario}
                  email={usuario.email}
                  avatarUrl={perfil?.avatar_url}
                  onLogout={handleLogout}
                />
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-verde-600 hover:bg-verde-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>

            <div className="flex md:hidden items-center gap-2">
              {usuario ? (
                <ProfileDropdown
                  name={nombreUsuario}
                  email={usuario.email}
                  avatarUrl={perfil?.avatar_url}
                  onLogout={handleLogout}
                  compact
                />
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-verde-600 hover:bg-verde-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-40">
        <div className="flex items-center justify-around h-16">
          <Link
            href="/partidos"
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              pathname === '/partidos' ? 'text-verde-400' : 'text-gray-400'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[10px] font-medium">Partidos</span>
          </Link>
          <Link
            href="/pronosticos"
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              pathname === '/pronosticos' ? 'text-verde-400' : 'text-gray-400'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium">Pronósticos</span>
          </Link>
          <Link
            href="/ligas"
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              pathname === '/ligas' || pathname.startsWith('/ligas/')
                ? 'text-verde-400'
                : 'text-gray-400'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-medium">Mis Ligas</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

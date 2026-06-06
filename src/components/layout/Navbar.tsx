'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Trophy, UserCircle, CalendarDays, CheckSquare, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const perfilRef = useRef<HTMLDivElement>(null);

  async function fetchNombre(userId: string) {
    const { data, error } = await supabase
      .from('perfiles')
      .select('nombre, apellido')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Navbar: error al cargar perfil:', error.message);
      return;
    }
    if (data) {
      const nombre = `${data.nombre ?? ''} ${data.apellido ?? ''}`.trim();
      setNombreUsuario(nombre || null);
    }
  }

  async function repararPerfil(user: User) {
    // Check if the user has a profile row
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // PGRST116 = "Row not found" — only upsert when the row is genuinely missing
    if (perfilError?.code === 'PGRST116' || (!perfilError && !perfil)) {
      const meta = user.user_metadata ?? {};
      await supabase.from('perfiles').upsert({
        id: user.id,
        email: user.email,
        nombre: meta.nombre || meta.full_name?.split(' ')[0] || 'Usuario',
        apellido: meta.apellido || (meta.full_name?.split(' ').slice(1).join(' ') ?? ''),
      });
    }

    // Ensure the user is a member of the global league
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
        fetchNombre(data.user.id);
        repararPerfil(data.user);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUsuario(session.user);
        fetchNombre(session.user.id);
        repararPerfil(session.user);
      } else {
        setUsuario(null);
        setNombreUsuario(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (perfilRef.current && !perfilRef.current.contains(event.target as Node)) {
        setPerfilAbierto(false);
      }
    }
    if (perfilAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [perfilAbierto]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <>
      <nav className="bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Area 1: Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-verde-500 flex-none">
              <Trophy className="w-6 h-6" />
              Kickdraft
            </Link>

            {/* Links escritorio (ocultos en móvil) */}
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

            {/* Espaciador */}
            <div className="flex-1" />

            {/* Botón login / avatar - escritorio */}
            <div className="hidden md:flex items-center gap-4">
              {usuario ? (
                <>
                  <span className="text-gray-300 text-sm">{nombreUsuario ?? usuario.email}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-verde-600 hover:bg-verde-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>

            {/* Area 2 y 3: Nombre + Icono de perfil (solo móvil) */}
            <div className="flex md:hidden items-center gap-2">
              {/* Area 2: Nombre del usuario (espacio izquierdo reservado para futuros anuncios) */}
              {nombreUsuario && (
                <span className="text-gray-300 text-xs truncate max-w-[110px]">{nombreUsuario}</span>
              )}

              {/* Area 3: Icono de perfil con dropdown */}
              <div className="relative" ref={perfilRef}>
                <button
                  className="p-1"
                  onClick={() => setPerfilAbierto(!perfilAbierto)}
                  aria-label="Perfil"
                >
                  <UserCircle className="w-7 h-7 text-gray-300" />
                </button>

                {perfilAbierto && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 p-3 space-y-2">
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-white"
                      onClick={() => setPerfilAbierto(false)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {usuario ? (
                      <>
                        <div className="pb-2 border-b border-gray-700 pr-6">
                          <p className="text-white font-semibold text-sm">{nombreUsuario ?? 'Usuario'}</p>
                          <p className="text-gray-400 text-xs truncate">{usuario.email}</p>
                        </div>
                        <button
                          onClick={async () => { await handleLogout(); setPerfilAbierto(false); }}
                          className="w-full text-left text-red-400 text-sm font-medium py-1"
                        >
                          Cerrar sesión
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/auth/login"
                        className="block text-verde-400 text-sm font-medium py-1"
                        onClick={() => setPerfilAbierto(false)}
                      >
                        Iniciar sesión
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Area 5: Barra de navegación inferior (solo móvil) */}
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

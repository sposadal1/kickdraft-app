'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [usuario, setUsuario] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => { if (!error) setUsuario(data.user); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-verde-500">
            <Trophy className="w-6 h-6" />
            Kickdraft
          </Link>

          {/* Links escritorio */}
          <div className="hidden md:flex items-center gap-6">
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

          {/* Botón login / avatar */}
          <div className="hidden md:flex items-center gap-4">
            {usuario ? (
              <>
                <span className="text-gray-300 text-sm">{usuario.email}</span>
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

          {/* Botón hamburguesa */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label="Menú"
          >
            {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú móvil */}
        {menuAbierto && (
          <div className="md:hidden py-4 space-y-3 border-t border-gray-800">
            <Link
              href="/partidos"
              className="block px-2 py-1 hover:text-verde-400 transition-colors"
              onClick={() => setMenuAbierto(false)}
            >
              Partidos
            </Link>
            <Link
              href="/pronosticos"
              className="block px-2 py-1 hover:text-verde-400 transition-colors"
              onClick={() => setMenuAbierto(false)}
            >
              Pronósticos
            </Link>
            <Link
              href="/ligas"
              className="block px-2 py-1 hover:text-verde-400 transition-colors"
              onClick={() => setMenuAbierto(false)}
            >
              Mis Ligas
            </Link>
            {usuario ? (
              <>
                <span className="block px-2 py-1 text-gray-300 text-sm">{usuario.email}</span>
                <button
                  onClick={async () => { await handleLogout(); setMenuAbierto(false); }}
                  className="block px-2 py-1 text-red-400 font-medium text-left"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="block px-2 py-1 text-verde-400 font-medium"
                onClick={() => setMenuAbierto(false)}
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

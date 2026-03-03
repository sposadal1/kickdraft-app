'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Trophy } from 'lucide-react';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

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
            <Link
              href="/auth/login"
              className="bg-verde-600 hover:bg-verde-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Iniciar sesión
            </Link>
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
            <Link
              href="/auth/login"
              className="block px-2 py-1 text-verde-400 font-medium"
              onClick={() => setMenuAbierto(false)}
            >
              Iniciar sesión
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

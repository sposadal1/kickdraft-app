'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Hash, Trophy, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LigasPage() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [mostrarUnirse, setMostrarUnirse] = useState(false);
  const [codigoInvitacion, setCodigoInvitacion] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      setAutenticado(!error && !!data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAutenticado(!!session?.user);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (autenticado === null) {
    return <div className="flex items-center justify-center py-20"><div className="text-gray-500">Cargando...</div></div>;
  }

  if (!autenticado) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-verde-900/40 rounded-2xl mb-6">
          <Trophy className="w-8 h-8 text-verde-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Mis Ligas</h1>
        <p className="text-gray-400 mb-8">
          Inicia sesión para crear y unirte a ligas con tus amigos.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 bg-verde-600 hover:bg-verde-700 text-white font-bold px-8 py-4 rounded-xl transition-colors"
        >
          <LogIn className="w-5 h-5" />
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Mis Ligas</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarUnirse(!mostrarUnirse)}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg border border-gray-700 transition-colors"
          >
            <Hash className="w-4 h-4" />
            Unirme con código
          </button>
          <Link
            href="/ligas/crear"
            className="flex items-center gap-2 bg-verde-600 hover:bg-verde-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear mi liga
          </Link>
        </div>
      </div>

      {/* Formulario unirse */}
      {mostrarUnirse && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <h3 className="text-white font-semibold mb-3">Unirme con código de invitación</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={codigoInvitacion}
              onChange={(e) => setCodigoInvitacion(e.target.value.toUpperCase())}
              placeholder="Ej: ABC12345"
              maxLength={8}
              className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:border-verde-500 focus:outline-none uppercase"
            />
            <button className="bg-verde-600 hover:bg-verde-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Unirme
            </button>
          </div>
        </div>
      )}

      {/* Lista vacía */}
      <div className="text-center py-16 text-gray-500">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium mb-2">Aún no tienes ligas</p>
        <p className="text-sm">Crea tu primera liga o únete con un código de invitación.</p>
      </div>
    </div>
  );
}

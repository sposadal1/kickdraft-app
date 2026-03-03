'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Hash, Trophy, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export default function LigasPage() {
  const [usuario, setUsuario] = useState<User | null | undefined>(undefined);
  const [misLigas, setMisLigas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarUnirse, setMostrarUnirse] = useState(false);
  const [codigoInvitacion, setCodigoInvitacion] = useState('');
  const [cargandoUnirse, setCargandoUnirse] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data.user) {
        setUsuario(data.user);
        cargarLigas(data.user);
      } else {
        setUsuario(null);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUsuario(session.user);
        cargarLigas(session.user);
      } else {
        setUsuario(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function cargarLigas(user: User) {
    setCargando(true);
    const { data } = await supabase
      .from('miembros_liga')
      .select('liga_id, total_puntos, ligas(id, nombre, codigo_invitacion, creador_id)')
      .eq('usuario_id', user.id);
    setMisLigas(data ?? []);
    setCargando(false);
  }

  async function handleUnirse() {
    if (!codigoInvitacion.trim() || !usuario) return;
    setCargandoUnirse(true);
    setError('');

    const { data: liga, error: ligaError } = await supabase
      .from('ligas')
      .select('id, nombre')
      .eq('codigo_invitacion', codigoInvitacion.trim().toUpperCase())
      .single();

    if (ligaError || !liga) {
      setError('Código de invitación inválido');
      setCargandoUnirse(false);
      return;
    }

    const { data: yaEsMiembro } = await supabase
      .from('miembros_liga')
      .select('liga_id')
      .eq('liga_id', liga.id)
      .eq('usuario_id', usuario.id)
      .single();

    if (yaEsMiembro) {
      setError('Ya eres miembro de esta liga');
      setCargandoUnirse(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('miembros_liga')
      .insert({ liga_id: liga.id, usuario_id: usuario.id, total_puntos: 0 });

    if (insertError) {
      setError('Error al unirte a la liga');
    } else {
      setCodigoInvitacion('');
      setMostrarUnirse(false);
      cargarLigas(usuario);
    }
    setCargandoUnirse(false);
  }

  if (usuario === undefined) {
    return <div className="flex items-center justify-center py-20"><div className="text-gray-500">Cargando...</div></div>;
  }

  if (!usuario) {
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
            <button
              onClick={handleUnirse}
              disabled={cargandoUnirse}
              className="bg-verde-600 hover:bg-verde-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {cargandoUnirse ? 'Uniéndome...' : 'Unirme'}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      )}

      {/* Lista de ligas */}
      {cargando ? (
        <div className="text-center py-16 text-gray-500">
          <div>Cargando ligas...</div>
        </div>
      ) : misLigas.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">Aún no tienes ligas</p>
          <p className="text-sm">Crea tu primera liga o únete con un código de invitación.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {misLigas.map((miembro) => {
            const liga = miembro.ligas as { id: string; nombre: string; codigo_invitacion: string; creador_id: string } | null;
            if (!liga) return null;
            return (
              <Link
                key={liga.id}
                href={`/ligas/${liga.id}`}
                className="block bg-gray-900 border border-gray-800 hover:border-verde-700 rounded-xl p-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{liga.nombre}</h3>
                    <p className="text-gray-500 text-sm mt-1">Código: {liga.codigo_invitacion}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-verde-400 font-bold">{miembro.total_puntos} pts</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

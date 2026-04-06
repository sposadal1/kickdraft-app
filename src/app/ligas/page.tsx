'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Hash, Trophy, LogIn, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface LigaInfo {
  id: string;
  nombre: string;
  codigo_invitacion: string;
  creador_id: string;
  es_global?: boolean;
}

interface MiembroConLiga {
  liga_id: string;
  total_puntos: number;
  ligas: LigaInfo | LigaInfo[] | null;
}

export default function LigasPage() {
  const [usuario, setUsuario] = useState<User | null | undefined>(undefined);
  const [misLigas, setMisLigas] = useState<MiembroConLiga[]>([]);
  const [ligaMundial, setLigaMundial] = useState<LigaInfo | null>(null);
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
      .select('liga_id, total_puntos, ligas(id, nombre, codigo_invitacion, creador_id, es_global)')
      .eq('usuario_id', user.id);

    const todas = (data ?? []) as MiembroConLiga[];
    const global = todas.find((m) => {
      const liga = Array.isArray(m.ligas) ? m.ligas[0] : m.ligas;
      return liga?.es_global === true;
    });
    const privadas = todas.filter((m) => {
      const liga = Array.isArray(m.ligas) ? m.ligas[0] : m.ligas;
      return !liga?.es_global;
    });

    if (global) {
      const liga = Array.isArray(global.ligas) ? global.ligas[0] : global.ligas;
      if (liga) setLigaMundial(liga);
    }
    setMisLigas(privadas);
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

      {/* Liga Mundial (global) */}
      {ligaMundial && (
        <Link
          href={`/ligas/${ligaMundial.id}`}
          className="block bg-gradient-to-r from-verde-900/60 to-gray-900 border border-verde-700 hover:border-verde-500 rounded-xl p-4 mb-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-verde-600 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">Liga Mundial 🌍</h3>
                <p className="text-verde-400 text-xs mt-0.5">Liga global · Todos los usuarios</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Compites automáticamente</p>
            </div>
          </div>
        </Link>
      )}

      {/* Lista de ligas */}
      {cargando ? (
        <div className="text-center py-16 text-gray-500">
          <div>Cargando ligas...</div>
        </div>
      ) : misLigas.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">Aún no tienes ligas privadas</p>
          <p className="text-sm">Crea tu primera liga o únete con un código de invitación.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {misLigas.map((miembro) => {
            const liga = (Array.isArray(miembro.ligas) ? miembro.ligas[0] : miembro.ligas) as LigaInfo | null;
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

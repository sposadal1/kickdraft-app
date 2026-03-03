'use client';

import { useEffect, useState } from 'react';
import { PARTIDOS } from '@/data/partidos';
import { EQUIPOS } from '@/data/equipos';
import InputMarcador from '@/components/pronosticos/InputMarcador';
import { Trophy, LogIn } from 'lucide-react';
import Link from 'next/link';
import { FasePartido } from '@/types/partido';
import { obtenerNombreFase } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

const FASES_DISPONIBLES: FasePartido[] = ['grupos'];

type PronosticoData = { golesLocal: number; golesVisitante: number; puntosObtenidos: number };

export default function PronosticosPage() {
  const [faseActiva, setFaseActiva] = useState<FasePartido>('grupos');
  const [usuario, setUsuario] = useState<User | null | undefined>(undefined);
  const [pronosticos, setPronosticos] = useState<Record<number, PronosticoData>>({});
  const [guardando, setGuardando] = useState<Record<number, boolean>>({});
  const [guardado, setGuardado] = useState<Record<number, boolean>>({});
  const [errorGuardando, setErrorGuardando] = useState<Record<number, boolean>>({});

  const ahora = new Date();
  const partidosFiltrados = PARTIDOS.filter((p) => p.fase === faseActiva);

  const totalPuntos = Object.values(pronosticos).reduce((sum, p) => sum + p.puntosObtenidos, 0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data.user) {
        setUsuario(data.user);
        cargarPronosticos(data.user);
      } else {
        setUsuario(null);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUsuario(session.user);
        cargarPronosticos(session.user);
      } else {
        setUsuario(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function cargarPronosticos(user: User) {
    const { data } = await supabase
      .from('pronosticos')
      .select('partido_id, goles_local_pronosticado, goles_visitante_pronosticado, puntos_obtenidos')
      .eq('usuario_id', user.id);

    if (data) {
      const map: Record<number, PronosticoData> = {};
      for (const row of data) {
        map[row.partido_id] = {
          golesLocal: row.goles_local_pronosticado,
          golesVisitante: row.goles_visitante_pronosticado,
          puntosObtenidos: row.puntos_obtenidos ?? 0,
        };
      }
      setPronosticos(map);
    }
  }

  async function guardarPronostico(partidoId: number, golesLocal: number, golesVisitante: number) {
    if (!usuario) return;

    setGuardando((prev) => ({ ...prev, [partidoId]: true }));
    setErrorGuardando((prev) => ({ ...prev, [partidoId]: false }));

    const { error } = await supabase.from('pronosticos').upsert(
      {
        usuario_id: usuario.id,
        partido_id: partidoId,
        goles_local_pronosticado: golesLocal,
        goles_visitante_pronosticado: golesVisitante,
      },
      { onConflict: 'usuario_id,partido_id' }
    );

    setGuardando((prev) => ({ ...prev, [partidoId]: false }));

    if (error) {
      setErrorGuardando((prev) => ({ ...prev, [partidoId]: true }));
      return;
    }

    setPronosticos((prev) => ({
      ...prev,
      [partidoId]: { golesLocal, golesVisitante, puntosObtenidos: prev[partidoId]?.puntosObtenidos ?? 0 },
    }));
    setGuardado((prev) => ({ ...prev, [partidoId]: true }));
    setTimeout(() => {
      setGuardado((prev) => ({ ...prev, [partidoId]: false }));
    }, 2000);
  }

  if (usuario === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-verde-900/40 rounded-2xl mb-6">
          <Trophy className="w-8 h-8 text-verde-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Mis Pronósticos</h1>
        <p className="text-gray-400 mb-8">
          Inicia sesión para hacer tus pronósticos y competir con amigos en el Mundial 2026.
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
        <div>
          <h1 className="text-3xl font-bold text-white">Mis Pronósticos</h1>
          <p className="text-gray-400">Mundial 2026</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-verde-400">{totalPuntos}</span>
          <p className="text-xs text-gray-500">puntos totales</p>
        </div>
      </div>

      {/* Filtro por fase */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {FASES_DISPONIBLES.map((fase) => (
          <button
            key={fase}
            onClick={() => setFaseActiva(fase)}
            className={`text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              faseActiva === fase
                ? 'bg-verde-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {obtenerNombreFase(fase)}
          </button>
        ))}
      </div>

      {/* Lista de partidos con input */}
      <div className="space-y-4">
        {partidosFiltrados.map((partido) => {
          const equipoLocal = EQUIPOS.find((e) => e.id === partido.equipoLocalId);
          const equipoVisitante = EQUIPOS.find((e) => e.id === partido.equipoVisitanteId);

          if (!equipoLocal || !equipoVisitante) return null;

          const bloqueado = ahora >= new Date(partido.fechaHoraUTC);

          return (
            <div key={partido.id}>
              <InputMarcador
                partido={partido}
                equipoLocal={equipoLocal}
                equipoVisitante={equipoVisitante}
                pronosticoInicial={pronosticos[partido.id]}
                onGuardar={(gl, gv) => guardarPronostico(partido.id, gl, gv)}
                bloqueado={bloqueado}
                guardando={guardando[partido.id] ?? false}
                guardado={guardado[partido.id] ?? false}
              />
              {errorGuardando[partido.id] && (
                <p className="text-red-400 text-xs mt-1 text-right">
                  Error al guardar. Intenta de nuevo.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


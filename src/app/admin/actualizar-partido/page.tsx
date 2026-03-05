'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { actualizarPuntosPartido } from '@/lib/actualizarPuntos';
import type { Partido, FasePartido } from '@/types/partido';
import { obtenerNombreFase, formatearFecha } from '@/lib/utils';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function ActualizarPartidoPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [partidoId, setPartidoId] = useState<number | ''>('');
  const [golesLocal, setGolesLocal] = useState<number | ''>('');
  const [golesVisitante, setGolesVisitante] = useState<number | ''>('');
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<{ actualizados: number; errores: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verificarAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        setAutorizado(false);
        return;
      }
      setAutorizado(true);

      const { data } = await supabase
        .from('partidos')
        .select('*')
        .order('numero_partido', { ascending: true });
      setPartidos((data as Partido[]) || []);
    }
    verificarAdmin();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResultado(null);

    if (partidoId === '' || golesLocal === '' || golesVisitante === '') {
      setError('Completa todos los campos.');
      return;
    }

    const partido = partidos.find((p) => p.id === partidoId);
    if (!partido) {
      setError('Partido no encontrado.');
      return;
    }

    setCargando(true);
    try {
      const res = await actualizarPuntosPartido(
        partido.id,
        partido.fase as FasePartido,
        Number(golesLocal),
        Number(golesVisitante)
      );
      setResultado(res);
    } catch (err) {
      setError('Error al actualizar los puntos.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  }

  if (autorizado === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Verificando acceso...</p>
      </div>
    );
  }

  if (autorizado === false) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Acceso denegado</h1>
          <p className="text-gray-400">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-black mb-2 text-verde-400">Admin — Actualizar partido</h1>
        <p className="text-gray-400 mb-8">
          Selecciona un partido, ingresa el marcador final y calcula los puntos de todos los pronósticos.
        </p>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Partido</label>
            <select
              value={partidoId}
              onChange={(e) => setPartidoId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-verde-500"
            >
              <option value="">Selecciona un partido</option>
              {partidos.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.numeroPartido} — {obtenerNombreFase(p.fase)} ({formatearFecha(p.fechaHoraUTC)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Goles local</label>
              <input
                type="number"
                min={0}
                value={golesLocal}
                onChange={(e) => setGolesLocal(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-verde-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Goles visitante</label>
              <input
                type="number"
                min={0}
                value={golesVisitante}
                onChange={(e) => setGolesVisitante(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-verde-500"
                placeholder="0"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {resultado && (
            <div className="bg-verde-900/20 border border-verde-800 rounded-xl px-4 py-3">
              <p className="text-verde-400 font-semibold">
                ✅ {resultado.actualizados} pronósticos actualizados
                {resultado.errores > 0 && ` — ⚠️ ${resultado.errores} errores`}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-verde-600 hover:bg-verde-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
          >
            {cargando ? 'Calculando...' : 'Calcular puntos'}
          </button>
        </form>
      </div>
    </div>
  );
}

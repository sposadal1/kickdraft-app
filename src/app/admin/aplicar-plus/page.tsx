'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { aplicarPuntosCampeonGoleador } from '@/lib/actualizarPuntos';
import { EQUIPOS } from '@/data/equipos';
import { CANDIDATOS_GOLEADOR, GOLEADORES_PENDIENTES_DATASET, GOLEADORES_MENSAJE_PENDIENTE } from '@/data/goleadores';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function AplicarPlusPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [campeonId, setCampeonId] = useState<number | ''>('');
  const [goleadorNombre, setGoleadorNombre] = useState('');
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
    }
    verificarAdmin();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResultado(null);

    if (campeonId === '' || !goleadorNombre) {
      setError('Completa todos los campos.');
      return;
    }

    setCargando(true);
    try {
      const res = await aplicarPuntosCampeonGoleador(Number(campeonId), goleadorNombre);
      setResultado(res);
    } catch (err) {
      setError('Error al aplicar los puntos.');
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
        <h1 className="text-3xl font-black mb-2 text-yellow-400">Admin — Aplicar puntos Campeón &amp; Goleador</h1>
        <p className="text-gray-400 mb-8">
          Selecciona el campeón y el goleador oficial del torneo. Se calcularán y asignarán los +10 pts
          a todos los miembros de ligas con esta opción activa que acertaron.
        </p>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">🏆 País Campeón</label>
            <select
              value={campeonId}
              onChange={(e) => setCampeonId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500"
            >
              <option value="">Selecciona el campeón...</option>
              {EQUIPOS.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nombre} ({eq.nombreCorto})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">⚽ Goleador del Torneo</label>
            {GOLEADORES_PENDIENTES_DATASET && (
              <p className="text-xs text-yellow-400 mb-2">{GOLEADORES_MENSAJE_PENDIENTE}</p>
            )}
            {CANDIDATOS_GOLEADOR.length > 0 ? (
              <select
                value={goleadorNombre}
                onChange={(e) => setGoleadorNombre(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500"
              >
                <option value="">Selecciona el goleador...</option>
                {CANDIDATOS_GOLEADOR.map((g) => (
                  <option key={g.nombre} value={g.nombre}>
                    {g.nombre} ({g.pais})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={goleadorNombre}
                onChange={(e) => setGoleadorNombre(e.target.value)}
                placeholder="Nombre del goleador oficial"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500"
              />
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {resultado && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl px-4 py-3">
              <p className="text-yellow-400 font-semibold">
                ✅ {resultado.actualizados} predicciones procesadas
                {resultado.errores > 0 && ` — ⚠️ ${resultado.errores} errores`}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando || campeonId === '' || !goleadorNombre}
            className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
          >
            {cargando ? 'Aplicando...' : 'Aplicar puntos Campeón & Goleador'}
          </button>
        </form>
      </div>
    </div>
  );
}

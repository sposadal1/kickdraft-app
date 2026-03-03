'use client';

import { useState } from 'react';
import { PARTIDOS } from '@/data/partidos';
import { EQUIPOS } from '@/data/equipos';
import InputMarcador from '@/components/pronosticos/InputMarcador';
import { Trophy, LogIn } from 'lucide-react';
import Link from 'next/link';
import { FasePartido } from '@/types/partido';
import { obtenerNombreFase } from '@/lib/utils';

const FASES_DISPONIBLES: FasePartido[] = ['grupos'];

export default function PronosticosPage() {
  const [faseActiva, setFaseActiva] = useState<FasePartido>('grupos');
  const [autenticado] = useState(false); // Se reemplazará con auth real
  const [pronosticos, setPronosticos] = useState<Record<number, { golesLocal: number; golesVisitante: number }>>({});

  const partidosFiltrados = PARTIDOS.filter((p) => p.fase === faseActiva);

  const totalPuntos = 0; // Se calculará con auth real

  function guardarPronostico(partidoId: number, golesLocal: number, golesVisitante: number) {
    setPronosticos((prev) => ({ ...prev, [partidoId]: { golesLocal, golesVisitante } }));
  }

  if (!autenticado) {
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

          return (
            <InputMarcador
              key={partido.id}
              partido={partido}
              equipoLocal={equipoLocal}
              equipoVisitante={equipoVisitante}
              pronosticoInicial={pronosticos[partido.id]}
              onGuardar={(gl, gv) => guardarPronostico(partido.id, gl, gv)}
            />
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Partido } from '@/types/partido';
import { Equipo } from '@/types/equipo';
import { getPuntosPorFase } from '@/lib/puntuacion';
import { formatearFecha, formatearHora } from '@/lib/utils';
import { Save } from 'lucide-react';
import Image from 'next/image';

interface Props {
  partido: Partido;
  equipoLocal: Equipo;
  equipoVisitante: Equipo;
  pronosticoInicial?: { golesLocal: number; golesVisitante: number };
  onGuardar: (golesLocal: number, golesVisitante: number) => void;
}

export default function InputMarcador({
  partido,
  equipoLocal,
  equipoVisitante,
  pronosticoInicial,
  onGuardar,
}: Props) {
  const [golesLocal, setGolesLocal] = useState(pronosticoInicial?.golesLocal ?? 0);
  const [golesVisitante, setGolesVisitante] = useState(pronosticoInicial?.golesVisitante ?? 0);

  const puntos = getPuntosPorFase(partido.fase);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="text-xs text-verde-400 font-semibold uppercase mb-3">
        {partido.grupoId ? `Grupo ${partido.grupoId}` : partido.fase} ·{' '}
        {formatearFecha(partido.fechaHoraUTC)} {formatearHora(partido.fechaHoraUTC)} (COL)
      </div>

      <div className="flex items-center gap-3">
        {/* Equipo local */}
        <div className="flex flex-col items-center gap-1 flex-1">
          {equipoLocal.banderaUrl && (
            <Image src={equipoLocal.banderaUrl} alt={equipoLocal.nombre} width={40} height={28} className="rounded" />
          )}
          <span className="text-xs font-semibold text-white">{equipoLocal.nombreCorto}</span>
        </div>

        {/* Inputs marcador */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={20}
            value={golesLocal}
            onChange={(e) => setGolesLocal(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
            className="w-12 h-10 text-center text-lg font-bold bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-verde-500 focus:outline-none"
          />
          <span className="text-gray-500 font-bold">-</span>
          <input
            type="number"
            min={0}
            max={20}
            value={golesVisitante}
            onChange={(e) => setGolesVisitante(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
            className="w-12 h-10 text-center text-lg font-bold bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-verde-500 focus:outline-none"
          />
        </div>

        {/* Equipo visitante */}
        <div className="flex flex-col items-center gap-1 flex-1">
          {equipoVisitante.banderaUrl && (
            <Image src={equipoVisitante.banderaUrl} alt={equipoVisitante.nombre} width={40} height={28} className="rounded" />
          )}
          <span className="text-xs font-semibold text-white">{equipoVisitante.nombreCorto}</span>
        </div>
      </div>

      {/* Puntos posibles y botón guardar */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Puntos posibles: <span className="text-verde-400 font-bold">{puntos.resultado}</span> resultado /{' '}
          <span className="text-verde-400 font-bold">{puntos.exacto}</span> exacto
        </span>
        <button
          onClick={() => onGuardar(golesLocal, golesVisitante)}
          className="flex items-center gap-1 bg-verde-600 hover:bg-verde-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <Save className="w-3 h-3" />
          Guardar
        </button>
      </div>
    </div>
  );
}

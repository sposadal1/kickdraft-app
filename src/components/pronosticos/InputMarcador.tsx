'use client';

import { useState, useEffect, useRef } from 'react';
import { Partido } from '@/types/partido';
import { Equipo } from '@/types/equipo';
import { getPuntosPorFase } from '@/lib/puntuacion';
import { formatearFecha, formatearHora } from '@/lib/utils';
import { Lock } from 'lucide-react';
import Image from 'next/image';

interface Props {
  partido: Partido;
  equipoLocal: Equipo;
  equipoVisitante: Equipo;
  pronosticoInicial?: { golesLocal: number; golesVisitante: number };
  onGuardar: (golesLocal: number, golesVisitante: number) => void;
  bloqueado?: boolean;
  guardando?: boolean;
  guardado?: boolean;
}

export default function InputMarcador({
  partido,
  equipoLocal,
  equipoVisitante,
  pronosticoInicial,
  onGuardar,
  bloqueado = false,
  guardando = false,
  guardado = false,
}: Props) {
  const [golesLocal, setGolesLocal] = useState(pronosticoInicial?.golesLocal ?? 0);
  const [golesVisitante, setGolesVisitante] = useState(pronosticoInicial?.golesVisitante ?? 0);

  const esPrimerRender = useRef(true);

  useEffect(() => {
    if (esPrimerRender.current) {
      esPrimerRender.current = false;
      return;
    }
    if (bloqueado) return;

    const timer = setTimeout(() => {
      onGuardar(golesLocal, golesVisitante);
    }, 900);

    return () => clearTimeout(timer);
  }, [golesLocal, golesVisitante, bloqueado, onGuardar]);

  const puntos = getPuntosPorFase(partido.fase);

  return (
    <div className={`bg-gray-900 border rounded-xl p-4 ${bloqueado ? 'border-gray-700 opacity-75' : 'border-gray-800'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-verde-400 font-semibold uppercase">
          {partido.grupoId ? `Grupo ${partido.grupoId}` : partido.fase} ·{' '}
          {formatearFecha(partido.fechaHoraUTC)} {formatearHora(partido.fechaHoraUTC)} (COL)
        </div>
        {bloqueado && (
          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
            <Lock className="w-3 h-3" />
            {partido.estado === 'finalizado' ? 'Finalizado' : 'En curso'}
          </span>
        )}
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
            disabled={bloqueado}
            onChange={(e) => setGolesLocal(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
            className="w-12 h-10 text-center text-lg font-bold bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-verde-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="text-gray-500 font-bold">-</span>
          <input
            type="number"
            min={0}
            max={20}
            value={golesVisitante}
            disabled={bloqueado}
            onChange={(e) => setGolesVisitante(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
            className="w-12 h-10 text-center text-lg font-bold bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-verde-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Puntos posibles e indicador de estado */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Puntos posibles: <span className="text-verde-400 font-bold">{puntos.resultado}</span> resultado /{' '}
          <span className="text-verde-400 font-bold">{puntos.exacto}</span> exacto
        </span>
        <div className="text-xs">
          {guardando && <span className="text-gray-400">Guardando...</span>}
          {guardado && !guardando && <span className="text-verde-400">✓ Guardado</span>}
        </div>
      </div>
    </div>
  );
}

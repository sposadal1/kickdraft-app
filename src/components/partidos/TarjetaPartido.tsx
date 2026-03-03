import { Partido } from '@/types/partido';
import { Equipo } from '@/types/equipo';
import { formatearFecha, formatearHora, obtenerNombreFase } from '@/lib/utils';
import { MapPin, Clock } from 'lucide-react';
import Image from 'next/image';

interface Props {
  partido: Partido;
  equipoLocal: Equipo;
  equipoVisitante: Equipo;
}

const ESTADO_BADGE = {
  programado: { label: 'Programado', className: 'bg-gray-700 text-gray-200' },
  en_vivo: { label: '● En Vivo', className: 'bg-red-600 text-white animate-pulse' },
  finalizado: { label: 'Finalizado', className: 'bg-verde-800 text-verde-200' },
};

export default function TarjetaPartido({ partido, equipoLocal, equipoVisitante }: Props) {
  const estado = ESTADO_BADGE[partido.estado];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-verde-600 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-verde-400 uppercase tracking-wider">
          {partido.grupoId ? `Grupo ${partido.grupoId}` : obtenerNombreFase(partido.fase)}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estado.className}`}>
          {estado.label}
        </span>
      </div>

      {/* Equipos y marcador */}
      <div className="flex items-center justify-between gap-4">
        {/* Equipo local */}
        <div className="flex flex-col items-center gap-1 flex-1">
          {equipoLocal.banderaUrl ? (
            <Image
              src={equipoLocal.banderaUrl}
              alt={equipoLocal.nombre}
              width={48}
              height={32}
              className="rounded shadow"
            />
          ) : (
            <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-400">
              {equipoLocal.codigoPais}
            </div>
          )}
          <span className="text-sm font-semibold text-white text-center">{equipoLocal.nombreCorto}</span>
        </div>

        {/* Marcador */}
        <div className="flex items-center gap-2">
          {partido.estado === 'finalizado' ? (
            <span className="text-2xl font-bold text-white">
              {partido.golesLocal} - {partido.golesVisitante}
            </span>
          ) : (
            <span className="text-2xl font-bold text-gray-500">VS</span>
          )}
        </div>

        {/* Equipo visitante */}
        <div className="flex flex-col items-center gap-1 flex-1">
          {equipoVisitante.banderaUrl ? (
            <Image
              src={equipoVisitante.banderaUrl}
              alt={equipoVisitante.nombre}
              width={48}
              height={32}
              className="rounded shadow"
            />
          ) : (
            <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-400">
              {equipoVisitante.codigoPais}
            </div>
          )}
          <span className="text-sm font-semibold text-white text-center">{equipoVisitante.nombreCorto}</span>
        </div>
      </div>

      {/* Footer: fecha, hora, estadio */}
      <div className="mt-3 pt-3 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatearFecha(partido.fechaHoraUTC)} · {formatearHora(partido.fechaHoraUTC)} (COL)
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {partido.estadio}, {partido.ciudad}
        </span>
      </div>
    </div>
  );
}

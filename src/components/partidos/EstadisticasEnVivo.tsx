'use client';
import { usePartidoEnVivo } from '@/hooks/usePartidoEnVivo';

interface Props {
  partidoId: number;
  nombreLocal: string;
  nombreVisitante: string;
}

export default function EstadisticasEnVivo({ partidoId, nombreLocal, nombreVisitante }: Props) {
  const partido = usePartidoEnVivo(partidoId);

  if (!partido) {
    return (
      <div className="animate-pulse bg-gray-900 rounded-2xl p-6 space-y-4">
        <div className="h-16 bg-gray-800 rounded-xl" />
        <div className="h-4 bg-gray-800 rounded w-3/4 mx-auto" />
        <div className="h-4 bg-gray-800 rounded" />
        <div className="h-4 bg-gray-800 rounded" />
      </div>
    );
  }

  const estaEnVivo = partido.estado === 'en_vivo';
  const finalizado = partido.estado === 'finalizado';
  const stats = partido.estadisticas;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
      {/* Marcador */}
      <div className="text-center">
        {estaEnVivo && (
          <div className="inline-flex items-center gap-2 bg-red-900/30 border border-red-700 text-red-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            EN VIVO {partido.minutoActual ? `${partido.minutoActual}'` : ''}
          </div>
        )}
        {finalizado && (
          <div className="inline-flex items-center gap-2 bg-gray-800 text-gray-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
            FINALIZADO
          </div>
        )}
        <div className="flex items-center justify-center gap-6">
          <span className="text-white font-bold text-lg w-24 text-right truncate">{nombreLocal}</span>
          <span className="text-5xl font-black text-white tabular-nums">
            {partido.golesLocal} – {partido.golesVisitante}
          </span>
          <span className="text-white font-bold text-lg w-24 text-left truncate">{nombreVisitante}</span>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="space-y-4">
          {/* Posesión */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{stats.posesionLocal}%</span>
              <span className="text-gray-500">Posesión</span>
              <span>{stats.posesionVisitante}%</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden">
              <div className="bg-verde-500 transition-all duration-500" style={{ width: `${stats.posesionLocal}%` }} />
              <div className="bg-gray-600 flex-1" />
            </div>
          </div>

          {/* Resto de stats */}
          {[
            { label: 'Tiros totales', local: stats.tirosLocal, visitante: stats.tirosVisitante },
            { label: 'Tiros a puerta', local: stats.tirosPuertaLocal, visitante: stats.tirosPuertaVisitante },
            { label: 'Córners', local: stats.cornersLocal, visitante: stats.cornersVisitante },
            { label: 'Faltas', local: stats.faltasLocal, visitante: stats.faltasVisitante },
            { label: 'Tarjetas amarillas', local: stats.tarjetasAmarillasLocal, visitante: stats.tarjetasAmarillasVisitante },
            { label: 'Tarjetas rojas', local: stats.tarjetasRojasLocal, visitante: stats.tarjetasRojasVisitante },
          ].map(({ label, local, visitante }) => {
            const total = local + visitante || 1;
            return (
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span className="font-semibold text-white">{local}</span>
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-white">{visitante}</span>
                </div>
                <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
                  <div className="bg-verde-500 transition-all duration-500" style={{ width: `${(local / total) * 100}%` }} />
                  <div className="bg-gray-600 flex-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!stats && (estaEnVivo || finalizado) && (
        <p className="text-center text-gray-500 text-sm">Estadísticas no disponibles aún</p>
      )}
    </div>
  );
}

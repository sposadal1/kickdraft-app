interface EstadisticasPartido {
  posesionLocal: number;
  posesionVisitante: number;
  tirosAPuertaLocal: number;
  tirosAPuertaVisitante: number;
  tirosLocal: number;
  tirosVisitante: number;
  cornersLocal: number;
  cornersVisitante: number;
  faltasLocal: number;
  faltasVisitante: number;
  amarillasLocal: number;
  amarillasVisitante: number;
}

interface Props {
  estado: string;
  nombreLocal: string;
  nombreVisitante: string;
}

const ESTADISTICAS_MOCK: EstadisticasPartido = {
  posesionLocal: 54,
  posesionVisitante: 46,
  tirosAPuertaLocal: 5,
  tirosAPuertaVisitante: 3,
  tirosLocal: 12,
  tirosVisitante: 8,
  cornersLocal: 6,
  cornersVisitante: 4,
  faltasLocal: 11,
  faltasVisitante: 14,
  amarillasLocal: 1,
  amarillasVisitante: 2,
};

interface FilaEstadisticaProps {
  label: string;
  valorLocal: number;
  valorVisitante: number;
  esPorcentaje?: boolean;
}

function FilaEstadistica({ label, valorLocal, valorVisitante, esPorcentaje }: FilaEstadisticaProps) {
  const total = valorLocal + valorVisitante || 1;
  const anchoLocal = Math.round((valorLocal / total) * 100);
  const anchoVisitante = 100 - anchoLocal;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold text-white w-8">{valorLocal}{esPorcentaje ? '%' : ''}</span>
        <span className="text-gray-400 text-xs">{label}</span>
        <span className="font-semibold text-white w-8 text-right">{valorVisitante}{esPorcentaje ? '%' : ''}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-800">
        <div className="bg-verde-500 rounded-l-full" style={{ width: `${anchoLocal}%` }} />
        <div className="bg-orange-500 rounded-r-full" style={{ width: `${anchoVisitante}%` }} />
      </div>
    </div>
  );
}

export default function SeccionEstadisticas({ estado, nombreLocal, nombreVisitante }: Props) {
  const esVisible = estado === 'en_vivo' || estado === 'finalizado';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
      <h3 className="text-lg font-bold text-white mb-4">Estadísticas</h3>

      {esVisible ? (
        <>
          <div className="flex justify-between text-xs text-gray-500 mb-4">
            <span className="font-medium text-verde-400">{nombreLocal}</span>
            <span className="font-medium text-orange-400">{nombreVisitante}</span>
          </div>
          <div className="space-y-4">
            <FilaEstadistica
              label="Posesión"
              valorLocal={ESTADISTICAS_MOCK.posesionLocal}
              valorVisitante={ESTADISTICAS_MOCK.posesionVisitante}
              esPorcentaje
            />
            <FilaEstadistica
              label="Tiros a puerta"
              valorLocal={ESTADISTICAS_MOCK.tirosAPuertaLocal}
              valorVisitante={ESTADISTICAS_MOCK.tirosAPuertaVisitante}
            />
            <FilaEstadistica
              label="Tiros"
              valorLocal={ESTADISTICAS_MOCK.tirosLocal}
              valorVisitante={ESTADISTICAS_MOCK.tirosVisitante}
            />
            <FilaEstadistica
              label="Córners"
              valorLocal={ESTADISTICAS_MOCK.cornersLocal}
              valorVisitante={ESTADISTICAS_MOCK.cornersVisitante}
            />
            <FilaEstadistica
              label="Faltas"
              valorLocal={ESTADISTICAS_MOCK.faltasLocal}
              valorVisitante={ESTADISTICAS_MOCK.faltasVisitante}
            />
            <FilaEstadistica
              label="Tarjetas amarillas"
              valorLocal={ESTADISTICAS_MOCK.amarillasLocal}
              valorVisitante={ESTADISTICAS_MOCK.amarillasVisitante}
            />
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-sm">Las estadísticas estarán disponibles cuando comience el partido</p>
      )}
    </div>
  );
}

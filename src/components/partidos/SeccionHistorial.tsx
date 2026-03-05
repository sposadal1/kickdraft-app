import { HistorialEnfrentamiento, PartidoHistorial } from '@/data/historial';

interface Props {
  historial: HistorialEnfrentamiento | undefined;
  nombreLocal: string;
  nombreVisitante: string;
}

function badgeResultado(resultado: PartidoHistorial['resultado'], nombreLocal: string, nombreVisitante: string) {
  if (resultado === 'local') {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-verde-900/50 text-verde-400 font-medium">Victoria {nombreLocal}</span>;
  }
  if (resultado === 'visitante') {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-900/50 text-orange-400 font-medium">Victoria {nombreVisitante}</span>;
  }
  return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 font-medium">Empate</span>;
}

export default function SeccionHistorial({ historial, nombreLocal, nombreVisitante }: Props) {
  if (!historial) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">Historial entre selecciones</h3>
        <p className="text-gray-500 text-sm">No hay enfrentamientos previos registrados</p>
      </div>
    );
  }

  const { partidosJugados, victoriasLocal, empates, victoriasVisitante, ultimos5 } = historial;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Historial entre selecciones</h3>

      {/* Resumen visual */}
      <div className="flex items-center justify-between mb-2 text-sm">
        <div className="text-center flex-1">
          <div className="text-2xl font-black text-verde-400">{victoriasLocal}</div>
          <div className="text-xs text-gray-500">{nombreLocal}</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-2xl font-black text-gray-400">{empates}</div>
          <div className="text-xs text-gray-500">Empates</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-2xl font-black text-orange-400">{victoriasVisitante}</div>
          <div className="text-xs text-gray-500">{nombreVisitante}</div>
        </div>
      </div>

      {/* Barra proporcional */}
      <div className="flex h-2 rounded-full overflow-hidden mb-1 bg-gray-800">
        {victoriasLocal > 0 && (
          <div
            className="bg-verde-500"
            style={{ width: `${Math.round((victoriasLocal / partidosJugados) * 100)}%` }}
          />
        )}
        {empates > 0 && (
          <div
            className="bg-gray-500"
            style={{ width: `${Math.round((empates / partidosJugados) * 100)}%` }}
          />
        )}
        {victoriasVisitante > 0 && (
          <div
            className="bg-orange-500"
            style={{ width: `${Math.round((victoriasVisitante / partidosJugados) * 100)}%` }}
          />
        )}
      </div>
      <p className="text-xs text-gray-500 mb-5">{partidosJugados} partidos jugados</p>

      {/* Últimos partidos */}
      <h4 className="text-sm font-semibold text-gray-400 mb-3">Últimos enfrentamientos</h4>
      <div className="space-y-2">
        {ultimos5.map((partido, idx) => (
          <div key={idx} className="border border-gray-800 rounded-xl p-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="text-xs text-gray-500">{partido.fecha} · {partido.torneo}</p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {nombreLocal} {partido.golesLocal} – {partido.golesVisitante} {nombreVisitante}
                </p>
              </div>
              {badgeResultado(partido.resultado, nombreLocal, nombreVisitante)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

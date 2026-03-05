import { AlineacionEquipo, Jugador } from '@/data/alineaciones';

interface Props {
  alineacion: AlineacionEquipo | undefined;
  nombreEquipo: string;
}

const ETIQUETAS_POSICION: Record<Jugador['posicion'], string> = {
  POR: 'Portero',
  DEF: 'Defensas',
  MED: 'Mediocampistas',
  DEL: 'Delanteros',
};

const ORDEN_POSICION: Jugador['posicion'][] = ['POR', 'DEF', 'MED', 'DEL'];

export default function SeccionAlineaciones({ alineacion, nombreEquipo }: Props) {
  if (!alineacion) {
    return (
      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-2">{nombreEquipo}</h4>
        <p className="text-gray-600 text-sm">Alineación no disponible</p>
      </div>
    );
  }

  const jugadoresPorPosicion = ORDEN_POSICION.reduce<Record<string, Jugador[]>>((acc, pos) => {
    acc[pos] = alineacion.jugadores.filter((j) => j.posicion === pos);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white">{nombreEquipo}</h4>
        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{alineacion.formacion}</span>
      </div>
      <div className="space-y-3">
        {ORDEN_POSICION.map((pos) => {
          const jugadores = jugadoresPorPosicion[pos];
          if (!jugadores || jugadores.length === 0) return null;
          return (
            <div key={pos}>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{ETIQUETAS_POSICION[pos]}</p>
              <div className="space-y-1">
                {jugadores.map((jugador, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-5 text-right">{jugador.numero}</span>
                    <span className="text-sm text-gray-300">{jugador.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

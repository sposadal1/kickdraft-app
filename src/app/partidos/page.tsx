import { PARTIDOS } from '@/data/partidos';
import { EQUIPOS, GRUPOS } from '@/data/equipos';
import TarjetaPartido from '@/components/partidos/TarjetaPartido';
import { FasePartido } from '@/types/partido';

const FASES: { valor: FasePartido | 'todos'; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'grupos', label: 'Grupos' },
  { valor: 'dieciseisavos', label: 'Dieciseisavos' },
  { valor: 'octavos', label: 'Octavos' },
  { valor: 'cuartos', label: 'Cuartos' },
  { valor: 'semifinal', label: 'Semifinal' },
  { valor: 'final', label: 'Final' },
];

export default function PartidosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Partidos</h1>
      <p className="text-gray-400 mb-8">Todos los partidos del Mundial 2026 · Hora Colombia (UTC-5)</p>

      {/* Filtros por grupo */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Grupos</h2>
        <div className="flex flex-wrap gap-2">
          {GRUPOS.map((grupo) => (
            <span
              key={grupo}
              className="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-lg border border-gray-700"
            >
              Grupo {grupo}
            </span>
          ))}
        </div>
      </div>

      {/* Lista de partidos */}
      <div className="space-y-4">
        {PARTIDOS.map((partido) => {
          const equipoLocal = EQUIPOS.find((e) => e.id === partido.equipoLocalId);
          const equipoVisitante = EQUIPOS.find((e) => e.id === partido.equipoVisitanteId);

          if (!equipoLocal || !equipoVisitante) return null;

          return (
            <TarjetaPartido
              key={partido.id}
              partido={partido}
              equipoLocal={equipoLocal}
              equipoVisitante={equipoVisitante}
            />
          );
        })}
      </div>
    </div>
  );
}

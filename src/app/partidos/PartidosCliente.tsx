'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PARTIDOS } from '@/data/partidos';
import { EQUIPOS, GRUPOS } from '@/data/equipos';
import TarjetaPartido from '@/components/partidos/TarjetaPartido';
import { FasePartido } from '@/types/partido';

const FASES: { valor: FasePartido | 'todos'; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'grupos', label: 'Solo grupos' },
  { valor: 'dieciseisavos', label: 'Dieciseisavos' },
  { valor: 'octavos', label: 'Octavos' },
  { valor: 'cuartos', label: 'Cuartos' },
  { valor: 'semifinal', label: 'Semifinal' },
  { valor: 'final', label: 'Final' },
];

export default function PartidosCliente() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const grupoParam = searchParams.get('group') ?? 'todos';
  const faseParam = (searchParams.get('fase') ?? 'todos') as FasePartido | 'todos';

  const [grupoActivo, setGrupoActivo] = useState<string>(grupoParam);
  const [faseActiva, setFaseActiva] = useState<FasePartido | 'todos'>(faseParam);

  const buildUrl = useCallback(
    (nuevoGrupo: string, nuevaFase: FasePartido | 'todos') => {
      const params = new URLSearchParams();
      if (nuevoGrupo !== 'todos') params.set('group', nuevoGrupo);
      if (nuevaFase !== 'todos') params.set('fase', nuevaFase);
      const qs = params.toString();
      return `/partidos${qs ? `?${qs}` : ''}`;
    },
    []
  );

  function handleGrupo(grupo: string) {
    const next = grupo === grupoActivo ? 'todos' : grupo;
    setGrupoActivo(next);
    // When a group is selected, clear the fase filter
    const nextFase = next !== 'todos' ? 'todos' : faseActiva;
    setFaseActiva(nextFase);
    router.push(buildUrl(next, nextFase), { scroll: false });
  }

  function handleFase(fase: FasePartido | 'todos') {
    setFaseActiva(fase);
    // When a fase filter is selected (non-grupos), clear group
    const nextGrupo = fase !== 'todos' && fase !== 'grupos' ? 'todos' : grupoActivo;
    setGrupoActivo(nextGrupo);
    router.push(buildUrl(nextGrupo, fase), { scroll: false });
  }

  // Sync state when URL changes (e.g. browser back/forward)
  useEffect(() => {
    setGrupoActivo(searchParams.get('group') ?? 'todos');
    setFaseActiva((searchParams.get('fase') ?? 'todos') as FasePartido | 'todos');
  }, [searchParams]);

  const partidosFiltrados = PARTIDOS.filter((partido) => {
    if (grupoActivo !== 'todos' && partido.grupoId !== grupoActivo) return false;
    if (faseActiva !== 'todos' && partido.fase !== faseActiva) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Partidos</h1>
      <p className="text-gray-400 mb-8">Todos los partidos del Mundial 2026 · Hora Colombia (UTC-5)</p>

      {/* Filtros por fase */}
      <div className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">Fase</h2>
        <div className="flex flex-wrap gap-2">
          {FASES.map(({ valor, label }) => (
            <button
              key={valor}
              onClick={() => handleFase(valor)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                faseActiva === valor
                  ? 'bg-verde-600 border-verde-500 text-white font-semibold'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-verde-700 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros por grupo */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">Grupos</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleGrupo('todos')}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              grupoActivo === 'todos'
                ? 'bg-verde-600 border-verde-500 text-white font-semibold'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-verde-700 hover:text-white'
            }`}
          >
            Todos los grupos
          </button>
          {GRUPOS.map((grupo) => (
            <button
              key={grupo}
              onClick={() => handleGrupo(grupo)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                grupoActivo === grupo
                  ? 'bg-verde-600 border-verde-500 text-white font-semibold'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-verde-700 hover:text-white'
              }`}
            >
              Grupo {grupo}
            </button>
          ))}
        </div>
      </div>

      {/* Resultado del filtro */}
      {(grupoActivo !== 'todos' || faseActiva !== 'todos') && (
        <p className="text-sm text-gray-400 mb-4">
          Mostrando <strong className="text-white">{partidosFiltrados.length}</strong> partido{partidosFiltrados.length !== 1 ? 's' : ''}
          {grupoActivo !== 'todos' && <> del <span className="text-verde-400">Grupo {grupoActivo}</span></>}
          {faseActiva !== 'todos' && <> · fase <span className="text-verde-400">{faseActiva}</span></>}
          <button
            onClick={() => {
              setGrupoActivo('todos');
              setFaseActiva('todos');
              router.push('/partidos', { scroll: false });
            }}
            className="ml-3 text-xs text-gray-500 hover:text-white underline"
          >
            Limpiar filtros
          </button>
        </p>
      )}

      {/* Lista de partidos */}
      {partidosFiltrados.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium">No hay partidos para este filtro</p>
          <p className="text-sm mt-1">Intenta con otro grupo o fase.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {partidosFiltrados.map((partido) => {
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
      )}
    </div>
  );
}

import { Equipo } from '@/types/equipo';
import { Partido } from '@/types/partido';

export interface FilaTablaGrupo {
  equipo: Equipo;
  jugados: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  golesFavor: number;
  golesContra: number;
  diferencia: number;
  puntos: number;
}

export function obtenerEquiposGrupo(grupoId: string, equipos: Equipo[]): Equipo[] {
  return equipos.filter((e) => e.grupoId === grupoId);
}

export function calcularTablaGrupo(
  grupoId: string,
  partidos: Partido[],
  equipos: Equipo[]
): FilaTablaGrupo[] {
  const equiposGrupo = obtenerEquiposGrupo(grupoId, equipos);
  const partidosGrupo = partidos.filter(
    (p) => p.fase === 'grupos' && p.grupoId === grupoId && p.estado === 'finalizado'
  );

  const tabla: FilaTablaGrupo[] = equiposGrupo.map((equipo) => ({
    equipo,
    jugados: 0,
    ganados: 0,
    empatados: 0,
    perdidos: 0,
    golesFavor: 0,
    golesContra: 0,
    diferencia: 0,
    puntos: 0,
  }));

  for (const partido of partidosGrupo) {
    const local = tabla.find((f) => f.equipo.id === partido.equipoLocalId);
    const visitante = tabla.find((f) => f.equipo.id === partido.equipoVisitanteId);

    // Skip if match doesn't have a final score or teams aren't in this group
    if (
      partido.marcadorLocal === undefined ||
      partido.marcadorVisitante === undefined ||
      !local ||
      !visitante
    ) {
      continue;
    }

    const gl = partido.marcadorLocal as number;
    const gv = partido.marcadorVisitante as number;

    local.jugados++;
    visitante.jugados++;
    local.golesFavor += gl;
    local.golesContra += gv;
    visitante.golesFavor += gv;
    visitante.golesContra += gl;

    if (gl > gv) {
      local.ganados++;
      local.puntos += 3;
      visitante.perdidos++;
    } else if (gl < gv) {
      visitante.ganados++;
      visitante.puntos += 3;
      local.perdidos++;
    } else {
      local.empatados++;
      visitante.empatados++;
      local.puntos++;
      visitante.puntos++;
    }
  }

  tabla.forEach((f) => {
    f.diferencia = f.golesFavor - f.golesContra;
  });

  // Criterios FIFA: 1) puntos, 2) diferencia de goles, 3) goles a favor
  tabla.sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    if (b.diferencia !== a.diferencia) return b.diferencia - a.diferencia;
    return b.golesFavor - a.golesFavor;
  });

  return tabla;
}

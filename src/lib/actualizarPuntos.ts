import { supabase } from '@/lib/supabase';
import { calcularPuntos } from '@/lib/puntuacion';
import type { FasePartido } from '@/types/partido';
import type { OpcionesPlus } from '@/types/liga';

export async function actualizarPuntosPartido(
  partidoId: number,
  fase: FasePartido,
  golesLocalReal: number,
  golesVisitanteReal: number
): Promise<{ actualizados: number; errores: number }> {
  // 1. Obtener todos los pronósticos del partido
  const { data: pronosticos, error } = await supabase
    .from('pronosticos')
    .select('id, usuario_id, goles_local_pronosticado, goles_visitante_pronosticado')
    .eq('partido_id', partidoId);

  if (error || !pronosticos) return { actualizados: 0, errores: 1 };

  let actualizados = 0;
  let errores = 0;

  // Map: usuario_id → puntos obtenidos (for racha evaluation)
  const puntosMap: Record<string, number> = {};

  for (const pron of pronosticos) {
    const puntos = calcularPuntos(
      fase,
      pron.goles_local_pronosticado,
      pron.goles_visitante_pronosticado,
      golesLocalReal,
      golesVisitanteReal
    );

    // Actualizar puntos_obtenidos en pronosticos
    const { error: errPron } = await supabase
      .from('pronosticos')
      .update({ puntos_obtenidos: puntos, actualizado_en: new Date().toISOString() })
      .eq('id', pron.id);

    if (errPron) { errores++; continue; }

    // Sumar puntos al total del miembro en todas sus ligas
    const { data: miembros } = await supabase
      .from('miembros_liga')
      .select('liga_id, usuario_id, total_puntos')
      .eq('usuario_id', pron.usuario_id);

    if (miembros && miembros.length > 0) {
      for (const miembro of miembros) {
        await supabase
          .from('miembros_liga')
          .update({ total_puntos: (miembro.total_puntos || 0) + puntos })
          .eq('liga_id', miembro.liga_id)
          .eq('usuario_id', miembro.usuario_id);
      }
    }

    puntosMap[pron.usuario_id] = puntos;
    actualizados++;
  }

  // 2. Evaluar racha "Lobo Solitario" por liga
  //    Un usuario gana esta racha si acertó marcador exacto (puntos == EXACTO para su fase)
  //    y es el ÚNICO miembro de esa liga que lo acertó.
  await evaluarRachaLoboSolitario(partidoId, fase, golesLocalReal, golesVisitanteReal, puntosMap);

  return { actualizados, errores };
}

async function evaluarRachaLoboSolitario(
  partidoId: number,
  fase: FasePartido,
  golesLocalReal: number,
  golesVisitanteReal: number,
  puntosMap: Record<string, number>
): Promise<void> {
  // Determine the exact-score points value for this phase to detect exact hits
  const { getPuntosPorFase } = await import('@/lib/puntuacion');
  const puntosExacto = getPuntosPorFase(fase).exacto;

  // Users who got exact score
  const usuariosExactos = Object.entries(puntosMap)
    .filter(([, pts]) => pts === puntosExacto)
    .map(([uid]) => uid);

  if (usuariosExactos.length === 0) return;

  // Fetch all ligas that have the "lobo_solitario" racha configured
  const { data: rachasConfig } = await supabase
    .from('rachas_config_liga')
    .select('liga_id, puntos')
    .eq('racha_id', 'lobo_solitario');

  if (!rachasConfig || rachasConfig.length === 0) return;

  for (const config of rachasConfig) {
    const ligaId = config.liga_id;

    // Verify the liga has rachas activo in opciones_plus
    const { data: ligaData } = await supabase
      .from('ligas')
      .select('opciones_plus')
      .eq('id', ligaId)
      .single();

    if (!ligaData) continue;
    const opcionesPlus = (ligaData.opciones_plus ?? {}) as OpcionesPlus;
    if (!opcionesPlus.rachas?.activo) continue;

    // Get all members of this liga who had a pronóstico for this partido
    const { data: miembros } = await supabase
      .from('miembros_liga')
      .select('usuario_id')
      .eq('liga_id', ligaId);

    if (!miembros || miembros.length === 0) continue;

    const miembroIds = miembros.map((m: { usuario_id: string }) => m.usuario_id);

    // Among liga members, who got exact score?
    const exactosEnLiga = usuariosExactos.filter((uid) => miembroIds.includes(uid));

    // Lobo solitario: exactly ONE member in the liga got the exact score
    if (exactosEnLiga.length === 1) {
      const ganadorId = exactosEnLiga[0];
      const puntos = config.puntos;

      // Check this racha hasn't already been awarded for this partido in this liga
      const { data: yaOtorgada } = await supabase
        .from('rachas_otorgadas')
        .select('id')
        .eq('liga_id', ligaId)
        .eq('usuario_id', ganadorId)
        .eq('racha_id', 'lobo_solitario')
        .eq('partido_id', partidoId)
        .single();

      if (yaOtorgada) continue;

      // Insert racha otorgada
      await supabase.from('rachas_otorgadas').insert({
        liga_id: ligaId,
        usuario_id: ganadorId,
        racha_id: 'lobo_solitario',
        partido_id: partidoId,
        puntos,
      });

      // Apply bonus points to the member in this liga
      const { data: miembro } = await supabase
        .from('miembros_liga')
        .select('total_puntos')
        .eq('liga_id', ligaId)
        .eq('usuario_id', ganadorId)
        .single();

      if (miembro) {
        await supabase
          .from('miembros_liga')
          .update({ total_puntos: (miembro.total_puntos || 0) + puntos })
          .eq('liga_id', ligaId)
          .eq('usuario_id', ganadorId);
      }
    }
  }
}

/**
 * Aplica los puntos de Campeón y Goleador al finalizar el torneo.
 * Llamar desde admin una vez conocidos el campeón y el goleador oficiales.
 */
export async function aplicarPuntosCampeonGoleador(
  campeonId: number,
  goleadorNombre: string
): Promise<{ actualizados: number; errores: number }> {
  const PUNTOS_CAMPEON = 10;
  const PUNTOS_GOLEADOR = 10;

  // Get all predictions for leagues with campeon_goleador active
  const { data: predicciones, error } = await supabase
    .from('predicciones_liga')
    .select('id, liga_id, usuario_id, campeon_id, goleador_nombre');

  if (error || !predicciones) return { actualizados: 0, errores: 1 };

  let actualizados = 0;
  let errores = 0;

  for (const pred of predicciones) {
    // Verify the liga has campeon_goleador option active
    const { data: ligaData } = await supabase
      .from('ligas')
      .select('opciones_plus')
      .eq('id', pred.liga_id)
      .single();

    if (!ligaData) continue;
    const opcionesPlus = (ligaData.opciones_plus ?? {}) as OpcionesPlus;
    if (!opcionesPlus.campeon_goleador) continue;

    const puntosCampeon = pred.campeon_id === campeonId ? PUNTOS_CAMPEON : 0;
    const puntosGoleador =
      pred.goleador_nombre?.toLowerCase() === goleadorNombre.toLowerCase() ? PUNTOS_GOLEADOR : 0;
    const totalBonus = puntosCampeon + puntosGoleador;

    // Update prediction record
    const { error: errPred } = await supabase
      .from('predicciones_liga')
      .update({ puntos_campeon: puntosCampeon, puntos_goleador: puntosGoleador })
      .eq('id', pred.id);

    if (errPred) { errores++; continue; }

    if (totalBonus > 0) {
      // Add bonus to member's total
      const { data: miembro } = await supabase
        .from('miembros_liga')
        .select('total_puntos')
        .eq('liga_id', pred.liga_id)
        .eq('usuario_id', pred.usuario_id)
        .single();

      if (miembro) {
        await supabase
          .from('miembros_liga')
          .update({ total_puntos: (miembro.total_puntos || 0) + totalBonus })
          .eq('liga_id', pred.liga_id)
          .eq('usuario_id', pred.usuario_id);
      }
    }

    actualizados++;
  }

  return { actualizados, errores };
}

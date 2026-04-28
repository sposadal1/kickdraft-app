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
  // Map: usuario_id → si acertó marcador exacto 0-0
  const exacto00Map: Record<string, boolean> = {};

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

    // Track exact 0-0 hits for muro_defensivo racha
    const acertoExacto =
      pron.goles_local_pronosticado === golesLocalReal &&
      pron.goles_visitante_pronosticado === golesVisitanteReal;
    if (acertoExacto && golesLocalReal === 0 && golesVisitanteReal === 0) {
      exacto00Map[pron.usuario_id] = true;
    }

    actualizados++;
  }

  // 2. Evaluar rachas por liga
  //    Lobo Solitario: único miembro que acertó marcador exacto en este partido.
  //    Muro Defensivo: acumuló N aciertos exactos 0-0 durante el torneo.
  await evaluarRachas(partidoId, fase, golesLocalReal, golesVisitanteReal, puntosMap, exacto00Map);

  return { actualizados, errores };
}

/** Obtiene el valor de un parámetro numérico de la config de racha, con fallback */
function getParamN(params: Record<string, unknown> | undefined | null, key: string, defaultValue: number): number {
  if (!params) return defaultValue;
  const v = params[key];
  return typeof v === 'number' ? v : defaultValue;
}

async function evaluarRachas(
  partidoId: number,
  fase: FasePartido,
  golesLocalReal: number,
  golesVisitanteReal: number,
  puntosMap: Record<string, number>,
  exacto00Map: Record<string, boolean>
): Promise<void> {
  // Fetch all ligas with any racha configured
  const { data: rachasConfigs } = await supabase
    .from('rachas_config_liga')
    .select('liga_id, racha_id, puntos, params');

  if (!rachasConfigs || rachasConfigs.length === 0) return;

  // Group by liga_id
  const configsByLiga: Record<string, Array<{ racha_id: string; puntos: number; params: Record<string, unknown> }>> = {};
  for (const c of rachasConfigs) {
    if (!configsByLiga[c.liga_id]) configsByLiga[c.liga_id] = [];
    configsByLiga[c.liga_id].push({ racha_id: c.racha_id, puntos: c.puntos, params: c.params ?? {} });
  }

  // Determine the exact-score points value for this phase to detect exact hits
  const { getPuntosPorFase } = await import('@/lib/puntuacion');
  const puntosExacto = getPuntosPorFase(fase).exacto;

  // Users who got exact score in this match
  const usuariosExactos = Object.entries(puntosMap)
    .filter(([, pts]) => pts === puntosExacto)
    .map(([uid]) => uid);

  for (const [ligaId, configs] of Object.entries(configsByLiga)) {
    // Verify the liga has rachas activo
    const { data: ligaData } = await supabase
      .from('ligas')
      .select('opciones_plus')
      .eq('id', ligaId)
      .single();

    if (!ligaData) continue;
    const opcionesPlus = (ligaData.opciones_plus ?? {}) as OpcionesPlus;
    if (!opcionesPlus.rachas?.activo) continue;

    // Get all members of this liga
    const { data: miembros } = await supabase
      .from('miembros_liga')
      .select('usuario_id')
      .eq('liga_id', ligaId);

    if (!miembros || miembros.length === 0) continue;
    const miembroIds = miembros.map((m: { usuario_id: string }) => m.usuario_id);

    for (const config of configs) {
      if (config.racha_id === 'lobo_solitario') {
        await evaluarLoboSolitario(ligaId, partidoId, config.puntos, usuariosExactos, miembroIds);
      } else if (config.racha_id === 'muro_defensivo') {
        const nVeces = getParamN(config.params, 'n_veces', 3);
        await evaluarMuroDefensivo(ligaId, config.puntos, nVeces, exacto00Map, miembroIds);
      }
    }
  }
}

/**
 * Lobo Solitario: el ÚNICO miembro de la liga que acertó marcador exacto en este partido.
 * Si dos o más miembros acertaron el marcador exacto, nadie obtiene la racha.
 */
async function evaluarLoboSolitario(
  ligaId: string,
  partidoId: number,
  puntos: number,
  usuariosExactos: string[],
  miembroIds: string[]
): Promise<void> {
  // Among liga members, who got exact score?
  const exactosEnLiga = usuariosExactos.filter((uid) => miembroIds.includes(uid));

  // Lobo solitario: exactly ONE member in the liga got the exact score
  if (exactosEnLiga.length !== 1) return;

  const ganadorId = exactosEnLiga[0];

  // Check this racha hasn't already been awarded for this partido in this liga
  const { data: yaOtorgada } = await supabase
    .from('rachas_otorgadas')
    .select('id')
    .eq('liga_id', ligaId)
    .eq('usuario_id', ganadorId)
    .eq('racha_id', 'lobo_solitario')
    .eq('partido_id', partidoId)
    .single();

  if (yaOtorgada) return;

  // Insert racha otorgada (requires service_role in production — see migration 004 notes)
  const { error: insertErr } = await supabase.from('rachas_otorgadas').insert({
    liga_id: ligaId,
    usuario_id: ganadorId,
    racha_id: 'lobo_solitario',
    partido_id: partidoId,
    puntos,
  });

  if (insertErr) {
    // TODO Phase 2: move racha inserts to server-side API route with service_role key
    console.warn('[Lobo Solitario] No se pudo insertar racha_otorgada:', insertErr.message);
    return;
  }

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

/**
 * Muro Defensivo: el usuario acumula N aciertos exactos 0-0 durante el torneo.
 * Se otorga UNA SOLA VEZ por usuario por liga al alcanzar exactamente el N-ésimo acierto.
 * N es configurable por liga (campo params.n_veces, default 3).
 */
async function evaluarMuroDefensivo(
  ligaId: string,
  puntos: number,
  nVeces: number,
  exacto00Map: Record<string, boolean>,
  miembroIds: string[]
): Promise<void> {
  // Only proceed if this match ended 0-0 and we have 0-0 exact hits
  const usuariosConExacto00 = Object.keys(exacto00Map).filter((uid) => miembroIds.includes(uid));
  if (usuariosConExacto00.length === 0) return;

  for (const usuarioId of usuariosConExacto00) {
    // Count how many times this user has gotten exact 0-0 in this liga (excluding today's new entry)
    const { data: pronosticos00 } = await supabase
      .from('pronosticos')
      .select('partido_id, goles_local_pronosticado, goles_visitante_pronosticado, puntos_obtenidos')
      .eq('usuario_id', usuarioId);

    if (!pronosticos00) continue;

    // Count exact 0-0 hits across all partidos where the real result was 0-0
    // We rely on the fact that puntos_obtenidos was just updated to reflect the exact score
    // So we count pronosticos where the user guessed 0-0 and we know the real result was 0-0
    // (determined by exacto00Map membership)
    // We query all partidos 0-0 where this user guessed 0-0 exactly
    let conteoExacto00 = 0;
    for (const pron of pronosticos00) {
      if (pron.goles_local_pronosticado === 0 && pron.goles_visitante_pronosticado === 0) {
        // Check if the real result was also 0-0 (puntos match exact score for any phase, or check partidos table)
        const { data: partido } = await supabase
          .from('partidos')
          .select('goles_local, goles_visitante')
          .eq('id', pron.partido_id)
          .single();
        if (partido && partido.goles_local === 0 && partido.goles_visitante === 0) {
          conteoExacto00++;
        }
      }
    }

    // Award only when user reaches exactly the N-th 0-0 exact hit
    if (conteoExacto00 < nVeces) continue;

    // Check this racha hasn't already been awarded for this user in this liga
    const { data: yaOtorgada } = await supabase
      .from('rachas_otorgadas')
      .select('id')
      .eq('liga_id', ligaId)
      .eq('usuario_id', usuarioId)
      .eq('racha_id', 'muro_defensivo')
      .single();

    if (yaOtorgada) continue; // Already awarded — do not double award

    // Insert racha otorgada (requires service_role in production — see migration 004 notes)
    const { error: insertErr } = await supabase.from('rachas_otorgadas').insert({
      liga_id: ligaId,
      usuario_id: usuarioId,
      racha_id: 'muro_defensivo',
      partido_id: null,
      puntos,
    });

    if (insertErr) {
      // TODO Phase 2: move racha inserts to server-side API route with service_role key
      console.warn('[Muro Defensivo] No se pudo insertar racha_otorgada:', insertErr.message);
      continue;
    }

    // Apply bonus points to the member in this liga
    const { data: miembro } = await supabase
      .from('miembros_liga')
      .select('total_puntos')
      .eq('liga_id', ligaId)
      .eq('usuario_id', usuarioId)
      .single();

    if (miembro) {
      await supabase
        .from('miembros_liga')
        .update({ total_puntos: (miembro.total_puntos || 0) + puntos })
        .eq('liga_id', ligaId)
        .eq('usuario_id', usuarioId);
    }
  }
}

/**
 * Aplica los puntos de Campeón y Goleador al finalizar el torneo.
 * Llamar desde admin una vez conocidos el campeón y el goleador oficiales.
 *
 * NOTA: predicciones_liga tiene un trigger que bloquea UPDATE, por lo que
 * los puntos se aplican únicamente en miembros_liga.total_puntos.
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
    .select('liga_id, usuario_id, campeon_id, goleador_nombre');

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

    if (totalBonus > 0) {
      // Apply bonus points directly to miembros_liga (predicciones_liga is immutable)
      const { data: miembro } = await supabase
        .from('miembros_liga')
        .select('total_puntos')
        .eq('liga_id', pred.liga_id)
        .eq('usuario_id', pred.usuario_id)
        .single();

      if (miembro) {
        const { error: errUpdate } = await supabase
          .from('miembros_liga')
          .update({ total_puntos: (miembro.total_puntos || 0) + totalBonus })
          .eq('liga_id', pred.liga_id)
          .eq('usuario_id', pred.usuario_id);

        if (errUpdate) { errores++; continue; }
      }
    }

    actualizados++;
  }

  return { actualizados, errores };
}


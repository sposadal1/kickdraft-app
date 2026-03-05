// supabase/functions/sync-live-scores/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const API_FOOTBALL_KEY = Deno.env.get('API_FOOTBALL_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Función para calcular puntos según fase
function calcularPuntos(
  fase: string,
  localPron: number,
  visitantePron: number,
  localReal: number,
  visitanteReal: number
): number {
  const PUNTOS: Record<string, { resultado: number; exacto: number }> = {
    grupos:        { resultado: 1, exacto: 2 },
    dieciseisavos: { resultado: 2, exacto: 3 },
    octavos:       { resultado: 3, exacto: 6 },
    cuartos:       { resultado: 4, exacto: 8 },
    semifinal:     { resultado: 5, exacto: 10 },
    tercer_cuarto: { resultado: 6, exacto: 12 },
    final:         { resultado: 7, exacto: 14 },
  };
  const p = PUNTOS[fase] ?? { resultado: 1, exacto: 2 };
  if (localPron === localReal && visitantePron === visitanteReal) return p.exacto;
  const signPron = Math.sign(localPron - visitantePron);
  const signReal = Math.sign(localReal - visitanteReal);
  if (signPron === signReal) return p.resultado;
  return 0;
}

Deno.serve(async () => {
  try {
    // 1. Obtener partidos activos o próximos a iniciar (en las próximas 2 horas)
    const ahora = new Date();
    const en2horas = new Date(ahora.getTime() + 2 * 60 * 60 * 1000);

    const { data: partidos } = await supabase
      .from('partidos')
      .select('*')
      .in('estado', ['programado', 'en_vivo'])
      .lte('fecha_hora_utc', en2horas.toISOString());

    if (!partidos || partidos.length === 0) {
      return new Response(JSON.stringify({ message: 'No hay partidos activos' }), { status: 200 });
    }

    // 2. Obtener fixtures del día desde API-Football
    // Para el Mundial 2026, usamos el league_id 1 (World Cup) season 2026
    const fechaHoy = ahora.toISOString().split('T')[0];
    const apiRes = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=1&season=2026&date=${fechaHoy}`,
      {
        headers: {
          'x-apisports-key': API_FOOTBALL_KEY,
        },
      }
    );

    const apiData = await apiRes.json();
    const fixtures = apiData.response ?? [];

    for (const partido of partidos) {
      // Buscar el partido correspondiente en la API por api_football_id o por tiempo aproximado
      const fixture = partido.api_football_id
        ? fixtures.find((f: any) => f.fixture.id === partido.api_football_id)
        : fixtures.find((f: any) => {
            const fixtureTime = new Date(f.fixture.date).getTime();
            const partidoTime = new Date(partido.fecha_hora_utc).getTime();
            return Math.abs(fixtureTime - partidoTime) < 30 * 60 * 1000;
          });

      if (!fixture) continue;

      const fixtureId = fixture.fixture.id;
      const statusShort = fixture.fixture.status.short; // 'NS', '1H', 'HT', '2H', 'FT', etc.
      const golesLocal = fixture.goals.home ?? 0;
      const golesVisitante = fixture.goals.away ?? 0;
      const minuto = fixture.fixture.status.elapsed ?? null;

      // Mapear estado de la API al estado interno
      let nuevoEstado: string;
      if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'].includes(statusShort)) {
        nuevoEstado = 'en_vivo';
      } else if (['FT', 'AET', 'PEN'].includes(statusShort)) {
        nuevoEstado = 'finalizado';
      } else {
        nuevoEstado = 'programado';
      }

      // 3. Actualizar partido
      await supabase
        .from('partidos')
        .update({
          estado: nuevoEstado,
          goles_local: nuevoEstado !== 'programado' ? golesLocal : null,
          goles_visitante: nuevoEstado !== 'programado' ? golesVisitante : null,
          minuto_actual: minuto,
          api_football_id: fixtureId,
        })
        .eq('id', partido.id);

      // 4. Actualizar estadísticas si el partido está en vivo o finalizado
      if (nuevoEstado !== 'programado') {
        const statsRes = await fetch(
          `https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`,
          { headers: { 'x-apisports-key': API_FOOTBALL_KEY } }
        );
        const statsData = await statsRes.json();
        const statsLocal = statsData.response?.[0]?.statistics ?? [];
        const statsVisitante = statsData.response?.[1]?.statistics ?? [];

        const getStat = (stats: any[], name: string) => {
          const s = stats.find((x: any) => x.type === name);
          return parseInt(s?.value ?? '0') || 0;
        };

        await supabase
          .from('estadisticas_partido')
          .upsert({
            partido_id: partido.id,
            tiros_local: getStat(statsLocal, 'Total Shots'),
            tiros_puerta_local: getStat(statsLocal, 'Shots on Goal'),
            tiros_visitante: getStat(statsVisitante, 'Total Shots'),
            tiros_puerta_visitante: getStat(statsVisitante, 'Shots on Goal'),
            posesion_local: parseInt(statsLocal.find((x: any) => x.type === 'Ball Possession')?.value ?? '50') || 50,
            posesion_visitante: parseInt(statsVisitante.find((x: any) => x.type === 'Ball Possession')?.value ?? '50') || 50,
            corners_local: getStat(statsLocal, 'Corner Kicks'),
            corners_visitante: getStat(statsVisitante, 'Corner Kicks'),
            faltas_local: getStat(statsLocal, 'Fouls'),
            faltas_visitante: getStat(statsVisitante, 'Fouls'),
            tarjetas_amarillas_local: getStat(statsLocal, 'Yellow Cards'),
            tarjetas_amarillas_visitante: getStat(statsVisitante, 'Yellow Cards'),
            tarjetas_rojas_local: getStat(statsLocal, 'Red Cards'),
            tarjetas_rojas_visitante: getStat(statsVisitante, 'Red Cards'),
            minuto_actual: minuto,
            actualizado_en: new Date().toISOString(),
          }, { onConflict: 'partido_id' });
      }

      // 5. Calcular puntos parciales o definitivos para todos los pronósticos
      if (nuevoEstado === 'en_vivo' || nuevoEstado === 'finalizado') {
        const { data: pronosticos } = await supabase
          .from('pronosticos')
          .select('id, usuario_id, goles_local_pronosticado, goles_visitante_pronosticado, puntos_obtenidos')
          .eq('partido_id', partido.id);

        if (pronosticos) {
          for (const pron of pronosticos) {
            const puntos = calcularPuntos(
              partido.fase,
              pron.goles_local_pronosticado,
              pron.goles_visitante_pronosticado,
              golesLocal,
              golesVisitante
            );

            if (nuevoEstado === 'finalizado') {
              // Puntos definitivos
              await supabase
                .from('pronosticos')
                .update({
                  puntos_obtenidos: puntos,
                  puntos_parciales: 0,
                  actualizado_en: new Date().toISOString(),
                })
                .eq('id', pron.id);
            } else {
              // Puntos parciales (partido en vivo)
              await supabase
                .from('pronosticos')
                .update({ puntos_parciales: puntos })
                .eq('id', pron.id);
            }
          }

          // 6. Recalcular total_puntos en miembros_liga para cada usuario afectado
          const usuariosAfectados = [...new Set(pronosticos.map((p) => p.usuario_id))];
          for (const usuarioId of usuariosAfectados) {
            const { data: todosLosPronosticos } = await supabase
              .from('pronosticos')
              .select('puntos_obtenidos, puntos_parciales')
              .eq('usuario_id', usuarioId);

            const totalPuntos = (todosLosPronosticos ?? []).reduce(
              (sum, p) => sum + (p.puntos_obtenidos ?? 0) + (p.puntos_parciales ?? 0),
              0
            );

            await supabase
              .from('miembros_liga')
              .update({ total_puntos: totalPuntos })
              .eq('usuario_id', usuarioId);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ message: 'Sincronización completada', partidos: partidos.length }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

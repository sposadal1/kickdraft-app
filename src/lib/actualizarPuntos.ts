import { supabase } from '@/lib/supabase';
import { calcularPuntos } from '@/lib/puntuacion';
import type { FasePartido } from '@/types/partido';

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
      .select('id, total_puntos')
      .eq('usuario_id', pron.usuario_id);

    if (miembros && miembros.length > 0) {
      for (const miembro of miembros) {
        await supabase
          .from('miembros_liga')
          .update({ total_puntos: (miembro.total_puntos || 0) + puntos })
          .eq('id', miembro.id);
      }
    }

    actualizados++;
  }

  return { actualizados, errores };
}

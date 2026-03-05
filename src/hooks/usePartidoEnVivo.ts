import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface EstadisticasPartido {
  tirosLocal: number;
  tirosPuertaLocal: number;
  tirosVisitante: number;
  tirosPuertaVisitante: number;
  posesionLocal: number;
  posesionVisitante: number;
  cornersLocal: number;
  cornersVisitante: number;
  faltasLocal: number;
  faltasVisitante: number;
  tarjetasAmarillasLocal: number;
  tarjetasAmarillasVisitante: number;
  tarjetasRojasLocal: number;
  tarjetasRojasVisitante: number;
  minutoActual: number | null;
}

export interface PartidoEnVivo {
  id: number;
  golesLocal: number;
  golesVisitante: number;
  estado: string;
  minutoActual: number | null;
  estadisticas: EstadisticasPartido | null;
}

export function usePartidoEnVivo(partidoId: number) {
  const [data, setData] = useState<PartidoEnVivo | null>(null);

  useEffect(() => {
    async function cargar() {
      const { data: partido } = await supabase
        .from('partidos')
        .select('id, goles_local, goles_visitante, estado, minuto_actual')
        .eq('id', partidoId)
        .single();

      const { data: stats } = await supabase
        .from('estadisticas_partido')
        .select('*')
        .eq('partido_id', partidoId)
        .single();

      if (partido) {
        setData({
          id: partido.id,
          golesLocal: partido.goles_local ?? 0,
          golesVisitante: partido.goles_visitante ?? 0,
          estado: partido.estado,
          minutoActual: partido.minuto_actual,
          estadisticas: stats ? {
            tirosLocal: stats.tiros_local,
            tirosPuertaLocal: stats.tiros_puerta_local,
            tirosVisitante: stats.tiros_visitante,
            tirosPuertaVisitante: stats.tiros_puerta_visitante,
            posesionLocal: stats.posesion_local,
            posesionVisitante: stats.posesion_visitante,
            cornersLocal: stats.corners_local,
            cornersVisitante: stats.corners_visitante,
            faltasLocal: stats.faltas_local,
            faltasVisitante: stats.faltas_visitante,
            tarjetasAmarillasLocal: stats.tarjetas_amarillas_local,
            tarjetasAmarillasVisitante: stats.tarjetas_amarillas_visitante,
            tarjetasRojasLocal: stats.tarjetas_rojas_local,
            tarjetasRojasVisitante: stats.tarjetas_rojas_visitante,
            minutoActual: stats.minuto_actual,
          } : null,
        });
      }
    }
    cargar();

    // Suscripción en tiempo real a cambios en partidos
    const channelPartido = supabase
      .channel(`partido-${partidoId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'partidos', filter: `id=eq.${partidoId}` },
        (payload) => {
          setData((prev) => prev ? {
            ...prev,
            golesLocal: payload.new.goles_local ?? 0,
            golesVisitante: payload.new.goles_visitante ?? 0,
            estado: payload.new.estado,
            minutoActual: payload.new.minuto_actual,
          } : null);
        }
      )
      .subscribe();

    // Suscripción en tiempo real a estadísticas
    const channelStats = supabase
      .channel(`stats-${partidoId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'estadisticas_partido', filter: `partido_id=eq.${partidoId}` },
        (payload) => {
          const s = payload.new as any;
          setData((prev) => prev ? {
            ...prev,
            estadisticas: {
              tirosLocal: s.tiros_local,
              tirosPuertaLocal: s.tiros_puerta_local,
              tirosVisitante: s.tiros_visitante,
              tirosPuertaVisitante: s.tiros_puerta_visitante,
              posesionLocal: s.posesion_local,
              posesionVisitante: s.posesion_visitante,
              cornersLocal: s.corners_local,
              cornersVisitante: s.corners_visitante,
              faltasLocal: s.faltas_local,
              faltasVisitante: s.faltas_visitante,
              tarjetasAmarillasLocal: s.tarjetas_amarillas_local,
              tarjetasAmarillasVisitante: s.tarjetas_amarillas_visitante,
              tarjetasRojasLocal: s.tarjetas_rojas_local,
              tarjetasRojasVisitante: s.tarjetas_rojas_visitante,
              minutoActual: s.minuto_actual,
            },
          } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelPartido);
      supabase.removeChannel(channelStats);
    };
  }, [partidoId]);

  return data;
}

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface MiembroRanking {
  usuarioId: string;
  nombre: string;
  apellido: string;
  email: string;
  totalPuntos: number;
  puntosParciales: number;
  totalConParciales: number;
}

export function useRankingEnVivo(ligaId: string) {
  const [ranking, setRanking] = useState<MiembroRanking[]>([]);

  async function cargarRanking() {
    const { data } = await supabase
      .from('miembros_liga')
      .select(`
        usuario_id,
        total_puntos,
        perfiles (nombre, apellido, email)
      `)
      .eq('liga_id', ligaId)
      .order('total_puntos', { ascending: false });

    if (!data) return;

    const rankingConParciales = await Promise.all(
      data.map(async (miembro: any) => {
        const { data: pronsParciales } = await supabase
          .from('pronosticos')
          .select('puntos_parciales')
          .eq('usuario_id', miembro.usuario_id);

        const parciales = (pronsParciales ?? []).reduce(
          (sum, p) => sum + (p.puntos_parciales ?? 0), 0
        );

        return {
          usuarioId: miembro.usuario_id,
          nombre: miembro.perfiles?.nombre ?? '',
          apellido: miembro.perfiles?.apellido ?? '',
          email: miembro.perfiles?.email ?? '',
          totalPuntos: miembro.total_puntos ?? 0,
          puntosParciales: parciales,
          totalConParciales: (miembro.total_puntos ?? 0) + parciales,
        };
      })
    );

    setRanking(rankingConParciales.sort((a, b) => b.totalConParciales - a.totalConParciales));
  }

  useEffect(() => {
    cargarRanking();

    // Suscripción en tiempo real cuando cambia miembros_liga
    const channel = supabase
      .channel(`ranking-${ligaId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'miembros_liga', filter: `liga_id=eq.${ligaId}` },
        () => cargarRanking()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pronosticos' },
        () => cargarRanking()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [ligaId]);

  return ranking;
}

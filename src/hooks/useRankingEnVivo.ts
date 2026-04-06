import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { compararDesempate, DatosDesempate, PESO_FASE } from '@/lib/puntuacion';
import type { FasePartido } from '@/types/partido';

export interface MiembroRanking extends DatosDesempate {
  usuarioId: string;
  nombre: string;
  apellido: string;
  email: string;
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

    interface MiembroRow {
      usuario_id: string;
      total_puntos: number;
      perfiles: { nombre: string; apellido: string; email: string } | null;
    }

    interface PartidoResumen {
      fase: string;
      goles_local: number | null;
      goles_visitante: number | null;
    }

    interface PronosticoRow {
      puntos_parciales: number | null;
      goles_local: number | null;
      goles_visitante: number | null;
      partidos: PartidoResumen | PartidoResumen[] | null;
    }

    const rankingConParciales = await Promise.all(
      (data as unknown as MiembroRow[]).map(async (miembro) => {
        const { data: pronsParciales } = await supabase
          .from('pronosticos')
          .select('puntos_parciales, goles_local, goles_visitante, partidos(fase, goles_local, goles_visitante)')
          .eq('usuario_id', miembro.usuario_id);

        const parciales = ((pronsParciales ?? []) as PronosticoRow[]).reduce(
          (sum, p) => sum + (p.puntos_parciales ?? 0), 0
        );

        // Calcular datos de desempate
        let exactos = 0;
        let marcadoresAcertados = 0;
        let pesoFasePonderado = 0;

        for (const p of ((pronsParciales ?? []) as PronosticoRow[])) {
          const partido = Array.isArray(p.partidos) ? p.partidos[0] : p.partidos;
          if (!partido || partido.goles_local == null || partido.goles_visitante == null) continue;

          const fase = (partido.fase ?? 'grupos') as FasePartido;
          const peso = PESO_FASE[fase] ?? 1;

          const esExacto =
            p.goles_local === partido.goles_local && p.goles_visitante === partido.goles_visitante;
          const resultadoPron = Math.sign((p.goles_local ?? 0) - (p.goles_visitante ?? 0));
          const resultadoReal = Math.sign(partido.goles_local - partido.goles_visitante);
          const aciertoResultado = resultadoPron === resultadoReal;

          if (esExacto) {
            exactos += 1;
            pesoFasePonderado += peso;
          } else if (aciertoResultado) {
            marcadoresAcertados += 1;
            pesoFasePonderado += peso * 0.5;
          }
        }

        return {
          usuarioId: miembro.usuario_id,
          nombre: miembro.perfiles?.nombre ?? '',
          apellido: miembro.perfiles?.apellido ?? '',
          email: miembro.perfiles?.email ?? '',
          totalPuntos: miembro.total_puntos ?? 0,
          exactos,
          marcadoresAcertados,
          pesoFasePonderado,
          puntosParciales: parciales,
          totalConParciales: (miembro.total_puntos ?? 0) + parciales,
        };
      })
    );

    setRanking(
      rankingConParciales.sort((a, b) =>
        compararDesempate(
          { ...a, totalPuntos: a.totalConParciales },
          { ...b, totalPuntos: b.totalConParciales }
        )
      )
    );
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ligaId]);

  return ranking;
}

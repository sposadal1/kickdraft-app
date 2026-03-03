import type { FasePartido } from '@/types/partido';

export type { FasePartido };

const PUNTOS_POR_FASE: Record<FasePartido, { resultado: number; exacto: number }> = {
  grupos:        { resultado: 1, exacto: 2 },
  dieciseisavos: { resultado: 2, exacto: 3 },
  octavos:       { resultado: 3, exacto: 6 },
  cuartos:       { resultado: 4, exacto: 8 },
  semifinal:     { resultado: 5, exacto: 10 },
  tercer_cuarto: { resultado: 6, exacto: 12 },
  final:         { resultado: 7, exacto: 14 },
};

export function calcularPuntos(
  fase: FasePartido,
  golesLocalPron: number,
  golesVisitantePron: number,
  golesLocalReal: number,
  golesVisitanteReal: number
): number {
  const puntos = PUNTOS_POR_FASE[fase];

  // Marcador exacto
  if (golesLocalPron === golesLocalReal && golesVisitantePron === golesVisitanteReal) {
    return puntos.exacto;
  }

  // Resultado correcto (ganador o empate)
  const resultadoPron = Math.sign(golesLocalPron - golesVisitantePron);
  const resultadoReal = Math.sign(golesLocalReal - golesVisitanteReal);

  if (resultadoPron === resultadoReal) {
    return puntos.resultado;
  }

  return 0;
}

export function getPuntosPorFase(fase: FasePartido) {
  return PUNTOS_POR_FASE[fase];
}

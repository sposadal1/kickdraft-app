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

// Peso por fase para criterio de desempate #4 (mayor = más importante)
export const PESO_FASE: Record<FasePartido, number> = {
  grupos:        1,
  dieciseisavos: 2,
  octavos:       3,
  cuartos:       4,
  semifinal:     5,
  tercer_cuarto: 6,
  final:         7,
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

export interface DatosDesempate {
  totalPuntos: number;
  exactos: number;
  marcadoresAcertados: number;
  pesoFasePonderado: number;
}

/**
 * Compara dos entradas de ranking usando los criterios de desempate en orden:
 * 1. Puntos totales
 * 2. Cantidad de resultados exactos
 * 3. Cantidad de marcadores acertados sin exactitud
 * 4. Puntaje ponderado por fase
 * Retorna negativo si a > b, positivo si b > a, 0 si iguales.
 */
export function compararDesempate(a: DatosDesempate, b: DatosDesempate): number {
  if (b.totalPuntos !== a.totalPuntos) return b.totalPuntos - a.totalPuntos;
  if (b.exactos !== a.exactos) return b.exactos - a.exactos;
  if (b.marcadoresAcertados !== a.marcadoresAcertados) return b.marcadoresAcertados - a.marcadoresAcertados;
  return b.pesoFasePonderado - a.pesoFasePonderado;
}

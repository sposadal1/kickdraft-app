export interface ProbabilidadPartido {
  partidoId: number;
  local: number;
  empate: number;
  visitante: number;
}

export const PROBABILIDADES: ProbabilidadPartido[] = [
  // Grupo A
  { partidoId: 1, local: 48, empate: 27, visitante: 25 },   // MEX vs RSA
  { partidoId: 2, local: 35, empate: 30, visitante: 35 },   // KOR vs PLD
  // Grupo B
  { partidoId: 3, local: 42, empate: 28, visitante: 30 },   // CAN vs QAT
  { partidoId: 4, local: 50, empate: 28, visitante: 22 },   // SUI vs PLA
  // Grupo C
  { partidoId: 5, local: 65, empate: 20, visitante: 15 },   // BRA vs MAR
  { partidoId: 6, local: 30, empate: 28, visitante: 42 },   // HAI vs SCO
  // Grupo D
  { partidoId: 7, local: 55, empate: 25, visitante: 20 },   // USA vs PAR
  { partidoId: 8, local: 45, empate: 30, visitante: 25 },   // AUS vs PLC
  // Grupo E
  { partidoId: 9, local: 68, empate: 18, visitante: 14 },   // GER vs CUW
  { partidoId: 10, local: 38, empate: 28, visitante: 34 },  // CIV vs ECU
  // Grupo F
  { partidoId: 11, local: 58, empate: 22, visitante: 20 },  // NED vs JPN
  { partidoId: 12, local: 35, empate: 30, visitante: 35 },  // PLB vs TUN
  // Grupo G
  { partidoId: 13, local: 55, empate: 25, visitante: 20 },  // BEL vs EGY
  { partidoId: 14, local: 35, empate: 30, visitante: 35 },  // IRN vs NZL
  // Grupo H
  { partidoId: 15, local: 70, empate: 18, visitante: 12 },  // ESP vs CPV
  { partidoId: 16, local: 35, empate: 28, visitante: 37 },  // KSA vs URU
  // Grupo I
  { partidoId: 17, local: 68, empate: 18, visitante: 14 },  // FRA vs SEN
  { partidoId: 18, local: 35, empate: 30, visitante: 35 },  // PI2 vs NOR
  // Grupo J
  { partidoId: 19, local: 72, empate: 16, visitante: 12 },  // ARG vs ALG
  { partidoId: 20, local: 45, empate: 28, visitante: 27 },  // AUT vs JOR
  // Grupo K
  { partidoId: 21, local: 68, empate: 18, visitante: 14 },  // POR vs PI1
  { partidoId: 22, local: 35, empate: 30, visitante: 35 },  // UZB vs COL
  // Grupo L
  { partidoId: 23, local: 60, empate: 22, visitante: 18 },  // ENG vs CRO
  { partidoId: 24, local: 42, empate: 28, visitante: 30 },  // GHA vs PAN
  // Jornada 2
  { partidoId: 25, local: 50, empate: 25, visitante: 25 },  // MEX vs KOR
  { partidoId: 26, local: 40, empate: 30, visitante: 30 },  // RSA vs PLD
  { partidoId: 27, local: 44, empate: 28, visitante: 28 },  // CAN vs SUI
  { partidoId: 28, local: 30, empate: 28, visitante: 42 },  // QAT vs PLA
  { partidoId: 29, local: 62, empate: 20, visitante: 18 },  // BRA vs HAI
  { partidoId: 30, local: 42, empate: 28, visitante: 30 },  // MAR vs SCO
  { partidoId: 31, local: 55, empate: 25, visitante: 20 },  // USA vs AUS
  { partidoId: 32, local: 45, empate: 28, visitante: 27 },  // PAR vs PLC
  { partidoId: 33, local: 65, empate: 20, visitante: 15 },  // GER vs CIV
  { partidoId: 34, local: 30, empate: 28, visitante: 42 },  // CUW vs ECU
  { partidoId: 35, local: 52, empate: 26, visitante: 22 },  // NED vs PLB
  { partidoId: 36, local: 45, empate: 28, visitante: 27 },  // JPN vs TUN
];

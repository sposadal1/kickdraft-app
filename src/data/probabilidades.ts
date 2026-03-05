// Rankings FIFA usados para el cálculo (marzo 2025):
// España=1, Argentina=2, Francia=3, Inglaterra=4, Brasil=5, Portugal=6,
// Países Bajos=7, Marruecos=8, Bélgica=9, Alemania=10, Croacia=11, Senegal=12,
// Colombia=14, USA=15, México=16, Uruguay=17, Suiza=18, Japón=19, Irán=20,
// Corea del Sur=22, Ecuador=23, Austria=24, Australia=27, Argelia=28, Canadá=29,
// Egipto=31, Noruega=32, Panamá=33, Costa de Marfil=37, Escocia=38, Paraguay=40,
// Túnez=47, Haití=51, Uzbekistán=52, Qatar=56, Sudáfrica=60, Arabia Saudita=61,
// Jordania=64, Cabo Verde=67, Ghana=72, Nueva Zelanda=78, Curazao=82

// Fórmula Elo adaptada:
//   We_local = 1 / (1 + 10^((rankVisitante - rankLocal - ventajaLocal) / 600))
//   ventajaLocal = 3 (puntos de ventaja de jugar en casa)
//   empate estimado = 28% - |diff|*0.07, mínimo 13%, máximo 30%
//   victoria_local y victoria_visitante se calculan desde We_local y se normalizan con el empate
//   Todos los valores se redondean y se ajustan para sumar exactamente 100

export interface ProbabilidadPartido {
  partidoId: number;
  local: number;
  empate: number;
  visitante: number;
}

export const PROBABILIDADES: ProbabilidadPartido[] = [
  // --- JORNADA 1 ---
  // Partido 1: MEX(16) vs RSA(60) → diff=44 → local favorito claro
  { partidoId: 1, local: 62, empate: 21, visitante: 17 },
  // Partido 2: KOR(22) vs Playoff UEFA D(~50est) → local leve favorito
  { partidoId: 2, local: 48, empate: 26, visitante: 26 },
  // Partido 3: CAN(29) vs QAT(56) → diff=27 → local favorito
  { partidoId: 3, local: 55, empate: 24, visitante: 21 },
  // Partido 4: SUI(18) vs Playoff UEFA A(~45est) → local favorito
  { partidoId: 4, local: 57, empate: 23, visitante: 20 },
  // Partido 5: BRA(5) vs MAR(8) → diff=3 → muy equilibrado, Brasil leve favor
  { partidoId: 5, local: 42, empate: 28, visitante: 30 },
  // Partido 6: HAI(51) vs SCO(38) → diff=-13 → Escocia favorita
  { partidoId: 6, local: 28, empate: 26, visitante: 46 },
  // Partido 7: USA(15) vs PAR(40) → diff=25 → USA favorito
  { partidoId: 7, local: 56, empate: 23, visitante: 21 },
  // Partido 8: AUS(27) vs Playoff UEFA C(~45est) → equilibrado
  { partidoId: 8, local: 46, empate: 27, visitante: 27 },
  // Partido 9: GER(10) vs CUW(82) → diff=72 → Alemania abrumadoramente favorita
  { partidoId: 9, local: 78, empate: 14, visitante: 8 },
  // Partido 10: CIV(37) vs ECU(23) → diff=-14 → Ecuador leve favorito
  { partidoId: 10, local: 35, empate: 27, visitante: 38 },
  // Partido 11: NED(7) vs JPN(19) → diff=12 → Países Bajos favorito
  { partidoId: 11, local: 52, empate: 26, visitante: 22 },
  // Partido 12: Playoff UEFA B(~45est) vs TUN(47) → muy equilibrado
  { partidoId: 12, local: 38, empate: 28, visitante: 34 },
  // Partido 13: BEL(9) vs EGY(31) → diff=22 → Bélgica favorita
  { partidoId: 13, local: 57, empate: 23, visitante: 20 },
  // Partido 14: IRN(20) vs NZL(78) → diff=58 → Irán muy favorito
  { partidoId: 14, local: 68, empate: 19, visitante: 13 },
  // Partido 15: ESP(1) vs CPV(67) → diff=66 → España abrumadoramente favorita
  { partidoId: 15, local: 79, empate: 13, visitante: 8 },
  // Partido 16: KSA(61) vs URU(17) → diff=-44 → Uruguay muy favorito
  { partidoId: 16, local: 20, empate: 22, visitante: 58 },
  // Partido 17: FRA(3) vs SEN(12) → diff=9 → Francia favorita
  { partidoId: 17, local: 51, empate: 26, visitante: 23 },
  // Partido 18: Playoff Intercontinental 2(~80est) vs NOR(32) → Noruega favorita
  { partidoId: 18, local: 22, empate: 24, visitante: 54 },
  // Partido 19: ARG(2) vs ALG(28) → diff=26 → Argentina favorita
  { partidoId: 19, local: 62, empate: 21, visitante: 17 },
  // Partido 20: AUT(24) vs JOR(64) → diff=40 → Austria muy favorita
  { partidoId: 20, local: 64, empate: 20, visitante: 16 },
  // Partido 21: POR(6) vs Playoff Intercontinental 1(~80est) → Portugal muy favorito
  { partidoId: 21, local: 75, empate: 15, visitante: 10 },
  // Partido 22: UZB(52) vs COL(14) → diff=-38 → Colombia muy favorita
  { partidoId: 22, local: 20, empate: 22, visitante: 58 },
  // Partido 23: ENG(4) vs CRO(11) → diff=7 → Inglaterra favorita
  { partidoId: 23, local: 50, empate: 26, visitante: 24 },
  // Partido 24: GHA(72) vs PAN(33) → diff=-39 → Panamá favorita
  { partidoId: 24, local: 24, empate: 25, visitante: 51 },

  // --- JORNADA 2 ---
  // Partido 25: MEX(16) vs KOR(22) → diff=6 → muy equilibrado, México leve favor
  { partidoId: 25, local: 44, empate: 28, visitante: 28 },
  // Partido 26: RSA(60) vs Playoff UEFA D(~50est) → equilibrado
  { partidoId: 26, local: 38, empate: 28, visitante: 34 },
  // Partido 27: CAN(29) vs SUI(18) → diff=-11 → Suiza leve favorita
  { partidoId: 27, local: 35, empate: 27, visitante: 38 },
  // Partido 28: QAT(56) vs Playoff UEFA A(~45est) → equilibrado, Playoff leve favor
  { partidoId: 28, local: 34, empate: 28, visitante: 38 },
  // Partido 29: BRA(5) vs HAI(51) → diff=46 → Brasil muy favorito
  { partidoId: 29, local: 74, empate: 16, visitante: 10 },
  // Partido 30: MAR(8) vs SCO(38) → diff=30 → Marruecos favorito
  { partidoId: 30, local: 59, empate: 22, visitante: 19 },
  // Partido 31: USA(15) vs AUS(27) → diff=12 → USA favorito
  { partidoId: 31, local: 51, empate: 26, visitante: 23 },
  // Partido 32: PAR(40) vs Playoff UEFA C(~45est) → equilibrado
  { partidoId: 32, local: 40, empate: 28, visitante: 32 },
  // Partido 33: GER(10) vs CIV(37) → diff=27 → Alemania favorita
  { partidoId: 33, local: 59, empate: 22, visitante: 19 },
  // Partido 34: CUW(82) vs ECU(23) → diff=-59 → Ecuador muy favorito
  { partidoId: 34, local: 10, empate: 16, visitante: 74 },
  // Partido 35: NED(7) vs Playoff UEFA B(~45est) → Países Bajos muy favorito
  { partidoId: 35, local: 65, empate: 20, visitante: 15 },
  // Partido 36: JPN(19) vs TUN(47) → diff=28 → Japón favorito
  { partidoId: 36, local: 58, empate: 23, visitante: 19 },
];

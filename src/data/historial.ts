export interface PartidoHistorial {
  fecha: string;
  torneo: string;
  golesLocal: number;
  golesVisitante: number;
  resultado: 'local' | 'visitante' | 'empate';
}

export interface HistorialEnfrentamiento {
  equipoLocalId: number;
  equipoVisitanteId: number;
  partidosJugados: number;
  victoriasLocal: number;
  empates: number;
  victoriasVisitante: number;
  ultimos5: PartidoHistorial[];
}

export const HISTORIAL: HistorialEnfrentamiento[] = [
  // MEX vs RSA (partido 1)
  {
    equipoLocalId: 1, equipoVisitanteId: 2,
    partidosJugados: 3, victoriasLocal: 2, empates: 1, victoriasVisitante: 0,
    ultimos5: [
      { fecha: '11 Jun 2010', torneo: 'Mundial 2010 - Grupo A', golesLocal: 1, golesVisitante: 1, resultado: 'empate' },
      { fecha: '22 Jun 2005', torneo: 'Copa Confederaciones 2005', golesLocal: 1, golesVisitante: 0, resultado: 'local' },
      { fecha: '15 Nov 2000', torneo: 'Amistoso', golesLocal: 2, golesVisitante: 0, resultado: 'local' },
    ],
  },
  // BRA vs MAR (partido 5)
  {
    equipoLocalId: 9, equipoVisitanteId: 10,
    partidosJugados: 4, victoriasLocal: 3, empates: 1, victoriasVisitante: 0,
    ultimos5: [
      { fecha: '22 Nov 2022', torneo: 'Amistoso', golesLocal: 2, golesVisitante: 0, resultado: 'local' },
      { fecha: '26 Mar 2019', torneo: 'Amistoso', golesLocal: 2, golesVisitante: 2, resultado: 'empate' },
      { fecha: '26 Mar 2009', torneo: 'Amistoso', golesLocal: 1, golesVisitante: 0, resultado: 'local' },
      { fecha: '27 Jul 1996', torneo: 'Olimpiadas 1996', golesLocal: 3, golesVisitante: 0, resultado: 'local' },
    ],
  },
  // USA vs PAR (partido 7)
  {
    equipoLocalId: 13, equipoVisitanteId: 14,
    partidosJugados: 5, victoriasLocal: 3, empates: 1, victoriasVisitante: 1,
    ultimos5: [
      { fecha: '12 Jun 2010', torneo: 'Mundial 2010 - Cuartos', golesLocal: 0, golesVisitante: 0, resultado: 'empate' },
      { fecha: '17 Jul 2007', torneo: 'Copa América 2007', golesLocal: 1, golesVisitante: 3, resultado: 'visitante' },
      { fecha: '27 Mar 2007', torneo: 'Amistoso', golesLocal: 1, golesVisitante: 0, resultado: 'local' },
    ],
  },
  // GER vs CUW (partido 9)
  {
    equipoLocalId: 17, equipoVisitanteId: 18,
    partidosJugados: 2, victoriasLocal: 2, empates: 0, victoriasVisitante: 0,
    ultimos5: [
      { fecha: '4 Jun 2015', torneo: 'Amistoso', golesLocal: 4, golesVisitante: 0, resultado: 'local' },
      { fecha: '2 Jun 2014', torneo: 'Amistoso', golesLocal: 3, golesVisitante: 1, resultado: 'local' },
    ],
  },
  // NED vs JPN (partido 11)
  {
    equipoLocalId: 21, equipoVisitanteId: 22,
    partidosJugados: 6, victoriasLocal: 3, empates: 1, victoriasVisitante: 2,
    ultimos5: [
      { fecha: '14 Nov 2022', torneo: 'Amistoso', golesLocal: 0, golesVisitante: 1, resultado: 'visitante' },
      { fecha: '9 Oct 2018', torneo: 'Amistoso', golesLocal: 0, golesVisitante: 3, resultado: 'visitante' },
      { fecha: '16 Nov 2013', torneo: 'Amistoso', golesLocal: 2, golesVisitante: 2, resultado: 'empate' },
    ],
  },
  // BEL vs EGY (partido 13)
  {
    equipoLocalId: 25, equipoVisitanteId: 26,
    partidosJugados: 3, victoriasLocal: 1, empates: 1, victoriasVisitante: 1,
    ultimos5: [
      { fecha: '18 Nov 2020', torneo: 'Amistoso', golesLocal: 4, golesVisitante: 4, resultado: 'empate' },
      { fecha: '29 May 2018', torneo: 'Amistoso', golesLocal: 3, golesVisitante: 0, resultado: 'local' },
      { fecha: '16 Nov 1990', torneo: 'Amistoso', golesLocal: 0, golesVisitante: 1, resultado: 'visitante' },
    ],
  },
  // ESP vs CPV (partido 15)
  {
    equipoLocalId: 29, equipoVisitanteId: 30,
    partidosJugados: 1, victoriasLocal: 1, empates: 0, victoriasVisitante: 0,
    ultimos5: [
      { fecha: '21 Nov 2013', torneo: 'Amistoso', golesLocal: 4, golesVisitante: 0, resultado: 'local' },
    ],
  },
  // FRA vs SEN (partido 17)
  {
    equipoLocalId: 33, equipoVisitanteId: 34,
    partidosJugados: 4, victoriasLocal: 1, empates: 1, victoriasVisitante: 2,
    ultimos5: [
      { fecha: '10 Oct 2023', torneo: 'Amistoso', golesLocal: 1, golesVisitante: 1, resultado: 'empate' },
      { fecha: '11 Jun 2022', torneo: 'Liga de Naciones', golesLocal: 2, golesVisitante: 0, resultado: 'local' },
      { fecha: '19 Nov 2019', torneo: 'Amistoso', golesLocal: 1, golesVisitante: 4, resultado: 'visitante' },
      { fecha: '30 May 2015', torneo: 'Amistoso', golesLocal: 0, golesVisitante: 2, resultado: 'visitante' },
    ],
  },
  // ARG vs ALG (partido 19)
  {
    equipoLocalId: 37, equipoVisitanteId: 38,
    partidosJugados: 2, victoriasLocal: 1, empates: 0, victoriasVisitante: 1,
    ultimos5: [
      { fecha: '27 Sep 2022', torneo: 'Finalissima Árabe-Sudamericana', golesLocal: 2, golesVisitante: 3, resultado: 'visitante' },
      { fecha: '3 Jun 1987', torneo: 'Copa América 1987', golesLocal: 3, golesVisitante: 0, resultado: 'local' },
    ],
  },
  // ENG vs CRO (partido 23)
  {
    equipoLocalId: 45, equipoVisitanteId: 46,
    partidosJugados: 7, victoriasLocal: 4, empates: 2, victoriasVisitante: 1,
    ultimos5: [
      { fecha: '13 Jun 2021', torneo: 'Euro 2020 - Grupo D', golesLocal: 1, golesVisitante: 0, resultado: 'local' },
      { fecha: '18 Jun 2018', torneo: 'Mundial 2018 - Grupo D', golesLocal: 0, golesVisitante: 0, resultado: 'empate' },
      { fecha: '11 Jul 2018', torneo: 'Mundial 2018 - Semifinal', golesLocal: 1, golesVisitante: 2, resultado: 'visitante' },
      { fecha: '18 Jun 2004', torneo: 'Euro 2004 - Grupo B', golesLocal: 4, golesVisitante: 2, resultado: 'local' },
      { fecha: '11 Oct 2003', torneo: 'Clasificación Euro 2004', golesLocal: 3, golesVisitante: 1, resultado: 'local' },
    ],
  },
];

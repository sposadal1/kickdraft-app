export interface Jugador {
  nombre: string;
  numero: number;
  posicion: 'POR' | 'DEF' | 'MED' | 'DEL';
}

export interface AlineacionEquipo {
  equipoId: number;
  formacion: string;
  jugadores: Jugador[];
}

export const ALINEACIONES: AlineacionEquipo[] = [
  // México
  {
    equipoId: 1,
    formacion: '4-3-3',
    jugadores: [
      { nombre: 'G. Ochoa', numero: 13, posicion: 'POR' },
      { nombre: 'J. Sánchez', numero: 2, posicion: 'DEF' },
      { nombre: 'C. Montes', numero: 3, posicion: 'DEF' },
      { nombre: 'H. Moreno', numero: 5, posicion: 'DEF' },
      { nombre: 'G. Angulo', numero: 7, posicion: 'DEF' },
      { nombre: 'E. Álvarez', numero: 4, posicion: 'MED' },
      { nombre: 'C. Rodríguez', numero: 10, posicion: 'MED' },
      { nombre: 'O. Pineda', numero: 6, posicion: 'MED' },
      { nombre: 'H. Lozano', numero: 22, posicion: 'DEL' },
      { nombre: 'R. Jiménez', numero: 9, posicion: 'DEL' },
      { nombre: 'A. Vega', numero: 11, posicion: 'DEL' },
    ],
  },
  // Brasil
  {
    equipoId: 9,
    formacion: '4-2-3-1',
    jugadores: [
      { nombre: 'Alisson', numero: 1, posicion: 'POR' },
      { nombre: 'Danilo', numero: 2, posicion: 'DEF' },
      { nombre: 'Marquinhos', numero: 4, posicion: 'DEF' },
      { nombre: 'G. Magalhães', numero: 3, posicion: 'DEF' },
      { nombre: 'Renan Lodi', numero: 6, posicion: 'DEF' },
      { nombre: 'Casemiro', numero: 5, posicion: 'MED' },
      { nombre: 'B. Guimarães', numero: 8, posicion: 'MED' },
      { nombre: 'Rodrygo', numero: 11, posicion: 'DEL' },
      { nombre: 'Lucas Paquetá', numero: 10, posicion: 'DEL' },
      { nombre: 'Vinicius Jr.', numero: 7, posicion: 'DEL' },
      { nombre: 'Endrick', numero: 9, posicion: 'DEL' },
    ],
  },
  // Alemania
  {
    equipoId: 17,
    formacion: '4-2-3-1',
    jugadores: [
      { nombre: 'M. Neuer', numero: 1, posicion: 'POR' },
      { nombre: 'J. Kimmich', numero: 6, posicion: 'DEF' },
      { nombre: 'A. Rüdiger', numero: 2, posicion: 'DEF' },
      { nombre: 'J. Tah', numero: 4, posicion: 'DEF' },
      { nombre: 'M. Mittelstädt', numero: 3, posicion: 'DEF' },
      { nombre: 'R. Andrich', numero: 23, posicion: 'MED' },
      { nombre: 'T. Kroos', numero: 8, posicion: 'MED' },
      { nombre: 'J. Musiala', numero: 10, posicion: 'DEL' },
      { nombre: 'I. Gündogan', numero: 21, posicion: 'DEL' },
      { nombre: 'L. Wirtz', numero: 17, posicion: 'DEL' },
      { nombre: 'K. Havertz', numero: 7, posicion: 'DEL' },
    ],
  },
  // España
  {
    equipoId: 29,
    formacion: '4-3-3',
    jugadores: [
      { nombre: 'D. Raya', numero: 1, posicion: 'POR' },
      { nombre: 'D. Carvajal', numero: 2, posicion: 'DEF' },
      { nombre: 'A. Laporte', numero: 4, posicion: 'DEF' },
      { nombre: 'R. Le Normand', numero: 3, posicion: 'DEF' },
      { nombre: 'M. Cucurella', numero: 12, posicion: 'DEF' },
      { nombre: 'R. Rodri', numero: 16, posicion: 'MED' },
      { nombre: 'F. Ruiz', numero: 8, posicion: 'MED' },
      { nombre: 'P. Gavi', numero: 9, posicion: 'MED' },
      { nombre: 'L. Yamal', numero: 19, posicion: 'DEL' },
      { nombre: 'A. Morata', numero: 7, posicion: 'DEL' },
      { nombre: 'N. Williams', numero: 11, posicion: 'DEL' },
    ],
  },
  // Francia
  {
    equipoId: 33,
    formacion: '4-3-3',
    jugadores: [
      { nombre: 'M. Maignan', numero: 16, posicion: 'POR' },
      { nombre: 'B. Pavard', numero: 2, posicion: 'DEF' },
      { nombre: 'D. Upamecano', numero: 4, posicion: 'DEF' },
      { nombre: 'W. Saliba', numero: 17, posicion: 'DEF' },
      { nombre: 'T. Hernández', numero: 22, posicion: 'DEF' },
      { nombre: 'A. Tchouameni', numero: 8, posicion: 'MED' },
      { nombre: 'A. Rabiot', numero: 14, posicion: 'MED' },
      { nombre: 'A. Griezmann', numero: 7, posicion: 'MED' },
      { nombre: 'O. Dembélé', numero: 11, posicion: 'DEL' },
      { nombre: 'K. Mbappé', numero: 10, posicion: 'DEL' },
      { nombre: 'M. Thuram', numero: 9, posicion: 'DEL' },
    ],
  },
  // Argentina
  {
    equipoId: 37,
    formacion: '4-3-3',
    jugadores: [
      { nombre: 'E. Martínez', numero: 23, posicion: 'POR' },
      { nombre: 'N. Molina', numero: 26, posicion: 'DEF' },
      { nombre: 'C. Romero', numero: 13, posicion: 'DEF' },
      { nombre: 'L. Martínez', numero: 14, posicion: 'DEF' },
      { nombre: 'N. Tagliafico', numero: 3, posicion: 'DEF' },
      { nombre: 'R. De Paul', numero: 7, posicion: 'MED' },
      { nombre: 'E. Fernández', numero: 24, posicion: 'MED' },
      { nombre: 'A. Mac Allister', numero: 20, posicion: 'MED' },
      { nombre: 'A. Di María', numero: 11, posicion: 'DEL' },
      { nombre: 'L. Messi', numero: 10, posicion: 'DEL' },
      { nombre: 'J. Álvarez', numero: 9, posicion: 'DEL' },
    ],
  },
  // Portugal
  {
    equipoId: 41,
    formacion: '4-3-3',
    jugadores: [
      { nombre: 'D. Costa', numero: 1, posicion: 'POR' },
      { nombre: 'J. Cancelo', numero: 20, posicion: 'DEF' },
      { nombre: 'R. Dias', numero: 4, posicion: 'DEF' },
      { nombre: 'D. Dalot', numero: 2, posicion: 'DEF' },
      { nombre: 'N. Mendes', numero: 19, posicion: 'DEF' },
      { nombre: 'R. Neves', numero: 15, posicion: 'MED' },
      { nombre: 'B. Fernandes', numero: 8, posicion: 'MED' },
      { nombre: 'J. Moutinho', numero: 18, posicion: 'MED' },
      { nombre: 'B. Silva', numero: 10, posicion: 'DEL' },
      { nombre: 'C. Ronaldo', numero: 7, posicion: 'DEL' },
      { nombre: 'R. Leão', numero: 11, posicion: 'DEL' },
    ],
  },
  // Inglaterra
  {
    equipoId: 45,
    formacion: '4-3-3',
    jugadores: [
      { nombre: 'J. Pickford', numero: 1, posicion: 'POR' },
      { nombre: 'K. Walker', numero: 2, posicion: 'DEF' },
      { nombre: 'J. Stones', numero: 5, posicion: 'DEF' },
      { nombre: 'M. Guehi', numero: 6, posicion: 'DEF' },
      { nombre: 'L. Shaw', numero: 3, posicion: 'DEF' },
      { nombre: 'D. Rice', numero: 4, posicion: 'MED' },
      { nombre: 'J. Bellingham', numero: 22, posicion: 'MED' },
      { nombre: 'T. Alexander-Arnold', numero: 12, posicion: 'MED' },
      { nombre: 'B. Saka', numero: 7, posicion: 'DEL' },
      { nombre: 'H. Kane', numero: 9, posicion: 'DEL' },
      { nombre: 'P. Foden', numero: 11, posicion: 'DEL' },
    ],
  },
];

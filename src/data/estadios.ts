export interface Estadio {
  nombre: string;
  ciudad: string;
  pais: string;
  capacidad: number;
}

export const ESTADIOS: Estadio[] = [
  { nombre: 'MetLife Stadium', ciudad: 'Nueva York/Nueva Jersey', pais: 'Estados Unidos', capacidad: 82500 },
  { nombre: 'SoFi Stadium', ciudad: 'Los Ángeles', pais: 'Estados Unidos', capacidad: 70000 },
  { nombre: "AT&T Stadium", ciudad: 'Dallas', pais: 'Estados Unidos', capacidad: 80000 },
  { nombre: 'NRG Stadium', ciudad: 'Houston', pais: 'Estados Unidos', capacidad: 72220 },
  { nombre: 'Lumen Field', ciudad: 'Seattle', pais: 'Estados Unidos', capacidad: 72000 },
  { nombre: 'Hard Rock Stadium', ciudad: 'Miami', pais: 'Estados Unidos', capacidad: 65326 },
  { nombre: 'Mercedes-Benz Stadium', ciudad: 'Atlanta', pais: 'Estados Unidos', capacidad: 71000 },
  { nombre: 'Gillette Stadium', ciudad: 'Boston', pais: 'Estados Unidos', capacidad: 65878 },
  { nombre: "Levi's Stadium", ciudad: 'San Francisco', pais: 'Estados Unidos', capacidad: 68500 },
  { nombre: 'Arrowhead Stadium', ciudad: 'Kansas City', pais: 'Estados Unidos', capacidad: 76416 },
  { nombre: 'Lincoln Financial Field', ciudad: 'Filadelfia', pais: 'Estados Unidos', capacidad: 69796 },
  { nombre: 'Estadio Azteca', ciudad: 'Ciudad de México', pais: 'México', capacidad: 87523 },
  { nombre: 'Estadio Akron', ciudad: 'Guadalajara', pais: 'México', capacidad: 49850 },
  { nombre: 'Estadio BBVA', ciudad: 'Monterrey', pais: 'México', capacidad: 53500 },
  { nombre: 'BMO Field', ciudad: 'Toronto', pais: 'Canadá', capacidad: 45736 },
  { nombre: 'BC Place', ciudad: 'Vancouver', pais: 'Canadá', capacidad: 54500 },
];

export interface CandidatoGoleador {
  nombre: string;
  pais: string;
  codigoPais: string;
}

/**
 * Lista provisional de candidatos a Bota de Oro del Mundial 2026.
 * El dataset oficial será proporcionado y cargado antes del inicio del torneo.
 */
export const CANDIDATOS_GOLEADOR: CandidatoGoleador[] = [
  { nombre: 'Kylian Mbappé', pais: 'Francia', codigoPais: 'FR' },
  { nombre: 'Erling Haaland', pais: 'Noruega', codigoPais: 'NO' },
  { nombre: 'Lionel Messi', pais: 'Argentina', codigoPais: 'AR' },
  { nombre: 'Vinicius Jr.', pais: 'Brasil', codigoPais: 'BR' },
  { nombre: 'Harry Kane', pais: 'Inglaterra', codigoPais: 'GB-ENG' },
  { nombre: 'Lautaro Martínez', pais: 'Argentina', codigoPais: 'AR' },
  { nombre: 'Neymar Jr.', pais: 'Brasil', codigoPais: 'BR' },
  { nombre: 'Mohamed Salah', pais: 'Egipto', codigoPais: 'EG' },
  { nombre: 'Antoine Griezmann', pais: 'Francia', codigoPais: 'FR' },
  { nombre: 'Cristiano Ronaldo', pais: 'Portugal', codigoPais: 'PT' },
  { nombre: 'Romelu Lukaku', pais: 'Bélgica', codigoPais: 'BE' },
  { nombre: 'Karim Benzema', pais: 'Francia', codigoPais: 'FR' },
];

/**
 * Indica que la lista está pendiente del dataset oficial.
 * Cuando el dataset esté disponible, reemplazar CANDIDATOS_GOLEADOR con los datos reales
 * y poner esta bandera en false.
 */
export const GOLEADORES_PENDIENTES_DATASET = true;

export const GOLEADORES_MENSAJE_PENDIENTE =
  '⚠️ Lista provisional. El dataset oficial de candidatos se cargará antes del inicio del Mundial 2026.';

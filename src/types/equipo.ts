export interface Equipo {
  id: number;
  nombre: string;
  nombreCorto: string;
  codigoPais: string; // ISO 3166-1 alpha-2 or ISO 3166-2 subdivision code; 'XX' for TBD/placeholder teams
  grupoId: string; // 'A' - 'L'
  banderaUrl?: string;
}

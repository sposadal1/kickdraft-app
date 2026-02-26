export interface Equipo {
  id: number;
  nombre: string;
  nombreCorto: string;
  codigoPais: string; // ISO 3166-1 alpha-2
  grupoId: string; // 'A' - 'L'
  banderaUrl?: string;
}

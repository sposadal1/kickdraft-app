export type FasePartido =
  | 'grupos'
  | 'dieciseisavos'
  | 'octavos'
  | 'cuartos'
  | 'semifinal'
  | 'tercer_cuarto'
  | 'final';

export type EstadoPartido = 'programado' | 'en_vivo' | 'finalizado';

export interface Partido {
  id: number;
  numeroPartido: number;
  fase: FasePartido;
  grupoId?: string;
  equipoLocalId: number;
  equipoVisitanteId: number;
  fechaHoraUTC: string; // ISO string UTC
  estadio: string;
  ciudad: string;
  pais: string;
  golesLocal?: number;
  golesVisitante?: number;
  estado: EstadoPartido;
}

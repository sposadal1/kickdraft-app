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
  apiFootballId?: number;
  minutoActual?: number;
}

export interface EstadisticasPartido {
  id: string;
  partidoId: number;
  tirosLocal: number;
  tirosPuertaLocal: number;
  tirosVisitante: number;
  tirosPuertaVisitante: number;
  posesionLocal: number;
  posesionVisitante: number;
  cornersLocal: number;
  cornersVisitante: number;
  faltasLocal: number;
  faltasVisitante: number;
  tarjetasAmarillasLocal: number;
  tarjetasAmarillasVisitante: number;
  tarjetasRojasLocal: number;
  tarjetasRojasVisitante: number;
  minutoActual: number | null;
  actualizadoEn: string;
}

export interface EventoPartido {
  id: string;
  partidoId: number;
  minuto: number;
  tipo: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'sustitucion';
  equipo: 'local' | 'visitante';
  jugador?: string;
  detalle?: string;
}

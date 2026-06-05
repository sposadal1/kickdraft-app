export interface Partido {
  id: number;
  numeroPartido: number;

  apiFixtureId?: number;

  fase:
    | 'grupos'
    | 'dieciseisavos'
    | 'octavos'
    | 'cuartos'
    | 'semifinal'
    | 'tercer-puesto'
    | 'final';

  grupoId?: string;

  equipoLocalId: number;
  equipoVisitanteId: number;

  fechaHoraUTC: string;

  estadio: string;
  ciudad: string;
  pais: string;

  estado:
    | 'programado'
    | 'en-vivo'
    | 'finalizado';

  marcadorLocal?: number;
  marcadorVisitante?: number;
}

export type FasePartido = Partido['fase'];
export interface Pronostico {
  id: string;
  usuarioId: string;
  partidoId: number;
  golesLocalPronosticado: number;
  golesVisitantePronosticado: number;
  puntosObtenidos: number;
  creadoEn: string;
  actualizadoEn: string;
}

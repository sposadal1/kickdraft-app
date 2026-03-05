export interface Liga {
  id: string;
  nombre: string;
  avatarUrl?: string;
  codigoInvitacion: string;
  creadorId: string;
  creadaEn: string;
}

export interface MiembroLiga {
  ligaId: string;
  usuarioId: string;
  totalPuntos: number;
  unidoEn: string;
  updatedAt?: string;
}

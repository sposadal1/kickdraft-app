export interface RachaDisponible {
  id: string;
  nombre: string;
  descripcion: string;
  puntos: number;
}

export const RACHAS_PREDEFINIDAS: RachaDisponible[] = [
  {
    id: 'lobo_solitario',
    nombre: 'Lobo solitario',
    descripcion: 'Acertó marcador exacto en un partido donde nadie más en la liga lo acertó.',
    puntos: 5,
  },
];

export interface OpcionesPlus {
  campeon_goleador?: boolean;
  rachas?: {
    activo: boolean;
    rachas_disponibles: RachaDisponible[];
  };
}

export interface Liga {
  id: string;
  nombre: string;
  avatarUrl?: string;
  codigoInvitacion: string;
  creadorId: string;
  creadaEn: string;
  opcionesPlus?: OpcionesPlus;
}

export interface MiembroLiga {
  ligaId: string;
  usuarioId: string;
  totalPuntos: number;
  unidoEn: string;
  updatedAt?: string;
}

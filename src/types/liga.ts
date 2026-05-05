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

export type RachaId = 'lobo_solitario' | 'muro_defensivo';

export interface RachaDisponible {
  id: RachaId;
  nombre: string;
  descripcion: string;
  defaultPuntos: number;
}

export const RACHAS_PREDEFINIDAS: Record<RachaId, RachaDisponible> = {
  lobo_solitario: {
    id: 'lobo_solitario',
    nombre: 'Lobo solitario',
    descripcion: 'Acertaste el marcador exacto y fuiste el único en la liga en hacerlo.',
    defaultPuntos: 8,
  },
  muro_defensivo: {
    id: 'muro_defensivo',
    nombre: 'Muro defensivo',
    descripcion: 'Acertaste un 0-0 exacto 3 veces.',
    defaultPuntos: 6,
  },
};

export interface OpcionesPlus {
  campeon_goleador?: boolean;
  rachas?: boolean;
}

export interface RachaConfigLiga {
  liga_id: string;
  racha_id: RachaId;
  nombre: string;
  descripcion?: string | null;
  puntos: number;
}

export interface PrediccionLiga {
  liga_id: string;
  usuario_id: string;
  campeon_id: number | null;
  goleador_nombre: string | null;
  creado_en?: string;
}

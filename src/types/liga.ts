export interface RachaDisponible {
  id: string;
  nombre: string;
  descripcion: string;
  puntos: number;
  /** Parámetros adicionales de configuración para la racha */
  params?: Record<string, number | string | boolean>;
}

export const RACHAS_PREDEFINIDAS: RachaDisponible[] = [
  {
    id: 'lobo_solitario',
    nombre: '🐺 Lobo Solitario',
    descripcion:
      'Ganador único: el único miembro de la liga que acertó el marcador exacto en ese partido. Si dos o más aciertan, nadie la obtiene.',
    puntos: 5,
  },
  {
    id: 'muro_defensivo',
    nombre: '🧱 Muro Defensivo',
    descripcion:
      'Otorgada al acertar el marcador exacto 0-0 N veces durante el torneo (N=3 por defecto). Solo cuenta partidos terminados 0-0.',
    puntos: 10,
    // N = número de aciertos exactos 0-0 requeridos; default 3
    params: { n_veces: 3 },
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

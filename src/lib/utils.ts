import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';
import type { FasePartido } from '@/types/partido';

const ZONA_COLOMBIA = 'America/Bogota';

export function convertirAHoraColombia(fechaUTC: string): Date {
  return toZonedTime(new Date(fechaUTC), ZONA_COLOMBIA);
}

export function formatearFecha(fechaUTC: string): string {
  const fechaColombia = convertirAHoraColombia(fechaUTC);
  return format(fechaColombia, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
}

export function formatearHora(fechaUTC: string): string {
  const fechaColombia = convertirAHoraColombia(fechaUTC);
  return format(fechaColombia, 'HH:mm');
}

export function generarCodigoInvitacion(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint32Array(8);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((val) => chars[val % chars.length])
    .join('');
}

export function obtenerNombreFase(fase: FasePartido): string {
  const nombres: Record<FasePartido, string> = {
    grupos: 'Fase de Grupos',
    dieciseisavos: 'Dieciseisavos de Final',
    octavos: 'Octavos de Final',
    cuartos: 'Cuartos de Final',
    semifinal: 'Semifinal',
    tercer_cuarto: 'Tercer y Cuarto Lugar',
    final: 'Final',
  };
  return nombres[fase];
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

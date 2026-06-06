export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  nombre_visible?: string;
  email: string;
  avatar_url?: string;
  creadoEn: string;
}
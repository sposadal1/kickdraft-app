export interface PerfilUsuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  nombre_visible?: string | null;
  avatar_url?: string | null;
  creado_en?: string;
}

export function getNombreVisible(perfil?: Partial<PerfilUsuario> | null, fallbackEmail?: string | null): string {
  const visible = perfil?.nombre_visible?.trim();
  if (visible) return visible;

  const nombre = `${perfil?.nombre ?? ''} ${perfil?.apellido ?? ''}`.trim();
  if (nombre) return nombre;

  return perfil?.email ?? fallbackEmail ?? 'Usuario';
}

export function getIniciales(nombre: string): string {
  const limpio = nombre.trim();
  if (!limpio) return 'U';
  const partes = limpio.split(/\s+/).filter(Boolean);
  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }
  return `${partes[0][0] ?? ''}${partes[1][0] ?? ''}`.toUpperCase();
}

export function validarNombreVisible(nombre: string): string | null {
  const value = nombre.trim();
  if (!value) return 'El nombre visible es obligatorio.';
  if (value.length < 2 || value.length > 40) return 'El nombre visible debe tener entre 2 y 40 caracteres.';
  if (!/^[\p{L}\p{N}][\p{L}\p{N}\s._-]*$/u.test(value)) {
    return 'Usa solo letras, números, espacios, puntos, guiones y guion bajo.';
  }
  return null;
}

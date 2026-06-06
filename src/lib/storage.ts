import { supabase } from '@/lib/supabase';

export const PROFILE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const PROFILE_MAX_FILE_SIZE = 2 * 1024 * 1024;

export function validarImagenPerfil(file: File): string | null {
  if (!PROFILE_ALLOWED_TYPES.includes(file.type)) {
    return 'Formato no permitido. Usa JPG, PNG o WEBP.';
  }
  if (file.size > PROFILE_MAX_FILE_SIZE) {
    return 'La imagen supera el límite de 2 MB.';
  }
  return null;
}

export async function subirAvatarPerfil(userId: string, file: File): Promise<{ publicUrl: string } | { error: string }> {
  const extByType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  const ext = extByType[file.type] ?? 'jpg';
  const filePath = `profiles/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return { publicUrl: data.publicUrl };
}

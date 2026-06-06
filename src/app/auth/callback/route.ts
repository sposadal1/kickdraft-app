import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      const meta = data.user.user_metadata;
      const nombreCompleto: string = meta?.full_name || meta?.name || '';
      const partes = nombreCompleto.trim().split(' ');
      const nombre = partes[0] || '';
      const apellido = partes.slice(1).join(' ') || '';

      const { error: upsertError } = await supabase.from('perfiles').upsert({
        id: data.user.id,
        email: data.user.email ?? '',
        nombre,
        apellido,
      }, { onConflict: 'id' });
      if (upsertError) console.error('Error al guardar perfil:', upsertError.message);
    }
  }

  return NextResponse.redirect(requestUrl.origin);
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { generarCodigoInvitacion } from '@/lib/utils';
import { Trophy, Copy, Check, Upload } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export default function CrearLigaPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<User | null | undefined>(undefined);
  const [nombre, setNombre] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarWarning, setAvatarWarning] = useState('');
  const [ligaCreada, setLigaCreada] = useState<{ nombre: string; codigo: string } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      const isAuth = !error && !!data.user;
      if (!isAuth) {
        setUsuario(null);
        router.replace('/auth/login');
      } else {
        setUsuario(data.user);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [router]);

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setAvatarWarning('Solo se permiten imágenes (JPG, PNG, GIF, WebP, SVG).');
        return;
      }
      setAvatarWarning('');
      // Revoke previous preview URL to avoid memory leaks
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !usuario) return;
    setCargando(true);
    setError('');

    const codigo = generarCodigoInvitacion();

    // Upload avatar if provided
    let avatar_url: string | null = null;
    if (avatarFile) {
      const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/svg+xml': 'svg',
      };
      const ext = mimeToExt[avatarFile.type] ?? 'jpg';
      const filePath = `${usuario.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });
      if (uploadError) {
        console.warn('Avatar upload failed:', uploadError.message);
        setAvatarWarning('No se pudo subir la imagen. La liga se creará sin foto.');
      } else {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatar_url = urlData.publicUrl;
      }
    }

    console.log('Creando liga con usuario:', usuario.id, 'nombre:', nombre.trim(), 'codigo:', codigo);

    const { data: liga, error: ligaError } = await supabase
      .from('ligas')
      .insert({
        nombre: nombre.trim(),
        codigo_invitacion: codigo,
        creador_id: usuario.id,
        ...(avatar_url ? { avatar_url } : {}),
      })
      .select()
      .single();

    if (ligaError || !liga) {
      console.error('Error al crear liga:', ligaError?.message, ligaError?.details, ligaError?.hint, ligaError?.code);
      const msg = ligaError?.message ?? '';
      if (msg.includes('duplicate') || msg.includes('unique') || ligaError?.code === '23505') {
        setError('Ya existe una liga con ese código. Por favor intenta de nuevo.');
      } else if (msg.includes('foreign key') || ligaError?.code === '23503') {
        setError('Error de autenticación. Por favor cierra sesión, vuelve a entrar e intenta de nuevo.');
      } else if (msg.includes('permission') || msg.includes('policy') || ligaError?.code === '42501') {
        setError('No tienes permiso para crear ligas. Asegúrate de haber iniciado sesión correctamente.');
      } else {
        setError(`Error al crear la liga: ${ligaError?.message ?? 'Error desconocido'}`);
      }
      setCargando(false);
      return;
    }

    console.log('Liga creada exitosamente:', liga.id);

    const { error: miembroError } = await supabase
      .from('miembros_liga')
      .insert({ liga_id: liga.id, usuario_id: usuario.id, total_puntos: 0 });

    if (miembroError) {
      console.error('Error al añadir miembro:', miembroError.message);
      setError(`Liga creada pero hubo un error al unirte como miembro: ${miembroError.message}`);
      setCargando(false);
      return;
    }

    setLigaCreada({ nombre: liga.nombre, codigo: liga.codigo_invitacion });
    setCargando(false);
  }

  async function copiarCodigo() {
    if (!ligaCreada) return;
    await navigator.clipboard.writeText(ligaCreada.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (usuario === undefined) {
    return <div className="flex items-center justify-center py-20"><div className="text-gray-500">Cargando...</div></div>;
  }

  if (ligaCreada) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-verde-900/40 rounded-2xl mb-6">
          <Trophy className="w-8 h-8 text-verde-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">¡Liga creada!</h1>
        <p className="text-gray-400 mb-8">
          Comparte este código con tus amigos para que se unan a <strong className="text-white">{ligaCreada.nombre}</strong>.
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-500 mb-2">Código de invitación</p>
          <div className="text-4xl font-black text-verde-400 tracking-widest mb-4">{ligaCreada.codigo}</div>
          <button
            onClick={copiarCodigo}
            className="flex items-center gap-2 mx-auto bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg border border-gray-700 transition-colors"
          >
            {copiado ? <Check className="w-4 h-4 text-verde-400" /> : <Copy className="w-4 h-4" />}
            {copiado ? '¡Copiado!' : 'Copiar código'}
          </button>
        </div>

        <Link
          href="/ligas"
          className="text-verde-400 hover:text-verde-300 text-sm font-medium transition-colors"
        >
          Ver mis ligas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Crear mi Liga</h1>
      <p className="text-gray-400 mb-8">Crea tu polla mundialista e invita a tus amigos.</p>

      <form onSubmit={handleCrear} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nombre de la liga *
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Los cracks del trabajo"
            maxLength={50}
            required
            className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-verde-500 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Foto de perfil (opcional)
          </label>
          <div
            className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center text-gray-500 hover:border-gray-600 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="Vista previa"
                className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
              />
            ) : (
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
            )}
            <p className="text-sm flex items-center justify-center gap-1">
              <Upload className="w-4 h-4" />
              {avatarFile ? avatarFile.name : 'Haz clic para subir una imagen'}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          {avatarWarning && <p className="text-yellow-400 text-xs mt-2">{avatarWarning}</p>}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={!nombre.trim() || cargando}
          className="w-full bg-verde-600 hover:bg-verde-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-4 rounded-xl transition-colors"
        >
          {cargando ? 'Creando...' : 'Crear liga'}
        </button>
      </form>
    </div>
  );
}

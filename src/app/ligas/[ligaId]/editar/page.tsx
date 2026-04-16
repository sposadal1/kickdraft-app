'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { ArrowLeft, Upload, Save, UserX, Check, Trophy } from 'lucide-react';
import Link from 'next/link';

interface Miembro {
  usuario_id: string;
  total_puntos: number;
  perfiles: {
    nombre: string;
    apellido: string;
    email: string;
  } | null;
}

interface Liga {
  id: string;
  nombre: string;
  creador_id: string;
  avatar_url?: string | null;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export default function EditarLigaPage() {
  const params = useParams();
  const router = useRouter();
  const ligaId = params.ligaId as string;

  const [liga, setLiga] = useState<Liga | null>(null);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);

  // Edit name
  const [nombre, setNombre] = useState('');
  const [guardandoNombre, setGuardandoNombre] = useState(false);
  const [exitoNombre, setExitoNombre] = useState(false);
  const [errorNombre, setErrorNombre] = useState('');

  // Edit avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarWarning, setAvatarWarning] = useState('');
  const [subiendoAvatar, setSubiendoAvatar] = useState(false);
  const [exitoAvatar, setExitoAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kick member
  const [expulsando, setExpulsando] = useState<string | null>(null);
  const [mensajeExpulsion, setMensajeExpulsion] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.replace('/auth/login');
        return;
      }
      setUsuario(data.user);
      cargarDatos(data.user.id);
    });
  }, [ligaId, router]);

  async function cargarDatos(userId: string) {
    setCargando(true);

    const { data: ligaData, error: ligaError } = await supabase
      .from('ligas')
      .select('id, nombre, creador_id, avatar_url')
      .eq('id', ligaId)
      .single();

    if (ligaError || !ligaData) {
      router.replace('/ligas');
      return;
    }

    // Only creator can access this page
    if (ligaData.creador_id !== userId) {
      router.replace(`/ligas/${ligaId}`);
      return;
    }

    setLiga(ligaData);
    setNombre(ligaData.nombre);

    const { data: miembrosData } = await supabase
      .from('miembros_liga')
      .select('usuario_id, total_puntos, perfiles(nombre, apellido, email)')
      .eq('liga_id', ligaId);

    setMiembros((miembrosData as unknown as Miembro[]) ?? []);
    setCargando(false);
  }

  function clearAvatarPreview() {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setAvatarFile(null);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setAvatarWarning('Solo se permiten imágenes (JPG, PNG, GIF, WebP, SVG).');
        return;
      }
      setAvatarWarning('');
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      clearAvatarPreview();
    }
  }

  async function guardarNombre(e: React.FormEvent) {
    e.preventDefault();
    if (!liga || !nombre.trim()) return;
    setGuardandoNombre(true);
    setErrorNombre('');
    setExitoNombre(false);

    const { error } = await supabase
      .from('ligas')
      .update({ nombre: nombre.trim() })
      .eq('id', liga.id);

    if (error) {
      setErrorNombre('No se pudo actualizar el nombre. Intenta de nuevo.');
    } else {
      setLiga({ ...liga, nombre: nombre.trim() });
      setExitoNombre(true);
      setTimeout(() => setExitoNombre(false), 3000);
    }
    setGuardandoNombre(false);
  }

  async function subirAvatar(e: React.FormEvent) {
    e.preventDefault();
    if (!liga || !avatarFile || !usuario) return;
    setSubiendoAvatar(true);
    setAvatarWarning('');
    setExitoAvatar(false);

    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
    };
    const ext = mimeToExt[avatarFile.type] ?? 'jpg';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const filePath = `ligas/${liga.id}/${uniqueName}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: true });

    if (uploadError) {
      setAvatarWarning(`No se pudo subir la imagen: ${uploadError.message}`);
      setSubiendoAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const avatar_url = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from('ligas')
      .update({ avatar_url })
      .eq('id', liga.id);

    if (updateError) {
      setAvatarWarning('Imagen subida pero no se pudo guardar en la liga. Intenta de nuevo.');
    } else {
      setLiga({ ...liga, avatar_url });
      setExitoAvatar(true);
      clearAvatarPreview();
      setTimeout(() => setExitoAvatar(false), 3000);
    }
    setSubiendoAvatar(false);
  }

  async function expulsarMiembro(usuarioId: string) {
    if (!liga) return;
    setExpulsando(usuarioId);
    setMensajeExpulsion('');

    const { error } = await supabase
      .from('miembros_liga')
      .delete()
      .eq('liga_id', liga.id)
      .eq('usuario_id', usuarioId);

    if (error) {
      setMensajeExpulsion('No se pudo expulsar al miembro. Intenta de nuevo.');
    } else {
      setMiembros((prev) => prev.filter((m) => m.usuario_id !== usuarioId));
      setMensajeExpulsion('Miembro expulsado correctamente.');
      setTimeout(() => setMensajeExpulsion(''), 3000);
    }
    setExpulsando(null);
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!liga) return null;

  const miembrosSinCreador = miembros.filter((m) => m.usuario_id !== liga.creador_id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href={`/ligas/${ligaId}`}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a la liga
      </Link>

      <h1 className="text-2xl font-bold text-white mb-8">Administrar Liga</h1>

      {/* Edit Name */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Nombre de la liga</h2>
        <form onSubmit={guardarNombre} className="flex gap-3">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={50}
            required
            className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:border-verde-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!nombre.trim() || guardandoNombre || nombre.trim() === liga.nombre}
            className="flex items-center gap-2 bg-verde-600 hover:bg-verde-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            {exitoNombre ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {guardandoNombre ? 'Guardando...' : exitoNombre ? '¡Guardado!' : 'Guardar'}
          </button>
        </form>
        {errorNombre && <p className="text-red-400 text-sm mt-2">{errorNombre}</p>}
      </section>

      {/* Edit Avatar */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Foto de perfil</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-verde-700 flex items-center justify-center text-white font-black text-2xl overflow-hidden flex-shrink-0">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Vista previa" className="w-full h-full object-cover" />
            ) : liga.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={liga.avatar_url} alt={liga.nombre} className="w-full h-full object-cover" />
            ) : (
              liga.nombre.charAt(0).toUpperCase()
            )}
          </div>
          <p className="text-gray-400 text-sm">
            {liga.avatar_url ? 'Foto de perfil actual. Sube una nueva para reemplazarla.' : 'Esta liga no tiene foto de perfil todavía.'}
          </p>
        </div>
        <form onSubmit={subirAvatar} className="space-y-3">
          <div
            className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center text-gray-500 hover:border-gray-600 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Trophy className="w-6 h-6 mx-auto mb-2 opacity-30" />
            <p className="text-sm flex items-center justify-center gap-1">
              <Upload className="w-4 h-4" />
              {avatarFile ? avatarFile.name : 'Haz clic para seleccionar una imagen'}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          {avatarWarning && <p className="text-yellow-400 text-xs">{avatarWarning}</p>}
          {exitoAvatar && <p className="text-verde-400 text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Foto actualizada correctamente.</p>}
          <button
            type="submit"
            disabled={!avatarFile || subiendoAvatar}
            className="flex items-center gap-2 bg-verde-600 hover:bg-verde-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4" />
            {subiendoAvatar ? 'Subiendo...' : 'Subir foto'}
          </button>
        </form>
      </section>

      {/* Manage Members */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Miembros</h2>
        <p className="text-xs text-gray-500 mb-4">Puedes expulsar a cualquier miembro de la liga.</p>

        {mensajeExpulsion && (
          <p className={`text-sm mb-4 ${mensajeExpulsion.startsWith('No se pudo') ? 'text-red-400' : 'text-verde-400'}`}>
            {mensajeExpulsion}
          </p>
        )}

        {miembrosSinCreador.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No hay otros miembros en esta liga.</p>
        ) : (
          <div className="space-y-2">
            {miembrosSinCreador.map((miembro) => {
              const perfil = miembro.perfiles;
              const nombreMiembro = perfil
                ? `${perfil.nombre} ${perfil.apellido}`.trim() || perfil.email
                : 'Usuario';
              return (
                <div
                  key={miembro.usuario_id}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl"
                >
                  <div className="w-8 h-8 rounded-full bg-verde-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {nombreMiembro.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm text-white truncate block">{nombreMiembro}</span>
                    {perfil?.email && (
                      <span className="text-xs text-gray-500 truncate block">{perfil.email}</span>
                    )}
                  </div>
                  <button
                    onClick={() => expulsarMiembro(miembro.usuario_id)}
                    disabled={expulsando === miembro.usuario_id}
                    className="flex items-center gap-1.5 bg-red-900/30 hover:bg-red-900/60 text-red-400 hover:text-red-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-900/50 transition-colors disabled:opacity-50"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    {expulsando === miembro.usuario_id ? 'Expulsando...' : 'Expulsar'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

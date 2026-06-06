'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Avatar from '@/components/profile/Avatar';
import { getNombreVisible, PerfilUsuario, validarNombreVisible } from '@/lib/profile';
import { subirAvatarPerfil, validarImagenPerfil } from '@/lib/storage';

export default function EditarPerfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [nombreVisible, setNombreVisible] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const nombrePreview = useMemo(() => nombreVisible.trim() || getNombreVisible(perfil), [nombreVisible, perfil]);

  useEffect(() => {
    async function cargar() {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace('/auth/login');
        return;
      }

      const { data } = await supabase
        .from('perfiles')
        .select('id, nombre, apellido, email, nombre_visible, avatar_url, creado_en')
        .eq('id', authData.user.id)
        .single();

      if (!data) {
        router.replace('/');
        return;
      }

      const perfilData = data as PerfilUsuario;
      setPerfil(perfilData);
      setNombreVisible(perfilData.nombre_visible ?? getNombreVisible(perfilData));
      setLoading(false);
    }

    cargar();

    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
    // avatarPreview cleanup in unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function handleFile(file: File | null) {
    if (!file) return;

    const validationError = validarImagenPerfil(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setAvatarFile(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0] ?? null);
  }

  async function guardarCambios(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return;

    const validationError = validarNombreVisible(nombreVisible);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    let avatarUrl = perfil.avatar_url ?? null;

    if (avatarFile) {
      const uploadResult = await subirAvatarPerfil(perfil.id, avatarFile);
      if ('error' in uploadResult) {
        setError(`No se pudo subir el avatar: ${uploadResult.error}`);
        setSaving(false);
        return;
      }
      avatarUrl = uploadResult.publicUrl;
    }

    const { error: updateError } = await supabase
      .from('perfiles')
      .update({
        nombre_visible: nombreVisible.trim(),
        avatar_url: avatarUrl,
      })
      .eq('id', perfil.id);

    if (updateError) {
      setError(`No se pudo guardar el perfil: ${updateError.message}`);
      setSaving(false);
      return;
    }

    setPerfil((prev) => prev ? ({ ...prev, nombre_visible: nombreVisible.trim(), avatar_url: avatarUrl }) : prev);
    setAvatarFile(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
    setSuccess('Perfil actualizado correctamente.');
    setSaving(false);
  }

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Cargando perfil...</div>;
  }

  if (!perfil) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/perfil" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6">
        <ArrowLeft className="w-4 h-4" />
        Volver a mi perfil
      </Link>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Editar perfil</h1>

        <form onSubmit={guardarCambios} className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar
              name={nombrePreview}
              avatarUrl={avatarPreview || perfil.avatar_url}
              sizeClassName="w-16 h-16"
              textClassName="text-xl font-black"
            />
            <div>
              <p className="text-sm text-gray-300">{nombrePreview}</p>
              <p className="text-xs text-gray-500">{perfil.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre visible</label>
            <input
              type="text"
              value={nombreVisible}
              onChange={(e) => setNombreVisible(e.target.value)}
              placeholder="Ej: Samuel Posada"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-verde-500 focus:outline-none"
              maxLength={40}
            />
            <p className="text-xs text-gray-500 mt-1">Permitido: letras, números, espacios, punto, guion y guion bajo.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Foto de perfil</label>
            <div
              className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center text-gray-400 hover:border-gray-600 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
            >
              <Upload className="w-5 h-5 mx-auto mb-2" />
              <p className="text-sm">Arrastra una imagen o haz clic para seleccionarla</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG o WEBP · Máximo 2 MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-verde-400">{success}</p>}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-verde-600 hover:bg-verde-700 disabled:bg-gray-700 text-white font-medium px-4 py-2.5 rounded-xl"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}

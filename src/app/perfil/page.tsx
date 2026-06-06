'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Mail, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Avatar from '@/components/profile/Avatar';
import { getNombreVisible, PerfilUsuario } from '@/lib/profile';

export default function PerfilPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState(true);

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

      setPerfil(data as PerfilUsuario);
      setCargando(false);
    }

    cargar();
  }, [router]);

  if (cargando) {
    return <div className="py-20 text-center text-gray-500">Cargando perfil...</div>;
  }

  if (!perfil) return null;

  const nombreVisible = getNombreVisible(perfil);
  const fechaRegistro = perfil.creado_en ? new Date(perfil.creado_en).toLocaleDateString('es-CO') : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={nombreVisible} avatarUrl={perfil.avatar_url} sizeClassName="w-16 h-16" textClassName="text-xl font-black" />
          <div>
            <h1 className="text-2xl font-bold text-white">{nombreVisible}</h1>
            <p className="text-gray-400">Perfil de usuario</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Mail className="w-4 h-4 text-gray-500" />
            <span>{perfil.email}</span>
          </div>

          {fechaRegistro && (
            <div className="flex items-center gap-2 text-gray-300">
              <CalendarDays className="w-4 h-4 text-gray-500" />
              <span>Registrado el {fechaRegistro}</span>
            </div>
          )}
        </div>

        <Link
          href="/perfil/editar"
          className="mt-6 inline-flex items-center gap-2 bg-verde-600 hover:bg-verde-700 text-white font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Editar perfil
        </Link>
      </div>
    </div>
  );
}

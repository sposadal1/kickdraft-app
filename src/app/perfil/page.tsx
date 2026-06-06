'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PerfilPage() {
interface Perfil {
  id: string;
  nombre: string;
  apellido: string;
  nombre_visible?: string;
  email: string;
  avatar_url?: string;
}

const [perfil, setPerfil] = useState<Perfil | null>(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

async function cargarPerfil() {
  try {
    const { data: auth, error: authError } =
      await supabase.auth.getUser();

    console.log('AUTH', auth);
    console.log('AUTH ERROR', authError);

    if (!auth.user) {
      alert('No hay usuario autenticado');
      return;
    }

    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', auth.user.id)
      .single();

    console.log('PERFIL DATA', data);
    console.log('PERFIL ERROR', error);

    setPerfil(data);
  } catch (e) {
    console.error(e);
    alert(String(e));
  }
}

  if (!perfil) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-white">
        Cargando perfil...
      </div>
    );
  }

  const nombre =
    perfil.nombre_visible ||
    `${perfil.nombre} ${perfil.apellido}`;
    alert(JSON.stringify(perfil, null, 2));

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">

        <div className="flex items-center gap-4 mb-8">

          <div className="w-20 h-20 rounded-full bg-verde-700 flex items-center justify-center text-2xl font-bold text-white">
            {nombre.substring(0,2).toUpperCase()}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              {nombre}
            </h1>

            <p className="text-gray-400">
              {perfil.email}
            </p>
          </div>
        </div>

        <Link
          href="/perfil/editar"
          className="bg-verde-600 hover:bg-verde-700 text-white px-4 py-2 rounded-lg"
        >
          Editar perfil
        </Link>

      </div>
    </div>
  );
}
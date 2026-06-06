'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function EditarPerfilPage() {

  const [nombreVisible, setNombreVisible] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {

    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) return;

    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', auth.user.id)
      .single();

    setNombreVisible(data?.nombre_visible || '');
  }

  async function guardar() {

    setGuardando(true);

    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) return;

    await supabase
      .from('perfiles')
      .update({
        nombre_visible: nombreVisible
      })
      .eq('id', auth.user.id);

    alert('Perfil actualizado');

    setGuardando(false);
  }

  return (
    <div className="max-w-xl mx-auto p-8">

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

        <h1 className="text-2xl font-bold text-white mb-6">
          Editar perfil
        </h1>

        <label className="block text-gray-300 mb-2">
          Nombre visible
        </label>

        <input
          value={nombreVisible}
          onChange={(e)=>setNombreVisible(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-6"
        />

        <button
          onClick={guardar}
          disabled={guardando}
          className="bg-verde-600 hover:bg-verde-700 px-4 py-3 rounded-lg text-white"
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>

      </div>

    </div>
  );
}
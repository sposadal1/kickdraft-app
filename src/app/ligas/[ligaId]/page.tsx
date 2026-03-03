'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Trophy, Copy, Check, Users, ArrowLeft } from 'lucide-react';
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
  codigo_invitacion: string;
  creador_id: string;
}

export default function DetalleLigaPage() {
  const params = useParams();
  const router = useRouter();
  const ligaId = params.ligaId as string;

  const [liga, setLiga] = useState<Liga | null>(null);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.replace('/auth/login');
        return;
      }
      setUsuario(data.user);
      cargarLiga(data.user.id);
    });
  }, [ligaId, router]);

  async function cargarLiga(userId: string) {
    setCargando(true);

    const { data: ligaData, error: ligaError } = await supabase
      .from('ligas')
      .select('id, nombre, codigo_invitacion, creador_id')
      .eq('id', ligaId)
      .single();

    if (ligaError || !ligaData) {
      router.replace('/ligas');
      return;
    }

    const { data: membresia } = await supabase
      .from('miembros_liga')
      .select('liga_id')
      .eq('liga_id', ligaId)
      .eq('usuario_id', userId)
      .single();

    if (!membresia) {
      router.replace('/ligas');
      return;
    }

    setLiga(ligaData);

    const { data: miembrosData } = await supabase
      .from('miembros_liga')
      .select('usuario_id, total_puntos, perfiles(nombre, apellido, email)')
      .eq('liga_id', ligaId)
      .order('total_puntos', { ascending: false });

    setMiembros((miembrosData as unknown as Miembro[]) ?? []);
    setCargando(false);
  }

  async function copiarCodigo() {
    if (!liga) return;
    await navigator.clipboard.writeText(liga.codigo_invitacion);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!liga) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/ligas" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Mis ligas
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-verde-700 flex items-center justify-center text-white font-black text-2xl">
          {liga.nombre.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{liga.nombre}</h1>
          <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
            <Users className="w-4 h-4" />
            {miembros.length} miembro{miembros.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Código de invitación */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8">
        <p className="text-xs text-gray-500 mb-2">Código de invitación</p>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-black text-verde-400 tracking-widest">{liga.codigo_invitacion}</p>
          <button
            onClick={copiarCodigo}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-3 py-2 rounded-lg border border-gray-700 transition-colors"
          >
            {copiado ? <Check className="w-4 h-4 text-verde-400" /> : <Copy className="w-4 h-4" />}
            {copiado ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Clasificación */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Clasificación</h2>
        {miembros.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No hay miembros aún</p>
            <p className="text-sm mt-1">Comparte el código para invitar a tus amigos.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {miembros.map((miembro, index) => {
              const esYo = miembro.usuario_id === usuario?.id;
              const nombreMostrado = miembro.perfiles
                ? `${miembro.perfiles.nombre} ${miembro.perfiles.apellido}`.trim() || miembro.perfiles.email
                : 'Usuario';
              return (
                <div
                  key={miembro.usuario_id}
                  className={`flex items-center gap-4 p-3 rounded-xl ${esYo ? 'bg-verde-900/30 border border-verde-800/50' : 'bg-gray-800/50'}`}
                >
                  <span className="text-gray-500 font-bold w-6 text-center">{index + 1}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {nombreMostrado}
                      {esYo && <span className="ml-2 text-xs text-verde-400">(Tú)</span>}
                    </p>
                  </div>
                  <p className="text-verde-400 font-bold">{miembro.total_puntos} pts</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


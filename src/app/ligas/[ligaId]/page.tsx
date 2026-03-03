'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Trophy, Copy, Check, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Miembro {
  usuario_id: string;
  total_puntos: number;
  perfiles: {
    nombre: string;
    apellido: string;
    email: string;
  };
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
  const [usuario, setUsuario] = useState<any>(null);
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

    const { data: esMiembro } = await supabase
      .from('miembros_liga')
      .select('liga_id')
      .eq('liga_id', ligaId)
      .eq('usuario_id', userId)
      .single();

    if (!esMiembro) {
      router.replace('/ligas');
      return;
    }

    const { data: ligaData } = await supabase
      .from('ligas')
      .select('id, nombre, codigo_invitacion, creador_id')
      .eq('id', ligaId)
      .single();

    if (ligaData) setLiga(ligaData);

    const { data: miembrosData } = await supabase
      .from('miembros_liga')
      .select('usuario_id, total_puntos, perfiles(nombre, apellido, email)')
      .eq('liga_id', ligaId)
      .order('total_puntos', { ascending: false });

    if (miembrosData) setMiembros(miembrosData as unknown as Miembro[]);
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
        <div className="text-gray-500">Cargando liga...</div>
      </div>
    );
  }

  if (!liga) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400">Liga no encontrada.</p>
        <Link href="/ligas" className="text-verde-400 hover:text-verde-300 mt-4 inline-block">
          Volver a mis ligas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/ligas" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{liga.nombre}</h1>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2">
          <span className="text-sm text-gray-400">Código:</span>
          <span className="text-verde-400 font-mono font-bold tracking-widest">{liga.codigo_invitacion}</span>
          <button onClick={copiarCodigo} className="text-gray-400 hover:text-white transition-colors ml-1">
            {copiado ? <Check className="w-4 h-4 text-verde-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Clasificación */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-800">
          <Users className="w-5 h-5 text-verde-400" />
          <h2 className="text-white font-semibold">Clasificación</h2>
          <span className="ml-auto text-sm text-gray-500">{miembros.length} miembro{miembros.length !== 1 ? 's' : ''}</span>
        </div>
        {miembros.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>Aún no hay miembros.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {miembros.map((miembro, index) => {
              const esYo = miembro.usuario_id === usuario?.id;
              const nombre = miembro.perfiles?.nombre
                ? `${miembro.perfiles.nombre} ${miembro.perfiles.apellido || ''}`.trim()
                : miembro.perfiles?.email ?? 'Usuario';
              return (
                <div
                  key={miembro.usuario_id}
                  className={`flex items-center gap-4 px-6 py-4 ${esYo ? 'bg-verde-900/20' : ''}`}
                >
                  <span className={`text-lg font-bold w-6 text-center ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {nombre}
                      {esYo && <span className="ml-2 text-xs text-verde-400 font-normal">(tú)</span>}
                    </p>
                  </div>
                  <span className="text-verde-400 font-bold">{miembro.total_puntos} pts</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


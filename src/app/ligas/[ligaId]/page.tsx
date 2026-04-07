'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Trophy, Copy, Check, Users, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import AdSenseClassification from '@/components/ligas/AdSenseClassification';

interface Miembro {
  usuario_id: string;
  total_puntos: number;
  exactos?: number;
  marcadores_acertados?: number;
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
  const [mostrarConfirmEliminar, setMostrarConfirmEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

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
      .select('usuario_id, total_puntos, exactos, marcadores_acertados, perfiles(nombre, apellido, email)')
      .eq('liga_id', ligaId)
      .order('total_puntos', { ascending: false });

    const miembrosOrdenados = ((miembrosData as unknown as Miembro[]) ?? []).sort((a, b) => {
      if (b.total_puntos !== a.total_puntos) return b.total_puntos - a.total_puntos;
      if ((b.exactos ?? 0) !== (a.exactos ?? 0)) return (b.exactos ?? 0) - (a.exactos ?? 0);
      return (b.marcadores_acertados ?? 0) - (a.marcadores_acertados ?? 0);
    });
    setMiembros(miembrosOrdenados);
    setCargando(false);
  }

  async function copiarCodigo() {
    if (!liga) return;
    await navigator.clipboard.writeText(liga.codigo_invitacion);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  async function eliminarLiga() {
    if (!liga) return;
    setEliminando(true);
    await supabase.from('ligas').delete().eq('id', liga.id);
    router.replace('/ligas');
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!liga) return null;

  const esCreador = usuario?.id === liga.creador_id;

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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{liga.nombre}</h1>
          <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
            <Users className="w-4 h-4" />
            {miembros.length} miembro{miembros.length !== 1 ? 's' : ''}
          </div>
        </div>
        {esCreador && (
          <button
            onClick={() => setMostrarConfirmEliminar(true)}
            className="flex items-center gap-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 hover:text-red-300 text-sm font-medium px-3 py-2 rounded-lg border border-red-900/50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar liga
          </button>
        )}
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
        <h2 className="text-xl font-bold text-white mb-1">Clasificación</h2>
        <p className="text-xs text-gray-500 mb-4">Desempate: exactos → marcadores → peso por fase</p>
        {miembros.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No hay miembros aún</p>
            <p className="text-sm mt-1">Comparte el código para invitar a tus amigos.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {miembros.map((miembro, idx) => {
              const perfil = miembro.perfiles;
              const nombre = perfil ? `${perfil.nombre} ${perfil.apellido}`.trim() || perfil.email : 'Usuario';
              const esYo = miembro.usuario_id === usuario?.id;
              return (
                <div
                  key={miembro.usuario_id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${esYo ? 'bg-verde-900/30 border border-verde-800/50' : 'bg-gray-800/50'}`}
                >
                  <span className="text-gray-500 font-bold text-sm w-5 text-center">{idx + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-verde-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`font-medium text-sm ${esYo ? 'text-verde-400' : 'text-white'}`}>
                      {nombre}{esYo && <span className="ml-1 text-xs text-gray-500">(tú)</span>}
                    </span>
                    {(miembro.exactos != null || miembro.marcadores_acertados != null) && (
                      <div className="flex gap-2 mt-0.5">
                        {miembro.exactos != null && (
                          <span className="text-xs text-green-400">{miembro.exactos} exactos</span>
                        )}
                        {miembro.marcadores_acertados != null && (
                          <span className="text-xs text-yellow-400">{miembro.marcadores_acertados} marcadores</span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-verde-400">{miembro.total_puntos} pts</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Anuncio no invasivo debajo de clasificación */}
      <AdSenseClassification />

      {/* Modal de confirmación de eliminación */}
      {mostrarConfirmEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 bg-red-900/30 rounded-xl mb-4 mx-auto">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white text-center mb-2">Eliminar liga</h2>
            <p className="text-gray-400 text-center text-sm mb-6">¿Estás seguro de que quieres eliminar{' '}
              <span className="text-white font-semibold">&lsquo;{liga.nombre}&rsquo;</span>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarConfirmEliminar(false)}
                disabled={eliminando}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarLiga}
                disabled={eliminando}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
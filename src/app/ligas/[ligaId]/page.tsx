'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Copy, Check, Users, ArrowLeft, Trash2, Settings, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';
import AdSenseClassification from '@/components/ligas/AdSenseClassification';
import { EQUIPOS } from '@/data/equipos';
import type { OpcionesPlus } from '@/types/liga';

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
  avatar_url?: string | null;
  opciones_plus?: OpcionesPlus;
}

interface Prediccion {
  campeon_id: number | null;
  goleador_nombre: string | null;
  puntos_campeon: number;
  puntos_goleador: number;
}

interface RachaOtorgada {
  racha_id: string;
  partido_id: number | null;
  puntos: number;
  creado_en: string;
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

  // Plus features state
  const [miPrediccion, setMiPrediccion] = useState<Prediccion | null>(null);
  const [misRachas, setMisRachas] = useState<RachaOtorgada[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.replace('/auth/login');
        return;
      }
      setUsuario(data.user);
      cargarLiga(data.user.id);
    });
    // cargarLiga es estable dentro del efecto; incluirla causaría bucles infinitos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ligaId, router]);

  async function cargarLiga(userId: string) {
    setCargando(true);

    const { data: ligaData, error: ligaError } = await supabase
      .from('ligas')
      .select('id, nombre, codigo_invitacion, creador_id, avatar_url, opciones_plus')
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

    // Load plus features data if needed
    const opcionesPlus = (ligaData.opciones_plus ?? {}) as OpcionesPlus;

    if (opcionesPlus.campeon_goleador) {
      const { data: predData } = await supabase
        .from('predicciones_liga')
        .select('campeon_id, goleador_nombre, puntos_campeon, puntos_goleador')
        .eq('liga_id', ligaId)
        .eq('usuario_id', userId)
        .single();
      if (predData) setMiPrediccion(predData);
    }

    if (opcionesPlus.rachas?.activo) {
      const { data: rachasData } = await supabase
        .from('rachas_otorgadas')
        .select('racha_id, partido_id, puntos, creado_en')
        .eq('liga_id', ligaId)
        .eq('usuario_id', userId)
        .order('creado_en', { ascending: false });
      setMisRachas((rachasData as RachaOtorgada[]) ?? []);
    }

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
        <div className="w-16 h-16 rounded-full bg-verde-700 flex items-center justify-center text-white font-black text-2xl overflow-hidden flex-shrink-0">
          {liga.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={liga.avatar_url} alt={liga.nombre} className="w-full h-full object-cover" />
          ) : (
            liga.nombre.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{liga.nombre}</h1>
          <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
            <Users className="w-4 h-4" />
            {miembros.length} miembro{miembros.length !== 1 ? 's' : ''}
          </div>
        </div>
        {esCreador && (
          <div className="flex flex-col gap-2 items-end">
            <Link
              href={`/ligas/${ligaId}/editar`}
              className="flex items-center gap-2 bg-verde-800/40 hover:bg-verde-800/70 text-verde-400 hover:text-verde-300 text-sm font-medium px-3 py-2 rounded-lg border border-verde-800/50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Administrar Liga
            </Link>
            <button
              onClick={() => setMostrarConfirmEliminar(true)}
              className="flex items-center gap-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 hover:text-red-300 text-sm font-medium px-3 py-2 rounded-lg border border-red-900/50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar liga
            </button>
          </div>
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

      {/* Campeón y Goleador — Mi predicción */}
      {liga.opciones_plus?.campeon_goleador && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Mi predicción</h2>
            <span className="text-xs bg-yellow-900/30 text-yellow-400 border border-yellow-800/30 px-2 py-0.5 rounded-full ml-1">
              Campeón &amp; Goleador
            </span>
          </div>
          {miPrediccion ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-800/60 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">País Campeón</p>
                  <p className="text-white font-semibold">
                    {EQUIPOS.find((e) => e.id === miPrediccion.campeon_id)?.nombre ?? '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-0.5">Puntos</p>
                  <p className={`font-bold ${miPrediccion.puntos_campeon > 0 ? 'text-verde-400' : 'text-gray-600'}`}>
                    +{miPrediccion.puntos_campeon}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-gray-800/60 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Goleador</p>
                  <p className="text-white font-semibold">{miPrediccion.goleador_nombre ?? '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-0.5">Puntos</p>
                  <p className={`font-bold ${miPrediccion.puntos_goleador > 0 ? 'text-verde-400' : 'text-gray-600'}`}>
                    +{miPrediccion.puntos_goleador}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600 text-center">Se aplica al final del torneo · No se puede cambiar</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hiciste una predicción al unirte a esta liga.</p>
          )}
        </div>
      )}

      {/* Rachas y Logros — Mis rachas */}
      {liga.opciones_plus?.rachas?.activo && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Mis Rachas</h2>
          </div>
          {misRachas.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aún no tienes rachas en esta liga.</p>
              <p className="text-xs mt-1 text-gray-600">Las rachas se otorgan automáticamente al cumplir las condiciones.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {misRachas.map((r) => {
                const label =
                  r.racha_id === 'lobo_solitario'
                    ? '🐺 Lobo Solitario'
                    : r.racha_id === 'muro_defensivo'
                    ? '🧱 Muro Defensivo'
                    : r.racha_id.replace(/_/g, ' ');
                return (
                  <div key={`${r.racha_id}-${r.partido_id ?? 'global'}`} className="flex items-center justify-between bg-orange-900/10 border border-orange-800/30 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white capitalize">
                        {label}
                      </p>
                      {r.partido_id && (
                        <p className="text-xs text-gray-500 mt-0.5">Partido #{r.partido_id}</p>
                      )}
                    </div>
                    <span className="font-bold text-orange-400">+{r.puntos} pts</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
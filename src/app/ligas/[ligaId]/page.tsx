'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import {
  Copy,
  Check,
  Users,
  ArrowLeft,
  Trash2,
  Settings,
  ShieldCheck,
  Trophy,
  Target,
  Star,
  Crown,
} from 'lucide-react';
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
  avatar_url?: string | null;
  opciones_plus?: {
    campeon_goleador?: boolean;
    rachas?: boolean;
  } | null;
}

type PrediccionRow = {
  usuario_id: string;
  campeon_id: number | null;
  goleador_nombre: string | null;
};

type EquipoRow = {
  id: number;
  nombre: string;
};

type AdminEstado =
  | { estado: 'idle' }
  | { estado: 'loading' }
  | { estado: 'success'; mensaje: string }
  | { estado: 'error'; mensaje: string };

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

  // Admin panel
  const [mostrarAdminPlus, setMostrarAdminPlus] = useState(false);
  const [adminEstado, setAdminEstado] = useState<AdminEstado>({ estado: 'idle' });

  // Previews para admin
  const [equipoCampeonNombre, setEquipoCampeonNombre] = useState<string>('');
  const [goleadorGanadorNombre, setGoleadorGanadorNombre] = useState<string>('');
  const [puntosCampeon, setPuntosCampeon] = useState<number>(10);
  const [puntosGoleador, setPuntosGoleador] = useState<number>(10);

  const plusHabilitado = !!liga?.opciones_plus?.campeon_goleador;

  // Predicciones (resumen para mostrar en clasificación)
  const [prediccionesByUser, setPrediccionesByUser] = useState<Record<string, { campeon?: string; goleador?: string }>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.replace('/auth/login');
        return;
      }
      setUsuario(data.user);
      cargarLiga(data.user.id);
    });
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

    // Cargar predicciones para mostrar resumen por miembro (solo si plus)
    if (ligaData?.opciones_plus?.campeon_goleador) {
      await cargarPrediccionesResumen(ligaId);
    } else {
      setPrediccionesByUser({});
    }

    setCargando(false);
  }

  async function cargarPrediccionesResumen(ligaIdParam: string) {
    // 1) traer predicciones
    const { data: preds, error: predsError } = await supabase
      .from('predicciones_liga')
      .select('usuario_id, campeon_id, goleador_nombre')
      .eq('liga_id', ligaIdParam);

    if (predsError) {
      console.error('Error cargando predicciones_liga:', predsError.message);
      setPrediccionesByUser({});
      return;
    }

    const predRows = (preds ?? []) as PrediccionRow[];

    // 2) resolver nombres de campeon_id (equipos)
    const campeonIds = Array.from(new Set(predRows.map((p) => p.campeon_id).filter((v): v is number => typeof v === 'number')));

    let equiposMap: Record<number, string> = {};
    if (campeonIds.length > 0) {
      const { data: equipos, error: equiposError } = await supabase
        .from('equipos')
        .select('id, nombre')
        .in('id', campeonIds);

      if (equiposError) {
        console.error('Error cargando equipos:', equiposError.message);
      } else {
        for (const e of (equipos ?? []) as EquipoRow[]) {
          equiposMap[e.id] = e.nombre;
        }
      }
    }

    const map: Record<string, { campeon?: string; goleador?: string }> = {};
    for (const p of predRows) {
      map[p.usuario_id] = {
        campeon: p.campeon_id != null ? (equiposMap[p.campeon_id] ?? undefined) : undefined,
        goleador: p.goleador_nombre ?? undefined,
      };
    }
    setPrediccionesByUser(map);
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

  const esCreador = usuario?.id === liga?.creador_id;

  const adminSummary = useMemo(() => {
    if (!plusHabilitado) return null;
    const campeonTxt = equipoCampeonNombre ? `Campeón: ${equipoCampeonNombre} (+${puntosCampeon})` : 'Campeón: (sin definir)';
    const goleadorTxt = goleadorGanadorNombre
      ? `Goleador: ${goleadorGanadorNombre} (+${puntosGoleador})`
      : 'Goleador: (sin definir)';
    return `${campeonTxt} · ${goleadorTxt}`;
  }, [equipoCampeonNombre, goleadorGanadorNombre, puntosCampeon, puntosGoleador, plusHabilitado]);

  async function aplicarPuntosPlusFinal() {
    if (!liga || !usuario) return;
    if (!esCreador) {
      setAdminEstado({ estado: 'error', mensaje: 'Solo el creador puede aplicar puntos.' });
      return;
    }
    if (!plusHabilitado) {
      setAdminEstado({ estado: 'error', mensaje: 'Este modo no está habilitado en la liga.' });
      return;
    }

    if (!equipoCampeonNombre.trim() || !goleadorGanadorNombre.trim()) {
      setAdminEstado({ estado: 'error', mensaje: 'Debes definir campeón y goleador antes de aplicar puntos.' });
      return;
    }

    setAdminEstado({ estado: 'loading' });

    // 1) Buscar equipo campeón por nombre
    const { data: equipoData, error: equipoError } = await supabase
      .from('equipos')
      .select('id, nombre')
      .ilike('nombre', equipoCampeonNombre.trim())
      .maybeSingle();

    if (equipoError || !equipoData) {
      setAdminEstado({ estado: 'error', mensaje: 'No pude encontrar el campeón en la tabla equipos (revisa el nombre exacto).' });
      return;
    }

    const equipo = equipoData as EquipoRow;

    // 2) Cargar predicciones de la liga
    const { data: preds, error: predsError } = await supabase
      .from('predicciones_liga')
      .select('usuario_id, campeon_id, goleador_nombre')
      .eq('liga_id', liga.id);

    if (predsError) {
      setAdminEstado({ estado: 'error', mensaje: 'Error cargando predicciones de la liga.' });
      return;
    }

    const predRows = (preds ?? []) as Array<Omit<PrediccionRow, never>>;

    // 3) Calcular usuarios ganadores
    const ganadorCampeon = new Set<string>();
    const ganadorGoleador = new Set<string>();

    for (const p of predRows) {
      if (p.campeon_id != null && p.campeon_id === equipo.id) {
        ganadorCampeon.add(p.usuario_id);
      }
      if (p.goleador_nombre && p.goleador_nombre.trim().toLowerCase() === goleadorGanadorNombre.trim().toLowerCase()) {
        ganadorGoleador.add(p.usuario_id);
      }
    }

    // 4) Aplicar puntos (updates individuales)
    const usuarios = new Set<string>([...ganadorCampeon, ...ganadorGoleador]);

    try {
      for (const userId of usuarios) {
        const suma = (ganadorCampeon.has(userId) ? puntosCampeon : 0) + (ganadorGoleador.has(userId) ? puntosGoleador : 0);
        if (suma === 0) continue;

        const { data: miembroActual, error: miembroErr } = await supabase
          .from('miembros_liga')
          .select('total_puntos')
          .eq('liga_id', liga.id)
          .eq('usuario_id', userId)
          .single();

        if (miembroErr || !miembroActual) continue;
        const totalActual = (miembroActual as { total_puntos: number }).total_puntos ?? 0;

        const { error: updErr } = await supabase
          .from('miembros_liga')
          .update({ total_puntos: totalActual + suma })
          .eq('liga_id', liga.id)
          .eq('usuario_id', userId);

        if (updErr) {
          console.error('Error update miembros_liga:', updErr.message);
        }
      }

      setAdminEstado({
        estado: 'success',
        mensaje: `Puntos aplicados. Ganadores: campeón (${ganadorCampeon.size}) · goleador (${ganadorGoleador.size}).`,
      });

      await cargarLiga(usuario.id);
    } catch {
      setAdminEstado({ estado: 'error', mensaje: 'Error aplicando puntos.' });
    }
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
      <Link href="/ligas" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Mis ligas
      </Link>

      <div className="flex items-center gap-4 mb-6">
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
          {plusHabilitado && (
            <div className="inline-flex items-center gap-2 mt-2 text-xs text-verde-300 bg-verde-900/20 border border-verde-800/40 rounded-full px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Modo Plus: Campeón y Goleador
            </div>
          )}
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
            {plusHabilitado && (
              <button
                onClick={() => {
                  setMostrarAdminPlus((v) => !v);
                  setAdminEstado({ estado: 'idle' });
                }}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-3 py-2 rounded-lg border border-gray-700 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Plus
              </button>
            )}
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

      {esCreador && plusHabilitado && mostrarAdminPlus && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Aplicar puntos finales (Plus)</h2>
              <p className="text-xs text-gray-500 mt-1">Aplica +{puntosCampeon} al campeón correcto y +{puntosGoleador} al goleador correcto. Úsalo una sola vez.</p>
              {adminSummary && <p className="text-xs text-gray-400 mt-2">{adminSummary}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
              <label className="block text-xs text-gray-400 mb-2">Campeón (nombre exacto en equipos)</label>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-verde-400" />
                <input
                  value={equipoCampeonNombre}
                  onChange={(e) => setEquipoCampeonNombre(e.target.value)}
                  placeholder="Ej: Argentina"
                  className="w-full bg-transparent text-white placeholder-gray-600 text-sm outline-none"
                />
              </div>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
              <label className="block text-xs text-gray-400 mb-2">Goleador (texto libre, debe coincidir)</label>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-verde-400" />
                <input
                  value={goleadorGanadorNombre}
                  onChange={(e) => setGoleadorGanadorNombre(e.target.value)}
                  placeholder="Ej: Lionel Messi"
                  className="w-full bg-transparent text-white placeholder-gray-600 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
              <label className="block text-xs text-gray-400 mb-2">Puntos campeón</label>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <input
                  type="number"
                  value={puntosCampeon}
                  onChange={(e) => setPuntosCampeon(Number(e.target.value) || 0)}
                  className="w-full bg-transparent text-white text-sm outline-none"
                />
              </div>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
              <label className="block text-xs text-gray-400 mb-2">Puntos goleador</label>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <input
                  type="number"
                  value={puntosGoleador}
                  onChange={(e) => setPuntosGoleador(Number(e.target.value) || 0)}
                  className="w-full bg-transparent text-white text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {adminEstado.estado === 'error' && (
            <p className="text-red-400 text-sm mt-3">{adminEstado.mensaje}</p>
          )}
          {adminEstado.estado === 'success' && (
            <p className="text-verde-400 text-sm mt-3">{adminEstado.mensaje}</p>
          )}

          <div className="flex flex-col md:flex-row gap-2 mt-4">
            <button
              onClick={aplicarPuntosPlusFinal}
              disabled={adminEstado.estado === 'loading'}
              className="flex-1 bg-verde-600 hover:bg-verde-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {adminEstado.estado === 'loading' ? 'Aplicando…' : 'Aplicar puntos (+campeón / +goleador)'}
            </button>
            <button
              onClick={() => {
                setMostrarAdminPlus(false);
                setAdminEstado({ estado: 'idle' });
              }}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

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

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-1">Clasificación</h2>
        <p className="text-xs text-gray-500 mb-4">Desempate: exactos → marcadores → peso por fase</p>

        {plusHabilitado && (
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Crown className="w-4 h-4 text-verde-400" />
              Predicciones (Plus)
              <span className="text-gray-600">·</span>
              <span className="text-gray-500">Campeón / Goleador</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Se muestra como referencia debajo del nombre de cada miembro.</p>
          </div>
        )}

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
              const pred = prediccionesByUser[miembro.usuario_id];
              const showPredLine = plusHabilitado && (pred?.campeon || pred?.goleador);

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

                    {showPredLine && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {pred?.campeon && <span className="text-verde-300">🏆 {pred.campeon}</span>}
                        {pred?.campeon && pred?.goleador && <span className="mx-2 text-gray-600">·</span>}
                        {pred?.goleador && <span className="text-yellow-300">🎯 {pred.goleador}</span>}
                      </div>
                    )}

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

      <AdSenseClassification />

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

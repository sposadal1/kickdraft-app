import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface PronosticoData {
  golesLocal: number;
  golesVisitante: number;
  puntosObtenidos: number;
}

interface CacheEntry {
  data: Record<number, PronosticoData>;
  fetchedAt: number;
}

// Module-level cache shared across all hook instances so navigating between
// pages doesn't trigger a new network request within the same browser session.
const pronosticosCache = new Map<string, CacheEntry>();

/** How long (ms) a cache entry stays fresh before being refetched. */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

/**
 * Fetches and caches the authenticated user's pronósticos.
 *
 * Returns the cached data immediately on subsequent navigations so there is
 * no visible delay when switching between `/partidos` and `/pronosticos`.
 */
export function useCachedPronosticos(userId: string | null | undefined) {
  const [pronosticos, setPronosticos] = useState<Record<number, PronosticoData>>(() => {
    if (!userId) return {};
    const cached = pronosticosCache.get(userId);
    return cached ? cached.data : {};
  });
  const [cargando, setCargando] = useState<boolean>(() => {
    if (!userId) return false;
    const cached = pronosticosCache.get(userId);
    // Already have fresh data — no loading state
    return !cached || !isFresh(cached);
  });

  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const cargar = useCallback(async (uid: string, force = false) => {
    const cached = pronosticosCache.get(uid);
    if (!force && cached && isFresh(cached)) {
      setPronosticos(cached.data);
      setCargando(false);
      return;
    }

    setCargando(true);
    const { data, error } = await supabase
      .from('pronosticos')
      .select('partido_id, goles_local_pronosticado, goles_visitante_pronosticado, puntos_obtenidos')
      .eq('usuario_id', uid);

    if (error) {
      console.error('useCachedPronosticos: error al cargar pronósticos:', error.message);
      setCargando(false);
      return;
    }

    const map: Record<number, PronosticoData> = {};
    for (const row of data ?? []) {
      map[row.partido_id] = {
        golesLocal: row.goles_local_pronosticado,
        golesVisitante: row.goles_visitante_pronosticado,
        puntosObtenidos: row.puntos_obtenidos ?? 0,
      };
    }

    pronosticosCache.set(uid, { data: map, fetchedAt: Date.now() });
    setPronosticos(map);
    setCargando(false);
  }, []);

  useEffect(() => {
    if (!userId) {
      setPronosticos({});
      setCargando(false);
      return;
    }
    cargar(userId);
  }, [userId, cargar]);

  /** Update a single pronóstico in the cache and state (after a successful upsert). */
  const actualizarPronostico = useCallback(
    (partidoId: number, golesLocal: number, golesVisitante: number) => {
      const uid = userIdRef.current;
      if (!uid) return;
      setPronosticos((prev) => {
        const next = {
          ...prev,
          [partidoId]: {
            golesLocal,
            golesVisitante,
            puntosObtenidos: prev[partidoId]?.puntosObtenidos ?? 0,
          },
        };
        // Keep the module cache in sync
        const existing = pronosticosCache.get(uid);
        if (existing) {
          pronosticosCache.set(uid, { ...existing, data: next });
        }
        return next;
      });
    },
    []
  );

  /** Force a full refetch (e.g., after returning to the page). */
  const refrescar = useCallback(() => {
    const uid = userIdRef.current;
    if (uid) cargar(uid, true);
  }, [cargar]);

  return { pronosticos, cargando, actualizarPronostico, refrescar };
}

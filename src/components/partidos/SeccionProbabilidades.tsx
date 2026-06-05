'use client';

import { usePredictions } from '@/hooks/usePredictions';

interface Props {
  fixtureId?: number;
  nombreLocal: string;
  nombreVisitante: string;
}

export default function SeccionProbabilidades({
  fixtureId,
  nombreLocal,
  nombreVisitante,
}: Props) {
  const { data, loading } = usePredictions(fixtureId);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-800 rounded w-40"></div>

          <div className="space-y-3">
            <div className="h-10 bg-gray-800 rounded"></div>
            <div className="h-10 bg-gray-800 rounded"></div>
            <div className="h-10 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const local = parseInt(data.percent.home);
  const empate = parseInt(data.percent.draw);
  const visitante = parseInt(data.percent.away);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
    <h3 className="text-lg font-bold text-white mb-4">
      Probabilidades
    </h3>
      <div className="space-y-3">
        {/* Victoria local */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">{nombreLocal}</span>

            <span className="font-semibold text-verde-400">
              {local}%
            </span>
          </div>

          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-verde-500 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${local}%` }}
            />
          </div>
        </div>

        {/* Empate */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Empate</span>

            <span className="font-semibold text-gray-400">
              {empate}%
            </span>
          </div>

          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gray-500 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${empate}%` }}
            />
          </div>
        </div>

        {/* Victoria visitante */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">
              {nombreVisitante}
            </span>

            <span className="font-semibold text-orange-400">
              {visitante}%
            </span>
          </div>

          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-orange-500 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${visitante}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between text-xs">
  <p className="text-gray-400">
    {data.advice}
  </p>

  {data.fallback && (
    <span className="text-yellow-400">
      Simulado
    </span>
  )}
</div>
      </div>
    </div>
  );
}
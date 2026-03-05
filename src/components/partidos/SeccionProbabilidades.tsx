import { ProbabilidadPartido } from '@/data/probabilidades';

interface Props {
  probabilidades: ProbabilidadPartido;
  nombreLocal: string;
  nombreVisitante: string;
}

export default function SeccionProbabilidades({ probabilidades, nombreLocal, nombreVisitante }: Props) {
  const { local, empate, visitante } = probabilidades;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
      <h3 className="text-lg font-bold text-white mb-4">Probabilidades</h3>
      <p className="text-xs text-gray-500 mb-4">Basadas en ranking FIFA 2025</p>

      <div className="space-y-3">
        {/* Victoria local */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">{nombreLocal}</span>
            <span className="font-semibold text-verde-400">{local}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div
              className="bg-verde-500 h-2.5 rounded-full"
              style={{ width: `${local}%` }}
            />
          </div>
        </div>

        {/* Empate */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Empate</span>
            <span className="font-semibold text-gray-400">{empate}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div
              className="bg-gray-500 h-2.5 rounded-full"
              style={{ width: `${empate}%` }}
            />
          </div>
        </div>

        {/* Victoria visitante */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">{nombreVisitante}</span>
            <span className="font-semibold text-orange-400">{visitante}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div
              className="bg-orange-500 h-2.5 rounded-full"
              style={{ width: `${visitante}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

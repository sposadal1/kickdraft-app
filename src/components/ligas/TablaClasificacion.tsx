import { MiembroLiga } from '@/types/liga';
import { Usuario } from '@/types/usuario';
import { Trophy, Medal } from 'lucide-react';

interface FilaClasificacion extends MiembroLiga {
  usuario: Usuario;
}

interface Props {
  clasificacion: FilaClasificacion[];
  usuarioActualId?: string;
}

const ICONOS_POSICION = [
  <Trophy key={1} className="w-4 h-4 text-yellow-400" />,
  <Medal key={2} className="w-4 h-4 text-gray-400" />,
  <Medal key={3} className="w-4 h-4 text-amber-600" />,
];

export default function TablaClasificacion({ clasificacion, usuarioActualId }: Props) {
  const ordenada = [...clasificacion].sort((a, b) => b.totalPuntos - a.totalPuntos);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 text-xs uppercase text-gray-500">
            <th className="text-left py-2 pr-4">#</th>
            <th className="text-left py-2 pr-4">Usuario</th>
            <th className="text-center py-2 px-4 font-bold text-white">Puntos</th>
          </tr>
        </thead>
        <tbody>
          {ordenada.map((fila, idx) => {
            const esActual = fila.usuarioId === usuarioActualId;
            return (
              <tr
                key={fila.usuarioId}
                className={`border-b border-gray-800 ${esActual ? 'bg-verde-900/30' : 'hover:bg-gray-800/50'}`}
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1">
                    {idx < 3 ? ICONOS_POSICION[idx] : <span className="text-gray-500 font-medium">{idx + 1}</span>}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-verde-700 flex items-center justify-center text-white text-xs font-bold">
                      {fila.usuario.nombre.charAt(0)}{fila.usuario.apellido.charAt(0)}
                    </div>
                    <span className={`font-medium ${esActual ? 'text-verde-400' : 'text-white'}`}>
                      {fila.usuario.nombre} {fila.usuario.apellido}
                      {esActual && <span className="ml-1 text-xs text-gray-500">(tú)</span>}
                    </span>
                  </div>
                </td>
                <td className="text-center py-3 px-4 font-bold text-verde-400">{fila.totalPuntos}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

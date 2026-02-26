import { FilaTablaGrupo } from '@/lib/grupos';
import Image from 'next/image';

interface Props {
  grupoId: string;
  tabla: FilaTablaGrupo[];
}

export default function TablaGrupo({ grupoId, tabla }: Props) {
  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-bold text-white mb-2">Grupo {grupoId}</h3>
      <table className="w-full text-sm text-gray-300">
        <thead>
          <tr className="border-b border-gray-700 text-xs uppercase text-gray-500">
            <th className="text-left py-2 pr-4">#</th>
            <th className="text-left py-2 pr-4">Equipo</th>
            <th className="text-center py-2 px-2">J</th>
            <th className="text-center py-2 px-2">G</th>
            <th className="text-center py-2 px-2">E</th>
            <th className="text-center py-2 px-2">P</th>
            <th className="text-center py-2 px-2">GF</th>
            <th className="text-center py-2 px-2">GC</th>
            <th className="text-center py-2 px-2">+/-</th>
            <th className="text-center py-2 px-2 font-bold text-white">PTS</th>
          </tr>
        </thead>
        <tbody>
          {tabla.map((fila, idx) => (
            <tr key={fila.equipo.id} className="border-b border-gray-800 hover:bg-gray-800/50">
              <td className="py-2 pr-4 text-gray-500">{idx + 1}</td>
              <td className="py-2 pr-4">
                <div className="flex items-center gap-2">
                  {fila.equipo.banderaUrl && (
                    <Image
                      src={fila.equipo.banderaUrl}
                      alt={fila.equipo.nombre}
                      width={20}
                      height={14}
                      className="rounded"
                    />
                  )}
                  <span className="font-medium text-white">{fila.equipo.nombreCorto}</span>
                  <span className="text-gray-500 hidden sm:inline">{fila.equipo.nombre}</span>
                </div>
              </td>
              <td className="text-center py-2 px-2">{fila.jugados}</td>
              <td className="text-center py-2 px-2">{fila.ganados}</td>
              <td className="text-center py-2 px-2">{fila.empatados}</td>
              <td className="text-center py-2 px-2">{fila.perdidos}</td>
              <td className="text-center py-2 px-2">{fila.golesFavor}</td>
              <td className="text-center py-2 px-2">{fila.golesContra}</td>
              <td className="text-center py-2 px-2">{fila.diferencia > 0 ? `+${fila.diferencia}` : fila.diferencia}</td>
              <td className="text-center py-2 px-2 font-bold text-verde-400">{fila.puntos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

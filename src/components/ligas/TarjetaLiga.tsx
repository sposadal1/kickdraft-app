import { Liga, MiembroLiga } from '@/types/liga';
import Link from 'next/link';
import { Users, Trophy } from 'lucide-react';

interface Props {
  liga: Liga;
  miembros: MiembroLiga[];
  posicionUsuario?: number;
  puntosUsuario?: number;
}

export default function TarjetaLiga({ liga, miembros, posicionUsuario, puntosUsuario }: Props) {
  return (
    <Link href={`/ligas/${liga.id}`} className="block">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-verde-600 transition-colors">
        <div className="flex items-center gap-3">
          {/* Avatar de la liga */}
          <div className="w-12 h-12 rounded-full bg-verde-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {liga.avatarUrl ? (
              <img src={liga.avatarUrl} alt={liga.nombre} className="w-full h-full rounded-full object-cover" />
            ) : (
              liga.nombre.charAt(0).toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold truncate">{liga.nombre}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {miembros.length} {miembros.length === 1 ? 'miembro' : 'miembros'}
              </span>
              {posicionUsuario !== undefined && (
                <span className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  Posición #{posicionUsuario}
                </span>
              )}
            </div>
          </div>

          {/* Puntos */}
          {puntosUsuario !== undefined && (
            <div className="text-right">
              <span className="text-2xl font-bold text-verde-400">{puntosUsuario}</span>
              <p className="text-xs text-gray-500">pts</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

import { Share2, Users } from 'lucide-react';

interface Props {
  params: Promise<{ ligaId: string }>;
}

export default async function DetalleLigaPage({ params }: Props) {
  const { ligaId } = await params;
  // En producción se obtendría de Supabase
  // Por ahora mostramos una página de placeholder
  const liga = {
    id: ligaId,
    nombre: 'Mi Liga',
    codigoInvitacion: 'ABC12345',
    totalMiembros: 0,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-verde-700 flex items-center justify-center text-white font-black text-2xl">
          {liga.nombre.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{liga.nombre}</h1>
          <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
            <Users className="w-4 h-4" />
            {liga.totalMiembros} miembros
          </div>
        </div>
        <button className="ml-auto flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg border border-gray-700 transition-colors">
          <Share2 className="w-4 h-4" />
          Compartir
        </button>
      </div>

      {/* Código de invitación */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8">
        <p className="text-xs text-gray-500 mb-1">Código de invitación</p>
        <p className="text-2xl font-black text-verde-400 tracking-widest">{liga.codigoInvitacion}</p>
      </div>

      {/* Clasificación */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Clasificación</h2>
        <div className="text-center py-8 text-gray-500">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No hay miembros aún</p>
          <p className="text-sm mt-1">Comparte el código para invitar a tus amigos.</p>
        </div>
      </div>
    </div>
  );
}

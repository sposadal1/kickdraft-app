import { notFound } from 'next/navigation';
import { PARTIDOS } from '@/data/partidos';
import { EQUIPOS } from '@/data/equipos';
import { calcularTablaGrupo } from '@/lib/grupos';
import { formatearFecha, formatearHora } from '@/lib/utils';
import TablaGrupo from '@/components/partidos/TablaGrupo';
import { MapPin, Clock } from 'lucide-react';
import Image from 'next/image';

interface Props {
  params: Promise<{ partidoId: string }>;
}

export default async function DetallePartidoPage({ params }: Props) {
  const { partidoId } = await params;
  const partido = PARTIDOS.find((p) => p.id === parseInt(partidoId));

  if (!partido) notFound();

  const equipoLocal = EQUIPOS.find((e) => e.id === partido.equipoLocalId)!;
  const equipoVisitante = EQUIPOS.find((e) => e.id === partido.equipoVisitanteId)!;

  const tablaGrupo = partido.grupoId
    ? calcularTablaGrupo(partido.grupoId, PARTIDOS, EQUIPOS)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Badge grupo/fase */}
      <div className="mb-6">
        <span className="bg-verde-900/50 border border-verde-700 text-verde-400 text-sm font-semibold px-3 py-1 rounded-full">
          {partido.grupoId ? `Grupo ${partido.grupoId}` : partido.fase}
        </span>
      </div>

      {/* Equipos y marcador */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between gap-8">
          {/* Local */}
          <div className="flex flex-col items-center gap-3 flex-1">
            {equipoLocal.banderaUrl && (
              <Image src={equipoLocal.banderaUrl} alt={equipoLocal.nombre} width={80} height={56} className="rounded-lg shadow-lg" />
            )}
            <h2 className="text-xl font-bold text-white text-center">{equipoLocal.nombre}</h2>
          </div>

          {/* Marcador */}
          <div className="text-center">
            {partido.estado === 'finalizado' ? (
              <div className="text-5xl font-black text-white">
                {partido.golesLocal} - {partido.golesVisitante}
              </div>
            ) : (
              <div className="text-3xl font-bold text-gray-500">VS</div>
            )}
            <div className={`mt-2 text-xs font-semibold px-3 py-1 rounded-full ${
              partido.estado === 'en_vivo'
                ? 'bg-red-600 text-white'
                : partido.estado === 'finalizado'
                ? 'bg-verde-800 text-verde-200'
                : 'bg-gray-700 text-gray-300'
            }`}>
              {partido.estado === 'programado' ? 'Programado' : partido.estado === 'en_vivo' ? '● En Vivo' : 'Finalizado'}
            </div>
          </div>

          {/* Visitante */}
          <div className="flex flex-col items-center gap-3 flex-1">
            {equipoVisitante.banderaUrl && (
              <Image src={equipoVisitante.banderaUrl} alt={equipoVisitante.nombre} width={80} height={56} className="rounded-lg shadow-lg" />
            )}
            <h2 className="text-xl font-bold text-white text-center">{equipoVisitante.nombre}</h2>
          </div>
        </div>

        {/* Info partido */}
        <div className="mt-6 pt-6 border-t border-gray-800 flex flex-wrap gap-4 justify-center text-sm text-gray-400">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-verde-400" />
            {formatearFecha(partido.fechaHoraUTC)} · {formatearHora(partido.fechaHoraUTC)} hora Colombia
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-verde-400" />
            {partido.estadio}, {partido.ciudad}, {partido.pais}
          </span>
        </div>
      </div>

      {/* Tabla del grupo */}
      {tablaGrupo && partido.grupoId && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <TablaGrupo grupoId={partido.grupoId} tabla={tablaGrupo} />
        </div>
      )}

      {/* Alineaciones */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-3">Alineaciones</h3>
        <p className="text-gray-500 text-sm">Disponible próximamente</p>
      </div>

      {/* Historial */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">Historial entre selecciones</h3>
        <p className="text-gray-500 text-sm">Disponible próximamente</p>
      </div>
    </div>
  );
}

import { Suspense } from 'react';
import PartidosCliente from './PartidosCliente';

export default function PartidosPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-gray-500">Cargando partidos...</div>}>
      <PartidosCliente />
    </Suspense>
  );
}

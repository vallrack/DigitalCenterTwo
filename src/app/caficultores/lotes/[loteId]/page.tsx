
// src/app/caficultores/lotes/[loteId]/page.tsx

'use client';

import { useParams } from 'next/navigation';

import ActividadesCultivoClient from './actividades-cultivo-client';
import ProduccionClient from './produccion-client';
import AnalisisClient from './analisis-client';

export default function LoteDetallePage() {
  const params = useParams();
  const loteId = params.loteId;

  // En un futuro, aquí buscaríamos la información del lote usando el loteId.
  // Por ahora, usaremos datos de ejemplo.
  const lote = {
    id: loteId,
    nombre: 'El Mirador',
    area: 500,
    variedad: 'Castillo',
    fechaSiembra: '2022-05-10',
    gps: '4.5,-74.2'
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Detalles del Lote: {lote.nombre}</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>Área:</strong> {lote.area} m²</p>
          <p><strong>Variedad:</strong> {lote.variedad}</p>
        </div>
        <div>
          <p><strong>Fecha de Siembra:</strong> {lote.fechaSiembra}</p>
          <p><strong>GPS:</strong> {lote.gps}</p>
        </div>
      </div>

      <ActividadesCultivoClient />
      <ProduccionClient />
      <AnalisisClient />
    </div>
  );
}

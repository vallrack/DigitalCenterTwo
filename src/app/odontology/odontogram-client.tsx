
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { OdontogramState } from '@/lib/types';

// Importa dinámicamente el nuevo componente de odontograma 3D sin renderizado del lado del servidor (SSR).
const Odontograma3D = dynamic(() => import('./odontogram-3d'), {
  ssr: false,
  loading: () => <p className="text-center p-4">Cargando Odontograma 3D...</p>,
});

/**
 * Este componente de cliente ahora envuelve el odontograma 3D más avanzado.
 * Se agrega un contenedor principal con posicionamiento relativo para contener los elementos de la interfaz de usuario
 * posicionados de forma absoluta del componente Odontograma3D.
 */
export function OdontogramClient() {
  const [odontogramState, setOdontogramState] = useState<OdontogramState>({});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Odontograma Interactivo</CardTitle>
      </CardHeader>
      <CardContent>
        {/* El contenedor para la escena 3D necesita una altura específica y posicionamiento relativo. */}
        <div style={{ height: '70vh', width: '100%', position: 'relative', overflow: 'hidden' }}>
          <Odontograma3D
            initialState={odontogramState}
            onStateChange={setOdontogramState}
          />
        </div>
      </CardContent>
    </Card>
  );
}

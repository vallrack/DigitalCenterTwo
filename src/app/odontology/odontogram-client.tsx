
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { OdontogramState } from '@/lib/types';

// Dynamically import the new 3D odontogram component with SSR turned off.
const Odontograma3D = dynamic(() => import('./odontogram-3d'), {
  ssr: false,
  loading: () => <p className="text-center p-4">Cargando Odontograma 3D...</p>,
});

/**
 * This client component now wraps the more advanced 3D odontogram.
 * A parent container with relative positioning is added to contain the absolutely positioned UI elements
 * of the Odontograma3D component.
 */
export function OdontogramClient() {
  const [odontogramState, setOdontogramState] = useState<OdontogramState>({});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Odontograma Interactivo</CardTitle>
      </CardHeader>
      <CardContent>
        {/* The container for the 3D scene needs a specific height and relative positioning. */}
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

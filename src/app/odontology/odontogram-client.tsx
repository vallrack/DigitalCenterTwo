
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

// Dynamically import the new 3D odontogram component with SSR turned off.
// The 'default' export is now being used.
const Odontograma3D = dynamic(() => import('./odontogram-3d'), {
  ssr: false,
  loading: () => <p className="text-center p-4">Cargando Odontograma 3D...</p>,
});

/**
 * This client component now wraps the more advanced 3D odontogram.
 */
export function OdontogramClient() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Odontograma Interactivo</CardTitle>
      </CardHeader>
      <CardContent>
        {/* The container for the 3D scene needs a specific height. */}
        <div style={{ height: '70vh', width: '100%' }}>
          <Odontograma3D />
        </div>
      </CardContent>
    </Card>
  );
}

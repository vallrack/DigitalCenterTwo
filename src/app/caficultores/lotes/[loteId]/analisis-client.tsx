
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

export default function AnalisisClient() {
  const params = useParams();
  const loteId = params.loteId as string;

  const [produccion, setProduccion] = useState([]);

  useEffect(() => {
    if (!loteId) return;
    const produccionCollectionRef = collection(db, 'lotes', loteId, 'produccion');
    const unsubscribe = onSnapshot(produccionCollectionRef, (snapshot) => {
      const produccionData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProduccion(produccionData);
    });
    return () => unsubscribe();
  }, [loteId]);

  const analisis = useMemo(() => {
    if (produccion.length === 0) {
      return { total: 0, promedio: 0 };
    }
    const total = produccion.reduce((acc, item) => acc + item.cantidad, 0);
    const promedio = total / produccion.length;
    return { total, promedio };
  }, [produccion]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Análisis de Datos y Reportes</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Resumen de Producción</h3>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Total Producción (kg)</TableHead>
                <TableHead>Producción Promedio por Cosecha (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{analisis.total.toFixed(2)}</TableCell>
                <TableCell>{analisis.promedio.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Historial de Producción</h3>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cantidad (kg)</TableHead>
                <TableHead>Calidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produccion.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.fecha}</TableCell>
                  <TableCell>{item.cantidad}</TableCell>
                  <TableCell>{item.calidad}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// /src/app/sales/sales-history-client.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Sale } from '@/lib/types';
import { getSales } from '@/services/sales-service';
import { generateSaleReceipt } from './sale-receipt';

export function SalesHistoryClient() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const salesData = await getSales();
      setSales(salesData);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cargar el historial de ventas.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrintReceipt = (sale: Sale) => {
    if (!userProfile) return;
    // For the organization name, we should ideally use the one from the user's profile context if available
    const orgName = userProfile.organizationId || "DigitalCenter";
    generateSaleReceipt(sale, orgName);
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    if (timestamp instanceof Timestamp) {
        return format(timestamp.toDate(), 'dd/MM/yyyy HH:mm');
    }
    // Fallback for string or other date types, though Firestore Timestamp is expected
    return format(new Date(timestamp), 'dd/MM/yyyy HH:mm');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Ventas</CardTitle>
        <CardDescription>
          Aquí se muestran todas las transacciones de venta registradas en el sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Almacén</TableHead>
              <TableHead>Método de Pago</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Cargando historial...
                </TableCell>
              </TableRow>
            ) : sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No hay ventas registradas.
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">
                    {formatDate(sale.createdAt)}
                  </TableCell>
                  <TableCell>{sale.warehouseName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{sale.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">${sale.total.toFixed(2)}</TableCell>
                   <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handlePrintReceipt(sale)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Ver Recibo
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

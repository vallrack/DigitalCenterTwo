// /src/app/reports/sales-report-client.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { DollarSign, Hash, BarChart } from 'lucide-react';

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
import { useToast } from '@/hooks/use-toast';
import type { Sale } from '@/lib/types';
import { getSales } from '@/services/sales-service';

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
);

export function SalesReportClient() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
  
  const salesStats = useMemo(() => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const numberOfSales = sales.length;
    const averageSale = numberOfSales > 0 ? totalRevenue / numberOfSales : 0;
    return {
        totalRevenue,
        numberOfSales,
        averageSale,
    };
  }, [sales]);

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Resumen de Ventas</CardTitle>
                <CardDescription>Métricas clave del rendimiento de ventas.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard title="Ingresos Totales" value={`$${salesStats.totalRevenue.toFixed(2)}`} icon={DollarSign} />
                    <StatCard title="Número de Ventas" value={salesStats.numberOfSales} icon={Hash} />
                    <StatCard title="Venta Promedio" value={`$${salesStats.averageSale.toFixed(2)}`} icon={BarChart} />
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Detalle de Ventas</CardTitle>
                <CardDescription>Lista completa de todas las transacciones de venta.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Almacén</TableHead>
                            <TableHead>Método de Pago</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            <TableHead className="text-right">Impuestos</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {loading ? (
                            <TableRow><TableCell colSpan={6} className="text-center h-24">Cargando datos...</TableCell></TableRow>
                        ) : sales.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center h-24">No hay ventas registradas.</TableCell></TableRow>
                        ) : (
                            sales.map(sale => (
                                <TableRow key={sale.id}>
                                    <TableCell>{sale.createdAt ? format(new Date(sale.createdAt.seconds * 1000), 'dd/MM/yyyy HH:mm') : sale.date}</TableCell>
                                    <TableCell>{sale.warehouseName}</TableCell>
                                    <TableCell><Badge variant="outline">{sale.paymentMethod}</Badge></TableCell>
                                    <TableCell className="text-right">${sale.subtotal.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${sale.tax.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-bold">${sale.total.toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}

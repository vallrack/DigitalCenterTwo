// /src/app/reports/profitability-client.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { Sale, SaleItem } from '@/lib/types';
import { getSales } from '@/services/sales-service';

interface ProductProfit {
    productId: string;
    productName: string;
    unitsSold: number;
    totalRevenue: number;
    totalCost: number;
    totalMargin: number;
}

export function ProfitabilityClient() {
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

  const salesWithProfit = useMemo(() => {
    return sales.map(sale => {
      const totalCost = sale.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
      const totalMargin = sale.subtotal - totalCost;
      return { ...sale, totalCost, totalMargin };
    });
  }, [sales]);

  const productProfitability = useMemo(() => {
    const productMap = new Map<string, ProductProfit>();
    sales.forEach(sale => {
        sale.items.forEach(item => {
            const existing = productMap.get(item.productId);
            const itemRevenue = item.price * item.quantity;
            const itemCost = item.costPrice * item.quantity;

            if (existing) {
                existing.unitsSold += item.quantity;
                existing.totalRevenue += itemRevenue;
                existing.totalCost += itemCost;
                existing.totalMargin += itemRevenue - itemCost;
            } else {
                productMap.set(item.productId, {
                    productId: item.productId,
                    productName: item.productName,
                    unitsSold: item.quantity,
                    totalRevenue: itemRevenue,
                    totalCost: itemCost,
                    totalMargin: itemRevenue - itemCost,
                });
            }
        });
    });
    return Array.from(productMap.values()).sort((a, b) => b.totalMargin - a.totalMargin);
  }, [sales]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporte de Rentabilidad</CardTitle>
        <CardDescription>
          Analice la rentabilidad por producto y por cada venta individual.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="byProduct">
            <TabsList>
                <TabsTrigger value="byProduct">Rentabilidad por Producto</TabsTrigger>
                <TabsTrigger value="bySale">Rentabilidad por Venta</TabsTrigger>
            </TabsList>
            <TabsContent value="byProduct">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Unidades Vendidas</TableHead>
                            <TableHead className="text-right">Ingresos Totales</TableHead>
                            <TableHead className="text-right">Costo Total</TableHead>
                            <TableHead className="text-right">Margen de Ganancia</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center h-24">Calculando rentabilidad...</TableCell></TableRow>
                        ) : productProfitability.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center h-24">No hay datos de ventas para analizar.</TableCell></TableRow>
                        ) : (
                            productProfitability.map(p => (
                                <TableRow key={p.productId}>
                                    <TableCell className="font-medium">{p.productName}</TableCell>
                                    <TableCell className="text-right">{p.unitsSold}</TableCell>
                                    <TableCell className="text-right">${p.totalRevenue.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${p.totalCost.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-bold">${p.totalMargin.toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TabsContent>
            <TabsContent value="bySale">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Ingreso (Venta)</TableHead>
                            <TableHead className="text-right">Costo de Mercancía</TableHead>
                            <TableHead className="text-right">Margen de Ganancia</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="text-center h-24">Cargando ventas...</TableCell></TableRow>
                        ) : salesWithProfit.length === 0 ? (
                             <TableRow><TableCell colSpan={4} className="text-center h-24">No hay ventas para mostrar.</TableCell></TableRow>
                        ) : (
                            salesWithProfit.map(sale => (
                                <TableRow key={sale.id}>
                                    <TableCell>{sale.date}</TableCell>
                                    <TableCell className="text-right">${sale.subtotal.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${sale.totalCost.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-bold">${sale.totalMargin.toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

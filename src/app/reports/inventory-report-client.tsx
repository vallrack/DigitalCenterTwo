// /src/app/reports/inventory-report-client.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Archive, DollarSign } from 'lucide-react';

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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { getProducts } from '@/services/inventory-service';

export function InventoryReportClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cargar el inventario.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const valuedInventory = useMemo(() => {
    return products.map(product => {
      const totalStock = Object.values(product.stockLevels || {}).reduce((sum, qty) => sum + qty, 0);
      const totalValue = totalStock * product.costPrice;
      return {
        ...product,
        totalStock,
        totalValue,
      };
    }).sort((a,b) => b.totalValue - a.totalValue);
  }, [products]);

  const totalInventoryValue = useMemo(() => {
    return valuedInventory.reduce((sum, product) => sum + product.totalValue, 0);
  }, [valuedInventory]);

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Valor Total del Inventario</CardTitle>
                    <CardDescription>Suma del costo de todas las existencias de productos.</CardDescription>
                </div>
                <DollarSign className="h-6 w-6 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">${totalInventoryValue.toFixed(2)}</p>
            </CardContent>
        </Card>
        <Card>
        <CardHeader>
            <CardTitle>Reporte de Inventario Valorado</CardTitle>
            <CardDescription>
            Desglose del valor del inventario por cada producto basado en el costo.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Producto (SKU)</TableHead>
                <TableHead className="text-right">Stock Total</TableHead>
                <TableHead className="text-right">Costo Unitario</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Cargando inventario...</TableCell></TableRow>
                ) : valuedInventory.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">No hay productos en el inventario.</TableCell></TableRow>
                ) : (
                valuedInventory.map((product) => (
                    <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name} <span className="text-muted-foreground">({product.sku})</span></TableCell>
                    <TableCell className="text-right">{product.totalStock}</TableCell>
                    <TableCell className="text-right">${product.costPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">${product.totalValue.toFixed(2)}</TableCell>
                    </TableRow>
                ))
                )}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold text-lg">Valor Total General</TableCell>
                    <TableCell className="text-right font-bold text-lg">${totalInventoryValue.toFixed(2)}</TableCell>
                </TableRow>
            </TableFooter>
            </Table>
        </CardContent>
        </Card>
    </div>
  );
}

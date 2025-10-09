// /src/app/sales/pos-client.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { PlusCircle, X, MinusCircle, ShoppingCart, DollarSign, CreditCard, Landmark, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Product, Warehouse, SaleItem, Sale, SystemSettings } from '@/lib/types';
import { getProducts } from '@/services/inventory-service';
import { getWarehouses } from '@/services/inventory-service';
import { addSale } from '@/services/sales-service';
import { getSystemSettings } from '@/services/settings-service';
import { generateSaleReceipt } from './sale-receipt';

export function PosClient() {
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Transfer'>('Cash');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);


  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, warehousesData, settingsData] = await Promise.all([
        getProducts(),
        getWarehouses(),
        getSystemSettings(),
      ]);
      setProducts(productsData);
      setWarehouses(warehousesData);
      setSettings(settingsData);
      if (warehousesData.length > 0) {
        setSelectedWarehouseId(warehousesData[0].id);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar los datos iniciales.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = useMemo(() => {
    if (!selectedWarehouseId) return [];
    return products
      .filter(p => (p.stockLevels?.[selectedWarehouseId] ?? 0) > 0)
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm, selectedWarehouseId]);

  const addToCart = (product: Product) => {
    if (!selectedWarehouseId) return;
    const existingItem = cart.find(item => item.productId === product.id);
    const stock = product.stockLevels?.[selectedWarehouseId] ?? 0;

    if (existingItem) {
      if (existingItem.quantity < stock) {
        setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
        toast({ title: 'Stock insuficiente', description: 'No hay más unidades disponibles.', variant: 'destructive'});
      }
    } else {
       setCart([...cart, { productId: product.id, productName: product.name, quantity: 1, price: product.salePrice, costPrice: product.costPrice }]);
    }
  };
  
  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product || !selectedWarehouseId) return;
    const stock = product.stockLevels?.[selectedWarehouseId] ?? 0;

    if (newQuantity <= 0) {
        setCart(cart.filter(item => item.productId !== productId));
    } else if (newQuantity <= stock) {
        setCart(cart.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item));
    } else {
        toast({ title: 'Stock insuficiente', description: `Solo hay ${stock} unidades disponibles.`, variant: 'destructive' });
    }
  };

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const taxRate = (settings?.taxRate || 0) / 100;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart, settings]);

  const handleFinalizeSale = async () => {
    if (cart.length === 0 || !selectedWarehouseId || !userProfile) {
        toast({ title: 'Venta vacía', description: 'Agregue productos al carrito para continuar.', variant: 'destructive'});
        return;
    }
    setIsSubmitting(true);
    const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);
    
    const saleData: Omit<Sale, 'id'> = {
        date: new Date().toISOString().split('T')[0],
        items: cart,
        subtotal: cartTotals.subtotal,
        tax: cartTotals.tax,
        total: cartTotals.total,
        paymentMethod,
        warehouseId: selectedWarehouseId,
        warehouseName: selectedWarehouse?.name || 'Desconocido',
        organizationId: userProfile.organizationId || 'default',
        createdAt: new Date(), // Use JS date for receipt
    };

    try {
        const saleId = await addSale(saleData);
        toast({ title: 'Venta Exitosa', description: 'La venta se ha registrado correctamente.'});
        
        setIsPrinting(true);
        // Generate and show receipt
        generateSaleReceipt({ ...saleData, id: saleId }, userProfile.name);
        setIsPrinting(false);

        setCart([]);
    } catch (error) {
        toast({ title: 'Error en la Venta', description: 'No se pudo registrar la venta.', variant: 'destructive'});
    } finally {
        setIsSubmitting(false);
        // Refetch products to get updated stock levels
        const productsData = await getProducts();
        setProducts(productsData);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Left side: Product Selection */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Productos Disponibles</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Input 
                placeholder="Buscar producto por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
            />
            <div className="flex items-center gap-2">
                <Label htmlFor="warehouse">Almacén:</Label>
                <Select 
                    value={selectedWarehouseId || ''} 
                    onValueChange={setSelectedWarehouseId} 
                    disabled={warehouses.length === 0}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                        {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {loading ? Array.from({ length: 8 }).map((_, i) => <Card key={i} className="h-48 animate-pulse bg-muted" />)
               : filteredProducts.length === 0 ? <p className="col-span-full text-center text-muted-foreground">No se encontraron productos.</p>
               : filteredProducts.map(product => (
                <Card key={product.id} className="flex flex-col overflow-hidden">
                    <div className="relative w-full h-24 bg-muted">
                        <Image
                            src={product.imageUrl || 'https://picsum.photos/seed/product/200/200'}
                            alt={product.name}
                            layout="fill"
                            objectFit="cover"
                            data-ai-hint="product image"
                        />
                    </div>
                  <div className="p-2 flex-1 flex flex-col">
                    <p className="font-semibold text-sm flex-1">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Stock: {product.stockLevels?.[selectedWarehouseId!] ?? 0}</p>
                    <p className="text-lg font-bold mt-1">${(product.salePrice || 0).toFixed(2)}</p>
                  </div>
                  <div className="p-2 pt-0 border-t mt-2">
                    <Button size="sm" className="w-full mt-2" onClick={() => addToCart(product)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Agregar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right side: Cart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShoppingCart /> Carrito de Venta</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-4rem)]">
          <ScrollArea className="flex-1 -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-center">Cant.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center h-24">El carrito está vacío</TableCell></TableRow>
                ) : cart.map(item => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium text-sm w-1/2">{item.productName}</TableCell>
                    <TableCell className="text-center w-1/4">
                       <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.productId, item.quantity - 1)}><MinusCircle className="h-4 w-4" /></Button>
                          <span>{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.productId, item.quantity + 1)}><PlusCircle className="h-4 w-4" /></Button>
                       </div>
                    </TableCell>
                    <TableCell className="text-right w-1/4">${((item.price || 0) * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="mt-auto pt-4 space-y-4">
            <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal:</span><span>${cartTotals.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Impuestos ({settings?.taxRate || 0}%):</span><span>${cartTotals.tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total:</span><span>${cartTotals.total.toFixed(2)}</span></div>
            </div>
            <div className="space-y-2">
                <Label>Método de Pago</Label>
                 <div className="flex gap-2">
                     <Button variant={paymentMethod === 'Cash' ? 'default' : 'outline'} className="flex-1" onClick={() => setPaymentMethod('Cash')}><DollarSign/>Efectivo</Button>
                     <Button variant={paymentMethod === 'Card' ? 'default' : 'outline'} className="flex-1" onClick={() => setPaymentMethod('Card')}><CreditCard/>Tarjeta</Button>
                     <Button variant={paymentMethod === 'Transfer' ? 'default' : 'outline'} className="flex-1" onClick={() => setPaymentMethod('Transfer')}><Landmark/>Transf.</Button>
                 </div>
            </div>
            <Button size="lg" className="w-full" onClick={handleFinalizeSale} disabled={isSubmitting || cart.length === 0}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Procesando...' : isPrinting ? 'Generando Recibo...' : 'Finalizar Venta'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

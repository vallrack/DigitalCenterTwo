// /src/app/inventory/inventory-client.tsx
"use client";

import { useEffect, useState, useCallback, memo, useMemo } from 'react';
import Image from 'next/image';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Product, Warehouse, ProductCategory } from '@/lib/types';
import { getProducts, deleteProduct, getWarehouses } from '@/services/inventory-service';
import { getProductCategories } from '@/services/product-category-service';
import { ProductForm } from './product-form';

export const InventoryClient = memo(() => {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();
  const { userProfile } = useAuth();


  const fetchData = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const [productsData, warehousesData, categoriesData] = await Promise.all([
        getProducts(),
        getWarehouses(),
        getProductCategories(userProfile),
      ]);
      setProducts(productsData);
      setWarehouses(warehousesData);
      setCategories(categoriesData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos de inventario.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, userProfile]);

  useEffect(() => {
    if (userProfile) {
      fetchData();
    }
  }, [userProfile, fetchData]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return products;
    }
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleEdit = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete);
      toast({ title: 'Éxito', description: 'Producto eliminado.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el producto.', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  }, [productToDelete, toast, fetchData]);

  const openDeleteDialog = useCallback((productId: string) => {
    setProductToDelete(productId);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    fetchData();
  }, [fetchData]);

  const getTotalStock = (stockLevels: { [key: string]: number } | undefined) => {
    if (!stockLevels) return 0;
    return Object.values(stockLevels).reduce((sum, qty) => sum + qty, 0);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <CardTitle>Productos y Servicios</CardTitle>
            <CardDescription>
              Gestione el catálogo de productos y servicios de su organización.
            </CardDescription>
          </div>
           <div className="flex flex-col sm:flex-row gap-2">
             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filtrar por categoría..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las Categorías</SelectItem>
                    {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Producto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Nombre / SKU</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Stock Total</TableHead>
                <TableHead className="text-right">Precio de Venta</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Cargando...</TableCell></TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">No se encontraron productos.</TableCell></TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image
                        alt="Imagen del producto"
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.imageUrl || 'https://picsum.photos/seed/product/64/64'}
                        width="64"
                        data-ai-hint="product image"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                        {product.name}
                        <div className="text-muted-foreground text-xs">SKU: {product.sku}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                    <TableCell className="text-right">{getTotalStock(product.stockLevels)}</TableCell>
                    <TableCell className="text-right">${product.salePrice.toLocaleString('es-CO')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(product)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(product.id)} className="text-red-600">Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>
          </DialogHeader>
          <ProductForm 
            product={selectedProduct} 
            warehouses={warehouses}
            onSuccess={handleFormSuccess} 
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará permanentemente el producto. No se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
InventoryClient.displayName = 'InventoryClient';

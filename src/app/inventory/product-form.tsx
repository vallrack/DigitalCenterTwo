// /src/app/inventory/product-form.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Product, Warehouse, ProductCategory } from '@/lib/types';
import { addProduct, updateProduct } from '@/services/inventory-service';
import { getProductCategories } from '@/services/product-category-service';
import { useAuth } from '@/hooks/use-auth';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido.'),
  sku: z.string().min(2, 'El SKU es requerido.'),
  description: z.string().optional(),
  costPrice: z.coerce.number().min(0, 'El costo no puede ser negativo.'),
  salePrice: z.coerce.number().min(0, 'El precio no puede ser negativo.'),
  category: z.string().min(1, 'La categoría es requerida.'),
  stockLevels: z.record(z.coerce.number().min(0).default(0)),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product | null;
  warehouses: Warehouse[];
  onSuccess: () => void;
}

export function ProductForm({ product, warehouses, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const defaultStockLevels = warehouses.reduce((acc, wh) => {
    acc[wh.id] = product?.stockLevels?.[wh.id] || 0;
    return acc;
  }, {} as Record<string, number>);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      sku: product?.sku || '',
      description: product?.description || '',
      costPrice: product?.costPrice || 0,
      salePrice: product?.salePrice || 0,
      category: product?.category || '',
      stockLevels: defaultStockLevels,
      imageUrl: product?.imageUrl || '',
    },
  });

  const fetchCategories = useCallback(async () => {
    if (!userProfile) return;
    try {
      const cats = await getProductCategories(userProfile);
      setCategories(cats);
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las categorías.' });
    }
  }, [userProfile, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue('imageUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };


  const onSubmit = async (data: ProductFormValues) => {
    if (!userProfile) return;
    try {
      const productData = {
        ...data,
        organizationId: userProfile.organizationId || 'default',
      };

      if (product) {
        await updateProduct(product.id, productData);
        toast({ title: 'Éxito', description: 'Producto actualizado.' });
      } else {
        await addProduct(productData);
        toast({ title: 'Éxito', description: 'Producto creado.' });
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el producto.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col items-center">
             <Image
                src={imagePreview || 'https://picsum.photos/seed/product-placeholder/200/200'}
                alt="Vista previa del producto"
                width={200}
                height={200}
                className="rounded-lg aspect-square object-cover border"
                data-ai-hint="product image"
              />
              <Input 
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
              />
              <Button 
                type="button"
                variant="outline" 
                className="mt-4 w-full" 
                onClick={() => fileInputRef.current?.click()}
              >
                Cambiar Imagen
              </Button>
          </div>
          <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nombre del Producto</FormLabel><FormControl><Input placeholder="Ej: Laptop Gamer" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem><FormLabel>SKU / Código</FormLabel><FormControl><Input placeholder="Ej: LP-GAM-001" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Detalles del producto..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="costPrice" render={({ field }) => (
                    <FormItem><FormLabel>Costo</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="salePrice" render={({ field }) => (
                    <FormItem><FormLabel>Precio de Venta</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione una categoría..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
          </div>
        </div>
        
        <div>
            <FormLabel>Niveles de Stock</FormLabel>
            <div className="space-y-2 mt-2 p-4 border rounded-md">
                {warehouses.length > 0 ? warehouses.map(wh => (
                    <FormField
                        key={wh.id}
                        control={form.control}
                        name={`stockLevels.${wh.id}`}
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                                <Label>{wh.name}</Label>
                                <FormControl>
                                    <Input type="number" className="w-24" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )) : <p className="text-sm text-muted-foreground">No hay almacenes creados. El stock no puede ser gestionado.</p>}
            </div>
        </div>
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Producto'}
        </Button>
      </form>
    </Form>
  );
}

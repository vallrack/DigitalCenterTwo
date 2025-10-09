// /src/app/inventory/categories-client.tsx
"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { ProductCategory } from '@/lib/types';
import { getProductCategories, addProductCategory, deleteProductCategory } from '@/services/product-category-service';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre de la categoría es requerido.'),
});

type FormValues = z.infer<typeof formSchema>;

export const CategoriesClient = memo(() => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });

  const fetchData = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const data = await getProductCategories(userProfile);
      setCategories(data);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar las categorías.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, userProfile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (data: FormValues) => {
    if (!userProfile) return;
    try {
      await addProductCategory(data, userProfile);
      toast({ title: 'Éxito', description: 'Categoría creada.' });
      form.reset();
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo crear la categoría.', variant: 'destructive' });
    }
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!categoryToDelete) return;
    try {
      await deleteProductCategory(categoryToDelete);
      toast({ title: 'Éxito', description: 'Categoría eliminada.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar la categoría.', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  }, [categoryToDelete, toast, fetchData]);

  const openDeleteDialog = useCallback((id: string) => {
    setCategoryToDelete(id);
    setIsDeleteDialogOpen(true);
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Categorías de Productos</CardTitle>
          <CardDescription>
            Organice sus productos en categorías para una mejor gestión.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor="name" className="text-sm font-medium">Nombre de la Categoría</label>
                <Input id="name" placeholder="Ej: Electrónica" {...form.register('name')} />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? 'Creando...' : 'Crear'}
              </Button>
            </form>
          </div>
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={2} className="text-center">Cargando...</TableCell></TableRow>
                ) : categories.length === 0 ? (
                  <TableRow><TableCell colSpan={2} className="text-center">No hay categorías.</TableCell></TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(cat.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará permanentemente la categoría.</AlertDialogDescription>
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

CategoriesClient.displayName = 'CategoriesClient';

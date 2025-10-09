// /src/app/customers/interaction-list.tsx
"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, MoreHorizontal, Phone, Users, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import type { Interaction, Customer, UserProfile } from '@/lib/types';
import { getInteractionsByCustomer, addInteraction, deleteInteraction } from '@/services/interaction-service';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const interactionSchema = z.object({
  type: z.enum(['Llamada', 'Reunión', 'Correo']),
  notes: z.string().min(5, 'Las notas son muy cortas.'),
});

type InteractionFormValues = z.infer<typeof interactionSchema>;

const interactionIcons = {
  'Llamada': Phone,
  'Reunión': Users,
  'Correo': Mail,
};


interface InteractionListProps {
  customer: Customer;
}

const InteractionListComponent = ({ customer }: InteractionListProps) => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [interactionToDelete, setInteractionToDelete] = useState<string | null>(null);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const form = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionSchema),
    defaultValues: { type: 'Llamada', notes: '' },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInteractionsByCustomer(customer.id);
      setInteractions(data);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar las interacciones.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [customer.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (data: InteractionFormValues) => {
    if (!userProfile) return;

    const interactionData: Omit<Interaction, 'id'> = {
        ...data,
        customerId: customer.id,
        userId: userProfile.uid,
        userName: userProfile.name,
        organizationId: customer.organizationId,
        date: new Date().toISOString(),
    };

    try {
        await addInteraction(interactionData);
        toast({ title: 'Éxito', description: 'Interacción registrada.' });
        form.reset();
        fetchData();
    } catch (error) {
        toast({ title: 'Error', description: 'No se pudo guardar la interacción.', variant: 'destructive' });
    }
  };
  
  const openDeleteDialog = (id: string) => {
    setInteractionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!interactionToDelete) return;
    try {
      await deleteInteraction(interactionToDelete);
      toast({ title: 'Éxito', description: 'Interacción eliminada.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar la interacción.', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setInteractionToDelete(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Interacción</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Interacción</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Llamada">Llamada</SelectItem>
                        <SelectItem value="Reunión">Reunión</SelectItem>
                        <SelectItem value="Correo">Correo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl><Textarea placeholder="Resumen de la conversación..." {...field} rows={5} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Registrar
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
         {loading ? <p>Cargando...</p> 
          : interactions.length === 0 ? <p className="text-center text-muted-foreground pt-10">No hay interacciones registradas.</p>
          : (
            <div className="space-y-4">
              {interactions.map(interaction => {
                const Icon = interactionIcons[interaction.type];
                return (
                  <div key={interaction.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="h-full w-px bg-border"></div>
                    </div>
                    <div className="pb-4 w-full">
                      <div className="flex justify-between">
                        <p className="font-semibold">{interaction.type} con {interaction.userName}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(interaction.date), 'dd MMM yyyy, p', { locale: es })}</p>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{interaction.notes}</p>
                      <Button variant="link" size="sm" className="text-red-500 p-0 h-auto mt-1" onClick={() => openDeleteDialog(interaction.id)}>
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
      </div>
      
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará el registro de la interacción de forma permanente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const InteractionList = memo(InteractionListComponent);

// /src/app/customers/opportunity-form.tsx
"use client";

import { memo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
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
import { useToast } from '@/hooks/use-toast';
import type { Opportunity, OpportunityStatus, Customer, UserProfile } from '@/lib/types';
import { addOpportunity, updateOpportunity } from '@/services/opportunity-service';

const opportunityStatuses: OpportunityStatus[] = ['Calificación', 'Propuesta', 'Negociación', 'Ganada', 'Perdida'];

const formSchema = z.object({
  name: z.string().min(5, 'El nombre de la oportunidad es muy corto.'),
  estimatedValue: z.coerce.number().min(0, 'El valor no puede ser negativo.'),
  status: z.enum(['Calificación', 'Propuesta', 'Negociación', 'Ganada', 'Perdida']),
  assignedToId: z.string().min(1, 'Debe asignar un responsable.'),
});

type OpportunityFormValues = z.infer<typeof formSchema>;

interface OpportunityFormProps {
  customer: Customer;
  currentUser: UserProfile;
  salesUsers: UserProfile[];
  opportunity?: Opportunity | null;
  onSuccess: () => void;
}

const OpportunityFormComponent = ({ customer, currentUser, salesUsers, opportunity, onSuccess }: OpportunityFormProps) => {
  const { toast } = useToast();
  const isEditing = !!opportunity;
  
  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: opportunity?.name || '',
      estimatedValue: opportunity?.estimatedValue || 0,
      status: opportunity?.status || 'Calificación',
      assignedToId: opportunity?.assignedToId || currentUser.uid,
    },
  });

  useEffect(() => {
    if (opportunity) {
        form.reset({
            name: opportunity.name,
            estimatedValue: opportunity.estimatedValue,
            status: opportunity.status,
            assignedToId: opportunity.assignedToId,
        });
    }
  }, [opportunity, form]);

  const onSubmit = async (data: OpportunityFormValues) => {
    try {
      const assignedUser = salesUsers.find(u => u.uid === data.assignedToId);
      if (!assignedUser) {
          throw new Error("Usuario asignado no encontrado.");
      }
      
      if (isEditing) {
        await updateOpportunity(opportunity.id, {
          ...data,
          assignedToName: assignedUser.name,
        });
        toast({ title: 'Éxito', description: 'Oportunidad actualizada correctamente.' });
      } else {
        const opportunityData: Omit<Opportunity, 'id'> = {
            ...data,
            customerId: customer.id,
            customerName: customer.name,
            assignedToName: assignedUser.name,
            organizationId: customer.organizationId || currentUser.organizationId || 'default',
        };
        await addOpportunity(opportunityData);
        toast({ title: 'Éxito', description: 'Oportunidad creada correctamente.' });
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving opportunity:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la oportunidad.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nombre de la Oportunidad</FormLabel><FormControl><Input placeholder="Ej: Implementación de Software Académico" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="estimatedValue" render={({ field }) => (
                <FormItem><FormLabel>Valor Estimado (COP)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Estado</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{opportunityStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="assignedToId" render={({ field }) => (
            <FormItem><FormLabel>Responsable (Vendedor)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione un responsable..." /></SelectTrigger></FormControl><SelectContent>{salesUsers.map(user => <SelectItem key={user.uid} value={user.uid}>{user.name}</SelectItem>)}</SelectContent></Select><FormDescription>El responsable de dar seguimiento a esta oportunidad.</FormDescription><FormMessage /></FormItem>
        )}/>
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Oportunidad')}
        </Button>
      </form>
    </Form>
  );
}

export const OpportunityForm = memo(OpportunityFormComponent);

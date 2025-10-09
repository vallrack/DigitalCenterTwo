// /src/app/finance/account-form.tsx
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Account, AccountType } from '@/lib/types';
import { addAccount, updateAccount } from '@/services/accounting-service';
import { pucData } from '@/lib/puc-data';

const accountTypes: AccountType[] = ['Activo', 'Pasivo', 'Patrimonio', 'Ingreso', 'Gasto'];

const formSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido.'),
  code: z.string().min(2, 'El código es requerido.'),
  type: z.enum(['Activo', 'Pasivo', 'Patrimonio', 'Ingreso', 'Gasto']),
  description: z.string().optional(),
  isParent: z.boolean().default(false),
  // Helper fields for the form
  clase: z.string().min(1, "Debe seleccionar una clase."),
  grupo: z.string().min(1, "Debe seleccionar un grupo."),
});

type FormValues = z.infer<typeof formSchema>;

interface AccountFormProps {
  accounts: Account[];
  account?: Account | null;
  onSuccess: () => void;
}

export function AccountForm({ accounts, account, onSuccess }: AccountFormProps) {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: account?.name || '',
      code: account?.code || '',
      type: account?.type || 'Activo',
      description: '', // Not stored in DB currently
      isParent: account?.isParent || false,
      clase: account?.parentCode ? account.parentCode.charAt(0) : '',
      grupo: account?.parentCode || '',
    },
  });
  
  const claseWatcher = useWatch({ control: form.control, name: 'clase' });
  const grupoWatcher = useWatch({ control: form.control, name: 'grupo' });

  const clases = useMemo(() => pucData.sectores.general.clases, []);
  const grupos = useMemo(() => {
    if (!claseWatcher) return [];
    return clases.find(c => c.clase_numero === claseWatcher)?.grupos || [];
  }, [claseWatcher, clases]);

  useEffect(() => {
    if (claseWatcher) {
      const selectedClase = clases.find(c => c.clase_numero === claseWatcher);
      if (selectedClase) {
        form.setValue('type', selectedClase.type);
      }
    }
  }, [claseWatcher, clases, form]);

  useEffect(() => {
    if (grupoWatcher) {
        form.setValue('code', `${grupoWatcher}01`); // Example code generation
    }
  }, [grupoWatcher, form]);
  
  // Reset grupo if clase changes
  useEffect(() => {
    form.setValue('grupo', '');
  }, [claseWatcher, form]);


  const onSubmit = async (data: FormValues) => {
    try {
      const accountData = {
        code: data.code,
        name: data.name,
        type: data.type,
        isParent: data.isParent,
        parentCode: data.grupo,
        balance: account?.balance || 0,
      };

      if (account) {
        await updateAccount(account.id, accountData);
        toast({ title: 'Éxito', description: 'Cuenta actualizada.' });
      } else {
        await addAccount(accountData as Omit<Account, 'id' | 'organizationId' | 'balance'>);
        toast({ title: 'Éxito', description: 'Cuenta creada.' });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="clase"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Clase</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccione una clase..." /></SelectTrigger></FormControl>
                        <SelectContent>{clases.map(c => <SelectItem key={c.clase_numero} value={c.clase_numero}>{c.clase_numero} - {c.nombre}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}/>
             <FormField
                control={form.control}
                name="grupo"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Grupo Principal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!claseWatcher}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un grupo..." /></SelectTrigger></FormControl>
                        <SelectContent>{grupos.map(g => <SelectItem key={g.numero} value={`${claseWatcher}${g.numero}`}>{g.numero} - {g.nombre}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}/>
         </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem><FormLabel>Código de Cuenta</FormLabel><FormControl><Input placeholder="Se genera al elegir grupo" {...field} disabled /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nombre de la Cuenta/Subcuenta</FormLabel><FormControl><Input placeholder="Ej: Caja General" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
         <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Descripción opcional de la cuenta..." {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField
          control={form.control}
          name="isParent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Es una cuenta principal (agrupadora)</FormLabel>
                <FormDescription>
                  Marque esta opción si esta cuenta agrupará a otras (no recibirá asientos directos).
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cuenta'}
        </Button>
      </form>
    </Form>
  );
}

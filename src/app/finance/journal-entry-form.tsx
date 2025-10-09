// /src/app/finance/journal-entry-form.tsx
"use client";

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Account, JournalEntry } from '@/lib/types';
import { addJournalEntry } from '@/services/accounting-service';

const transactionSchema = z.object({
  accountId: z.string().min(1, "Seleccione una cuenta"),
  debit: z.coerce.number().min(0).default(0),
  credit: z.coerce.number().min(0).default(0),
});

const formSchema = z.object({
  date: z.date({ required_error: "La fecha es requerida." }),
  description: z.string().min(3, 'La descripción es requerida.'),
  transactions: z.array(transactionSchema).min(2, 'Se requieren al menos dos transacciones.'),
}).refine(data => {
    const totalDebits = data.transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredits = data.transactions.reduce((sum, t) => sum + t.credit, 0);
    return Math.abs(totalDebits - totalCredits) < 0.01; // Allow for small floating point inaccuracies
}, {
    message: 'La suma de débitos y créditos debe ser igual (Partida Doble).',
    path: ['transactions'],
});

type FormValues = z.infer<typeof formSchema>;

interface JournalEntryFormProps {
  accounts: Account[];
  onSuccess: () => void;
}

export function JournalEntryForm({ accounts, onSuccess }: JournalEntryFormProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      description: '',
      transactions: [
        { accountId: '', debit: 0, credit: 0 },
        { accountId: '', debit: 0, credit: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "transactions",
  });

  const onSubmit = async (data: FormValues) => {
    try {
        const entryData: Omit<JournalEntry, 'id'> = {
            date: format(data.date, 'yyyy-MM-dd'),
            description: data.description,
            transactions: data.transactions.map(t => ({
                ...t,
                accountCode: accounts.find(a => a.id === t.accountId)?.code || '',
                accountName: accounts.find(a => a.id === t.accountId)?.name || '',
            })),
            organizationId: 'default', // TODO: Get from user profile
        };
        await addJournalEntry(entryData);
        toast({ title: 'Éxito', description: 'Asiento contable registrado.' });
        onSuccess();
    } catch (error) {
        toast({ title: 'Error', description: 'No se pudo registrar el asiento.', variant: 'destructive' });
    }
  };
  
  const totalDebits = form.watch('transactions').reduce((sum, t) => sum + (t.debit || 0), 0);
  const totalCredits = form.watch('transactions').reduce((sum, t) => sum + (t.credit || 0), 0);
  const difference = totalDebits - totalCredits;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Fecha</FormLabel>
                <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : (<span>Seleccione fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent></Popover><FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="col-span-2"><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Ej: Venta de mercancías..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        
        <div>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-center mb-2">
              <div className="col-span-5">
                <Controller
                  control={form.control}
                  name={`transactions.${index}.accountId`}
                  render={({ field }) => (
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccione una cuenta..." /></SelectTrigger></FormControl>
                        <SelectContent>{accounts.filter(a => !a.isParent).map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.code} - {acc.name}</SelectItem>)}</SelectContent>
                     </Select>
                  )}
                />
              </div>
               <div className="col-span-3">
                 <Controller
                    control={form.control}
                    name={`transactions.${index}.debit`}
                    render={({ field }) => <Input type="number" step="0.01" placeholder="Débito" {...field} />}
                 />
              </div>
               <div className="col-span-3">
                 <Controller
                    control={form.control}
                    name={`transactions.${index}.credit`}
                    render={({ field }) => <Input type="number" step="0.01" placeholder="Crédito" {...field} />}
                 />
              </div>
              <div className="col-span-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 2}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ accountId: '', debit: 0, credit: 0 })}>
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar Fila
          </Button>
        </div>
        
        <div className="flex justify-end items-center gap-4 pt-4 border-t">
            <div className="text-right">
                <p className={cn("text-sm font-mono", difference !== 0 ? 'text-destructive' : 'text-green-600')}>Diferencia: ${difference.toLocaleString('es-CO')}</p>
                <p className="text-sm font-mono">Total Débitos: ${totalDebits.toLocaleString('es-CO')}</p>
                <p className="text-sm font-mono">Total Créditos: ${totalCredits.toLocaleString('es-CO')}</p>
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting || difference !== 0}>
              {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Asiento'}
            </Button>
        </div>
         <FormMessage>{form.formState.errors.transactions?.message}</FormMessage>
      </form>
    </Form>
  );
}

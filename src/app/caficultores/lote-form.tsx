
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const loteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  area: z.coerce.number().min(0, 'El área no puede ser negativa'),
  variedad: z.string().min(1, 'La variedad es requerida'),
  fechaSiembra: z.string(),
  gps: z.string().optional(),
});

const variedadesDeCafe = [
  'Arábica',
  'Robusta',
  'Liberica',
  'Excelsa',
  'Geisha',
  'Bourbon',
  'Caturra',
  'Castillo',
  'Colombia',
];

export default function LoteForm({ onSubmit, initialData }) {
  const form = useForm({
    resolver: zodResolver(loteSchema),
    defaultValues: initialData || {
      nombre: '',
      area: 0,
      variedad: '',
      fechaSiembra: '',
      gps: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Lote</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área (m²)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="variedad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variedad de Café</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una variedad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {variedadesDeCafe.map(variedad => (
                    <SelectItem key={variedad} value={variedad}>
                      {variedad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fechaSiembra"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Siembra</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación GPS (Opcional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Guardar</Button>
      </form>
    </Form>
  );
}

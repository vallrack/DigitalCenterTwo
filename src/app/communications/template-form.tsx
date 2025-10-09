// /src/app/communications/template-form.tsx
"use client";

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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Template, TemplateType } from '@/lib/types';
import { addTemplate, updateTemplate } from '@/services/communications-service';

const formSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido.'),
  subject: z.string().optional(),
  content: z.string().min(10, 'El contenido es muy corto.'),
});

type FormValues = z.infer<typeof formSchema>;

interface TemplateFormProps {
  type: TemplateType;
  template?: Template | null;
  onSuccess: () => void;
}

export function TemplateForm({ type, template, onSuccess }: TemplateFormProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name || '',
      subject: template?.subject || '',
      content: template?.content || '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!userProfile) return;
    try {
      const templateData = { ...data, type };
      if (template) {
        await updateTemplate(template.id, templateData);
        toast({ title: 'Éxito', description: 'Plantilla actualizada.' });
      } else {
        await addTemplate(templateData, userProfile);
        toast({ title: 'Éxito', description: 'Plantilla creada.' });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la plantilla.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Plantilla</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Bienvenida a Nuevos Clientes" {...field} />
              </FormControl>
              <FormDescription>Nombre interno para identificar esta plantilla.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {type === 'email' && (
           <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Asunto del Correo</FormLabel>
                <FormControl>
                    <Input placeholder="¡Gracias por unirte!" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        )}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido del Mensaje</FormLabel>
              <FormControl>
                <Textarea placeholder="Hola {{nombre_cliente}}, bienvenido a..." rows={10} {...field} />
              </FormControl>
               <FormDescription>
                Puedes usar variables como {'{{nombre_cliente}}'}, {'{{nombre_empresa}}'}, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Plantilla'}
        </Button>
      </form>
    </Form>
  );
}

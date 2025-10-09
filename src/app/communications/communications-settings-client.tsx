// /src/app/communications/communications-settings-client.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { CommunicationsSettings } from '@/lib/types';
import { getCommunicationsSettings, updateCommunicationsSettings } from '@/services/communications-settings-service';

const formSchema = z.object({
  defaultEmailFooter: z.string().min(5, 'El pie de página es muy corto.'),
});

type FormValues = z.infer<typeof formSchema>;

export function CommunicationsSettingsClient() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { defaultEmailFooter: '' },
  });

  const fetchSettings = useCallback(async () => {
    if (!userProfile?.organizationId) return;
    setLoading(true);
    try {
      const currentSettings = await getCommunicationsSettings(userProfile.organizationId);
      form.reset({ defaultEmailFooter: currentSettings.defaultEmailFooter });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar las configuraciones.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, userProfile, form]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onSubmit = async (data: FormValues) => {
    if (!userProfile?.organizationId) return;
    try {
      await updateCommunicationsSettings(userProfile.organizationId, data);
      toast({ title: 'Éxito', description: 'Configuración guardada.' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar la configuración.', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Comunicaciones</CardTitle>
        <CardDescription>
          Configure las integraciones y ajustes para los canales de comunicación.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
                 <FormField
                    control={form.control}
                    name="defaultEmailFooter"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pie de Página para Correos</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Atentamente,&#10;El equipo de [Tu Empresa]"
                                rows={5}
                                {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Este texto se añadirá al final de todos los correos enviados en campañas.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting || loading}>
                    {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
            </form>
         </Form>
      </CardContent>
    </Card>
  );
}

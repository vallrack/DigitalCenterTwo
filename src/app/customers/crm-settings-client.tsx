// /src/app/customers/crm-settings-client.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { CrmSettings } from '@/lib/types';
import { getCrmSettings, updateCrmSettings } from '@/services/crm-settings-service';

const formSchema = z.object({
  newChannel: z.string().min(2, 'El nombre del canal es muy corto.'),
});

type FormValues = z.infer<typeof formSchema>;

export function CrmSettingsClient() {
  const [settings, setSettings] = useState<CrmSettings>({ acquisitionChannels: [] });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { newChannel: '' },
  });

  const fetchSettings = useCallback(async () => {
    if (!userProfile?.organizationId) return;
    setLoading(true);
    try {
      const currentSettings = await getCrmSettings(userProfile.organizationId);
      setSettings(currentSettings);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar las configuraciones.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, userProfile]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onAddChannel = async (data: FormValues) => {
    if (!userProfile?.organizationId) return;
    const updatedChannels = [...settings.acquisitionChannels, data.newChannel];
    try {
      await updateCrmSettings(userProfile.organizationId, { acquisitionChannels: updatedChannels });
      toast({ title: 'Éxito', description: 'Canal de adquisición agregado.' });
      fetchSettings();
      form.reset();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo agregar el canal.', variant: 'destructive' });
    }
  };

  const onRemoveChannel = async (channelToRemove: string) => {
    if (!userProfile?.organizationId) return;
    const updatedChannels = settings.acquisitionChannels.filter(c => c !== channelToRemove);
     try {
      await updateCrmSettings(userProfile.organizationId, { acquisitionChannels: updatedChannels });
      toast({ title: 'Éxito', description: 'Canal de adquisición eliminado.' });
      fetchSettings();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el canal.', variant: 'destructive' });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración del CRM</CardTitle>
        <CardDescription>
          Ajuste los parámetros y opciones del módulo de gestión de clientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-md space-y-6">
            <div>
                <h3 className="font-semibold">Canales de Adquisición</h3>
                <p className="text-sm text-muted-foreground">Gestione los canales por los cuales adquiere nuevos clientes.</p>
                <div className="mt-4 space-y-2">
                    {loading ? <p>Cargando...</p> : settings.acquisitionChannels.map(channel => (
                        <div key={channel} className="flex items-center justify-between rounded-md border p-2">
                            <span>{channel}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onRemoveChannel(channel)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onAddChannel)} className="flex items-end gap-2">
                    <FormField
                        control={form.control}
                        name="newChannel"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Nuevo Canal</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: Evento Especial" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Agregar
                    </Button>
                </form>
            </Form>
        </div>
      </CardContent>
    </Card>
  );
}

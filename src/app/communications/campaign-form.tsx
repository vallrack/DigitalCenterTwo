// /src/app/communications/campaign-form.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Campaign, Template } from '@/lib/types';
import { addCampaign, updateCampaign } from '@/services/communications-service';

const formSchema = z.object({
  name: z.string().min(3, 'El nombre de la campaña es requerido.'),
  templateId: z.string().min(1, 'Debe seleccionar una plantilla.'),
  targetAudience: z.enum(['all', 'prospects', 'active']),
  status: z.enum(['draft', 'scheduled', 'sent']),
});

type FormValues = z.infer<typeof formSchema>;

interface CampaignFormProps {
  campaign?: Campaign | null;
  templates: Template[];
  onSuccess: () => void;
}

export function CampaignForm({ campaign, templates, onSuccess }: CampaignFormProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: campaign?.name || '',
      templateId: campaign?.templateId || '',
      targetAudience: campaign?.targetAudience || 'all',
      status: campaign?.status || 'draft',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!userProfile) return;
    try {
      if (campaign) {
        await updateCampaign(campaign.id, data);
        toast({ title: 'Éxito', description: 'Campaña actualizada.' });
      } else {
        await addCampaign(data, userProfile);
        toast({ title: 'Éxito', description: 'Campaña creada.' });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la campaña.',
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
              <FormLabel>Nombre de la Campaña</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Promoción de Verano" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="templateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plantilla a Utilizar</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una plantilla..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.type})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="targetAudience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Audiencia Objetivo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione la audiencia..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">Todos los Clientes</SelectItem>
                  <SelectItem value="prospects">Solo Prospectos</SelectItem>
                  <SelectItem value="active">Solo Clientes Activos</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Define a qué segmento de clientes se enviará esta campaña.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Campaña'}
        </Button>
      </form>
    </Form>
  );
}

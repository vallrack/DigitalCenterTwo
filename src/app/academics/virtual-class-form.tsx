// /src/app/academics/virtual-class-form.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Sparkles, Loader2 } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import type { VideoRecording } from '@/lib/types';
import { addVideoRecording, updateVideoRecording } from '@/services/video-recording-service';
import { generateMeetingLink } from '@/ai/flows/generate-meeting-link';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(3, 'El título es requerido'),
  subject: z.string().min(2, 'La materia es requerida'),
  date: z.date({ required_error: "La fecha es requerida." }),
  url: z.string().url('Debe ser una URL válida (ej: https://...)'),
});

type FormValues = z.infer<typeof formSchema>;

interface VirtualClassFormProps {
  recording?: VideoRecording | null;
  organizationId: string;
  onSuccess: () => void;
}

export function VirtualClassForm({ recording, organizationId, onSuccess }: VirtualClassFormProps) {
  const { toast } = useToast();
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: recording?.title || '',
      subject: recording?.subject || '',
      date: recording?.date ? new Date(recording.date) : new Date(),
      url: recording?.url || '',
    },
  });

  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);
    const title = form.getValues('title');
    if (!title) {
        toast({ title: 'Título requerido', description: 'Por favor, ingrese un título para la clase antes de generar un enlace.', variant: 'destructive' });
        setIsGeneratingLink(false);
        return;
    }

    try {
        const result = await generateMeetingLink({ summary: title });
        form.setValue('url', result.meetingLink, { shouldValidate: true });
        toast({ title: 'Éxito', description: 'Enlace de reunión generado y añadido.' });
    } catch (error) {
        toast({ title: 'Error de IA', description: 'No se pudo generar el enlace de la reunión.', variant: 'destructive' });
    } finally {
        setIsGeneratingLink(false);
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      const classData = {
        ...data,
        date: format(data.date, 'yyyy-MM-dd'),
        organizationId,
      };

      if (recording) {
        await updateVideoRecording(recording.id, classData);
        toast({ title: 'Éxito', description: 'Clase virtual actualizada.' });
      } else {
        await addVideoRecording(classData);
        toast({ title: 'Éxito', description: 'Clase virtual creada.' });
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving virtual class:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la clase virtual.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem><FormLabel>Título de la Clase</FormLabel><FormControl><Input placeholder="Ej: Clase de Repaso de Álgebra" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="subject" render={({ field }) => (
            <FormItem><FormLabel>Materia</FormLabel><FormControl><Input placeholder="Ej: Matemáticas" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem className="flex flex-col"><FormLabel>Fecha de la Clase</FormLabel>
            <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : (<span>Seleccione una fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent></Popover><FormMessage />
            </FormItem>
        )}/>
         <FormField control={form.control} name="url" render={({ field }) => (
            <FormItem><FormLabel>URL de la Reunión / Grabación</FormLabel><FormControl><Input placeholder="https://meet.google.com/..." {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
         <Button type="button" variant="outline" onClick={handleGenerateLink} disabled={isGeneratingLink}>
            {isGeneratingLink ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isGeneratingLink ? 'Generando...' : 'Generar Enlace de Reunión con IA'}
         </Button>
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Clase Virtual'}
        </Button>
      </form>
    </Form>
  );
}

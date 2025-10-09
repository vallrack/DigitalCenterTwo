// /src/app/academics/lesson-plan-form.tsx
"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, PlusCircle, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { LessonPlan } from '@/lib/types';
import { addLessonPlan, updateLessonPlan } from '@/services/lesson-plan-service';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(3, 'El título es requerido'),
  subject: z.string().min(2, 'La materia es requerida'),
  teacher: z.string().min(2, 'El nombre del profesor es requerido'),
  date: z.date({ required_error: "La fecha es requerida." }),
  objectives: z.array(z.object({ value: z.string().min(5, 'El objetivo es muy corto') })).min(1, 'Debe haber al menos un objetivo.'),
});

type LessonPlanFormValues = z.infer<typeof formSchema>;

interface LessonPlanFormProps {
  plan?: LessonPlan | null;
  organizationId: string;
  onSuccess: () => void;
}

export function LessonPlanForm({ plan, organizationId, onSuccess }: LessonPlanFormProps) {
  const { toast } = useToast();
  const form = useForm<LessonPlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: plan?.title || '',
      subject: plan?.subject || '',
      teacher: plan?.teacher || '',
      date: plan?.date ? new Date(plan.date) : new Date(),
      objectives: plan?.objectives ? plan.objectives.map(o => ({ value: o })) : [{ value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "objectives",
  });

  const onSubmit = async (data: LessonPlanFormValues) => {
    try {
      const planData = {
        ...data,
        date: format(data.date, 'yyyy-MM-dd'),
        objectives: data.objectives.map(o => o.value),
        organizationId,
      };

      if (plan) {
        await updateLessonPlan(plan.id, planData);
        toast({ title: 'Éxito', description: 'Plan de lección actualizado.' });
      } else {
        await addLessonPlan(planData);
        toast({ title: 'Éxito', description: 'Plan de lección creado.' });
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving lesson plan:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el plan de lección.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem><FormLabel>Título del Plan</FormLabel><FormControl><Input placeholder="Ej: Introducción a la Fotosíntesis" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="subject" render={({ field }) => (
                <FormItem><FormLabel>Materia</FormLabel><FormControl><Input placeholder="Ej: Ciencias Naturales" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="teacher" render={({ field }) => (
                <FormItem><FormLabel>Profesor</FormLabel><FormControl><Input placeholder="Ej: Ana García" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
         <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem className="flex flex-col"><FormLabel>Fecha de la Clase</FormLabel>
            <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : (<span>Seleccione una fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent></Popover><FormMessage />
            </FormItem>
        )}/>

        <div>
            <FormLabel>Objetivos de la Lección</FormLabel>
            <div className="space-y-2 mt-2">
                {fields.map((field, index) => (
                    <FormField
                        key={field.id}
                        control={form.control}
                        name={`objectives.${index}.value`}
                        render={({ field: objectiveField }) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                <FormControl>
                                    <Textarea placeholder={`Objetivo ${index + 1}`} {...objectiveField} className="resize-none" />
                                </FormControl>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                    <X className="h-4 w-4" />
                                </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}
            </div>
             <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Objetivo
            </Button>
        </div>
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Plan de Lección'}
        </Button>
      </form>
    </Form>
  );
}

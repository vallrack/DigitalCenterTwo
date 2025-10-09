// /src/app/academics/student-form.tsx
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Student, Organization } from '@/lib/types';
import { addStudent, updateStudent } from '@/services/student-service';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Correo electrónico inválido'),
  grade: z.string().min(1, 'El grado es requerido'),
  status: z.enum(['Active', 'Inactive']),
  organizationId: z.string().min(1, 'La organización es requerida'),
});

type StudentFormValues = z.infer<typeof formSchema>;

interface StudentFormProps {
  student?: Student | null;
  organizations: Organization[];
  onSuccess: () => void;
}

export function StudentForm({ student, organizations, onSuccess }: StudentFormProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const isSuperAdmin = userProfile?.role === 'SuperAdmin';

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: student?.name || '',
      email: student?.email || '',
      grade: student?.grade || '',
      status: student?.status || 'Active',
      organizationId: student?.organizationId || userProfile?.organizationId || '',
    },
  });

  useEffect(() => {
    // This ensures the form resets correctly when the selected student changes
    form.reset({
      name: student?.name || '',
      email: student?.email || '',
      grade: student?.grade || '',
      status: student?.status || 'Active',
      organizationId: student?.organizationId || userProfile?.organizationId || '',
    });
  }, [student, userProfile, form]);

  const onSubmit = async (data: StudentFormValues) => {
    try {
      if (student) {
        await updateStudent(student.id, data);
        toast({ title: 'Éxito', description: 'Estudiante actualizado correctamente.' });
      } else {
        await addStudent(data);
        toast({ title: 'Éxito', description: 'Estudiante creado correctamente.' });
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el estudiante.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isSuperAdmin && (
          <FormField
            control={form.control}
            name="organizationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organización</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una organización..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input placeholder="Ej: Carlos Pérez" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input type="email" placeholder="estudiante@ejemplo.com" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="grade" render={({ field }) => (
                <FormItem><FormLabel>Grado / Curso</FormLabel><FormControl><Input placeholder="Ej: 10mo Grado" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="Active">Activo</SelectItem>
                        <SelectItem value="Inactive">Inactivo</SelectItem>
                    </SelectContent>
                </Select>
            <FormMessage />
            </FormItem>
        )}/>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </form>
    </Form>
  );
}

// /src/app/academics/subject-form.tsx
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
import type { Subject, Employee } from '@/lib/types';
import { addSubject, updateSubject } from '@/services/subject-service';
import { getEmployees } from '@/services/employee-service';

const formSchema = z.object({
  name: z.string().min(3, 'El nombre de la materia es requerido'),
  teacherId: z.string().min(1, 'Debe seleccionar un profesor'),
  grade: z.string().min(2, 'El grado o curso es requerido'),
});

type SubjectFormValues = z.infer<typeof formSchema>;

interface SubjectFormProps {
  subject?: Subject | null;
  organizationId: string;
  onSuccess: () => void;
}

export function SubjectForm({ subject, organizationId, onSuccess }: SubjectFormProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [teachers, setTeachers] = useState<Employee[]>([]);

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: subject?.name || '',
      teacherId: subject?.teacherId || '',
      grade: subject?.grade || '',
    },
  });

  useEffect(() => {
    const fetchTeachers = async () => {
        if (!userProfile) return;
        try {
            const allEmployees = await getEmployees(userProfile);
            // Filter for employees that have an academic role
            const academicStaff = allEmployees.filter(e => ['Academico', 'Admin', 'SuperAdmin'].includes(e.role));
            setTeachers(academicStaff);
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudieron cargar los profesores.' });
        }
    };
    fetchTeachers();
  }, [toast, userProfile]);

  const onSubmit = async (data: SubjectFormValues) => {
    try {
      const selectedTeacher = teachers.find(t => t.id === data.teacherId);
      if (!selectedTeacher) {
        toast({ title: 'Error', description: 'Profesor seleccionado no válido.', variant: 'destructive' });
        return;
      }
      
      const subjectData = {
        ...data,
        teacherName: selectedTeacher.name,
        organizationId,
      };

      if (subject) {
        await updateSubject(subject.id, subjectData);
        toast({ title: 'Éxito', description: 'Materia actualizada.' });
      } else {
        await addSubject(subjectData);
        toast({ title: 'Éxito', description: 'Materia creada.' });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la materia.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nombre de la Materia</FormLabel><FormControl><Input placeholder="Ej: Álgebra Lineal" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="teacherId" render={({ field }) => (
                <FormItem><FormLabel>Profesor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un profesor..." /></SelectTrigger></FormControl>
                    <SelectContent>
                        {teachers.map(teacher => (
                            <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="grade" render={({ field }) => (
                <FormItem><FormLabel>Grado / Curso</FormLabel><FormControl><Input placeholder="Ej: 11vo Grado" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Materia'}
        </Button>
      </form>
    </Form>
  );
}

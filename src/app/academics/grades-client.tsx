// /src/app/academics/grades-client.tsx
"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Grade, Student, Subject } from '@/lib/types';
import { getGrades, addGrade } from '@/services/grade-service';
import { getStudents } from '@/services/student-service';
import { getSubjects } from '@/services/subject-service';

const gradeFormSchema = z.object({
  grade: z.coerce.number().min(0, 'La nota no puede ser negativa').max(5, 'La nota no puede ser mayor a 5'),
  notes: z.string().optional(),
});

type GradeFormValues = z.infer<typeof gradeFormSchema>;

export const GradesClient = memo(() => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: { grade: 0, notes: '' },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsData, subjectsData] = await Promise.all([
        getStudents(),
        getSubjects(),
      ]);
      setStudents(studentsData);
      setSubjects(subjectsData);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar los datos iniciales.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchGrades = useCallback(async () => {
    if (!selectedStudentId || !selectedSubjectId) {
      setGrades([]);
      return;
    }
    try {
      const gradesData = await getGrades(selectedStudentId, selectedSubjectId);
      setGrades(gradesData);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar las calificaciones.', variant: 'destructive' });
    }
  }, [selectedStudentId, selectedSubjectId, toast]);
  
  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const onSubmit = async (data: GradeFormValues) => {
    const student = students.find(s => s.id === selectedStudentId);
    const subject = subjects.find(s => s.id === selectedSubjectId);

    if (!student || !subject || !userProfile?.organizationId) return;

    try {
      const gradeData = {
        ...data,
        studentId: student.id,
        studentName: student.name,
        subjectId: subject.id,
        subjectName: subject.name,
        date: new Date().toISOString().split('T')[0],
        organizationId: userProfile.organizationId,
      };
      await addGrade(gradeData);
      toast({ title: 'Éxito', description: 'Calificación registrada.' });
      form.reset();
      fetchGrades();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo registrar la calificación.', variant: 'destructive' });
    }
  };
  
  const averageGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(2)
    : 'N/A';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Calificaciones</CardTitle>
        <CardDescription>Seleccione un estudiante y una materia para registrar o consultar sus calificaciones.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
           <div>
            <Label>Estudiante</Label>
             <Select value={selectedStudentId} onValueChange={setSelectedStudentId} disabled={loading}>
                <SelectTrigger><SelectValue placeholder="Seleccione un estudiante..." /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
           </div>
            <div>
            <Label>Materia</Label>
             <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={loading}>
                <SelectTrigger><SelectValue placeholder="Seleccione una materia..." /></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
           </div>
        </div>
        
        {selectedStudentId && selectedSubjectId && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <h3 className="font-semibold mb-4">Registrar Nueva Calificación</h3>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="grade" render={({ field }) => (
                                <FormItem><FormLabel>Nota (0.0 - 5.0)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="notes" render={({ field }) => (
                                <FormItem><FormLabel>Observaciones</FormLabel><FormControl><Textarea placeholder="Ej: Excelente participación..." {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Registrando...' : 'Registrar Nota'}
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="lg:col-span-2">
                     <h3 className="font-semibold mb-4">Calificaciones Registradas</h3>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Nota</TableHead>
                                <TableHead>Observaciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {grades.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="text-center">No hay calificaciones registradas.</TableCell></TableRow>
                            ) : (
                                grades.map(grade => (
                                    <TableRow key={grade.id}>
                                        <TableCell>{format(new Date(grade.date), 'PPP', { locale: es })}</TableCell>
                                        <TableCell className="font-bold">{grade.grade.toFixed(1)}</TableCell>
                                        <TableCell>{grade.notes}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                     </Table>
                     <div className="text-right font-bold mt-4">
                        Promedio Final: {averageGrade}
                     </div>
                </div>
            </div>
        )}

      </CardContent>
    </Card>
  );
});
GradesClient.displayName = 'GradesClient';

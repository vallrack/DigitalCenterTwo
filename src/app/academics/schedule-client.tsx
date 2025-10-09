// /src/app/academics/schedule-client.tsx
"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Info, CalendarIcon, Clock } from 'lucide-react';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Schedule, Subject, Employee } from '@/lib/types';
import { getSchedules, addScheduleEntry } from '@/services/schedule-service';
import { getSubjects } from '@/services/subject-service';
import { getEmployees } from '@/services/employee-service';
import { cn } from '@/lib/utils';

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const;
type DayOfWeek = typeof daysOfWeek[number];
const timeSlots = Array.from({ length: 12 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);


const scheduleFormSchema = z.object({
  subjectId: z.string().min(1, "Debe seleccionar una materia"),
  modality: z.enum(['Presencial', 'Virtual', 'Híbrido']),
  startDate: z.date({ required_error: "La fecha de inicio es requerida." }),
  endDate: z.date({ required_error: "La fecha de finalización es requerida." }),
  repeatDays: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Debe seleccionar al menos un día.",
  }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato de hora inválido"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato de hora inválido"),
  classroom: z.string().min(2, "El aula es requerida"),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export const ScheduleClient = memo(() => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [formInitialData, setFormInitialData] = useState({});

  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      repeatDays: [],
      modality: 'Presencial',
      startTime: '08:00',
      endTime: '09:00',
    }
  });

  const fetchData = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const [schedulesData, subjectsData, employeesData] = await Promise.all([
        getSchedules(),
        getSubjects(),
        getEmployees(userProfile),
      ]);
      setSchedules(schedulesData);
      setSubjects(subjectsData);
      setTeachers(employeesData.filter(e => ['Academico', 'Admin', 'SuperAdmin'].includes(e.role)));
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar los datos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, userProfile]);

  useEffect(() => {
    if (userProfile) {
      fetchData();
    }
  }, [userProfile, fetchData]);
  
  const handleOpenForm = useCallback((day?: DayOfWeek, time?: string) => {
    const defaultValues = {
        subjectId: '',
        modality: 'Presencial' as const,
        repeatDays: day ? [day] : [],
        startTime: time || '08:00',
        endTime: time ? `${(parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0')}:00` : '09:00',
        classroom: '',
    };
    form.reset(defaultValues);
    setIsFormOpen(true);
  }, [form]);

  const handleOpenInfo = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsInfoOpen(true);
  };

  const onSubmit = async (data: ScheduleFormValues) => {
    const subject = subjects.find(s => s.id === data.subjectId);
    const teacher = teachers.find(t => t.id === subject?.teacherId);

    if (!subject || !teacher || !userProfile?.organizationId) {
      toast({ title: 'Error de datos', description: 'No se encontró la materia o el profesor asociado.', variant: 'destructive'});
      return;
    }

    try {
      const scheduleData = {
        ...data,
        subjectName: subject.name,
        teacherId: teacher.id,
        teacherName: teacher.name,
        organizationId: userProfile.organizationId,
      };
      await addScheduleEntry(scheduleData);
      toast({ title: 'Éxito', description: 'Horario programado correctamente.' });
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
       toast({ title: 'Error', description: 'No se pudo programar la clase.', variant: 'destructive' });
    }
  };

  const getScheduleForSlot = (day: DayOfWeek, time: string) => {
    return schedules.find(s => s.dayOfWeek === day && s.startTime === time);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
                <CardTitle>Horarios de Clases</CardTitle>
                <CardDescription>Visualice el horario de clases semanal y programe nuevas clases recurrentes.</CardDescription>
            </div>
            <Button onClick={() => handleOpenForm()} className="w-full md:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Programar Nueva Clase
            </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 border w-[100px]">Hora</th>
                  {daysOfWeek.map(day => <th key={day} className="p-2 border">{day}</th>)}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time}>
                    <td className="p-2 border font-semibold bg-muted/50">{time}</td>
                    {daysOfWeek.map(day => {
                      const schedule = getScheduleForSlot(day, time);
                      return (
                        <td key={day} className="p-1 border h-20 align-top relative group">
                          {schedule ? (
                            <button onClick={() => handleOpenInfo(schedule)} className="w-full h-full text-left">
                              <div className="bg-primary/10 p-2 rounded-md h-full hover:bg-primary/20 transition-colors">
                                <p className="font-bold text-primary text-xs">{schedule.subjectName}</p>
                                <p className="text-muted-foreground text-xs">{schedule.teacherName}</p>
                                <p className="text-muted-foreground text-xs mt-1">Aula: {schedule.classroom}</p>
                              </div>
                            </button>
                          ) : (
                            <button onClick={() => handleOpenForm(day, time)} className="w-full h-full flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity">
                                <PlusCircle className="h-6 w-6" />
                            </button>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Programar Nueva Clase</DialogTitle>
          </DialogHeader>
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                <FormField control={form.control} name="subjectId" render={({ field }) => (
                    <FormItem><FormLabel>Materia</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione una materia..." /></SelectTrigger></FormControl><SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.grade})</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="modality" render={({ field }) => (
                  <FormItem><FormLabel>Modalidad</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Presencial">Presencial</SelectItem><SelectItem value="Virtual">Virtual</SelectItem><SelectItem value="Híbrido">Híbrido</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="startDate" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Fecha de Inicio</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Seleccione fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent></Popover><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="endDate" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Fecha de Finalización</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Seleccione fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent></Popover><FormMessage /></FormItem>
                    )}/>
                </div>
                 <FormField
                    control={form.control}
                    name="repeatDays"
                    render={() => (
                        <FormItem>
                        <div className="mb-4"><FormLabel>Repetir Semanalmente los Días</FormLabel></div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            {daysOfWeek.map((day) => (
                            <FormField
                                key={day}
                                control={form.control}
                                name="repeatDays"
                                render={({ field }) => {
                                return (
                                    <FormItem key={day} className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(day)}
                                            onCheckedChange={(checked) => {
                                                return checked
                                                ? field.onChange([...field.value, day])
                                                : field.onChange(
                                                    field.value?.filter(
                                                        (value) => value !== day
                                                    )
                                                    )
                                            }}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal text-sm">{day}</FormLabel>
                                    </FormItem>
                                )
                                }}
                            />
                            ))}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="grid grid-cols-2 gap-4">
                     <FormField control={form.control} name="startTime" render={({ field }) => (
                        <FormItem><FormLabel>Hora de Inicio</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>{timeSlots.map(time => <SelectItem key={`start-${time}`} value={time}>{time}</SelectItem>)}</SelectContent>
                          </Select><FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="endTime" render={({ field }) => (
                        <FormItem><FormLabel>Hora de Finalización</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>{timeSlots.map(time => <SelectItem key={`end-${time}`} value={time}>{time}</SelectItem>)}</SelectContent>
                          </Select><FormMessage />
                        </FormItem>
                    )}/>
                </div>
                 <FormField control={form.control} name="classroom" render={({ field }) => (
                    <FormItem><FormLabel>Aula / Salón</FormLabel><FormControl><Input placeholder="Ej: Salón 101, Enlace de Meet" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Horario'}
                </Button>
            </form>
           </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Detalles de la Clase</DialogTitle>
              </DialogHeader>
              {selectedSchedule && (
                  <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-4"><Info className="h-5 w-5 text-primary"/><span className="font-semibold">Materia:</span><span>{selectedSchedule.subjectName}</span></div>
                      <div className="flex items-center gap-4"><Info className="h-5 w-5 text-primary"/><span className="font-semibold">Profesor:</span><span>{selectedSchedule.teacherName}</span></div>
                      <div className="flex items-center gap-4"><Info className="h-5 w-5 text-primary"/><span className="font-semibold">Día:</span><span>{selectedSchedule.dayOfWeek}</span></div>
                      <div className="flex items-center gap-4"><Info className="h-5 w-5 text-primary"/><span className="font-semibold">Hora:</span><span>{selectedSchedule.startTime} - {selectedSchedule.endTime}</span></div>
                      <div className="flex items-center gap-4"><Info className="h-5 w-5 text-primary"/><span className="font-semibold">Aula:</span><span>{selectedSchedule.classroom}</span></div>
                      <div className="flex items-center gap-4"><Info className="h-5 w-5 text-primary"/><span className="font-semibold">Modalidad:</span><span>{selectedSchedule.modality}</span></div>
                  </div>
              )}
          </DialogContent>
      </Dialog>
    </>
  );
});
ScheduleClient.displayName = 'ScheduleClient';

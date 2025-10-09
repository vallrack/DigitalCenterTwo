// /src/app/academics/academic-settings-client.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Plus, CalendarIcon, PlusCircle, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { AcademicPeriod, GradingActivity, Organization } from '@/lib/types';
import { getAcademicPeriods, addAcademicPeriod, getGradingActivities, addGradingActivity } from '@/services/academic-settings-service';
import { getOrganizations } from '@/services/organization-service';
import { cn } from '@/lib/utils';

// Schemas
const periodSchema = z.object({
  name: z.string().min(3, "El nombre es requerido."),
  startDate: z.date({ required_error: "La fecha de inicio es requerida." }),
  endDate: z.date({ required_error: "La fecha de fin es requerida." }),
});
type PeriodFormValues = z.infer<typeof periodSchema>;

const activitySchema = z.object({
    name: z.string().min(3, "El nombre es requerido."),
    percentage: z.coerce.number().min(0).max(100, "El porcentaje debe estar entre 0 y 100."),
});
type ActivityFormValues = z.infer<typeof activitySchema>;


export function AcademicSettingsClient() {
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const isSuperAdmin = userProfile?.role === 'SuperAdmin';
  
  // State for data
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [activities, setActivities] = useState<GradingActivity[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  
  // State for UI control
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(userProfile?.organizationId || null);
  
  // Forms
  const periodForm = useForm<PeriodFormValues>({
    resolver: zodResolver(periodSchema),
    defaultValues: { name: '', startDate: new Date(), endDate: new Date() },
  });
  const activityForm = useForm<ActivityFormValues>({
      resolver: zodResolver(activitySchema),
      defaultValues: { name: '', percentage: 0 },
  });
  
  const hasSelectedOrg = !!selectedOrgId;

  const fetchOrganizations = useCallback(async () => {
    if (isSuperAdmin) {
      try {
        const orgs = await getOrganizations();
        setOrganizations(orgs);
      } catch {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las organizaciones.' });
      }
    }
  }, [isSuperAdmin, toast]);
  
  const fetchPeriods = useCallback(async () => {
    if (!hasSelectedOrg) {
      setPeriods([]);
      return;
    };
    try {
      const data = await getAcademicPeriods(selectedOrgId!);
      setPeriods(data);
    } catch { toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los periodos.' }); }
  }, [toast, hasSelectedOrg, selectedOrgId]);
  
  const fetchActivities = useCallback(async () => {
      if (!hasSelectedOrg) {
        setActivities([]);
        return;
      };
      try {
          const data = await getGradingActivities(selectedOrgId!);
          setActivities(data);
      } catch { toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las actividades.' }); }
  }, [toast, hasSelectedOrg, selectedOrgId]);

  useEffect(() => {
    if (userProfile) { // Wait for userProfile to be available
        fetchOrganizations();
        fetchPeriods();
        fetchActivities();
    }
  }, [userProfile, selectedOrgId, fetchOrganizations, fetchPeriods, fetchActivities]);

  const onPeriodSubmit = async (data: PeriodFormValues) => {
    if (!selectedOrgId) return;
    const periodData = {
      ...data,
      startDate: format(data.startDate, 'yyyy-MM-dd'),
      endDate: format(data.endDate, 'yyyy-MM-dd'),
      organizationId: selectedOrgId,
      isActive: false, // Default to false, can be managed later
    };
    try {
      await addAcademicPeriod(periodData);
      toast({ title: 'Éxito', description: 'Periodo creado.' });
      periodForm.reset();
      fetchPeriods();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar el periodo.' });
    }
  };
  
  const onActivitySubmit = async (data: ActivityFormValues) => {
    if (!selectedOrgId) return;
     try {
        await addGradingActivity({...data, organizationId: selectedOrgId});
        toast({ title: 'Éxito', description: 'Actividad creada.' });
        activityForm.reset();
        fetchActivities();
     } catch {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la actividad.' });
     }
  }

  const totalPercentage = activities.reduce((sum, act) => sum + act.percentage, 0);

  if (!userProfile) {
    return <p>Cargando información del usuario...</p>;
  }

  const showNoOrgAlert = !userProfile.organizationId && !isSuperAdmin;

  return (
    <div className="space-y-6">
        {showNoOrgAlert && (
             <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Acción Requerida</AlertTitle>
              <AlertDescription>
                Su perfil no está asociado a ninguna organización. Las parametrizaciones académicas son específicas de cada institución. 
                Por favor, contacte a un administrador para que lo asigne a una.
              </AlertDescription>
            </Alert>
        )}
        
        {isSuperAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Selección de Organización</CardTitle>
              <CardDescription>Como SuperAdmin, elija la organización para la cual desea gestionar las parametrizaciones académicas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="org-select">Organización</Label>
              <Select onValueChange={setSelectedOrgId} value={selectedOrgId || ''}>
                <SelectTrigger id="org-select"><SelectValue placeholder="Seleccione una organización..." /></SelectTrigger>
                <SelectContent>{organizations.map(org => <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>)}</SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Academic Periods Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Periodos Académicos</CardTitle>
                    <CardDescription>Defina los ciclos lectivos como trimestres o semestres.</CardDescription>
                </CardHeader>
                <CardContent>
                    <fieldset disabled={!hasSelectedOrg} className="space-y-4">
                        <Form {...periodForm}>
                            <form onSubmit={periodForm.handleSubmit(onPeriodSubmit)} className="space-y-4">
                                <FormField name="name" control={periodForm.control} render={({ field }) => (<FormItem><FormLabel>Nombre del Periodo</FormLabel><FormControl><Input placeholder="Ej: Trimestre 1" {...field} /></FormControl><FormMessage/></FormItem>)} />
                                <div className="grid grid-cols-2 gap-4">
                                   <FormField name="startDate" control={periodForm.control} render={({ field }) => (<FormItem><FormLabel>Fecha de Inicio</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "dd/MM/yyyy") : <span>dd/mm/aaaa</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50"/></Button></FormControl></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange}/></PopoverContent></Popover><FormMessage/></FormItem>)}/>
                                    <FormField name="endDate" control={periodForm.control} render={({ field }) => (<FormItem><FormLabel>Fecha de Fin</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "dd/MM/yyyy") : <span>dd/mm/aaaa</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50"/></Button></FormControl></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange}/></PopoverContent></Popover><FormMessage/></FormItem>)}/>
                                </div>
                                <Button type="submit"><Plus className="mr-2 h-4 w-4"/> Agregar Periodo</Button>
                            </form>
                        </Form>
                    </fieldset>
                    <Table className="mt-6">
                        <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Inicio</TableHead><TableHead>Fin</TableHead></TableRow></TableHeader>
                        <TableBody>
                        {hasSelectedOrg && periods.length > 0 ? periods.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.startDate}</TableCell>
                                <TableCell>{p.endDate}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={3} className="h-24 text-center">{hasSelectedOrg ? 'No hay periodos definidos.' : 'Seleccione una organización.'}</TableCell></TableRow>
                        )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             {/* Grading Activities Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Ponderación de Actividades</CardTitle>
                    <CardDescription>Defina las actividades a evaluar y su peso en la nota final.</CardDescription>
                </CardHeader>
                <CardContent>
                     <fieldset disabled={!hasSelectedOrg} className="space-y-4">
                         <Form {...activityForm}>
                            <form onSubmit={activityForm.handleSubmit(onActivitySubmit)} className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField name="name" control={activityForm.control} render={({ field }) => (<FormItem className="col-span-2"><FormLabel>Nombre de la Actividad</FormLabel><FormControl><Input placeholder="Ej: Seguimiento" {...field} /></FormControl><FormMessage/></FormItem>)} />
                                    <FormField name="percentage" control={activityForm.control} render={({ field }) => (<FormItem><FormLabel>Ponderación (%)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage/></FormItem>)} />
                                </div>
                                <Button type="submit"><Plus className="mr-2 h-4 w-4"/> Agregar Actividad</Button>
                            </form>
                        </Form>
                     </fieldset>
                     <Table className="mt-6">
                        <TableHeader><TableRow><TableHead>Actividad</TableHead><TableHead className="text-right">Ponderación (%)</TableHead></TableRow></TableHeader>
                        <TableBody>
                           {hasSelectedOrg && activities.length > 0 ? activities.map(a => (
                                <TableRow key={a.id}><TableCell>{a.name}</TableCell><TableCell className="text-right">{a.percentage}%</TableCell></TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={2} className="h-24 text-center">{hasSelectedOrg ? 'No hay actividades definidas.' : 'Seleccione una organización.'}</TableCell></TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow><TableCell className="font-bold">Total</TableCell><TableCell className="text-right font-bold">{totalPercentage}%</TableCell></TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </div>
        
        {/* Grading Scales Card */}
        <Accordion type="single" collapsible disabled={!hasSelectedOrg}>
            <AccordionItem value="item-1">
                <Card>
                    <AccordionTrigger className="p-6">
                        <CardHeader className="p-0 text-left">
                            <CardTitle>Escalas de Calificación</CardTitle>
                            <CardDescription>Configure escalas de notas (ej: 0-100, A-F) y los criterios de aprobación.</CardDescription>
                        </CardHeader>
                    </AccordionTrigger>
                    <AccordionContent>
                        <CardContent>
                            <Button variant="outline" disabled={!hasSelectedOrg}><PlusCircle className="mr-2 h-4 w-4" /> Crear Nueva Escala de Calificación</Button>
                            <div className="mt-4 border rounded-md p-4">
                                <p className="text-sm text-muted-foreground">Escalas Existentes</p>
                                <p className="text-sm mt-2">Aún no se han configurado escalas de calificación.</p>
                            </div>
                        </CardContent>
                    </AccordionContent>
                </Card>
            </AccordionItem>
        </Accordion>
    </div>
  );
}

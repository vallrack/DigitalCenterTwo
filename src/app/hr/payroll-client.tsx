// /src/app/hr/payroll-client.tsx
"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Payroll, PayrollNovelty } from '@/lib/types';
import { getPayrolls, generatePayrollsForPeriod, updatePayroll, addNoveltyToPayroll, removeNoveltyFromPayroll } from '@/services/payroll-service';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Form, FormField, FormControl, FormLabel } from '@/components/ui/form';

const generationSchema = z.object({
  periodType: z.enum(['monthly', 'biweekly']),
  startDate: z.date({ required_error: "La fecha de inicio es requerida."}),
  endDate: z.date({ required_error: "La fecha de fin es requerida."}),
});

type GenerationFormValues = z.infer<typeof generationSchema>;

const noveltySchema = z.object({
    description: z.string().min(3, "La descripción es requerida."),
    amount: z.coerce.number().min(1, "El monto debe ser positivo."),
    type: z.enum(['bonus', 'deduction']),
});
type NoveltyFormValues = z.infer<typeof noveltySchema>;


export const PayrollClient = memo(() => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [isGenerationFormOpen, setIsGenerationFormOpen] = useState(false);
  const [isNoveltyFormOpen, setIsNoveltyFormOpen] = useState(false);

  const { toast } = useToast();
  const { userProfile } = useAuth();

  const generationForm = useForm<GenerationFormValues>({
    resolver: zodResolver(generationSchema),
    defaultValues: { periodType: 'monthly', startDate: startOfMonth(subMonths(new Date(), 1)), endDate: endOfMonth(subMonths(new Date(), 1)) },
  });

  const noveltyForm = useForm<NoveltyFormValues>({
      resolver: zodResolver(noveltySchema),
      defaultValues: { description: '', amount: 0, type: 'bonus'},
  });

  const fetchData = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const data = await getPayrolls(userProfile);
      setPayrolls(data);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cargar la nómina.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, userProfile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGeneratePayroll = async (data: GenerationFormValues) => {
    if (!userProfile) return;
    setGenerating(true);
    try {
        await generatePayrollsForPeriod(data.startDate, data.endDate, userProfile);
        toast({ title: 'Éxito', description: `Nómina generada.`});
        fetchData();
        setIsGenerationFormOpen(false);
    } catch (error: any) {
         toast({ title: 'Error', description: error.message || 'No se pudo generar la nómina.', variant: 'destructive'});
    } finally {
        setGenerating(false);
    }
  }
  
  const handleMarkAsPaid = async (payrollId: string) => {
      try {
          await updatePayroll(payrollId, { status: 'Paid', paymentDate: new Date().toISOString() });
          toast({ title: 'Éxito', description: 'Nómina marcada como pagada.' });
          fetchData();
      } catch (error) {
          toast({ title: 'Error', description: 'No se pudo actualizar el estado.', variant: 'destructive'});
      }
  }

  const handleAddNovelty = async (data: NoveltyFormValues) => {
      if (!selectedPayroll || !userProfile) return;
      const newNovelty: PayrollNovelty = {
          id: `novelty_${Date.now()}`,
          ...data,
      };
      try {
          await addNoveltyToPayroll(selectedPayroll.id, newNovelty);
          toast({ title: 'Novedad agregada', description: 'El cálculo de la nómina ha sido actualizado.' });
          noveltyForm.reset();
          const updatedPayrolls = await getPayrolls(userProfile);
          setPayrolls(updatedPayrolls);
          const updatedSelectedPayroll = updatedPayrolls.find(p => p.id === selectedPayroll.id);
          setSelectedPayroll(updatedSelectedPayroll || null);
      } catch (error) {
           toast({ title: 'Error', description: 'No se pudo agregar la novedad.', variant: 'destructive' });
      }
  };

  const handleRemoveNovelty = async (noveltyId: string) => {
      if (!selectedPayroll || !userProfile) return;
      try {
          await removeNoveltyFromPayroll(selectedPayroll.id, noveltyId);
          toast({ title: 'Novedad eliminada' });
          const updatedPayrolls = await getPayrolls(userProfile);
          setPayrolls(updatedPayrolls);
          const updatedSelectedPayroll = updatedPayrolls.find(p => p.id === selectedPayroll.id);
          setSelectedPayroll(updatedSelectedPayroll || null);
      } catch (error) {
          toast({ title: 'Error', description: 'No se pudo eliminar la novedad.', variant: 'destructive' });
      }
  }
  
  const getStatusVariant = (status: Payroll['status']) => {
    switch(status) {
        case 'Paid': return 'success';
        case 'Cancelled': return 'destructive';
        case 'Pending':
        default: return 'secondary';
    }
  }

  const totalLegalDeductions = selectedPayroll?.legalDeductions?.reduce((sum, d) => sum + d.amount, 0) || 0;

  return (
    <>
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
            <CardTitle>Gestión de Nómina</CardTitle>
            <CardDescription>
            Genere y administre los pagos de nómina de sus empleados.
            </CardDescription>
        </div>
        <Button onClick={() => setIsGenerationFormOpen(true)}>
            Generar Nueva Nómina
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Horas Trab. / Contrat.</TableHead>
                    <TableHead>Salario Neto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center h-24">Cargando...</TableCell></TableRow>
                ) : payrolls.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center h-24">No hay nóminas generadas.</TableCell></TableRow>
                ) : (
                    payrolls.map(p => (
                        <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.employeeName}</TableCell>
                            <TableCell>{p.period}</TableCell>
                            <TableCell>{p.workedHours.toFixed(1)} / {p.contractedHours}</TableCell>
                            <TableCell>${p.netPay.toLocaleString('es-CO')}</TableCell>
                            <TableCell><Badge variant={getStatusVariant(p.status)}>{p.status}</Badge></TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost"><MoreHorizontal /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => { setSelectedPayroll(p); setIsNoveltyFormOpen(true); }}>Gestionar Novedades</DropdownMenuItem>
                                        <DropdownMenuItem disabled={p.status === 'Paid'} onClick={() => handleMarkAsPaid(p.id)}>Marcar como Pagada</DropdownMenuItem>
                                        <DropdownMenuItem>Ver Desprendible</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </CardContent>
    </Card>

    {/* Generation Form Dialog */}
    <Dialog open={isGenerationFormOpen} onOpenChange={setIsGenerationFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Generar Nómina</DialogTitle>
                <DialogDescription>Seleccione el período para el cual desea generar los pagos de nómina.</DialogDescription>
            </DialogHeader>
            <Form {...generationForm}>
                <form onSubmit={generationForm.handleSubmit(handleGeneratePayroll)} className="space-y-4 pt-4">
                    <FormField
                        control={generationForm.control}
                        name="periodType"
                        render={({ field }) => (
                            <div className="space-y-2">
                                <FormLabel>Tipo de Período</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="monthly">Mensual</SelectItem>
                                        <SelectItem value="biweekly">Quincenal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />
                     <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={generationForm.control}
                            name="startDate"
                            render={({ field }) => (
                                <div className="flex flex-col space-y-2">
                                    <FormLabel>Fecha de Inicio</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione fecha</span>}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        />
                         <FormField
                            control={generationForm.control}
                            name="endDate"
                            render={({ field }) => (
                                 <div className="flex flex-col space-y-2">
                                    <FormLabel>Fecha de Fin</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                           <FormControl>
                                            <Button variant="outline" className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione fecha</span>}
                                            </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent>
                                    </Popover>
                                 </div>
                            )}
                        />
                     </div>
                     <Button type="submit" className="w-full" disabled={generating}>
                        {generating ? 'Generando...' : 'Confirmar y Generar'}
                     </Button>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
    
    {/* Novelty Management Dialog */}
    <Dialog open={isNoveltyFormOpen} onOpenChange={setIsNoveltyFormOpen}>
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>Gestionar Novedades de Nómina</DialogTitle>
                <DialogDescription>Para: {selectedPayroll?.employeeName} | Período: {selectedPayroll?.period}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add Novelty Form */}
                 <div className="space-y-4">
                    <h3 className="font-semibold">Agregar Novedad Manual</h3>
                     <form onSubmit={noveltyForm.handleSubmit(handleAddNovelty)} className="space-y-4 p-4 border rounded-md">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select onValueChange={(value) => noveltyForm.setValue('type', value as 'bonus' | 'deduction')} defaultValue="bonus">
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bonus">Bonificación</SelectItem>
                                        <SelectItem value="deduction">Deducción</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Monto</Label>
                                <Input type="number" {...noveltyForm.register('amount')} placeholder="0.00" />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Input {...noveltyForm.register('description')} placeholder="Ej: Comisión por ventas" />
                        </div>
                        <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4"/> Agregar Novedad</Button>
                     </form>
                 </div>
                {/* Summary and List */}
                <div className="space-y-4">
                    <h3 className="font-semibold">Resumen de Pago</h3>
                    <div className="p-4 border rounded-md space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Salario Base:</span> <span>${selectedPayroll?.baseSalary.toLocaleString('es-CO')}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Horas (Trab./Contrat.):</span> <span>{selectedPayroll?.workedHours.toFixed(1)} / {selectedPayroll?.contractedHours}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Total Bonificaciones:</span> <span className="text-green-600">+ ${selectedPayroll?.totalBonuses.toLocaleString('es-CO')}</span></div>
                        <Separator/>
                        <div className="flex justify-between font-semibold"><span className="text-muted-foreground">Subtotal:</span> <span>${((selectedPayroll?.baseSalary ?? 0) + (selectedPayroll?.totalBonuses ?? 0)).toLocaleString('es-CO')}</span></div>
                        <Separator/>
                        <div className="flex justify-between"><span className="text-muted-foreground">Deducciones de Ley:</span> <span className="text-red-600">- ${totalLegalDeductions.toLocaleString('es-CO')}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Otras Deducciones:</span> <span className="text-red-600">- ${selectedPayroll?.totalDeductions.toLocaleString('es-CO')}</span></div>
                        <Separator/>
                        <div className="flex justify-between font-bold text-base"><span >Salario Neto a Pagar:</span> <span>${selectedPayroll?.netPay.toLocaleString('es-CO')}</span></div>
                    </div>
                    
                    <h4 className="font-semibold">Novedades Manuales Registradas</h4>
                    <div className="space-y-2">
                       {selectedPayroll?.bonuses?.map(n => (
                           <div key={n.id} className="flex justify-between items-center p-2 border rounded-md text-sm">
                               <div><p>{n.description}</p><p className="text-green-600 font-medium">+ ${n.amount.toLocaleString('es-CO')}</p></div>
                               <Button size="icon" variant="ghost" onClick={() => handleRemoveNovelty(n.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                           </div>
                       ))}
                        {selectedPayroll?.deductions?.map(n => (
                           <div key={n.id} className="flex justify-between items-center p-2 border rounded-md text-sm">
                               <div><p>{n.description}</p><p className="text-red-600 font-medium">- ${n.amount.toLocaleString('es-CO')}</p></div>
                               <Button size="icon" variant="ghost" onClick={() => handleRemoveNovelty(n.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                           </div>
                       ))}
                       {selectedPayroll?.bonuses?.length === 0 && selectedPayroll?.deductions?.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-2">No hay novedades manuales.</p>
                       )}
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
    </>
  );
});
PayrollClient.displayName = 'PayrollClient';

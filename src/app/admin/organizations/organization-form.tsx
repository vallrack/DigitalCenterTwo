// /src/app/admin/organizations/organization-form.tsx
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Globe } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Organization } from '@/lib/types';
import { addOrganization, updateOrganization } from '@/services/organization-service';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  taxId: z.string().optional(),
  planType: z.string().optional(),
  contractStartDate: z.date().optional(),
  contractEndDate: z.date().optional(),
  contractStatus: z.enum(['Active', 'OnTrial', 'Expired', 'Cancelled', 'Pending']).optional(),
  subscriptionEnds: z.date({
    required_error: "Se requiere una fecha de vencimiento.",
  }),
  modules: z.object({
    hr: z.boolean().default(false),
    academics: z.boolean().default(false),
    finance: z.boolean().default(false),
    students: z.boolean().default(false),
    inventory: z.boolean().default(false),
    sales: z.boolean().default(false),
    reports: z.boolean().default(false),
    landingPage: z.boolean().default(false),
    communications: z.boolean().default(false),
  }),
});

type OrganizationFormValues = z.infer<typeof formSchema>;

interface OrganizationFormProps {
  organization?: Organization | null;
  onSuccess: () => void;
}

const moduleLabels: { id: keyof Organization['modules']; label: string }[] = [
    { id: 'hr', label: 'Recursos Humanos' },
    { id: 'academics', label: 'Gestión Académica' },
    { id: 'finance', label: 'Finanzas' },
    { id: 'students', label: 'Estudiantes' },
    { id: 'inventory', label: 'Inventario' },
    { id: 'sales', label: 'Ventas (POS)' },
    { id: 'reports', label: 'Reportes y Analíticas' },
    { id: 'communications', label: 'Comunicaciones' },
];

// Helper function to safely parse dates
const parseDateString = (dateString: string | undefined | null): Date | undefined => {
  if (!dateString || dateString === 'N/A') return undefined;
  const date = new Date(dateString);
  return isValid(date) ? date : undefined;
};

export function OrganizationForm({ organization, onSuccess }: OrganizationFormProps) {
  const { toast } = useToast();
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organization?.name || '',
      taxId: organization?.taxId || '',
      planType: organization?.planType || '',
      contractStartDate: parseDateString(organization?.contractStartDate),
      contractEndDate: parseDateString(organization?.contractEndDate),
      contractStatus: organization?.contractStatus || 'Active',
      subscriptionEnds: parseDateString(organization?.subscriptionEnds) || new Date(),
      modules: {
        hr: organization?.modules?.hr || false,
        academics: organization?.modules?.academics || false,
        finance: organization?.modules?.finance || false,
        students: organization?.modules?.students || false,
        inventory: organization?.modules?.inventory || false,
        sales: organization?.modules?.sales || false,
        reports: organization?.modules?.reports || false,
        landingPage: organization?.modules?.landingPage || false,
        communications: organization?.modules?.communications || false,
      },
    },
  });

  const onSubmit = async (data: OrganizationFormValues) => {
    try {
      const organizationData = {
          ...data,
          subscriptionEnds: format(data.subscriptionEnds, 'yyyy-MM-dd'),
          contractStartDate: data.contractStartDate ? format(data.contractStartDate, 'yyyy-MM-dd') : undefined,
          contractEndDate: data.contractEndDate ? format(data.contractEndDate, 'yyyy-MM-dd') : undefined,
      };

      if (organization) {
        await updateOrganization(organization.id, organizationData);
        toast({ title: 'Éxito', description: 'Cliente actualizado correctamente.' });
      } else {
        await addOrganization(organizationData);
        toast({ title: 'Éxito', description: 'Cliente creado correctamente.' });
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving organization:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el cliente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4 border p-4 rounded-md">
            <h4 className="font-medium text-sm">Información del Cliente</h4>
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nombre del Cliente / Razón Social</FormLabel><FormControl><Input placeholder="Ej: Academia Innovate" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="taxId" render={({ field }) => (
                    <FormItem><FormLabel>Identificación Fiscal</FormLabel><FormControl><Input placeholder="Ej: 3-101-123456" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="planType" render={({ field }) => (
                    <FormItem><FormLabel>Plan Contratado</FormLabel><FormControl><Input placeholder="Ej: Plan Profesional" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <FormField control={form.control} name="contractStartDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Inicio del Contrato</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "PPP")) : (<span>Seleccione una fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent></Popover><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="contractEndDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Fin del Contrato</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "PPP")) : (<span>Seleccione una fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent></Popover><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="contractStatus" render={({ field }) => (
                    <FormItem><FormLabel>Estado del Contrato</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Active">Activo</SelectItem>
                                <SelectItem value="OnTrial">En Prueba</SelectItem>
                                <SelectItem value="Expired">Vencido</SelectItem>
                                <SelectItem value="Cancelled">Cancelado</SelectItem>
                                <SelectItem value="Pending">Pendiente (desde Registro)</SelectItem>
                            </SelectContent>
                        </Select>
                    <FormMessage />
                    </FormItem>
                )}/>
            </div>
        </div>
        
        <div className="space-y-4 border p-4 rounded-md">
            <h4 className="font-medium text-sm">Suscripción y Módulos</h4>
            <FormField control={form.control} name="subscriptionEnds" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Vencimiento de la Suscripción</FormLabel>
                <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value && isValid(field.value) ? (format(field.value, "PPP")) : (<span>Seleccione una fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus/></PopoverContent></Popover><FormMessage />
                </FormItem>
            )}/>
            <FormItem>
                <div className="mb-4">
                    <FormLabel>Módulos del Sistema</FormLabel>
                    <FormDescription>Seleccione los módulos que estarán disponibles para este cliente.</FormDescription>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {moduleLabels.map((item) => (
                        <FormField key={item.id} control={form.control} name={`modules.${item.id}`} render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                            <div className="space-y-1 leading-none"><FormLabel>{item.label}</FormLabel></div>
                        </FormItem>
                        )}/>
                    ))}
                </div>
                <FormMessage />
            </FormItem>
            <Separator />
            <FormItem>
                <div className="mb-4">
                    <FormLabel className="flex items-center gap-2"><Globe /> Módulos Adicionales</FormLabel>
                    <FormDescription>Active funcionalidades extra para este cliente.</FormDescription>
                </div>
                 <FormField control={form.control} name={`modules.landingPage`} render={({ field }) => (
                 <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div className="space-y-1 leading-none"><FormLabel>Página Pública Personalizable</FormLabel>
                     <FormDescription>Permite al cliente tener una página de inicio pública en /o/[id].</FormDescription>
                    </div>
                 </FormItem>
                )}/>
            </FormItem>
        </div>
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </form>
    </Form>
  );
}

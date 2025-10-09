// /src/app/customers/customer-form.tsx
"use client";

import { memo, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import type { Customer, CustomerType, IdentificationType, CompanySize } from '@/lib/types';
import { addCustomer, updateCustomer } from '@/services/customer-service';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { validateNit } from '@/lib/utils';
import { departments } from '@/lib/colombia-geo';

const identificationTypes: IdentificationType[] = ['CC', 'CE', 'NIT', 'Pasaporte'];
const customerTypes: CustomerType[] = ['Prospecto', 'Activo', 'Inactivo', 'Potencial'];
const companySizes: { id: CompanySize, label: string }[] = [
    { id: 'microempresa', label: 'Microempresa' },
    { id: 'pequeña', label: 'Pequeña' },
    { id: 'mediana', label: 'Mediana' },
    { id: 'grande', label: 'Grande' },
];

const economicActivities: { code: string, description: string }[] = [
    { code: '6201', description: 'Desarrollo de sistemas informáticos' },
    { code: '8543', description: 'Establecimientos que combinan diferentes niveles de educación' },
    { code: '4773', description: 'Comercio al por menor de productos farmacéuticos' },
    { code: '7020', description: 'Actividades de consultoría de gestión' },
];
const acquisitionChannels: string[] = ['Referido', 'Pauta Digital', 'Redes Sociales', 'Evento', 'Llamada en Frío', 'Sitio Web'];

const formSchema = z.object({
  // Basic Info
  name: z.string().min(2, 'El nombre o razón social es requerido'),
  isBusiness: z.boolean(),
  identificationType: z.enum(['CC', 'CE', 'NIT', 'Pasaporte']),
  identificationNumber: z.string().min(5, 'El número de identificación es muy corto'),
  customerType: z.enum(['Prospecto', 'Activo', 'Inactivo', 'Potencial']),
  // Segmentation Info (RF-005)
  department: z.string().optional(),
  municipality: z.string().optional(),
  economicActivity: z.string().optional(),
  companySize: z.enum(['microempresa', 'pequeña', 'mediana', 'grande']).optional(),
  acquisitionChannel: z.string().optional(),
})
.refine(data => {
    if (data.isBusiness && data.identificationType === 'NIT') {
        return validateNit(data.identificationNumber);
    }
    return true;
}, {
    message: 'El NIT no es válido. Verifique el número y el dígito de verificación.',
    path: ['identificationNumber'],
});


type CustomerFormValues = z.infer<typeof formSchema>;

interface CustomerFormProps {
  customer?: Customer | null;
  onSuccess: () => void;
}

const CustomerFormComponent = ({ customer, onSuccess }: CustomerFormProps) => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: customer?.name || '',
      isBusiness: customer?.isBusiness || false,
      identificationType: customer?.identificationType || 'CC',
      identificationNumber: customer?.identificationNumber || '',
      customerType: customer?.customerType || 'Prospecto',
      department: customer?.department || '',
      municipality: customer?.municipality || '',
      economicActivity: customer?.economicActivity || '',
      companySize: customer?.companySize || undefined,
      acquisitionChannel: customer?.acquisitionChannel || '',
    },
  });
  
  const selectedDepartment = useWatch({
    control: form.control,
    name: 'department',
  });

  useEffect(() => {
    if (selectedDepartment) {
      const departmentData = departments.find(d => d.name === selectedDepartment);
      setMunicipalities(departmentData ? departmentData.municipalities : []);
      // Si el municipio guardado no pertenece al nuevo departamento, lo reseteamos.
      if (customer?.department !== selectedDepartment) {
         form.setValue('municipality', '');
      }
    } else {
      setMunicipalities([]);
    }
  }, [selectedDepartment, form, customer]);
  
  // Set initial municipalities on form load if a department is already selected
  useEffect(() => {
    if (customer?.department) {
       const departmentData = departments.find(d => d.name === customer.department);
       if (departmentData) {
           setMunicipalities(departmentData.municipalities);
       }
    }
  }, [customer]);


  const onSubmit = async (data: CustomerFormValues) => {
    if (!userProfile) return;
    try {
      if (customer) {
        await updateCustomer(customer.id, data);
        toast({ title: 'Éxito', description: 'Cliente actualizado correctamente.' });
      } else {
        await addCustomer(data, userProfile);
        toast({ title: 'Éxito', description: 'Cliente agregado correctamente.' });
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el cliente.',
        variant: 'destructive',
      });
    }
  };

  const isBusiness = form.watch('isBusiness');
  const idType = form.watch('identificationType');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
         <div className="space-y-4 p-4 border rounded-md">
            <h4 className="font-medium text-sm">Información Básica</h4>
            <FormField
              control={form.control}
              name="isBusiness"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Cliente</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value === 'true')}
                      defaultValue={String(field.value)}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl><RadioGroupItem value="false" /></FormControl>
                        <FormLabel className="font-normal">Persona Natural</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl><RadioGroupItem value="true" /></FormControl>
                        <FormLabel className="font-normal">Persona Jurídica</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nombre Completo / Razón Social</FormLabel><FormControl><Input placeholder="Ej: Juan Pérez o Empresa SAS" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="identificationType" render={({ field }) => (
                    <FormItem><FormLabel>Tipo de Identificación</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{identificationTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="identificationNumber" render={({ field }) => (
                    <FormItem><FormLabel>Número de Identificación</FormLabel><FormControl><Input placeholder={isBusiness && idType === 'NIT' ? "Ej: 900123456-1" : "Sin puntos ni guiones"} {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <FormField control={form.control} name="customerType" render={({ field }) => (
                <FormItem><FormLabel>Estado del Cliente</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{customerTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )}/>
        </div>

        <div className="space-y-4 p-4 border rounded-md">
            <h4 className="font-medium text-sm">Información de Segmentación (RF-005)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <FormField control={form.control} name="department" render={({ field }) => (
                  <FormItem><FormLabel>Departamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione un departamento..." /></SelectTrigger></FormControl><SelectContent>{departments.map(dep => <SelectItem key={dep.id} value={dep.name}>{dep.name}</SelectItem>)}</SelectContent></Select>
                  <FormMessage /></FormItem>
               )}/>
               <FormField control={form.control} name="municipality" render={({ field }) => (
                  <FormItem><FormLabel>Municipio / Ciudad</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDepartment}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione un municipio..." /></SelectTrigger></FormControl><SelectContent>{municipalities.map(mun => <SelectItem key={mun} value={mun}>{mun}</SelectItem>)}</SelectContent></Select>
                  <FormMessage /></FormItem>
               )}/>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormField control={form.control} name="companySize" render={({ field }) => (
                    <FormItem><FormLabel>Tamaño de Empresa</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione un tamaño..." /></SelectTrigger></FormControl><SelectContent>{companySizes.map(size => <SelectItem key={size.id} value={size.id}>{size.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="acquisitionChannel" render={({ field }) => (
                  <FormItem><FormLabel>Canal de Adquisición</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione un canal..." /></SelectTrigger></FormControl><SelectContent>{acquisitionChannels.map(channel => <SelectItem key={channel} value={channel}>{channel}</SelectItem>)}</SelectContent></Select>
                  <FormMessage /></FormItem>
               )}/>
            </div>
             <FormField control={form.control} name="economicActivity" render={({ field }) => (
                <FormItem><FormLabel>Actividad Económica (CIIU)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione una actividad..." /></SelectTrigger></FormControl><SelectContent>{economicActivities.map(act => <SelectItem key={act.code} value={act.code}>{act.code} - {act.description}</SelectItem>)}</SelectContent></Select>
                <FormDescription>Código CIIU principal</FormDescription><FormMessage /></FormItem>
            )}/>
        </div>
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </form>
    </Form>
  );
}

export const CustomerForm = memo(CustomerFormComponent);

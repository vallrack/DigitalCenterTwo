// /src/app/admin/users/user-new-form.tsx
"use client";

import { useForm, useWatch } from 'react-hook-form';
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
import type { UserProfile, Organization, UserRole } from '@/lib/types';
import { createUser } from '@/services/user-service';
import { banks, epsList, arlList } from '@/lib/colombia-data';
import { Separator } from '@/components/ui/separator';

// Base schema without the 'role' field to avoid duplication
const baseSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  organizationId: z.string().min(1, "Debe seleccionar una organización."),
});

const employeeFieldsSchema = z.object({
  position: z.string().min(2, "El cargo es requerido"),
  salary: z.coerce.number().min(0, 'El salario no puede ser negativo').optional(),
  contractedHours: z.coerce.number().min(1, 'Las horas deben ser positivas').optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  eps: z.string().optional(),
  arl: z.string().optional(),
});

// Discriminated union where each object defines its own literal 'role'
const formSchema = z.discriminatedUnion("role", [
  z.object({ role: z.literal("SuperAdmin") }).merge(baseSchema),
  z.object({ role: z.literal("Admin") }).merge(baseSchema),
  z.object({ role: z.literal("EnEspera") }).merge(baseSchema),
  z.object({ role: z.literal("Estudiante") }).merge(baseSchema),
  z.object({ role: z.literal("Empleado") }).merge(baseSchema).merge(employeeFieldsSchema),
  z.object({ role: z.literal("Academico") }).merge(baseSchema).merge(employeeFieldsSchema),
  z.object({ role: z.literal("RRHH") }).merge(baseSchema).merge(employeeFieldsSchema),
  z.object({ role: z.literal("Finanzas") }).merge(baseSchema).merge(employeeFieldsSchema),
]);


type UserFormValues = z.infer<typeof formSchema>;

interface UserNewFormProps {
  organizations: Organization[];
  onSuccess: () => void;
}

const allUserRoles: UserRole[] = ['SuperAdmin', 'Admin', 'Academico', 'RRHH', 'Finanzas', 'Estudiante', 'Empleado', 'EnEspera'];

export function UserNewForm({ organizations, onSuccess }: UserNewFormProps) {
  const { toast } = useToast();
  const { userProfile: currentUserProfile } = useAuth();
  const isSuperAdmin = currentUserProfile?.role === 'SuperAdmin';

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'Empleado',
      organizationId: !isSuperAdmin ? currentUserProfile?.organizationId : organizations[0]?.id || '',
      // Employee fields might not exist depending on role, but safe to default
      position: '',
      salary: 0,
      contractedHours: 160,
      bankName: '',
      accountNumber: '',
      eps: '',
      arl: '',
    },
  });

  const selectedRole = useWatch({ control: form.control, name: 'role' });
  const showEmployeeFields = !['Admin', 'SuperAdmin', 'Estudiante', 'EnEspera'].includes(selectedRole);

  const onSubmit = async (data: UserFormValues) => {
    try {
      await createUser(data);
      toast({ title: 'Éxito', description: 'Usuario creado y registrado correctamente.' });
      onSuccess();
    } catch (error: any) {
      console.error('Error saving user:', error);
      if (error.code === 'auth/email-already-in-use') {
         toast({
          title: 'Error: Correo en uso',
          description: 'Este correo electrónico ya está en uso por otro usuario.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo crear el usuario. Por favor, intente de nuevo.',
          variant: 'destructive',
        });
      }
    }
  };
  
  const availableRoles = isSuperAdmin ? allUserRoles : allUserRoles.filter(r => r !== 'SuperAdmin' && r !== 'Admin');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Ana García" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input placeholder="nombre@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol en el Sistema</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="organizationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organización</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isSuperAdmin}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una organización" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {showEmployeeFields && 'position' in form.getValues() && (
            <div className="space-y-4 border p-4 rounded-md">
                <h4 className="font-medium text-sm">Información de Empleado</h4>
                <Separator />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="position" render={({ field }) => (
                        <FormItem><FormLabel>Cargo</FormLabel><FormControl><Input placeholder="Ej: Profesor" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="salary" render={({ field }) => (
                        <FormItem><FormLabel>Salario</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="contractedHours" render={({ field }) => (
                        <FormItem><FormLabel>Horas Contratadas/Mes</FormLabel><FormControl><Input type="number" placeholder="160" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="bankName" render={({ field }) => (
                        <FormItem><FormLabel>Banco</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione un banco" /></SelectTrigger></FormControl><SelectContent>{banks.map(bank => <SelectItem key={bank} value={bank}>{bank}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="accountNumber" render={({ field }) => (
                        <FormItem><FormLabel>Número de Cuenta</FormLabel><FormControl><Input placeholder="Ej: 123-456789-00" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="eps" render={({ field }) => (
                        <FormItem><FormLabel>EPS</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione una EPS" /></SelectTrigger></FormControl><SelectContent>{epsList.map(eps => <SelectItem key={eps} value={eps}>{eps}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="arl" render={({ field }) => (
                        <FormItem><FormLabel>ARL</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione una ARL" /></SelectTrigger></FormControl><SelectContent>{arlList.map(arl => <SelectItem key={arl} value={arl}>{arl}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                </div>
            </div>
        )}
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting 
            ? 'Creando...' 
            : 'Crear Usuario'}
        </Button>
      </form>
    </Form>
  );
}

// /src/app/admin/organizations/organization-customization-form.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Organization, LandingPageConfig, ThemeColors } from '@/lib/types';
import { getOrganizations, updateOrganization } from '@/services/organization-service';

const formSchema = z.object({
  selectedOrgId: z.string().min(1, 'Debe seleccionar una organización'),
  landingPageConfig: z.object({
    title: z.string().min(5, 'El título es muy corto'),
    description: z.string().min(10, 'La descripción es muy corta'),
  }),
  themeColors: z.object({
    primary: z.string(),
    background: z.string(),
    accent: z.string(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function OrganizationCustomizationForm() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedOrgId: '',
      landingPageConfig: { title: '', description: '' },
      themeColors: { primary: '240 5.9% 10%', background: '0 0% 100%', accent: '240 4.8% 95.9%' },
    },
  });

  const selectedOrgId = form.watch('selectedOrgId');
  const themeColors = form.watch('themeColors');

  const selectedOrgHasLandingPage = useMemo(() => {
    const org = organizations.find(o => o.id === selectedOrgId);
    return org?.modules.landingPage;
  }, [selectedOrgId, organizations]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const orgs = await getOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar las organizaciones.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedOrgId) {
      const org = organizations.find(o => o.id === selectedOrgId);
      if (org) {
        form.reset({
          selectedOrgId,
          landingPageConfig: org.landingPageConfig || { title: `Bienvenido a ${org.name}`, description: 'Esta es nuestra página de inicio personalizada.' },
          themeColors: org.themeColors || { primary: '240 5.9% 10%', background: '0 0% 100%', accent: '240 4.8% 95.9%' },
        });
      }
    } else {
        form.reset({
          selectedOrgId: '',
          landingPageConfig: { title: '', description: '' },
          themeColors: { primary: '240 5.9% 10%', background: '0 0% 100%', accent: '240 4.8% 95.9%' },
        });
    }
  }, [selectedOrgId, organizations, form]);

  const onSubmit = async (data: FormValues) => {
    try {
        const { selectedOrgId, ...updates } = data;
        await updateOrganization(selectedOrgId, updates);
        toast({ title: 'Éxito', description: 'La personalización ha sido guardada.' });
        // Refetch to update local state
        fetchData();
    } catch (error) {
        toast({ title: 'Error', description: 'No se pudo guardar la personalización.', variant: 'destructive' });
    }
  }
  
  const themeStyle = useMemo(() => ({
    '--primary-preview': themeColors.primary,
    '--background-preview': themeColors.background,
    '--accent-preview': themeColors.accent,
  } as React.CSSProperties), [themeColors]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalización de Marca</CardTitle>
        <CardDescription>
          Ajuste la apariencia y el contenido de la página pública para cada organización.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="selectedOrgId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organización a Personalizar</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
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
              
              {selectedOrgId && (
                <>
                  {!selectedOrgHasLandingPage && (
                    <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                      <p className="font-bold">Módulo no activo</p>
                      <p>La página pública no está activada para esta organización. Actívela en la pestaña 'Organizaciones' para que los cambios sean visibles.</p>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-8">
                      {/* Form Section */}
                      <div className="space-y-6">
                          <Card>
                              <CardHeader><CardTitle className="text-lg">Contenido de la Página</CardTitle></CardHeader>
                              <CardContent className="space-y-4">
                                  <FormField control={form.control} name="landingPageConfig.title" render={({ field }) => (
                                  <FormItem><FormLabel>Título Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                  )}/>
                                  <FormField control={form.control} name="landingPageConfig.description" render={({ field }) => (
                                  <FormItem><FormLabel>Descripción / Slogan</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                  )}/>
                              </CardContent>
                          </Card>
                          <Card>
                              <CardHeader><CardTitle className="text-lg">Colores de Marca (HSL)</CardTitle></CardHeader>
                              <CardContent className="space-y-4">
                                <FormField control={form.control} name="themeColors.primary" render={({ field }) => (
                                  <FormItem><FormLabel>Primario</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Ej: 240 5.9% 10%</FormDescription><FormMessage /></FormItem>
                                  )}/>
                                  <FormField control={form.control} name="themeColors.background" render={({ field }) => (
                                  <FormItem><FormLabel>Fondo</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Ej: 0 0% 100%</FormDescription><FormMessage /></FormItem>
                                  )}/>
                                  <FormField control={form.control} name="themeColors.accent" render={({ field }) => (
                                  <FormItem><FormLabel>Acento</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Ej: 240 4.8% 95.9%</FormDescription><FormMessage /></FormItem>
                                  )}/>
                              </CardContent>
                          </Card>
                      </div>
                      {/* Preview Section */}
                      <div>
                          <FormLabel>Vista Previa del Tema</FormLabel>
                          <div className="mt-2 rounded-lg border p-4 space-y-4" style={themeStyle}>
                              <div className="p-6 rounded-md" style={{ backgroundColor: 'hsl(var(--background-preview))' }}>
                                  <h3 className="text-xl font-bold" style={{ color: 'hsl(var(--primary-preview))' }}>
                                      {form.watch('landingPageConfig.title') || 'Título de Ejemplo'}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                      {form.watch('landingPageConfig.description') || 'Esta es una descripción de ejemplo para la vista previa.'}
                                  </p>
                              </div>
                              <div className="flex justify-between items-center p-4 rounded-md" style={{ backgroundColor: 'hsl(var(--accent-preview))' }}>
                                  <span className="text-sm" style={{ color: 'hsl(var(--primary-preview))' }}>Color de Acento</span>
                                  <Button style={{ 
                                      backgroundColor: 'hsl(var(--primary-preview))', 
                                      color: 'hsl(var(--background-preview))' 
                                  }}>
                                      Botón Principal
                                  </Button>
                              </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                              La página pública aplicará estos colores a todos sus elementos.
                          </p>
                      </div>
                  </div>
                </>
              )}
              
              <Button type="submit" disabled={!selectedOrgId || form.formState.isSubmitting}>
                Guardar Personalización
              </Button>
            </form>
         </Form>
      </CardContent>
    </Card>
  );
}

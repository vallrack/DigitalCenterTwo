// /src/app/admin/settings/settings-client.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { SystemSettings, Account } from '@/lib/types';
import { getSystemSettings, updateSystemSettings } from '@/services/settings-service';
import { getAccounts } from '@/services/accounting-service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { resetFirebaseData } from '@/ai/flows/reset-firebase-data';
import { Alert, AlertDescription as AlertDescriptionComponent, AlertTitle as AlertTitleComponent } from '@/components/ui/alert';

const settingsFormSchema = z.object({
  taxRate: z.coerce.number().min(0, 'La tasa no puede ser negativa').max(100, 'La tasa no puede ser mayor a 100'),
  accountingSector: z.enum(['comercial', 'financiero', 'salud', 'solidario']).optional(),
  defaultCashAccountId: z.string().optional(),
  defaultSalesRevenueAccountId: z.string().optional(),
  defaultTaxPayableAccountId: z.string().optional(),
  defaultInventoryAccountId: z.string().optional(),
  defaultCostOfGoodsSoldAccountId: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function SettingsClient() {
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { toast } = useToast();
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      taxRate: 0,
      accountingSector: 'comercial',
    },
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [settings, accountsData] = await Promise.all([
          getSystemSettings(),
          getAccounts(),
      ]);
      setAccounts(accountsData.filter(a => !a.isParent));
      form.reset({ 
          taxRate: settings.taxRate,
          accountingSector: settings.accountingSector || 'comercial',
          defaultCashAccountId: settings.defaultCashAccountId,
          defaultSalesRevenueAccountId: settings.defaultSalesRevenueAccountId,
          defaultTaxPayableAccountId: settings.defaultTaxPayableAccountId,
          defaultInventoryAccountId: settings.defaultInventoryAccountId,
          defaultCostOfGoodsSoldAccountId: settings.defaultCostOfGoodsSoldAccountId,
      });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar las parametrizaciones.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [form, toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      await updateSystemSettings(data);
      toast({ title: 'Éxito', description: 'Parametrizaciones guardadas correctamente.' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron guardar los cambios.', variant: 'destructive' });
    }
  };
  
  const handleResetData = async () => {
    setIsResetting(true);
    try {
        const result = await resetFirebaseData();
        toast({
            title: 'Reinicio Completado',
            description: result.message,
        });
        // Reload the page to reflect the cleared state
        window.location.reload();
    } catch (error) {
        console.error("Error resetting data:", error);
        toast({
            title: 'Error en el Reinicio',
            description: 'No se pudieron reiniciar los datos. Revise la consola para más detalles.',
            variant: 'destructive',
        });
    } finally {
        setIsResetting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Parametrizaciones Generales</CardTitle>
          <CardDescription>
            Configure los parámetros globales del sistema, como la tasa de impuestos y las cuentas contables por defecto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem className="max-w-sm">
                    <FormLabel>Tasa de Impuestos (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 19" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-4 rounded-md border p-4">
                  <h3 className="text-base font-semibold">Configuración Contable</h3>
                  <FormField
                      control={form.control}
                      name="accountingSector"
                      render={({ field }) => (
                          <FormItem className="max-w-sm">
                          <FormLabel>Sector Contable (PUC)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Seleccione un sector" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="comercial">Comercial (PUC General)</SelectItem>
                                  <SelectItem value="financiero" disabled>Sector Financiero (Próximamente)</SelectItem>
                                  <SelectItem value="salud" disabled>Sector Salud (Próximamente)</SelectItem>
                                  <SelectItem value="solidario" disabled>Sector Solidario (Próximamente)</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormDescription>
                              Seleccione el plan de cuentas que se ajuste a su industria.
                          </FormDescription>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
              </div>
              
              <div className="space-y-4 rounded-md border p-4">
                  <h3 className="text-base font-semibold">Cuentas Contables por Defecto</h3>
                  <p className="text-sm text-muted-foreground">
                      Seleccione las cuentas que se usarán para generar los asientos contables automáticos de ventas.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="defaultCashAccountId" render={({ field }) => (
                          <FormItem><FormLabel>Caja/Banco (Activo)</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione una cuenta" /></SelectTrigger></FormControl><SelectContent>{accounts.filter(a => a.type === 'Activo').map(a => <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name="defaultSalesRevenueAccountId" render={({ field }) => (
                          <FormItem><FormLabel>Ingresos por Ventas (Ingreso)</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione una cuenta" /></SelectTrigger></FormControl><SelectContent>{accounts.filter(a => a.type === 'Ingreso').map(a => <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name="defaultTaxPayableAccountId" render={({ field }) => (
                          <FormItem><FormLabel>Impuestos por Pagar (Pasivo)</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione una cuenta" /></SelectTrigger></FormControl><SelectContent>{accounts.filter(a => a.type === 'Pasivo').map(a => <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name="defaultInventoryAccountId" render={({ field }) => (
                          <FormItem><FormLabel>Inventario (Activo)</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione una cuenta" /></SelectTrigger></FormControl><SelectContent>{accounts.filter(a => a.type === 'Activo').map(a => <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name="defaultCostOfGoodsSoldAccountId" render={({ field }) => (
                          <FormItem><FormLabel>Costo de Mercancía Vendida (Gasto)</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione una cuenta" /></SelectTrigger></FormControl><SelectContent>{accounts.filter(a => a.type === 'Gasto').map(a => <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                      )}/>
                  </div>
              </div>

              <Button type="submit" disabled={form.formState.isSubmitting || loading}>
                {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Zona de Peligro</CardTitle>
          <CardDescription>
            Las acciones en esta sección son irreversibles y pueden causar la pérdida permanente de datos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Reiniciar Datos de la Aplicación</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente TODOS los datos de la aplicación, incluyendo organizaciones, usuarios, clientes, ventas, etc. La única cuenta que se conservará será la del SuperAdmin (`vallrack67@gmail.com`). Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetData} disabled={isResetting}>
                  {isResetting ? 'Reiniciando...' : 'Sí, entiendo las consecuencias, reiniciar todo'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
           <Alert variant="destructive" className="mt-4 max-w-2xl">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitleComponent>¡Advertencia!</AlertTitleComponent>
              <AlertDescriptionComponent>
                Esta función está diseñada para entornos de prueba y desarrollo. Usarla en producción borrará todos los datos de sus clientes.
              </AlertDescriptionComponent>
            </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

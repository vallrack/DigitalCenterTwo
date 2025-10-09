// /src/app/admin/prospects/prospects-client.tsx
"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import { addDays } from 'date-fns';
import { Mail, Building, SlidersHorizontal, Package, UserCheck, Loader2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, Organization } from '@/lib/types';
import { getUsers, approveProspect } from '@/services/user-service';
import { getOrganizations } from '@/services/organization-service';
import { Separator } from '@/components/ui/separator';

const moduleLabels: { id: keyof Organization['modules']; label: string }[] = [
    { id: 'hr', label: 'Recursos Humanos' },
    { id: 'academics', label: 'Gestión Académica' },
    { id: 'finance', label: 'Finanzas' },
    { id: 'students', label: 'Estudiantes' },
    { id: 'inventory', label: 'Inventario' },
    { id: 'sales', label: 'Ventas (POS)' },
    { id: 'reports', label: 'Reportes y Analíticas' },
    { id: 'communications', label: 'Comunicaciones' },
    { id: 'landingPage', label: 'Página Pública' },
];

export const ProspectsClient = memo(() => {
  const [prospects, setProspects] = useState<UserProfile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState<UserProfile | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prospectsData, orgsData] = await Promise.all([
        getUsers('EnEspera'),
        getOrganizations()
      ]);
      setProspects(prospectsData);
      setOrganizations(orgsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los prospectos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleManage = useCallback((prospect: UserProfile) => {
    setSelectedProspect(prospect);
    setIsSheetOpen(true);
  }, []);
  
  const handleApprove = async () => {
    if (!selectedProspect || !selectedProspect.organizationId) return;
    setIsApproving(true);
    try {
      const trialEndDate = addDays(new Date(), 15);
      const organization = getOrganizationForProspect(selectedProspect.organizationId);
      if (!organization) throw new Error("Organización del prospecto no encontrada.");

      await approveProspect(
        selectedProspect.uid, 
        organization.id, 
        organization.name, 
        trialEndDate
      );

      toast({
        title: '¡Prospecto Aprobado!',
        description: `${selectedProspect.name} ahora es un cliente activo con una prueba de 15 días.`
      });
      setIsSheetOpen(false);
      fetchData(); // Refresh the list
    } catch (error) {
       toast({ title: 'Error', description: 'No se pudo aprobar al prospecto.', variant: 'destructive' });
    } finally {
      setIsApproving(false);
    }
  };

  const getOrganizationForProspect = (orgId?: string): Organization | undefined => {
      if (!orgId) return undefined;
      return organizations.find(o => o.id === orgId);
  }

  const selectedOrg = getOrganizationForProspect(selectedProspect?.organizationId);
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Prospectos Pendientes de Aprobación</CardTitle>
          <CardDescription>
            Usuarios que han solicitado una prueba y esperan la activación de su cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {loading ? (
             <p className="text-center text-muted-foreground">Cargando prospectos...</p>
           ) : prospects.length === 0 ? (
             <p className="text-center text-muted-foreground">No hay prospectos pendientes.</p>
           ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {prospects.map((prospect) => {
                const organization = getOrganizationForProspect(prospect.organizationId);
                return (
                  <Card key={prospect.uid}>
                    <CardHeader>
                      <CardTitle>{organization?.name || 'Organización Desconocida'}</CardTitle>
                      <CardDescription>Contacto: {prospect.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{prospect.email}</p>
                    </CardContent>
                    <CardFooter>
                       <Button onClick={() => handleManage(prospect)} className="w-full">
                          <SlidersHorizontal className="mr-2 h-4 w-4"/>
                          Gestionar
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
           )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg">
            <SheetHeader>
                <SheetTitle>Gestionar Prospecto</SheetTitle>
                <SheetDescription>
                    Revise la solicitud y active la cuenta de prueba para este nuevo cliente.
                </SheetDescription>
            </SheetHeader>
            {selectedProspect && selectedOrg && (
                <div className="py-4 space-y-6">
                    <div className="space-y-1">
                        <h4 className="font-medium">Información del Contacto</h4>
                        <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground"/>{selectedProspect.email}</div>
                    </div>
                     <div className="space-y-1">
                        <h4 className="font-medium">Organización</h4>
                        <div className="flex items-center gap-2 text-sm"><Building className="h-4 w-4 text-muted-foreground"/>{selectedOrg.name}</div>
                    </div>

                    <Separator />

                     <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2"><Package className="h-4 w-4"/> Módulos Solicitados</h4>
                        <div className="flex flex-wrap gap-2">
                        {moduleLabels.map(module => (
                            selectedOrg.modules[module.id] && (
                                <Badge key={module.id} variant="secondary">{module.label}</Badge>
                            )
                        ))}
                        </div>
                    </div>
                </div>
            )}
             <SheetFooter>
                <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancelar</Button>
                <Button onClick={handleApprove} disabled={isApproving}>
                    {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    <UserCheck className="mr-2 h-4 w-4"/>
                    Aprobar y Activar Prueba de 15 Días
                </Button>
            </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
});

ProspectsClient.displayName = 'ProspectsClient';

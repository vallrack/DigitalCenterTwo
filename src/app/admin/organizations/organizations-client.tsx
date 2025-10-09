// /src/app/admin/organizations/organizations-client.tsx
"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { format, isValid } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { Organization, UserProfile } from '@/lib/types';
import { getOrganizations, deleteOrganization } from '@/services/organization-service';
import { getUsers } from '@/services/user-service';
import { OrganizationForm } from './organization-form';
import { Badge } from '@/components/ui/badge';

export const OrganizationsClient = memo(() => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [orgsData, usersData] = await Promise.all([
        getOrganizations(),
        getUsers()
      ]);
      setOrganizations(orgsData);
      setUsers(usersData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback((org: Organization) => {
    setSelectedOrg(org);
    setIsFormOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedOrg(null);
    setIsFormOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!orgToDelete) return;
    try {
      await deleteOrganization(orgToDelete);
      toast({ title: 'Éxito', description: 'Cliente eliminado correctamente.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el cliente.', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setOrgToDelete(null);
    }
  }, [orgToDelete, toast, fetchData]);

  const openDeleteDialog = useCallback((orgId: string) => {
    setOrgToDelete(orgId);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    fetchData();
  }, [fetchData]);
  
  const getBadgeVariant = (status?: 'Active' | 'OnTrial' | 'Expired' | 'Cancelled' | 'Pending') => {
    switch(status) {
        case 'Active': return 'success';
        case 'OnTrial': return 'warning';
        case 'Expired': return 'secondary';
        case 'Cancelled': return 'destructive';
        case 'Pending': return 'outline';
        default: return 'outline';
    }
  }
  
  const getAdminForOrg = (orgId: string) => {
    const adminUser = users.find(u => u.organizationId === orgId && u.role === 'Admin');
    return adminUser?.name || 'N/A';
  }

  const formatDate = (dateString: string) => {
    if (dateString === 'N/A') return 'N/A';
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'dd/MM/yyyy') : 'N/A';
  };


  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <CardTitle>Clientes (Organizaciones)</CardTitle>
            <CardDescription>
              Gestione los clientes y las organizaciones que utilizan la plataforma.
            </CardDescription>
          </div>
          <Button onClick={handleAddNew} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Cliente
          </Button>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre / Razón Social</TableHead>
                  <TableHead>Usuario Admin Principal</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado Contrato</TableHead>
                  <TableHead>Suscripción Vence</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center">Cargando...</TableCell></TableRow>
                ) : organizations.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center">No se encontraron clientes.</TableCell></TableRow>
                ) : (
                  organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell>{getAdminForOrg(org.id)}</TableCell>
                      <TableCell>{org.planType || 'N/A'}</TableCell>
                      <TableCell><Badge variant={getBadgeVariant(org.contractStatus)}>{org.contractStatus || 'N/A'}</Badge></TableCell>
                      <TableCell>{formatDate(org.subscriptionEnds)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Menú</span></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(org)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(org.id)} className="text-red-600">Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-4 md:hidden">
            {loading ? (
              <p className="text-center text-muted-foreground">Cargando...</p>
            ) : organizations.length === 0 ? (
              <p className="text-center text-muted-foreground">No se encontraron clientes.</p>
            ) : (
              organizations.map((org) => (
                <Card key={org.id}>
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{org.name}</CardTitle>
                        <CardDescription>Admin: {getAdminForOrg(org.id)}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 -mt-2 -mr-2"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Menú</span></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                           <DropdownMenuItem onClick={() => handleEdit(org)}>Editar</DropdownMenuItem>
                           <DropdownMenuItem onClick={() => openDeleteDialog(org.id)} className="text-red-600">Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Plan:</span>
                      <span>{org.planType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Vence:</span>
                      <span>{formatDate(org.subscriptionEnds)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Contrato:</span>
                      <Badge variant={getBadgeVariant(org.contractStatus)}>{org.contractStatus || 'N/A'}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedOrg ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</DialogTitle>
          </DialogHeader>
          <OrganizationForm organization={selectedOrg} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Eliminará permanentemente al cliente y todos sus datos asociados.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
OrganizationsClient.displayName = 'OrganizationsClient';

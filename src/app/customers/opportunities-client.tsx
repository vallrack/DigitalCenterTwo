// /src/app/customers/opportunities-client.tsx
"use client";

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { MoreHorizontal } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

import type { Opportunity, OpportunityStatus, UserProfile, Customer } from '@/lib/types';
import { getAllOpportunities, deleteOpportunity } from '@/services/opportunity-service';
import { getCustomers } from '@/services/customer-service';
import { getUsers } from '@/services/user-service';
import { OpportunityForm } from './opportunity-form';

const opportunityStatuses: OpportunityStatus[] = ['Calificación', 'Propuesta', 'Negociación', 'Ganada', 'Perdida'];

export const OpportunitiesClient = memo(() => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState<Opportunity | null>(null);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const salesUsers = useMemo(() => users.filter(u => ['Ventas', 'Admin', 'SuperAdmin'].includes(u.role)), [users]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [oppsData, usersData, customersData] = await Promise.all([
        getAllOpportunities(),
        getUsers(),
        getCustomers(),
      ]);
      setOpportunities(oppsData);
      setUsers(usersData);
      setCustomers(customersData);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar los datos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback((opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsFormOpen(true);
  }, []);

  const openDeleteDialog = useCallback((opportunity: Opportunity) => {
    setOpportunityToDelete(opportunity);
    setIsDeleteDialogOpen(true);
  }, []);
  
  const handleDeleteConfirm = useCallback(async () => {
    if (!opportunityToDelete) return;
    try {
      await deleteOpportunity(opportunityToDelete.id);
      toast({ title: 'Éxito', description: 'Oportunidad eliminada.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar la oportunidad.', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setOpportunityToDelete(null);
    }
  }, [opportunityToDelete, toast, fetchData]);


  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    fetchData();
  }, [fetchData]);
  
  const getStatusVariant = (status: Opportunity['status']) => {
    switch(status) {
      case 'Ganada': return 'success';
      case 'Perdida': return 'destructive';
      case 'Propuesta':
      case 'Negociación': return 'default';
      case 'Calificación':
      default: return 'secondary';
    }
  }

  const renderTable = (filteredOpportunities: Opportunity[]) => (
     <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre Oportunidad</TableHead>
          <TableHead>Cliente Asociado</TableHead>
          <TableHead>Responsable</TableHead>
          <TableHead className="text-right">Valor Estimado</TableHead>
          <TableHead className="text-center">Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow><TableCell colSpan={6} className="text-center">Cargando...</TableCell></TableRow>
        ) : filteredOpportunities.length === 0 ? (
          <TableRow><TableCell colSpan={6} className="text-center">No se encontraron oportunidades.</TableCell></TableRow>
        ) : (
          filteredOpportunities.map((opp) => (
            <TableRow key={opp.id}>
              <TableCell className="font-medium">{opp.name}</TableCell>
              <TableCell>{opp.customerName}</TableCell>
              <TableCell>{opp.assignedToName}</TableCell>
              <TableCell className="text-right">${opp.estimatedValue.toLocaleString('es-CO')}</TableCell>
              <TableCell className="text-center"><Badge variant={getStatusVariant(opp.status)}>{opp.status}</Badge></TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEdit(opp)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openDeleteDialog(opp)} className="text-red-600">Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pipeline de Oportunidades</CardTitle>
          <CardDescription>
            Vista global de todas las oportunidades de venta en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              {opportunityStatuses.map(status => (
                 <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all">
              {renderTable(opportunities)}
            </TabsContent>
            {opportunityStatuses.map(status => (
              <TabsContent key={status} value={status}>
                {renderTable(opportunities.filter(o => o.status === status))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Oportunidad</DialogTitle>
            <DialogDescription>Actualice los detalles de la oportunidad de venta.</DialogDescription>
          </DialogHeader>
          {userProfile && selectedOpportunity && (
            <OpportunityForm
              customer={customers.find(c => c.id === selectedOpportunity.customerId)!}
              currentUser={userProfile}
              salesUsers={salesUsers}
              opportunity={selectedOpportunity}
              onSuccess={handleFormSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la oportunidad permanentemente.
            </AlertDialogDescription>
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

OpportunitiesClient.displayName = 'OpportunitiesClient';

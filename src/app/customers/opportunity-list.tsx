// /src/app/customers/opportunity-list.tsx
"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import { PlusCircle, MoreHorizontal } from 'lucide-react';

import type { Opportunity, Customer, UserProfile } from '@/lib/types';
import { getOpportunitiesByCustomer, deleteOpportunity } from '@/services/opportunity-service';
import { getUsers } from '@/services/user-service';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { OpportunityForm } from './opportunity-form';

interface OpportunityListProps {
  customer: Customer;
}

const OpportunityListComponent = ({ customer }: OpportunityListProps) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [salesUsers, setSalesUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [opportunityToDelete, setOpportunityToDelete] = useState<Opportunity | null>(null);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [opps, allUsers] = await Promise.all([
        getOpportunitiesByCustomer(customer.id),
        getUsers()
      ]);
      setOpportunities(opps);
      setSalesUsers(allUsers.filter(u => ['Ventas', 'Admin', 'SuperAdmin'].includes(u.role)));
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar las oportunidades.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [customer.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleAddNew = () => {
    setSelectedOpportunity(null);
    setIsFormOpen(true);
  }

  const handleEdit = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsFormOpen(true);
  }

  const openDeleteDialog = (opportunity: Opportunity) => {
    setOpportunityToDelete(opportunity);
    setIsDeleteDialogOpen(true);
  }
  
  const handleDeleteConfirm = async () => {
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
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedOpportunity(null);
    fetchData();
  };

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

  return (
    <div className="py-4 flex flex-col flex-1">
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Oportunidad
        </Button>
      </div>
      <div className="border rounded-md flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="text-right">Valor Estimado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Cargando oportunidades...</TableCell>
              </TableRow>
            ) : opportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">No hay oportunidades para este cliente.</TableCell>
              </TableRow>
            ) : (
              opportunities.map((opp) => (
                <TableRow key={opp.id}>
                  <TableCell className="font-medium">{opp.name}</TableCell>
                  <TableCell><Badge variant={getStatusVariant(opp.status)}>{opp.status}</Badge></TableCell>
                  <TableCell>{opp.assignedToName}</TableCell>
                  <TableCell className="text-right">${opp.estimatedValue.toLocaleString('es-CO')}</TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
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
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedOpportunity ? 'Editar Oportunidad' : `Nueva Oportunidad para ${customer.name}`}</DialogTitle>
            <DialogDescription>
              {selectedOpportunity ? 'Actualice los detalles de esta oportunidad.' : 'Registre una nueva oportunidad de venta o negocio.'}
            </DialogDescription>
          </DialogHeader>
          {userProfile && (
            <OpportunityForm
              customer={customer}
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
    </div>
  );
};

export const OpportunityList = memo(OpportunityListComponent);

// /src/app/customers/customers-client.tsx
"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import { MoreHorizontal, PlusCircle, Briefcase, User, MessageSquare } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription as AlertDialogDescriptionComponent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

import type { Customer, UserProfile } from '@/lib/types';
import { getCustomers, deleteCustomer } from '@/services/customer-service';
import { CustomerForm } from './customer-form';
import { OpportunityList } from './opportunity-list';
import { InteractionList } from './interaction-list';

const companySizeLabels: Record<string, string> = {
  microempresa: 'Microempresa',
  pequeña: 'Pequeña',
  mediana: 'Mediana',
  grande: 'Grande',
};


export const CustomersClient = memo(() => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  const fetchCustomers = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const data = await getCustomers(userProfile);
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los clientes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, userProfile]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleEdit = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  }, []);

  const handleViewDetails = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  }, []);
  
  const handleDeleteConfirm = useCallback(async () => {
    if (!customerToDelete) return;
    try {
      await deleteCustomer(customerToDelete);
      toast({
        title: 'Éxito',
        description: 'Cliente eliminado correctamente.',
      });
      fetchCustomers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el cliente.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  }, [customerToDelete, toast, fetchCustomers]);

  const openDeleteDialog = useCallback((customerId: string) => {
    setCustomerToDelete(customerId);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <CardTitle>Clientes</CardTitle>
              <CardDescription>
                Gestione sus prospectos y clientes activos.
              </CardDescription>
            </div>
            <Button onClick={handleAddNew} className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Cliente
            </Button>
        </CardHeader>
        <CardContent>
            {/* Desktop View */}
            <div className="hidden md:block">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nombre / Razón Social</TableHead>
                    <TableHead>Identificación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Segmentación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>
                    ) : customers.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center">No se encontraron clientes.</TableCell></TableRow>
                    ) : (
                    customers.map((customer) => (
                        <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.identificationType}: {customer.identificationNumber}</TableCell>
                        <TableCell><Badge>{customer.customerType}</Badge></TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                            {customer.department && <Badge variant="outline">{customer.department}</Badge>}
                            {customer.companySize && <Badge variant="secondary">{companySizeLabels[customer.companySize]}</Badge>}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(customer)}>
                                <User className="mr-2 h-4 w-4" />
                                Ver Ficha
                            </Button>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 ml-2">
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEdit(customer)}>Editar Cliente</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openDeleteDialog(customer.id)} className="text-red-600">Eliminar Cliente</DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))
                    )}
                </TableBody>
                </Table>
            </div>
            {/* Mobile View */}
            <div className="grid gap-4 md:hidden">
                {loading ? (
                    <p className="text-center text-muted-foreground">Cargando...</p>
                ) : customers.length === 0 ? (
                    <p className="text-center text-muted-foreground">No se encontraron clientes.</p>
                ) : (
                customers.map((customer) => (
                    <Card key={customer.id}>
                        <CardHeader className="p-4 flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="text-base">{customer.name}</CardTitle>
                                <CardDescription>{customer.identificationType}: {customer.identificationNumber}</CardDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 -mt-2 -mr-2">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEdit(customer)}>Editar Cliente</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openDeleteDialog(customer.id)} className="text-red-600">Eliminar Cliente</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Estado:</span>
                                <Badge>{customer.customerType}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Segmentación:</span>
                                 <div className="flex flex-wrap gap-1 justify-end">
                                    {customer.department && <Badge variant="outline">{customer.department}</Badge>}
                                    {customer.companySize && <Badge variant="secondary">{companySizeLabels[customer.companySize]}</Badge>}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                             <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewDetails(customer)}>
                                <User className="mr-2 h-4 w-4" />
                                Ver Ficha de Cliente
                            </Button>
                        </CardFooter>
                    </Card>
                ))
                )}
            </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
                <DialogTitle>{selectedCustomer ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</DialogTitle>
            </DialogHeader>
            <CustomerForm
                customer={selectedCustomer}
                onSuccess={handleFormSuccess}
            />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Ficha del Cliente: {selectedCustomer?.name}</DialogTitle>
            <DialogDescription>
              Gestione las oportunidades y el historial de interacciones.
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <Tabs defaultValue="opportunities" className="flex-1 flex flex-col overflow-hidden">
                <TabsList>
                    <TabsTrigger value="opportunities"><Briefcase/> Oportunidades</TabsTrigger>
                    <TabsTrigger value="interactions"><MessageSquare/> Interacciones</TabsTrigger>
                </TabsList>
                <TabsContent value="opportunities" className="flex-1 overflow-auto">
                    <OpportunityList customer={selectedCustomer} />
                </TabsContent>
                <TabsContent value="interactions" className="flex-1 overflow-auto">
                    <InteractionList customer={selectedCustomer} />
                </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescriptionComponent>
              Esta acción no se puede deshacer. Esto eliminará permanentemente al cliente y todos sus datos asociados.
            </AlertDialogDescriptionComponent>
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

CustomersClient.displayName = 'CustomersClient';

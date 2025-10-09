// /src/app/hr/employees-client.tsx
"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import Image from 'next/image';
import { MoreHorizontal, PlusCircle, CreditCard, UserCheck, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Employee, Organization } from '@/lib/types';
import { getEmployees } from '@/services/employee-service';
import { getOrganizations } from '@/services/organization-service';
import { deleteUserFromApp } from '@/services/user-service';
import { UserProfileDialog } from '@/app/admin/users/user-profile-dialog';
import { IdCard } from '@/components/id-card';
import { UserNewForm } from '@/app/admin/users/user-new-form';


export const EmployeesClient = memo(() => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [userForProfile, setUserForProfile] = useState<Employee | null>(null);
  const [userForIdCard, setUserForIdCard] = useState<Employee | null>(null);
  const [userToDelete, setUserToDelete] = useState<Employee | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isNewUserFormOpen, setIsNewUserFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const isSuperAdmin = userProfile?.role === 'SuperAdmin';


  const fetchData = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const [empData, orgsData] = await Promise.all([
        getEmployees(userProfile),
        isSuperAdmin ? getOrganizations() : Promise.resolve([]),
      ]);
      setEmployees(empData);
      setOrganizations(orgsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los empleados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, userProfile, isSuperAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewProfile = useCallback((employee: Employee) => {
    setUserForProfile(employee);
    setIsProfileOpen(true);
  }, []);
  
  const handleViewIdCard = useCallback((employee: Employee) => {
    setUserForIdCard(employee);
    setIsIdCardOpen(true);
  }, []);

  const openDeleteDialog = useCallback((employee: Employee) => {
    setUserToDelete(employee);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!userToDelete) return;
    try {
      await deleteUserFromApp(userToDelete.id);
      toast({
        title: 'Éxito',
        description: `El usuario ${userToDelete.name} ha sido eliminado permanentemente.`,
      });
      fetchData();
    } catch (error) {
       toast({
        title: 'Error',
        description: 'No se pudo eliminar al usuario.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  }, [userToDelete, toast, fetchData]);
  
  const handleFormSuccess = useCallback(() => {
    setIsNewUserFormOpen(false);
    fetchData();
  }, [fetchData]);


  const getStatusBadgeVariant = (status: 'Active' | 'Inactive') => {
    return status === 'Active' ? 'success' : 'secondary';
  }
  
  const orgsForForm = isSuperAdmin ? organizations : (userProfile?.organizationId ? organizations.filter(o => o.id === userProfile.organizationId) : []);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <CardTitle>Expedientes de Empleados</CardTitle>
                <CardDescription>
                Gestione la información y el estado del personal de la organización.
                </CardDescription>
            </div>
             <Button onClick={() => setIsNewUserFormOpen(true)} className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Empleado
            </Button>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Rol del Sistema</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center">Cargando...</TableCell></TableRow>
                ) : employees.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center">No se encontraron empleados.</TableCell></TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <Image
                          alt="Avatar del empleado"
                          className="aspect-square rounded-full object-cover"
                          height="40"
                          src={employee.avatarUrl || `https://picsum.photos/seed/${employee.id}/40/40`}
                          width="40"
                          data-ai-hint="person portrait"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(employee.status)}>
                          {employee.status === 'Active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Menú</span></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewProfile(employee)}><UserCheck className="mr-2 h-4 w-4" /> Ver Perfil Completo</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewIdCard(employee)}><CreditCard className="mr-2 h-4 w-4" /> Ver Carnet</DropdownMenuItem>
                            {isSuperAdmin && (
                              <>
                               <DropdownMenuSeparator />
                               <DropdownMenuItem onClick={() => openDeleteDialog(employee)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Eliminar Empleado</DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Mobile Card View */}
          <div className="grid gap-4 md:hidden">
            {loading ? <p className="text-center text-muted-foreground">Cargando...</p> 
            : employees.map((employee) => (
              <Card key={employee.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Image
                      alt="Avatar del empleado"
                      className="aspect-square rounded-full object-cover"
                      height="64"
                      src={employee.avatarUrl || `https://picsum.photos/seed/${employee.id}/64/64`}
                      width="64"
                      data-ai-hint="person portrait"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                        </div>
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 -mt-2 -mr-2"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Menú</span></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                             <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                             <DropdownMenuItem onClick={() => handleViewProfile(employee)}><UserCheck className="mr-2 h-4 w-4" /> Ver Perfil</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleViewIdCard(employee)}><CreditCard className="mr-2 h-4 w-4" /> Ver Carnet</DropdownMenuItem>
                             {isSuperAdmin && (
                              <>
                               <DropdownMenuSeparator />
                               <DropdownMenuItem onClick={() => openDeleteDialog(employee)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Eliminar Empleado</DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                       <Badge variant={getStatusBadgeVariant(employee.status)}>
                          {employee.status === 'Active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {userForProfile && (
        <UserProfileDialog
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
          user={userForProfile}
        />
      )}
      
      <IdCard 
        user={userForIdCard}
        open={isIdCardOpen}
        onOpenChange={setIsIdCardOpen}
      />
      
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará permanentemente al empleado y su cuenta de usuario asociada.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Sí, eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isNewUserFormOpen} onOpenChange={setIsNewUserFormOpen}>
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
          </DialogHeader>
           <UserNewForm
                organizations={orgsForForm}
                onSuccess={handleFormSuccess}
            />
        </DialogContent>
      </Dialog>
    </>
  );
});
EmployeesClient.displayName = 'EmployeesClient';

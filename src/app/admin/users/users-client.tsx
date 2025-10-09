// /src/app/admin/users/users-client.tsx
"use client";

import Image from 'next/image';
import { useEffect, useState, useCallback, memo } from 'react';
import { MoreHorizontal, KeyRound, PlusCircle, Trash2, User as UserIcon } from 'lucide-react';

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

import type { UserProfile, Organization } from '@/lib/types';
import { getUsers, updateUserProfileAndEmployee, deleteUserFromApp } from '@/services/user-service';
import { getOrganizations } from '@/services/organization-service';
import { UserForm } from './user-form';
import { UserNewForm } from './user-new-form';
import { UserProfileDialog } from './user-profile-dialog';

export const UsersClient = memo(() => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userForProfile, setUserForProfile] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewUserFormOpen, setIsNewUserFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { userProfile: currentUserProfile } = useAuth();

  const isSuperAdmin = currentUserProfile?.role === 'SuperAdmin';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, organizationsData] = await Promise.all([
        getUsers(),
        getOrganizations()
      ]);
      setUsers(usersData);
      setOrganizations(organizationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos de usuarios.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback((user: UserProfile) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  }, []);

  const handleViewProfile = useCallback((user: UserProfile) => {
    setUserForProfile(user);
    setIsProfileOpen(true);
  }, []);

  const openDeleteDialog = useCallback((user: UserProfile) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!userToDelete) return;
    try {
      await deleteUserFromApp(userToDelete.uid);
      toast({
        title: 'Éxito',
        description: `El usuario ${userToDelete.name} ha sido eliminado permanentemente del sistema.`,
      });
      fetchData();
    } catch (error) {
       toast({
        title: 'Error',
        description: 'No se pudo eliminar al usuario. Por favor, intente de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  }, [userToDelete, toast, fetchData]);


  const handleForcePasswordChange = async (user: UserProfile) => {
    try {
        await updateUserProfileAndEmployee(user.uid, { forcePasswordChange: true });
        toast({
            title: 'Éxito',
            description: `Se ha requerido un cambio de contraseña para ${user.name}.`,
        });
        fetchData();
    } catch (error) {
         toast({
            title: 'Error',
            description: 'No se pudo procesar la solicitud.',
            variant: 'destructive',
        });
    }
  }

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    setIsNewUserFormOpen(false);
    fetchData();
  }, [fetchData]);

  const getOrganizationName = (orgId?: string) => {
    if (!orgId) return 'N/A';
    return organizations.find(o => o.id === orgId)?.name || 'Desconocida';
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <CardTitle>Usuarios del Sistema</CardTitle>
            <CardDescription>
              Gestione los perfiles, roles y acceso de los usuarios a la plataforma.
            </CardDescription>
          </div>
           <Button onClick={() => setIsNewUserFormOpen(true)} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Usuario
            </Button>
        </CardHeader>
        <CardContent>
           <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Organización</TableHead>
                    <TableHead>Rol del Sistema</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Seguridad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="text-center">Cargando...</TableCell></TableRow>
                  ) : users.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center">No se encontraron usuarios.</TableCell></TableRow>
                  ) : (
                    users.map((user) => {
                      const isCurrentUser = user.uid === currentUserProfile?.uid;
                      return (
                      <TableRow key={user.uid}>
                        <TableCell>
                          <Image
                            alt="Avatar del usuario"
                            className="aspect-square rounded-full object-cover"
                            height="64"
                            src={user.avatarUrl || `https://picsum.photos/seed/${user.uid}/64/64`}
                            width="64"
                            data-ai-hint="person portrait"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{getOrganizationName(user.organizationId)}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.forcePasswordChange && (
                            <Badge variant="destructive">Cambio Contraseña Req.</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleViewProfile(user)}>
                            <UserIcon className="h-4 w-4" />
                            <span className="sr-only">Ver Perfil</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 ml-2">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menú</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEdit(user)}>Editar Usuario</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleForcePasswordChange(user)}>
                                <KeyRound className="mr-2 h-4 w-4" />
                                Forzar Cambio de Contraseña
                              </DropdownMenuItem>
                              {isSuperAdmin && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openDeleteDialog(user)} className="text-red-600" disabled={isCurrentUser}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )})
                  )}
                </TableBody>
              </Table>
           </div>
           
           <div className="grid gap-4 md:hidden">
            {loading ? (
                <p className="text-center text-muted-foreground">Cargando...</p>
              ) : users.length === 0 ? (
                <p className="text-center text-muted-foreground">No se encontraron usuarios.</p>
              ) : (
                users.map((user) => {
                  const isCurrentUser = user.uid === currentUserProfile?.uid;
                  return (
                    <Card key={user.uid}>
                       <CardContent className="p-4 flex gap-4 items-start">
                         <Image
                            alt="Avatar del usuario"
                            className="aspect-square rounded-full object-cover mt-1"
                            height="48"
                            src={user.avatarUrl || `https://picsum.photos/seed/${user.uid}/64/64`}
                            width="48"
                            data-ai-hint="person portrait"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{getOrganizationName(user.organizationId)}</p>
                                <p className="text-xs text-muted-foreground">{user.role}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 -mt-2 -mr-2">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Menú</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                   <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                   <DropdownMenuItem onClick={() => handleViewProfile(user)}>Ver Perfil</DropdownMenuItem>
                                   <DropdownMenuItem onClick={() => handleEdit(user)}>Editar Usuario</DropdownMenuItem>
                                   <DropdownMenuItem onClick={() => handleForcePasswordChange(user)}>
                                      <KeyRound className="mr-2 h-4 w-4" />
                                      Forzar Cambio de Contraseña
                                   </DropdownMenuItem>
                                   {isSuperAdmin && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => openDeleteDialog(user)} className="text-red-600" disabled={isCurrentUser}>
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Eliminar
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                             <div className="flex flex-wrap gap-2 pt-1">
                                <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                                  {user.status}
                                </Badge>
                                {user.forcePasswordChange && (
                                  <Badge variant="destructive">Cambio Contraseña Req.</Badge>
                                )}
                              </div>
                          </div>
                       </CardContent>
                    </Card>
                  )
                })
              )}
           </div>

        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserForm
                user={selectedUser}
                organizations={organizations}
                onSuccess={handleFormSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {userForProfile && (
        <UserProfileDialog
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
          user={userForProfile}
        />
      )}

      <Dialog open={isNewUserFormOpen} onOpenChange={setIsNewUserFormOpen}>
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <UserNewForm
              organizations={organizations}
              onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar a {userToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción es irreversible. Se eliminará al usuario del sistema de autenticación
                y todos sus registros asociados en la base de datos. Se guardará un registro de auditoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Sí, eliminar permanentemente</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
UsersClient.displayName = 'UsersClient';

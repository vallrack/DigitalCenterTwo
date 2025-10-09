// /src/app/admin/deleted-users/deleted-users-client.tsx
"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
import { useToast } from '@/hooks/use-toast';
import type { DeletedUserLog, Organization } from '@/lib/types';
import { getDeletedUsersLog } from '@/services/deleted-users-service';
import { getOrganizations } from '@/services/organization-service';

export const DeletedUsersClient = memo(() => {
  const [deletedUsers, setDeletedUsers] = useState<DeletedUserLog[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [deletedUsersData, orgsData] = await Promise.all([
        getDeletedUsersLog(),
        getOrganizations(),
      ]);
      setDeletedUsers(deletedUsersData);
      setOrganizations(orgsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el registro de usuarios eliminados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const getOrganizationName = (orgId?: string) => {
    if (!orgId) return 'N/A';
    return organizations.find(o => o.id === orgId)?.name || 'Desconocida';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Usuarios Eliminados</CardTitle>
        <CardDescription>
          Aquí se muestra un registro de auditoría de los usuarios que han sido eliminados permanentemente del sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo Electrónico</TableHead>
              <TableHead>Rol Anterior</TableHead>
              <TableHead>Organización Anterior</TableHead>
              <TableHead>Fecha de Eliminación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Cargando registro...</TableCell></TableRow>
            ) : deletedUsers.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center">No hay usuarios eliminados registrados.</TableCell></TableRow>
            ) : (
              deletedUsers.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.name}</TableCell>
                  <TableCell>{log.email}</TableCell>
                  <TableCell>{log.role}</TableCell>
                  <TableCell>{getOrganizationName(log.organizationId)}</TableCell>
                  <TableCell>
                    {log.deletedAt?.toDate ? format(log.deletedAt.toDate(), 'PPP p', { locale: es }) : 'Fecha no disponible'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});

DeletedUsersClient.displayName = 'DeletedUsersClient';

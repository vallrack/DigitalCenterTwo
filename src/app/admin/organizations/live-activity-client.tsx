// /src/app/admin/organizations/live-activity-client.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { Wifi } from 'lucide-react';
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
import { listenToActiveSessions, ActiveSession } from '@/services/presence-service';

export function LiveActivityClient() {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = listenToActiveSessions((sessions) => {
      setActiveSessions(sessions);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to active sessions:", error);
      toast({
        title: 'Error de Conexión',
        description: 'No se pudo obtener la información de actividad en tiempo real.',
        variant: 'destructive',
      });
      setLoading(false);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [toast]);

  const activeOrganizations = Array.from(new Set(activeSessions.map(s => s.organizationName)))
    .filter(Boolean)
    .sort();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="text-green-500" />
            Clientes (Organizaciones) Activos
          </CardTitle>
          <CardDescription>
            Organizaciones con al menos un usuario en línea ahora mismo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre de la Organización</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell className="text-center">Cargando...</TableCell></TableRow>
              ) : activeOrganizations.length === 0 ? (
                <TableRow><TableCell className="text-center">No hay organizaciones activas.</TableCell></TableRow>
              ) : (
                activeOrganizations.map((orgName) => (
                  <TableRow key={orgName}>
                    <TableCell className="font-medium">{orgName}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="text-green-500" />
            Usuarios Activos
          </CardTitle>
          <CardDescription>
            Todos los usuarios que están actualmente en línea en la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre de Usuario</TableHead>
                <TableHead>Organización</TableHead>
                <TableHead>Rol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} className="text-center">Cargando...</TableCell></TableRow>
              ) : activeSessions.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center">No hay usuarios en línea.</TableCell></TableRow>
              ) : (
                activeSessions.map((session) => (
                  <TableRow key={session.uid}>
                    <TableCell className="font-medium">{session.userName}</TableCell>
                    <TableCell>{session.organizationName || 'N/A'}</TableCell>
                    <TableCell>{session.role}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// /src/app/admin/activity-feed-client.tsx
"use client";

import { useEffect, useState } from 'react';
import { ListCollapse } from 'lucide-react';
import TimeAgo from 'react-timeago';
// @ts-ignore
import spanishStrings from 'react-timeago/lib/language-strings/es';
// @ts-ignore
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

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
import { listenToActivityLog, ActivityLog } from '@/services/activity-log-service';
import { Badge } from '@/components/ui/badge';

const formatter = buildFormatter(spanishStrings);

export function ActivityFeedClient() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = listenToActivityLog((newActivities) => {
      setActivities(newActivities);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to activity log:", error);
      toast({
        title: 'Error de Conexión',
        description: 'No se pudo obtener el registro de actividad en tiempo real.',
        variant: 'destructive',
      });
      setLoading(false);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [toast]);

  const getActivityTypeVariant = (type: ActivityLog['details']['type']) => {
    switch (type) {
        case 'CREATE': return 'success';
        case 'UPDATE': return 'default';
        case 'DELETE': return 'destructive';
        case 'LOGIN': return 'info';
        default: return 'secondary';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListCollapse />
          Feed de Actividad en Tiempo Real
        </CardTitle>
        <CardDescription>
          Un vistazo a las acciones más recientes realizadas en la plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mensaje</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center">Cargando actividad...</TableCell></TableRow>
            ) : activities.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center">No hay actividad reciente.</TableCell></TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.message}</TableCell>
                  <TableCell>
                    <Badge variant={getActivityTypeVariant(activity.details.type)}>
                        {activity.details.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    <TimeAgo date={activity.timestamp} formatter={formatter} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

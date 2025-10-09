// /src/app/hr/attendance-client.tsx
"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { QrCode, CalendarClock } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { QrScanner } from './qr-scanner';
import { useToast } from '@/hooks/use-toast';
import type { Attendance } from '@/lib/types';
import { getAttendanceRecords } from '@/services/attendance-service';

export const AttendanceClient = memo(() => {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAttendanceRecords();
      setRecords(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los registros de asistencia.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleScanSuccess = useCallback(() => {
      // After a successful scan, refetch the data to show the new record
      fetchData();
  }, [fetchData]);

  const getStatusVariant = (status: Attendance['status']) => {
      switch (status) {
          case 'Presente': return 'success';
          case 'Tarde': return 'warning';
          case 'Ausente': return 'destructive';
          case 'Jornada Finalizada': return 'secondary';
          default: return 'secondary';
      }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><QrCode/> Registrar Asistencia por QR</CardTitle>
                    <CardDescription>Use la cámara para escanear el código QR del carnet del empleado y registrar su entrada o salida.</CardDescription>
                </CardHeader>
                <CardContent>
                    <QrScanner onScanSuccess={handleScanSuccess} />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarClock/> Registro de Asistencias</CardTitle>
                    <CardDescription>Historial de entradas y salidas del personal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Empleado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Entrada</TableHead>
                        <TableHead>Salida</TableHead>
                        <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                        <TableRow><TableCell colSpan={5} className="text-center h-24">Cargando...</TableCell></TableRow>
                        ) : records.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center h-24">No hay registros.</TableCell></TableRow>
                        ) : (
                        records.map((record) => (
                            <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.employeeName}</TableCell>
                            <TableCell>{format(new Date(record.date), 'PPP', { locale: es })}</TableCell>
                            <TableCell>{record.checkIn}</TableCell>
                            <TableCell>{record.checkOut || 'N/A'}</TableCell>
                            <TableCell><Badge variant={getStatusVariant(record.status)}>{record.status}</Badge></TableCell>
                            </TableRow>
                        ))
                        )}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
});

AttendanceClient.displayName = 'AttendanceClient';

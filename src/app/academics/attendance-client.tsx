// /src/app/academics/attendance-client.tsx
"use client";

import { useEffect, useState, useCallback, useRef, memo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Camera, CalendarIcon, ListChecks, QrCode } from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Subject, Student, AcademicAttendance } from '@/lib/types';
import { getSubjects } from '@/services/subject-service';
import { getStudents } from '@/services/student-service';
import { recordStudentAttendance, getAttendanceForClass } from '@/services/academic-attendance-service';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export const AttendanceClient = memo(() => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AcademicAttendance[]>([]);
  
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const qrScannerRef = useRef<Html5QrcodeScanner | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [subjectsData, studentsData] = await Promise.all([getSubjects(), getStudents()]);
      setSubjects(subjectsData);
      setStudents(studentsData);
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar materias o estudiantes.', variant: 'destructive' });
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchAttendance = useCallback(async () => {
    if (!selectedSubjectId) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    try {
        const records = await getAttendanceForClass(selectedSubjectId, dateStr);
        setAttendanceRecords(records);
    } catch (error) {
        toast({ title: 'Error', description: 'No se pudo cargar la asistencia.', variant: 'destructive'});
    }
  }, [selectedSubjectId, selectedDate, toast]);
  
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    if (!selectedSubjectId || !userProfile?.organizationId) return;

    // Check if student is already marked present
    const isAlreadyPresent = attendanceRecords.some(rec => rec.studentId === decodedText);
    if (isAlreadyPresent) {
      toast({ title: 'Ya Registrado', description: 'Este estudiante ya tiene la asistencia registrada para esta clase.', variant: 'default' });
      return;
    }
    
    const student = students.find(s => s.id === decodedText);
    if (!student) {
        toast({ title: 'QR Inválido', description: 'El código QR no corresponde a un estudiante válido.', variant: 'destructive' });
        return;
    }
    
    try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        await recordStudentAttendance({
            studentId: student.id,
            studentName: student.name,
            subjectId: selectedSubjectId,
            date: dateStr,
            organizationId: userProfile.organizationId
        });
        toast({ title: 'Asistencia Registrada', description: `Se registró la asistencia para ${student.name}.` });
        fetchAttendance(); // Refresh the list
    } catch (error) {
        toast({ title: 'Error', description: 'No se pudo registrar la asistencia.', variant: 'destructive' });
    }
  }, [selectedSubjectId, students, attendanceRecords, fetchAttendance, toast, selectedDate, userProfile]);
  
  const startScanner = useCallback(() => {
    if (!selectedSubjectId) {
        toast({ title: 'Acción requerida', description: 'Por favor, seleccione una materia primero.', variant: 'destructive' });
        return;
    }
    setIsScannerActive(true);

    const qrScanner = new Html5QrcodeScanner(
      'qr-reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [],
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      },
      false
    );
    qrScannerRef.current = qrScanner;
    
    const handleSuccess = (decodedText: string, decodedResult: any) => {
        qrScanner.pause(true);
        handleScanSuccess(decodedText);
        setTimeout(() => {
            if (qrScannerRef.current?.getState() === 2) { // 2 = PAUSED
                qrScannerRef.current?.resume();
            }
        }, 2000);
    };

    qrScanner.render(handleSuccess, (error) => {});
  }, [selectedSubjectId, handleScanSuccess, toast]);

  const stopScanner = useCallback(() => {
    setIsScannerActive(false);
    if (qrScannerRef.current) {
      qrScannerRef.current.clear().catch(err => console.error("Error clearing scanner:", err));
      qrScannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Cleanup on component unmount
    return () => stopScanner();
  }, [stopScanner]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asistencia de Estudiantes por QR</CardTitle>
        <CardDescription>Seleccione una materia y fecha, luego inicie el escáner para tomar asistencia.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Controls and List */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger><SelectValue placeholder="Seleccione una materia..." /></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.grade})</SelectItem>)}</SelectContent>
              </Select>
               <Popover>
                <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} initialFocus/></PopoverContent>
              </Popover>
            </div>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2"><ListChecks/> Asistencia Registrada</CardTitle>
                    <Badge variant="secondary">{attendanceRecords.length} / {students.length}</Badge>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Estudiante</TableHead>
                                <TableHead className="text-right">Hora de Ingreso</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendanceRecords.length === 0 ? (
                                <TableRow><TableCell colSpan={2} className="text-center h-24">No hay registros para esta clase.</TableCell></TableRow>
                            ) : attendanceRecords.map(rec => (
                                <TableRow key={rec.id}>
                                    <TableCell className="font-medium">{rec.studentName}</TableCell>
                                    <TableCell className="text-right">{rec.checkInTime}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </div>

          {/* Right Panel: QR Scanner */}
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/30 min-h-[300px]">
            {isScannerActive ? (
                <>
                    <div id="qr-reader" className="w-full max-w-sm"></div>
                    <Button variant="destructive" onClick={stopScanner} className="mt-4">Detener Escáner</Button>
                </>
            ) : (
                <div className="text-center">
                    <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Escáner de QR</h3>
                    <p className="text-sm text-muted-foreground mb-4">El escáner está listo para iniciarse.</p>
                    <Button onClick={startScanner} disabled={!selectedSubjectId}>
                        <Camera className="mr-2 h-4 w-4" /> Iniciar Escáner
                    </Button>
                </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AttendanceClient.displayName = 'AttendanceClient';

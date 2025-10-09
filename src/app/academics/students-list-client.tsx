// /src/app/academics/students-list-client.tsx
"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import Image from 'next/image';
import { MoreHorizontal, PlusCircle, CreditCard } from 'lucide-react';

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

import type { Student, Organization } from '@/lib/types';
import { getStudents, deleteStudent } from '@/services/student-service';
import { getOrganizations } from '@/services/organization-service';
import { StudentForm } from './student-form';
import { IdCard } from '@/components/id-card';

export const StudentsListClient = memo(() => {
  const [students, setStudents] = useState<Student[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentForIdCard, setStudentForIdCard] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const isSuperAdmin = userProfile?.role === 'SuperAdmin';

  const fetchData = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const [studentsData, orgsData] = await Promise.all([
        getStudents(userProfile),
        isSuperAdmin ? getOrganizations() : Promise.resolve([]),
      ]);
      setStudents(studentsData);
      setOrganizations(orgsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, userProfile, isSuperAdmin]);

  useEffect(() => {
    if (userProfile) { 
      fetchData();
    }
  }, [userProfile, fetchData]);


  const handleEdit = useCallback((student: Student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedStudent(null);
    setIsFormOpen(true);
  }, []);

  const handleViewIdCard = useCallback((student: Student) => {
    setStudentForIdCard(student);
    setIsIdCardOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!studentToDelete) return;
    try {
      await deleteStudent(studentToDelete);
      toast({ title: 'Éxito', description: 'Estudiante eliminado correctamente.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar al estudiante.', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  }, [studentToDelete, toast, fetchData]);

  const openDeleteDialog = useCallback((studentId: string) => {
    setStudentToDelete(studentId);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    fetchData();
  }, [fetchData]);
  
  const getStatusBadgeVariant = (status: 'Active' | 'Inactive') => {
    return status === 'Active' ? 'success' : 'secondary';
  }

  const getOrganizationName = (orgId?: string) => {
    if (!orgId) return 'N/A';
    return organizations.find(o => o.id === orgId)?.name || 'Desconocida';
  }
  
  const canAddStudent = isSuperAdmin ? organizations.length > 0 : !!userProfile?.organizationId;


  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <CardTitle>Listado de Estudiantes</CardTitle>
            <CardDescription>
              Gestione los perfiles y expedientes de los estudiantes.
            </CardDescription>
          </div>
          <Button onClick={handleAddNew} className="w-full md:w-auto" disabled={!canAddStudent}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Estudiante
          </Button>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  {isSuperAdmin && <TableHead>Organización</TableHead>}
                  <TableHead>Grado / Curso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={isSuperAdmin ? 6 : 5} className="text-center">Cargando...</TableCell></TableRow>
                ) : students.length === 0 ? (
                  <TableRow><TableCell colSpan={isSuperAdmin ? 6 : 5} className="text-center">No se encontraron estudiantes.</TableCell></TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Image
                          alt="Avatar del estudiante"
                          className="aspect-square rounded-full object-cover"
                          height="40"
                          src={student.avatarUrl || `https://picsum.photos/seed/${student.id}/40/40`}
                          width="40"
                          data-ai-hint="person portrait"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      {isSuperAdmin && <TableCell>{getOrganizationName(student.organizationId)}</TableCell>}
                      <TableCell>{student.grade}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(student.status)}>
                          {student.status === 'Active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Menú</span></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(student)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewIdCard(student)}><CreditCard className="mr-2 h-4 w-4" /> Ver Carnet</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDeleteDialog(student.id)} className="text-red-600">Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-4 md:hidden">
            {loading ? (
              <p className="text-center text-muted-foreground">Cargando...</p>
            ) : students.length === 0 ? (
              <p className="text-center text-muted-foreground">No se encontraron estudiantes.</p>
            ) : (
              students.map((student) => (
                <Card key={student.id}>
                  <CardHeader className="p-4 flex flex-row items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Image
                          alt="Avatar del estudiante"
                          className="aspect-square rounded-full object-cover"
                          height="48"
                          src={student.avatarUrl || `https://picsum.photos/seed/${student.id}/48/48`}
                          width="48"
                          data-ai-hint="person portrait"
                        />
                        <div>
                          <CardTitle className="text-base">{student.name}</CardTitle>
                          <CardDescription>{student.email}</CardDescription>
                          {isSuperAdmin && <CardDescription className="text-xs italic">{getOrganizationName(student.organizationId)}</CardDescription>}
                        </div>
                    </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 -mt-2 -mr-2"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Menú</span></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                           <DropdownMenuItem onClick={() => handleEdit(student)}>Editar</DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleViewIdCard(student)}><CreditCard className="mr-2 h-4 w-4" /> Ver Carnet</DropdownMenuItem>
                           <DropdownMenuSeparator />
                           <DropdownMenuItem onClick={() => openDeleteDialog(student.id)} className="text-red-600">Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Grado:</span>
                      <span>{student.grade}</span>
                    </div>
                     <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Estado:</span>
                      <Badge variant={getStatusBadgeVariant(student.status)}>{student.status === 'Active' ? 'Activo' : 'Inactivo'}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedStudent ? 'Editar Estudiante' : 'Agregar Nuevo Estudiante'}</DialogTitle>
          </DialogHeader>
          {isFormOpen && userProfile && (
            <StudentForm 
                student={selectedStudent} 
                organizations={organizations}
                onSuccess={handleFormSuccess} 
            />
          )}
        </DialogContent>
      </Dialog>

      <IdCard 
        user={studentForIdCard}
        open={isIdCardOpen}
        onOpenChange={setIsIdCardOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará permanentemente el registro del estudiante.</AlertDialogDescription>
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
StudentsListClient.displayName = 'StudentsListClient';

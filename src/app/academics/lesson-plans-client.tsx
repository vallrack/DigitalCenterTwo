// /src/app/academics/lesson-plans-client.tsx
"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

import type { LessonPlan } from '@/lib/types';
import { getLessonPlans, deleteLessonPlan } from '@/services/lesson-plan-service';
import { LessonPlanForm } from './lesson-plan-form';

export const LessonPlansClient = memo(() => {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLessonPlans();
      setPlans(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los planes de lección.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback((plan: LessonPlan) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedPlan(null);
    setIsFormOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!planToDelete) return;
    try {
      await deleteLessonPlan(planToDelete);
      toast({ title: 'Éxito', description: 'Plan de lección eliminado.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el plan.', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  }, [planToDelete, toast, fetchData]);

  const openDeleteDialog = useCallback((planId: string) => {
    setPlanToDelete(planId);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    fetchData();
  }, [fetchData]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <CardTitle>Planes de Lección</CardTitle>
            <CardDescription>
              Cree y gestione los planes de clase para sus materias.
            </CardDescription>
          </div>
          <Button onClick={handleAddNew} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Plan de Lección
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título del Plan</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Profesor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>
              ) : plans.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center">No se encontraron planes de lección.</TableCell></TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.title}</TableCell>
                    <TableCell>{plan.subject}</TableCell>
                    <TableCell>{plan.teacher}</TableCell>
                    <TableCell>{format(new Date(plan.date), 'PPP', { locale: es })}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Menú</span></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(plan)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(plan.id)} className="text-red-600">Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPlan ? 'Editar Plan de Lección' : 'Crear Nuevo Plan de Lección'}</DialogTitle>
          </DialogHeader>
          {userProfile && <LessonPlanForm plan={selectedPlan} organizationId={userProfile.organizationId || 'default'} onSuccess={handleFormSuccess} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará permanentemente el plan de lección.</AlertDialogDescription>
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
LessonPlansClient.displayName = 'LessonPlansClient';

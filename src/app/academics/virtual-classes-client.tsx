// /src/app/academics/virtual-classes-client.tsx
"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import { MoreHorizontal, PlusCircle, Sparkles, Loader2, Link as LinkIcon, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
import type { VideoRecording } from '@/lib/types';
import { getVideoRecordings, deleteVideoRecording, updateVideoRecording } from '@/services/video-recording-service';
import { generateClassRecordingSummary } from '@/ai/flows/generate-class-recording-summary';
import { VirtualClassForm } from './virtual-class-form';

export const VirtualClassesClient = memo(() => {
  const [recordings, setRecordings] = useState<VideoRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<VideoRecording | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordingToDelete, setRecordingToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVideoRecordings();
      setRecordings(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las clases virtuales.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleGenerateSummary = async (recording: VideoRecording) => {
    setSummarizingId(recording.id);
    try {
      const result = await generateClassRecordingSummary({ videoClassLink: recording.url });
      await updateVideoRecording(recording.id, { summary: result.summary });
      toast({ title: 'Éxito', description: 'Resumen generado y guardado.' });
      fetchData(); // Refresh data
    } catch (error) {
      toast({ title: 'Error de IA', description: 'No se pudo generar el resumen.', variant: 'destructive' });
    } finally {
      setSummarizingId(null);
    }
  };

  const handleEdit = (recording: VideoRecording) => {
    setSelectedRecording(recording);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedRecording(null);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (recordingId: string) => {
    setRecordingToDelete(recordingId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordingToDelete) return;
    try {
      await deleteVideoRecording(recordingToDelete);
      toast({ title: 'Éxito', description: 'Clase virtual eliminada.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar la clase.', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setRecordingToDelete(null);
    }
  };
  
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchData();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <CardTitle>Clases Virtuales</CardTitle>
            <CardDescription>
              Cree enlaces para clases en vivo o añada grabaciones. Use la IA para generar resúmenes automáticos.
            </CardDescription>
          </div>
          <Button onClick={handleAddNew} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Clase Virtual
          </Button>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Resumen IA</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>
                  ) : recordings.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center">No se encontraron clases virtuales.</TableCell></TableRow>
                  ) : (
                    recordings.map((rec) => (
                      <TableRow key={rec.id}>
                        <TableCell className="font-medium">{rec.title}</TableCell>
                        <TableCell>{rec.subject}</TableCell>
                        <TableCell>{format(new Date(rec.date), 'PPP', { locale: es })}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                            {rec.summary || 'Pendiente de generar'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Menú</span></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem asChild><Link href={rec.url} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2 h-4 w-4"/>Ver Video/Enlace</Link></DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleGenerateSummary(rec)} disabled={!!summarizingId}>
                                {summarizingId === rec.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                {summarizingId === rec.id ? 'Generando...' : 'Generar Resumen'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(rec)}><Edit className="mr-2 h-4 w-4"/>Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(rec.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/>Eliminar</DropdownMenuItem>
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
              : recordings.length === 0 ? <p className="text-center text-muted-foreground">No se encontraron clases.</p>
              : recordings.map((rec) => (
              <Card key={rec.id}>
                <CardHeader className="p-4 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{rec.title}</CardTitle>
                      <CardDescription>{rec.subject} - {format(new Date(rec.date), 'PPP', { locale: es })}</CardDescription>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 -mt-2 -mr-2"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Menú</span></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                           <DropdownMenuItem onClick={() => handleEdit(rec)}><Edit className="mr-2 h-4 w-4"/>Editar</DropdownMenuItem>
                           <DropdownMenuItem onClick={() => openDeleteDialog(rec.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/>Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                </CardHeader>
                 <CardContent className="p-4 pt-0 text-sm">
                  <p className="text-muted-foreground italic whitespace-pre-wrap">
                    {rec.summary ? `"${rec.summary}"` : 'No se ha generado un resumen para esta clase.'}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-col items-stretch gap-2">
                   <Button asChild variant="outline">
                      <Link href={rec.url} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="mr-2 h-4 w-4" /> Ver Video/Enlace
                      </Link>
                    </Button>
                    <Button onClick={() => handleGenerateSummary(rec)} disabled={!!summarizingId}>
                      {summarizingId === rec.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      {summarizingId === rec.id ? 'Generando...' : 'Generar Resumen'}
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedRecording ? 'Editar Clase Virtual' : 'Crear Clase Virtual'}</DialogTitle>
          </DialogHeader>
          {userProfile && <VirtualClassForm recording={selectedRecording} organizationId={userProfile.organizationId || 'default'} onSuccess={handleFormSuccess} />}
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará permanentemente la clase virtual.</AlertDialogDescription>
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
VirtualClassesClient.displayName = 'VirtualClassesClient';

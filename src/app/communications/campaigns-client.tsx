// /src/app/communications/campaigns-client.tsx
"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Campaign, Template } from '@/lib/types';
import { getCampaigns, getTemplates, deleteCampaign } from '@/services/communications-service';
import { CampaignForm } from './campaign-form';

export const CampaignsClient = memo(() => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const fetchData = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const [campaignsData, templatesData] = await Promise.all([
        getCampaigns(userProfile),
        getTemplates(userProfile),
      ]);
      setCampaigns(campaignsData);
      setTemplates(templatesData);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar los datos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, userProfile]);

  useEffect(() => {
    if (userProfile) {
      fetchData();
    }
  }, [userProfile, fetchData]);

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCampaign(null);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setCampaignToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!campaignToDelete) return;
    try {
      await deleteCampaign(campaignToDelete);
      toast({ title: 'Éxito', description: 'Campaña eliminada.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar la campaña.', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchData();
  };
  
  const getTemplateName = (templateId: string) => templates.find(t => t.id === templateId)?.name || 'Plantilla Desconocida';
  
  const getStatusVariant = (status: Campaign['status']) => {
      switch(status) {
          case 'sent': return 'success';
          case 'scheduled': return 'default';
          case 'draft':
          default: return 'secondary';
      }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Campañas de Comunicación</CardTitle>
            <CardDescription>Cree y gestione sus campañas de marketing.</CardDescription>
          </div>
          <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Crear Campaña</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Campaña</TableHead>
                <TableHead>Plantilla Usada</TableHead>
                <TableHead>Audiencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center">No hay campañas creadas.</TableCell></TableRow>
              ) : (
                campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{getTemplateName(c.templateId)}</TableCell>
                    <TableCell>{c.targetAudience}</TableCell>
                    <TableCell><Badge variant={getStatusVariant(c.status)}>{c.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreHorizontal /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEdit(c)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(c.id)} className="text-red-600">Eliminar</DropdownMenuItem>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCampaign ? 'Editar Campaña' : 'Crear Nueva Campaña'}</DialogTitle>
          </DialogHeader>
          <CampaignForm campaign={selectedCampaign} templates={templates} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará la campaña permanentemente.</AlertDialogDescription>
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

CampaignsClient.displayName = 'CampaignsClient';

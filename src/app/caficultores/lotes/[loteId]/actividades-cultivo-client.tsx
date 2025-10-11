
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

import ActividadCultivoForm from './actividad-cultivo-form';

export default function ActividadesCultivoClient() {
  const params = useParams();
  const loteId = params.loteId as string;

  const [actividades, setActividades] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActividad, setEditingActividad] = useState(null);

  useEffect(() => {
    if (!loteId) return;
    const actividadesCollectionRef = collection(db, 'lotes', loteId, 'actividades');
    const unsubscribe = onSnapshot(actividadesCollectionRef, (snapshot) => {
      const actividadesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActividades(actividadesData);
    });
    return () => unsubscribe();
  }, [loteId]);

  const handleSubmit = async (data) => {
    if (editingActividad) {
      const actividadRef = doc(db, 'lotes', loteId, 'actividades', editingActividad.id);
      await updateDoc(actividadRef, data);
    } else {
      await addDoc(collection(db, 'lotes', loteId, 'actividades'), data);
    }
    setIsDialogOpen(false);
    setEditingActividad(null);
  };

  const handleEdit = (actividad) => {
    setEditingActividad(actividad);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    const actividadRef = doc(db, 'lotes', loteId, 'actividades', id);
    await deleteDoc(actividadRef);
  };

  const openAddDialog = () => {
    setEditingActividad(null);
    setIsDialogOpen(true);
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Actividades de Cultivo</h2>
        <Button onClick={openAddDialog}>Agregar Actividad</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen);
        if (!isOpen) {
          setEditingActividad(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingActividad ? 'Editar Actividad' : 'Agregar Nueva Actividad'}</DialogTitle>
          </DialogHeader>
          <ActividadCultivoForm onSubmit={handleSubmit} initialData={editingActividad} />
        </DialogContent>
      </Dialog>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo de Actividad</TableHead>
              <TableHead>Insumos Utilizados</TableHead>
              <TableHead>Observaciones</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actividades.map((actividad) => (
              <TableRow key={actividad.id}>
                <TableCell>{actividad.fecha}</TableCell>
                <TableCell>{actividad.tipo}</TableCell>
                <TableCell>{actividad.insumos}</TableCell>
                <TableCell>{actividad.observaciones}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(actividad)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(actividad.id)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

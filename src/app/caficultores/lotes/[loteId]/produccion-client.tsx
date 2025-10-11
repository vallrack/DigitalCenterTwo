
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

import ProduccionForm from './produccion-form';

export default function ProduccionClient() {
  const params = useParams();
  const loteId = params.loteId as string;

  const [produccion, setProduccion] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduccion, setEditingProduccion] = useState(null);

  useEffect(() => {
    if (!loteId) return;
    const produccionCollectionRef = collection(db, 'lotes', loteId, 'produccion');
    const unsubscribe = onSnapshot(produccionCollectionRef, (snapshot) => {
      const produccionData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProduccion(produccionData);
    });
    return () => unsubscribe();
  }, [loteId]);

  const handleSubmit = async (data) => {
    if (editingProduccion) {
      const produccionRef = doc(db, 'lotes', loteId, 'produccion', editingProduccion.id);
      await updateDoc(produccionRef, data);
    } else {
      await addDoc(collection(db, 'lotes', loteId, 'produccion'), data);
    }
    setIsDialogOpen(false);
    setEditingProduccion(null);
  };

  const handleEdit = (item) => {
    setEditingProduccion(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    const produccionRef = doc(db, 'lotes', loteId, 'produccion', id);
    await deleteDoc(produccionRef);
  };

  const openAddDialog = () => {
    setEditingProduccion(null);
    setIsDialogOpen(true);
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Registro de Producción</h2>
        <Button onClick={openAddDialog}>Agregar Cosecha</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen);
        if (!isOpen) {
          setEditingProduccion(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduccion ? 'Editar Cosecha' : 'Agregar Nueva Cosecha'}</DialogTitle>
          </DialogHeader>
          <ProduccionForm onSubmit={handleSubmit} initialData={editingProduccion} />
        </DialogContent>
      </Dialog>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cantidad (kg)</TableHead>
              <TableHead>Calidad</TableHead>
              <TableHead>Observaciones</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produccion.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.fecha}</TableCell>
                <TableCell>{item.cantidad}</TableCell>
                <TableCell>{item.calidad}</TableCell>
                <TableCell>{item.observaciones}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(item)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
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

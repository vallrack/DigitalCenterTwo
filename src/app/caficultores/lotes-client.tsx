
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

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

import LoteForm from './lote-form';

export default function LotesClient() {
  const [lotes, setLotes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLote, setEditingLote] = useState(null);
  const { user, userProfile, organization, loading: authLoading } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (userProfile) {
      let lotesQuery;
      if (userProfile.role === 'SuperAdmin') {
        lotesQuery = collection(db, 'lotes');
      } else if (organization) {
        lotesQuery = query(collection(db, 'lotes'), where('organizationId', '==', organization.id));
      } else {
        setLotes([]);
        setIsLoading(false);
        return;
      }
      
      const unsubscribe = onSnapshot(lotesQuery, (snapshot) => {
        const lotesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLotes(lotesData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching lotes: ", error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, userProfile, organization, authLoading, router]);

  const handleSubmit = async (data) => {
    const dataToSave = { ...data };
    if (!editingLote && userProfile?.role !== 'SuperAdmin' && organization) {
      dataToSave.organizationId = organization.id;
    }

    try {
      if (editingLote) {
        const loteRef = doc(db, 'lotes', editingLote.id);
        await updateDoc(loteRef, dataToSave);
      } else {
        await addDoc(collection(db, 'lotes'), dataToSave);
      }
      setIsDialogOpen(false);
      setEditingLote(null);
    } catch (error) {
      console.error("Error saving lote: ", error);
    }
  };

  const handleEdit = (lote) => {
    setEditingLote(lote);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este lote?')) {
      try {
        const loteRef = doc(db, 'lotes', id);
        await deleteDoc(loteRef);
      } catch (error) {
        console.error("Error deleting lote: ", error);
      }
    }
  };

  const openAddDialog = () => {
    setEditingLote(null);
    setIsDialogOpen(true);
  }

  if (authLoading || isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Lotes de Cultivo</h2>
        <Button onClick={openAddDialog}>Agregar Lote</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setEditingLote(null);
        }
        setIsDialogOpen(isOpen);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLote ? 'Editar Lote' : 'Agregar Nuevo Lote'}</DialogTitle>
          </DialogHeader>
          <LoteForm onSubmit={handleSubmit} initialData={editingLote} />
        </DialogContent>
      </Dialog>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Área (m²)</TableHead>
              <TableHead>Variedad</TableHead>
              <TableHead>Fecha de Siembra</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lotes.map((lote) => (
              <TableRow key={lote.id}>
                <TableCell>{lote.nombre}</TableCell>
                <TableCell>{lote.area}</TableCell>
                <TableCell>{lote.variedad}</TableCell>
                <TableCell>{lote.fechaSiembra}</TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm" className="mr-2">
                    <Link href={`/caficultores/lotes/${lote.id}`}>Gestionar</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(lote)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(lote.id)}>
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

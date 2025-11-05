"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Odontograma3D, { Odontograma3DRef } from '../odontogram-3d';
import { Patient, FollowUp } from '@/lib/types';
import { ChevronUp, ChevronDown, ArrowLeft, Pencil, Calendar as CalendarIcon } from 'lucide-react';
import { getPatientById, updatePatient } from '@/services/odontology-service';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { EditPatientSheet } from '../edit-patient-sheet';
import { AddFollowUpDialog } from '../add-follow-up-dialog';

// Función para formatear fechas
const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

export default function OdontologyPage({ params }: { params: { patientId: string } }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generalNotes, setGeneralNotes] = useState('');
  const [isNotesCollapsed, setIsNotesCollapsed] = useState(false);
  const [isFollowUpsCollapsed, setIsFollowUpsCollapsed] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const odontogramRef = useRef<Odontograma3DRef>(null);
  const router = useRouter();
  const { toast } = useToast();

  const fetchPatient = useCallback(async () => {
    try {
      setLoading(true);
      const patientData = await getPatientById(params.patientId);
      if (patientData) {
        // Ordenar controles por fecha descendente
        if (patientData.followUps) {
            patientData.followUps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        setPatient(patientData);
        setGeneralNotes(patientData.generalNotes || '');
      } else {
        setError('Paciente no encontrado');
      }
    } catch (err) {
      setError('Error al cargar los datos del paciente');
    } finally {
      setLoading(false);
    }
  }, [params.patientId]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const handlePrint = () => {
    if (odontogramRef.current && patient) {
      odontogramRef.current.generateDetailedPdf(patient, generalNotes);
    }
  };

  const handleGoBack = () => {
    router.push('/odontology');
  };

  const handleSave = async () => {
    if (!patient || !odontogramRef.current) return;

    try {
      const currentState = odontogramRef.current.getOdontogramState();
      const screenshot = await odontogramRef.current.captureScreenshot();

      const updatedData: Partial<Patient> = {
        odontogramState: currentState,
        generalNotes: generalNotes,
        odontogramScreenshot: screenshot,
      };

      await updatePatient(patient.id, updatedData);

      toast({
        title: 'Éxito',
        description: 'Los cambios se han guardado correctamente.',
        duration: 5000,
      });

    } catch (error) {
      console.error("Error saving patient data:", error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">{error}</div>;
  }
  
  if (!patient) {
    return <div className="flex items-center justify-center h-screen">Paciente no encontrado</div>;
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handleGoBack}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Ficha del Paciente</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="font-semibold text-gray-800 dark:text-gray-100">{patient.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {patient.identificationNumber}</p>
            </div>
            <AddFollowUpDialog patientId={patient.id} onFollowUpAdded={fetchPatient} />
            <Button variant="outline" onClick={() => setIsEditSheetOpen(true)}>
              <Pencil className="h-4 w-4 mr-2"/>
              Editar Paciente
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Guardar Cambios
            </Button>
            <Button 
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Imprimir Reporte
            </Button>
          </div>
        </header>

        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          <div className="flex-grow h-full">
            <Odontograma3D 
              ref={odontogramRef}
              initialState={patient.odontogramState || {}}
              isInteractive={true}
            />
          </div>
          <aside className="md:w-1/3 bg-white dark:bg-gray-800 border-l dark:border-gray-700 flex flex-col transition-all duration-300">
            <div className="flex-shrink-0 p-4 border-b dark:border-gray-700">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsNotesCollapsed(!isNotesCollapsed)}
              >
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Notas de la Consulta</h2>
                <button className="p-1 text-gray-600 dark:text-gray-400">
                  {isNotesCollapsed ? <ChevronDown className="h-5 w-5"/> : <ChevronUp className="h-5 w-5"/>}
                </button>
              </div>
              {!isNotesCollapsed && (
                  <textarea 
                      className="w-full h-32 mt-2 p-2 border rounded-md resize-y bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                      placeholder="Escriba aquí las notas generales de la consulta inicial..."
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                  />
              )}
            </div>

            <div className="flex-grow p-4 overflow-y-auto">
                <div 
                  className="flex justify-between items-center cursor-pointer pb-2 mb-4 border-b dark:border-gray-700"
                  onClick={() => setIsFollowUpsCollapsed(!isFollowUpsCollapsed)}
                >
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Controles y Seguimiento</h2>
                  <button className="p-1 text-gray-600 dark:text-gray-400">
                    {isFollowUpsCollapsed ? <ChevronDown className="h-5 w-5"/> : <ChevronUp className="h-5 w-5"/>}
                  </button>
                </div>
                {!isFollowUpsCollapsed && (
                  <div className="space-y-4">
                    {patient.followUps && patient.followUps.length > 0 ? (
                      patient.followUps.map((followUp) => (
                        <div key={followUp.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg shadow-sm">
                          <div className="flex items-center space-x-3 mb-2">
                            <CalendarIcon className="h-5 w-5 text-blue-500" />
                            <p className="font-bold text-gray-800 dark:text-gray-100">{formatDate(followUp.date)}</p>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{followUp.notes}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay controles de seguimiento.</p>
                    )}
                  </div>
                )}
            </div>
          </aside>
        </div>
      </div>
      <EditPatientSheet 
        patient={patient} 
        isOpen={isEditSheetOpen} 
        onClose={(updated) => {
          setIsEditSheetOpen(false);
          if (updated) {
            fetchPatient();
          }
        }}
      />
    </>
  );
}

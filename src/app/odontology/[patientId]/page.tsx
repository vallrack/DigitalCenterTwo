
// /src/app/odontology/[patientId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Odontograma3D from '../odontogram-3d';
import { getPatientById, updatePatient } from '@/services/odontology-service';
import { Patient, OdontogramState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OdontogramSummary } from '../odontogram-summary';
import { Textarea } from '@/components/ui/textarea';
import { PrintablePatientHistory } from '../printable-patient-history'; // Corrected import path

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = params.patientId as string;
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [odontogramState, setOdontogramState] = useState<OdontogramState>({});
  const [generalNotes, setGeneralNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isPrinting = searchParams.get('print') === 'true';

  useEffect(() => {
    if (patientId) {
      const fetchPatient = async () => {
        setLoading(true);
        try {
            const fetchedPatient = await getPatientById(patientId);
            setPatient(fetchedPatient || null);
            if (fetchedPatient) {
                setGeneralNotes(fetchedPatient.generalNotes || "");
                setOdontogramState(fetchedPatient.odontogramState || {});
            }
        } catch (error) {
            console.error("Failed to fetch patient:", error);
            toast({ title: "Error", description: "No se pudo cargar el paciente.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
      };
      fetchPatient();
    }
  }, [patientId, toast]);

  useEffect(() => {
    if (isPrinting && patient) {
      document.title = `Historia Clínica - ${patient.name}`;
      setTimeout(() => window.print(), 500);
    }
  }, [isPrinting, patient]);

  const handleOdontogramChange = (newState: OdontogramState) => {
    setOdontogramState(newState);
  };

  const handleSave = async () => {
    if (!patient) return;
    setIsSaving(true);
    try {
      const dataToUpdate = { 
        odontogramState,
        generalNotes,
      };
      await updatePatient(patient.id, dataToUpdate);
      toast({ title: "Éxito", description: "Los datos del paciente han sido guardados." });
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: "Error", description: `No se pudo guardar: ${error.message}`, variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando datos del paciente...</div>;
  }

  if (!patient) {
    return <div className="flex justify-center items-center h-screen">Paciente no encontrado.</div>;
  }

  if (isPrinting) {
      return <PrintablePatientHistory patient={patient} />;
  }

  return (
    <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
            <Button onClick={() => router.push('/odontology')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Listado
            </Button>
            <div className="flex items-center gap-2">
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">Odontograma de: {patient.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <aside className="lg:col-span-2 space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">Resumen del Odontograma</h3>
                <OdontogramSummary odontogramState={odontogramState} />
            </div>
             <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">Notas de la Consulta</h3>
                <Textarea
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="Anotaciones específicas de la consulta, observaciones, plan de tratamiento..."
                    className="w-full min-h-[200px]"
                />
            </div>
        </aside>
        <main className="lg:col-span-3 bg-white p-4 rounded-lg shadow">
            <div style={{ height: '550px', width: '100%' }}>
                <Odontograma3D 
                    initialState={odontogramState}
                    onStateChange={handleOdontogramChange} 
                />
            </div>
        </main>
      </div>
    </div>
  );
}

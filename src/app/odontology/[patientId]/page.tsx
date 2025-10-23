// /src/app/odontology/[patientId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Odontograma3D from '../odontogram-3d';
import { getPatientById, updatePatient } from '@/services/odontology-service';
import { Patient, OdontogramState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Printer, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OdontogramSummary } from '../odontogram-summary';
import { Textarea } from '@/components/ui/textarea';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = params.patientId as string;
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalHistory, setMedicalHistory] = useState("");
  const [odontogramState, setOdontogramState] = useState<OdontogramState>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (patientId) {
      const fetchPatient = async () => {
        setLoading(true);
        const fetchedPatient = await getPatientById(patientId);
        setPatient(fetchedPatient || null);
        if (fetchedPatient) {
            setMedicalHistory(fetchedPatient.medicalHistory || "");
            setOdontogramState(fetchedPatient.odontogramState || {});
        }
        setLoading(false);
      };
      fetchPatient();
    }
  }, [patientId]);

  useEffect(() => {
    const isPrinting = searchParams.get('print') === 'true';
    if (isPrinting && !loading) {
      // Delay print slightly to ensure all content is rendered
      setTimeout(() => window.print(), 500);
    }
  }, [searchParams, loading]);

  const handleOdontogramChange = (newState: OdontogramState) => {
    setOdontogramState(newState);
  };

  const handleSave = async () => {
    if (!patient) return;
    setIsSaving(true);
    try {
      const updatedPatientData = { ...patient, medicalHistory, odontogramState };
      await updatePatient(patient.id, updatedPatientData);
      setPatient(updatedPatientData);
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
    return <div className="flex justify-center items-center h-full">Cargando datos del paciente...</div>;
  }

  if (!patient) {
    return <div className="flex justify-center items-center h-full">Paciente no encontrado.</div>;
  }

  return (
    <div>
        <div className="flex items-center justify-between mb-4 print:hidden">
            <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
            </Button>
            <div className="flex items-center gap-2">
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button onClick={() => window.print()} variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir / PDF
                </Button>
            </div>
      </div>

      {/* Title visible for both screen and print */}
      <h1 className="text-xl font-bold md:text-2xl mb-4">Historia Clínica de: {patient.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md print:shadow-none print:p-0">
            <div className="space-y-2 mb-4 print:mb-2">
                <p><strong>Cédula:</strong> {patient.identificationNumber}</p>
                <p><strong>Edad:</strong> {patient.age}</p>
                <p><strong>Género:</strong> {patient.gender}</p>
                <p><strong>Contacto:</strong> {patient.contact}</p>
                <p><strong>Fecha de Registro:</strong> {new Date(patient.registrationDate).toLocaleDateString()}</p>
            </div>
            <h3 className="text-lg font-semibold mb-2">Antecedentes y Notas</h3>
            {/* Show textarea for editing, hide for printing */}
            <div className="print:hidden">
              <Textarea
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Antecedentes médicos, alergias, notas de la consulta..."
                  className="w-full h-80"
              />
            </div>
            {/* Show just the text for printing */}
            <div className="hidden print:block bg-white p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{medicalHistory}</p>
            </div>
             <OdontogramSummary odontogramState={odontogramState} />
        </div>
        <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow-md print:shadow-none print:p-0">
            <h2 className="text-xl font-bold mb-4 text-center print:text-left">Odontograma</h2>
            <div style={{ height: '500px', width: '100%' }} className="print:h-auto">
                <Odontograma3D 
                    initialState={odontogramState}
                    onStateChange={handleOdontogramChange} 
                />
            </div>
        </div>
      </div>
    </div>
  );
}

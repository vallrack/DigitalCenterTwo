
// /src/app/odontology/[patientId]/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Odontograma3D from '../odontogram-3d';
import { getPatientById, updatePatient } from '@/services/odontology-service';
import { Patient, OdontogramState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, Printer, FilePenLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OdontogramSummary } from '../odontogram-summary';
import { Textarea } from '@/components/ui/textarea';
import { PrintablePatientHistory } from '../printable-patient-history';
import { EditPatientSheet } from '../edit-patient-sheet';
import html2canvas from 'html2canvas';
import { usePrintStore } from '@/store/print-store';

interface Odontograma3DRef {
  toggleUI: (visible: boolean) => void;
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = params.patientId as string;
  const { toast } = useToast();
  const setPatientForPrint = usePrintStore((state) => state.setPatientForPrint);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [odontogramState, setOdontogramState] = useState<OdontogramState>({});
  const [generalNotes, setGeneralNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  
  const odontogramContainerRef = useRef<HTMLDivElement>(null);
  const odontogramComponentRef = useRef<Odontograma3DRef>(null);

  const isPrinting = searchParams.get('print') === 'true';

  const fetchPatient = useCallback(async () => {
    if (!patientId || isPrinting) return;
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
  }, [patientId, isPrinting, toast]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const handleSave = async () => {
    if (!patient) return false;
    setIsSaving(true);
    try {
      const dataToUpdate = { 
        odontogramState,
        generalNotes,
      };
      await updatePatient(patient.id, dataToUpdate);
      toast({ title: "Éxito", description: "Los cambios en el odontograma y notas han sido guardados." });
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: "Error", description: `No se pudo guardar: ${error.message}`, variant: "destructive" });
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  const handlePrint = async () => {
    const odontogramUI = odontogramComponentRef.current;
    const odontogramElement = odontogramContainerRef.current;
    if (!odontogramUI || !odontogramElement) {
        toast({ title: "Error", description: "El componente del odontograma no está listo.", variant: "destructive" });
        return;
    }

    const saved = await handleSave();
    if (saved && patient) {
        try {
            odontogramUI.toggleUI(false);
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(odontogramElement, { 
                useCORS: true, backgroundColor: '#1a1a2e', logging: false, scale: 2 
            });
            const screenshot = canvas.toDataURL('image/png');
            
            const updatedPatientData: Patient = {
                ...patient,
                generalNotes: generalNotes, 
                odontogramState: odontogramState,
                odontogramScreenshot: screenshot,
            };
            
            setPatientForPrint(updatedPatientData);
            router.push(`/odontology/${patientId}?print=true`);

        } catch (error) {
             console.error("Print Error:", error);
             toast({ title: "Error de Impresión", description: "Ocurrió un error al generar el PDF.", variant: "destructive" });
        } finally {
            odontogramUI.toggleUI(true);
        }
    }
  };

  const handleSheetClose = (updated?: boolean) => {
    setIsEditSheetOpen(false);
    if (updated) {
      fetchPatient();
    }
  };

  if (isPrinting) {
      return <PrintablePatientHistoryWrapper />;
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando datos del paciente...</div>;
  }

  if (!patient) {
    return <div className="flex justify-center items-center h-screen">Paciente no encontrado.</div>;
  }

  return (
    <>
      <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
              <Button onClick={() => router.push('/odontology')} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Listado
              </Button>
              <div className="flex items-center gap-2">
                  <Button onClick={() => setIsEditSheetOpen(true)} variant="secondary">
                      <FilePenLine className="h-4 w-4 mr-2" />
                      Editar Paciente
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Guardando...' : 'Guardar Odontograma'}
                  </Button>
                  <Button onClick={handlePrint} variant="outline">
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir
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
                      placeholder="Anotaciones específicas de la consulta..."
                      className="w-full min-h-[200px]"
                  />
              </div>
          </aside>
          <main className="lg:col-span-3 bg-white p-4 rounded-lg shadow">
              <div ref={odontogramContainerRef} style={{ height: '550px', width: '100%' }}>
                  <Odontograma3D 
                      ref={odontogramComponentRef}
                      initialState={odontogramState}
                      onStateChange={(newState) => setOdontogramState(newState)} 
                  />
              </div>
          </main>
        </div>
      </div>
      
      <EditPatientSheet 
        isOpen={isEditSheetOpen}
        onClose={handleSheetClose}
        patient={patient}
      />
    </>
  );
}

function PrintablePatientHistoryWrapper() {
    const patientForPrint = usePrintStore((state) => state.patientForPrint);
    const router = useRouter();
    const params = useParams();
    
    useEffect(() => {
        if (patientForPrint) {
            document.title = `Historia Clínica - ${patientForPrint.name}`;
            const timer = setTimeout(() => { window.print(); }, 500);
            return () => clearTimeout(timer);
        } else {
            const patientId = params.patientId as string;
            if (patientId) {
                router.replace(`/odontology/${patientId}`);
            } else {
                router.replace('/odontology');
            }
        }
    }, [patientForPrint, params.patientId, router]);
    
    if (!patientForPrint) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg text-gray-600">Redirigiendo... Si la página no carga, por favor, vuelva a la página anterior.</p>
            </div>
        );
    }

    return <PrintablePatientHistory patient={patientForPrint} />;
}

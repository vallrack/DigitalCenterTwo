
// /src/app/odontology/printable-patient-history.tsx
"use client";

import { Patient, OdontogramState } from "@/lib/types";

interface PrintablePatientHistoryProps {
  patient: Patient;
}

const ReportSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6 page-break-inside-avoid">
    <h2 className="text-xl font-bold border-b-2 border-gray-800 pb-2 mb-3">{title}</h2>
    <div className="space-y-2">{children}</div>
  </div>
);

const ReportField = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex text-sm">
        <p className="w-1/2 font-semibold text-gray-700">{label}:</p>
        <p className="w-1/2 text-gray-800">{value || 'No especificado'}</p>
    </div>
);

const getDientesConObservaciones = (odontogramState?: OdontogramState) => {
    if (!odontogramState) return [];
    return Object.entries(odontogramState)
        .filter(([, state]) => state.status !== 'sano' && state.status !== 'ausente')
        .map(([toothId, state]) => ({
            toothId,
            status: state.status,
            condition: state.condition,
        }));
};

export function PrintablePatientHistory({ patient }: PrintablePatientHistoryProps) {
  const dientesConObservaciones = getDientesConObservaciones(patient.odontogramState);
  // Corregido: Construir la dirección completa correctamente
  const fullAddress = [patient.address, patient.municipality, patient.department].filter(Boolean).join(', ');

  return (
    <div className="bg-white text-gray-900 p-8 font-sans">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Historia Clínica Odontológica</h1>
        <p className="text-lg text-gray-600 mt-1">{patient.name}</p>
      </header>

      <main>
        <ReportSection title="Información del Paciente">
            <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                <ReportField label="Cédula" value={patient.identificationNumber} />
                <ReportField label="Edad" value={patient.age} />
                <ReportField label="Género" value={patient.gender} />
                <ReportField label="Teléfono" value={patient.phone} />
                <ReportField label="Email" value={patient.email} />
                <ReportField label="Dirección" value={fullAddress} />
            </div>
        </ReportSection>

        <ReportSection title="Antecedentes Médicos">
             <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                <ReportField label="Alergias" value={patient.allergies} />
                <ReportField label="Medicamentos Actuales" value={patient.currentMedications} />
                <ReportField label="Enfermedades Crónicas" value={patient.chronicDiseases} />
                <ReportField label="Antecedentes Quirúrgicos" value={patient.surgeries} />
                <ReportField label="Hábitos" value={patient.habits} />
            </div>
        </ReportSection>
        
        <ReportSection title="Odontograma">
            {patient.odontogramScreenshot ? (
                <div className="text-center my-4 p-2 border rounded-lg bg-gray-50">
                    <img 
                        src={patient.odontogramScreenshot}
                        alt="Odontograma del paciente"
                        className="max-w-full mx-auto"
                    />
                </div>
            ) : (
                <p className="text-center text-gray-500">No se pudo generar la imagen del odontograma.</p>
            )}
        </ReportSection>

        {dientesConObservaciones.length > 0 && (
            <ReportSection title="Observaciones del Odontograma">
                <div className="p-4 border rounded-lg bg-gray-50">
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {dientesConObservaciones.map(({ toothId, status, condition }) => (
                            <div key={toothId} className="border p-2 rounded-md bg-white text-sm">
                                <p className="font-bold text-gray-800">Diente {toothId}</p>
                                <p className="capitalize"><strong>Estado:</strong> {status}</p>
                                {condition && <p><strong>Obs:</strong> {condition}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </ReportSection>
        )}

        <ReportSection title="Notas de la Consulta">
            <div className="p-4 border rounded-lg bg-gray-50 min-h-[120px] whitespace-pre-wrap text-sm">
                <p>{patient.generalNotes || 'No hay notas generales.'}</p>
            </div>
        </ReportSection>
      </main>

      <footer className="text-center text-xs text-gray-400 mt-10">
          <p>Documento generado el: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>Software de Gestión Odontológica</p>
      </footer>
    </div>
  );
}

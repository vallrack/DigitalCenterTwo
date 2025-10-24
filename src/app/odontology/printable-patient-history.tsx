
// /src/app/odontology/printable-patient-history.tsx
"use client";

import { Patient } from "@/lib/types";

interface PrintablePatientHistoryProps {
  patient: Patient;
}

const ReportSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold border-b-2 border-gray-800 pb-2 mb-3">{title}</h2>
    <div className="space-y-2">{children}</div>
  </div>
);

const ReportField = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex">
    <p className="w-1/3 font-semibold text-gray-600">{label}:</p>
    <p className="w-2/3 text-gray-800">{value || 'No especificado'}</p>
  </div>
);

export function PrintablePatientHistory({ patient }: PrintablePatientHistoryProps) {
  return (
    <div className="bg-white text-gray-900 p-8 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Historia Clínica Odontológica</h1>
        <p className="text-lg">{patient.name}</p>
      </div>

      <ReportSection title="Información del Paciente">
        <ReportField label="Cédula" value={patient.identificationNumber} />
        <ReportField label="Edad" value={patient.age} />
        <ReportField label="Género" value={patient.gender} />
        <ReportField label="Teléfono" value={patient.phone} />
        <ReportField label="Email" value={patient.email} />
        <ReportField label="Dirección" value={`${patient.municipality}, ${patient.department}`} />
      </ReportSection>

      <ReportSection title="Antecedentes Médicos">
        <ReportField label="Alergias" value={patient.allergies} />
        <ReportField label="Medicamentos Actuales" value={patient.currentMedications} />
        <ReportField label="Enfermedades Crónicas" value={patient.chronicDiseases} />
        <ReportField label="Antecedentes Quirúrgicos" value={patient.surgeries} />
        <ReportField label="Hábitos" value={patient.habits} />
      </ReportSection>
      
      {/* TODO: Add Odontogram section here once data is available */}

    </div>
  );
}

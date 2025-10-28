
// /src/app/odontology/patient-details-dialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Patient } from "@/lib/types";

interface PatientDetailsDialogProps {
  patient: Patient | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const DetailItem = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 py-2 border-b">
      <p className="font-semibold text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="md:col-span-2 text-sm text-gray-800 dark:text-gray-200">{value || 'No especificado'}</p>
    </div>
  );

export function PatientDetailsDialog({ patient, isOpen, onOpenChange }: PatientDetailsDialogProps) {
  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Paciente</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Información Personal</h3>
            <DetailItem label="Nombre Completo" value={patient.name} />
            <DetailItem label="Cédula" value={patient.identificationNumber} />
            <DetailItem label="Edad" value={patient.age} />
            <DetailItem label="Género" value={patient.gender} />

            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3">Contacto y Ubicación</h3>
            <DetailItem label="Teléfono" value={patient.phone} />
            <DetailItem label="Email" value={patient.email} />
            <DetailItem label="Dirección" value={patient.address} />
            <DetailItem label="Departamento" value={patient.department} />
            <DetailItem label="Municipio" value={patient.municipality} />

            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3">Historia Clínica</h3>
            <DetailItem label="Alergias" value={patient.allergies} />
            <DetailItem label="Medicamentos Actuales" value={patient.currentMedications} />
            <DetailItem label="Enfermedades Crónicas" value={patient.chronicDiseases} />
            <DetailItem label="Antecedentes Quirúrgicos" value={patient.surgeries} />
            <DetailItem label="Hábitos" value={patient.habits} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

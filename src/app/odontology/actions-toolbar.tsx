// /src/app/odontology/actions-toolbar.tsx
"use client";

import { PatientForm } from "./patient-form";

interface ActionsToolbarProps {
  onPatientAdded: () => void;
}

export function ActionsToolbar({ onPatientAdded }: ActionsToolbarProps) {
  return (
    <div className="flex justify-end">
      <PatientForm onPatientAdded={onPatientAdded} />
    </div>
  );
}

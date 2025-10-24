
// /src/app/odontology/odontology-client.tsx
"use client";

import { useEffect, useState } from "react";
import { getColumns } from "./columns";
import { PatientDataTable } from "./data-table";
import { getPatients } from "@/services/odontology-service";
import { Patient } from "@/lib/types";
import { ActionsToolbar } from "./actions-toolbar";
import { PatientDetailsDialog } from "./patient-details-dialog";

export function OdontologyClient() {
  const [data, setData] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const patients = await getPatients();
    setData(patients);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDetailsDialogOpen(true);
  };

  const columns = getColumns(fetchData, handleViewPatient);

  return (
    <div className="space-y-4">
      <ActionsToolbar onPatientAdded={fetchData} />
      <PatientDataTable columns={columns} data={data} loading={loading} />
      <PatientDetailsDialog 
        patient={selectedPatient} 
        isOpen={isDetailsDialogOpen} 
        onOpenChange={setIsDetailsDialogOpen} 
      />
    </div>
  );
}

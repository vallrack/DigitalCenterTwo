// /src/app/odontology/odontology-client.tsx
"use client";

import { useEffect, useState } from "react";
import { columns } from "./columns";
import { PatientDataTable } from "./data-table";
import { getPatients } from "@/services/odontology-service";
import { Patient } from "@/lib/types";
import { ActionsToolbar } from "./actions-toolbar";

export function OdontologyClient() {
  const [data, setData] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const patients = await getPatients();
    setData(patients);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <ActionsToolbar onPatientAdded={fetchData} />
      <PatientDataTable columns={columns} data={data} loading={loading} />
    </div>
  );
}

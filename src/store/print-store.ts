
// /src/store/print-store.ts
import { create } from 'zustand';
import { Patient } from '@/lib/types';

interface PrintState {
  patientForPrint: Patient | null;
  setPatientForPrint: (patient: Patient) => void;
}

export const usePrintStore = create<PrintState>((set) => ({
  patientForPrint: null,
  setPatientForPrint: (patient) => set({ patientForPrint: patient }),
}));

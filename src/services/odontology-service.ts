// /src/services/odontology-service.ts
import { Patient } from "@/lib/types";

let patients: Patient[] = [
  {
    id: "1",
    name: "Juan Pérez",
    identificationNumber: "12345678",
    age: 30,
    gender: "Masculino",
    contact: "juan.perez@example.com",
    registrationDate: new Date("2023-01-15"),
    medicalHistory: "Paciente con antecedentes de hipertensión. Última consulta para limpieza.",
    odontogramState: {"16":{"status":"present","conditions":["caries"]},"17":{"status":"absent"},"25":{"status":"present","conditions":["restoration"]},"32":{"status":"present","conditions":["fracture","caries"]}}
  },
  {
    id: "2",
    name: "Ana Gómez",
    identificationNumber: "87654321",
    age: 25,
    gender: "Femenino",
    contact: "ana.gomez@example.com",
    registrationDate: new Date("2023-02-20"),
    medicalHistory: "Sin antecedentes médicos de relevancia.",
    odontogramState: {}
  },
  {
    id: "3",
    name: "Luis Torres",
    identificationNumber: "11223344",
    age: 45,
    gender: "Masculino",
    contact: "luis.torres@example.com",
    registrationDate: new Date("2023-03-10"),
    medicalHistory: "Paciente fumador, presenta enfermedad periodontal.",
    odontogramState: {}
  },
];

// GET ALL PATIENTS
export const getPatients = async (): Promise<Patient[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(patients)));
    }, 500);
  });
};

// GET PATIENT BY ID
export const getPatientById = async (id: string): Promise<Patient | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const patient = patients.find((p) => p.id === id);
      resolve(patient ? JSON.parse(JSON.stringify(patient)) : null);
    }, 300);
  });
};

// ADD NEW PATIENT
export const addPatient = async (patient: Omit<Patient, 'id' | 'registrationDate'>): Promise<Patient> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (patients.some(p => p.identificationNumber === patient.identificationNumber)) {
        reject(new Error("Ya existe un paciente con la misma cédula."));
      } else {
        const newPatient: Patient = {
          ...patient,
          id: (patients.length + 1).toString(),
          registrationDate: new Date(),
          medicalHistory: '',
          odontogramState: {},
        };
        patients.push(newPatient);
        resolve(newPatient);
      }
    }, 500);
  });
};

// UPDATE PATIENT
export const updatePatient = async (id: string, updatedData: Partial<Patient>): Promise<Patient> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const patientIndex = patients.findIndex(p => p.id === id);
            if (patientIndex !== -1) {
                patients[patientIndex] = { ...patients[patientIndex], ...updatedData };
                resolve(patients[patientIndex]);
            } else {
                reject(new Error("Paciente no encontrado."));
            }
        }, 500);
    });
};

// DELETE PATIENT
export const deletePatient = async (id: string): Promise<{ success: true }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const initialLength = patients.length;
            patients = patients.filter(p => p.id !== id);
            if (patients.length < initialLength) {
                resolve({ success: true });
            } else {
                reject(new Error("No se pudo encontrar el paciente para eliminar."));
            }
        }, 500);
    });
};

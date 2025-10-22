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
  },
  {
    id: "2",
    name: "Ana Gómez",
    identificationNumber: "87654321",
    age: 25,
    gender: "Femenino",
    contact: "ana.gomez@example.com",
    registrationDate: new Date("2023-02-20"),
  },
  {
    id: "3",
    name: "Luis Torres",
    identificationNumber: "11223344",
    age: 45,
    gender: "Masculino",
    contact: "luis.torres@example.com",
    registrationDate: new Date("2023-03-10"),
  },
];

export const getPatients = async (): Promise<Patient[]> => {
  // Simulate a delay to represent a real API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(patients);
    }, 500);
  });
};

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
        };
        patients.push(newPatient);
        resolve(newPatient);
      }
    }, 500);
  });
};

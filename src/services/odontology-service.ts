// /src/services/odontology-service.ts
import { Patient } from "@/lib/types";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

const PATIENTS_COLLECTION = "patients";

// GET ALL PATIENTS
export const getPatients = async (): Promise<Patient[]> => {
  const q = query(collection(db, PATIENTS_COLLECTION));
  const querySnapshot = await getDocs(q);
  const patients: Patient[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    patients.push({
      id: doc.id,
      name: data.name,
      identificationNumber: data.identificationNumber,
      age: data.age,
      gender: data.gender,
      contact: data.contact,
      registrationDate: data.registrationDate.toDate(),
      medicalHistory: data.medicalHistory,
      odontogramState: data.odontogramState,
    });
  });
  return patients;
};

// GET PATIENT BY ID
export const getPatientById = async (id: string): Promise<Patient | null> => {
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      identificationNumber: data.identificationNumber,
      age: data.age,
      gender: data.gender,
      contact: data.contact,
      registrationDate: data.registrationDate.toDate(),
      medicalHistory: data.medicalHistory,
      odontogramState: data.odontogramState,
    };
  } else {
    return null;
  }
};

// ADD NEW PATIENT
export const addPatient = async (
  patient: Omit<Patient, "id" | "registrationDate">
): Promise<Patient> => {
  const patientsRef = collection(db, PATIENTS_COLLECTION);
  const q = query(
    patientsRef,
    where("identificationNumber", "==", patient.identificationNumber)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error("Ya existe un paciente con la misma cédula.");
  }

  const newPatientRef = await addDoc(collection(db, PATIENTS_COLLECTION), {
    ...patient,
    registrationDate: new Date(),
    medicalHistory: "",
    odontogramState: {},
  });

  return {
    ...patient,
    id: newPatientRef.id,
    registrationDate: new Date(),
    medicalHistory: "",
    odontogramState: {},
  };
};

// UPDATE PATIENT
export const updatePatient = async (
  id: string,
  updatedData: Partial<Patient>
): Promise<Patient> => {
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  await updateDoc(docRef, updatedData);
  const updatedDoc = await getDoc(docRef);
  const data = updatedDoc.data();
  return {
    id: updatedDoc.id,
    name: data.name,
    identificationNumber: data.identificationNumber,
    age: data.age,
    gender: data.gender,
    contact: data.contact,
    registrationDate: data.registrationDate.toDate(),
    medicalHistory: data.medicalHistory,
    odontogramState: data.odontogramState,
  };
};

// DELETE PATIENT
export const deletePatient = async (id: string): Promise<{ success: true }> => {
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  await deleteDoc(docRef);
  return { success: true };
};


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

// UTILITY to flatten patient data from Firestore
const flattenPatientData = (docSnap: any): Patient => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        name: data.name,
        identificationNumber: data.identificationNumber,
        age: data.age,
        gender: data.gender,
        registrationDate: data.registrationDate?.toDate(),
        odontogramState: data.odontogramState,
        generalNotes: data.generalNotes,
        odontogramScreenshot: data.odontogramScreenshot,
        followUps: data.followUps || [], // <-- FIX: Ensure followUps are retrieved
        // Flatten contact details
        phone: data.contact?.phone,
        email: data.contact?.email,
        address: data.contact?.address,
        department: data.contact?.department,
        municipality: data.contact?.municipality,
        // Flatten medical history
        allergies: data.medicalHistory?.allergies,
        currentMedications: data.medicalHistory?.currentMedications,
        chronicDiseases: data.medicalHistory?.chronicDiseases,
        surgeries: data.medicalHistory?.surgeries,
        habits: data.medicalHistory?.habits,
    } as Patient;
};

// GET ALL PATIENTS
export const getPatients = async (): Promise<Patient[]> => {
  const q = query(collection(db, PATIENTS_COLLECTION));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(flattenPatientData);
};

// GET PATIENT BY ID
export const getPatientById = async (id: string): Promise<Patient | null> => {
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return flattenPatientData(docSnap);
  } else {
    return null;
  }
};

// ADD NEW PATIENT
export const addPatient = async (
  patient: Omit<Patient, "id" | "registrationDate">
): Promise<string> => {
  const patientsRef = collection(db, PATIENTS_COLLECTION);
  const q = query(
    patientsRef,
    where("identificationNumber", "==", patient.identificationNumber)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error("Ya existe un paciente con la misma cédula.");
  }

  const newPatientData = {
    name: patient.name,
    identificationNumber: patient.identificationNumber,
    age: patient.age,
    gender: patient.gender,
    registrationDate: new Date(),
    odontogramState: {},
    generalNotes: "",
    followUps: [], // <-- FIX: Initialize followUps array
    contact: {
      phone: patient.phone || null,
      email: patient.email || null,
      address: patient.address || null,
      department: patient.department || null,
      municipality: patient.municipality || null,
    },
    medicalHistory: {
      allergies: patient.allergies || null,
      currentMedications: patient.currentMedications || null,
      chronicDiseases: patient.chronicDiseases || null,
      surgeries: patient.surgeries || null,
      habits: patient.habits || null,
    },
  };

  const newPatientRef = await addDoc(collection(db, PATIENTS_COLLECTION), newPatientData);
  return newPatientRef.id;
};

// UPDATE PATIENT
export const updatePatient = async (
  id: string,
  updatedData: Partial<Patient>
): Promise<void> => {
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  const dataToUpdate: { [key: string]: any } = {};

  // This loop structure allows for updating nested and top-level fields.
  // 'followUps' is a top-level field and will be updated correctly.
  for (const key in updatedData) {
    if (Object.prototype.hasOwnProperty.call(updatedData, key)) {
      const value = updatedData[key as keyof Patient];
      
      if (key === 'id') continue;

      if (['phone', 'email', 'address', 'department', 'municipality'].includes(key)) {
        // Use dot notation for nested fields in Firestore
        dataToUpdate[`contact.${key}`] = value;
      } else if (['allergies', 'currentMedications', 'chronicDiseases', 'surgeries', 'habits'].includes(key)) {
        dataToUpdate[`medicalHistory.${key}`] = value;
      } else {
        // Direct update for top-level fields like 'name', 'age', 'odontogramState', 'followUps', etc.
        dataToUpdate[key] = value;
      }
    }
  }

  if (Object.keys(dataToUpdate).length > 0) {
    await updateDoc(docRef, dataToUpdate);
  }
};

// DELETE PATIENT
export const deletePatient = async (id: string): Promise<void> => {
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  await deleteDoc(docRef);
};

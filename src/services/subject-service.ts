// /src/services/subject-service.ts
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Subject } from '@/lib/types';

const subjectsCollection = collection(db, 'subjects');

// CREATE
export const addSubject = async (subjectData: Omit<Subject, 'id'>) => {
  try {
    const docRef = await addDoc(subjectsCollection, {
      ...subjectData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding subject: ', error);
    throw error;
  }
};

// READ
export const getSubjects = async (): Promise<Subject[]> => {
  try {
    const q = query(subjectsCollection, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Subject, 'id'>),
    }));
  } catch (error) {
    console.error('Error getting subjects: ', error);
    throw error;
  }
};

// UPDATE
export const updateSubject = async (
  id: string,
  updates: Partial<Omit<Subject, 'id'>>
) => {
  try {
    const subjectDoc = doc(db, 'subjects', id);
    await updateDoc(subjectDoc, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating subject: ', error);
    throw error;
  }
};

// DELETE
export const deleteSubject = async (id: string) => {
  try {
    const subjectDoc = doc(db, 'subjects', id);
    await deleteDoc(subjectDoc);
  } catch (error) {
    console.error('Error deleting subject: ', error);
    throw error;
  }
};

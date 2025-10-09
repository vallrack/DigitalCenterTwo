// /src/services/grade-service.ts
import {
  collection,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Grade } from '@/lib/types';

const gradesCollection = collection(db, 'grades');

// CREATE
export const addGrade = async (gradeData: Omit<Grade, 'id'>) => {
  try {
    const docRef = await addDoc(gradesCollection, {
      ...gradeData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding grade: ', error);
    throw error;
  }
};

// READ grades for a specific student in a specific subject
export const getGrades = async (studentId: string, subjectId: string): Promise<Grade[]> => {
  try {
    const q = query(
        gradesCollection, 
        where('studentId', '==', studentId), 
        where('subjectId', '==', subjectId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Grade, 'id'>),
    }));
  } catch (error) {
    console.error('Error getting grades: ', error);
    throw error;
  }
};

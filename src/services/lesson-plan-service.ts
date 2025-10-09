// /src/services/lesson-plan-service.ts
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
import type { LessonPlan } from '@/lib/types';

const lessonPlansCollection = collection(db, 'lessonPlans');

// CREATE
export const addLessonPlan = async (planData: Omit<LessonPlan, 'id'>) => {
  try {
    const docRef = await addDoc(lessonPlansCollection, {
      ...planData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding lesson plan: ', error);
    throw error;
  }
};

// READ
export const getLessonPlans = async (): Promise<LessonPlan[]> => {
  try {
    const q = query(lessonPlansCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<LessonPlan, 'id'>),
    }));
  } catch (error) {
    console.error('Error getting lesson plans: ', error);
    throw error;
  }
};

// UPDATE
export const updateLessonPlan = async (
  id: string,
  updates: Partial<Omit<LessonPlan, 'id'>>
) => {
  try {
    const planDoc = doc(db, 'lessonPlans', id);
    await updateDoc(planDoc, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating lesson plan: ', error);
    throw error;
  }
};

// DELETE
export const deleteLessonPlan = async (id: string) => {
  try {
    const planDoc = doc(db, 'lessonPlans', id);
    await deleteDoc(planDoc);
  } catch (error) {
    console.error('Error deleting lesson plan: ', error);
    throw error;
  }
};

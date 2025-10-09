// /src/services/academic-settings-service.ts
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
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AcademicPeriod, GradingActivity } from '@/lib/types';
import { auth } from '@/lib/firebase';

const periodsCollection = collection(db, 'academicPeriods');
const activitiesCollection = collection(db, 'gradingActivities');

// --- Academic Period Services ---

export const getAcademicPeriods = async (organizationId: string): Promise<AcademicPeriod[]> => {
  try {
    const q = query(
        periodsCollection, 
        where('organizationId', '==', organizationId)
    );
    const snapshot = await getDocs(q);
    const periods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AcademicPeriod));
    // Sort client-side to avoid composite index
    return periods.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  } catch (error) {
    console.error("Error fetching academic periods:", error);
    throw error;
  }
};

export const addAcademicPeriod = async (periodData: Omit<AcademicPeriod, 'id'>) => {
  try {
    const docRef = await addDoc(periodsCollection, { ...periodData, createdAt: serverTimestamp() });
    return docRef.id;
  } catch (error) {
    console.error("Error adding academic period:", error);
    throw error;
  }
};

export const updateAcademicPeriod = async (id: string, updates: Partial<AcademicPeriod>) => {
  try {
    const periodDoc = doc(db, 'academicPeriods', id);
    await updateDoc(periodDoc, { ...updates, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error("Error updating academic period:", error);
    throw error;
  }
};

// --- Grading Activity Services ---

export const getGradingActivities = async (organizationId: string): Promise<GradingActivity[]> => {
  try {
    const q = query(
        activitiesCollection, 
        where('organizationId', '==', organizationId)
    );
    const snapshot = await getDocs(q);
    const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GradingActivity));
    // Sort client-side to avoid composite index
    return activities.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching grading activities:", error);
    throw error;
  }
};

export const addGradingActivity = async (activityData: Omit<GradingActivity, 'id'>) => {
  try {
    const docRef = await addDoc(activitiesCollection, { ...activityData, createdAt: serverTimestamp() });
    return docRef.id;
  } catch (error) {
    console.error("Error adding grading activity:", error);
    throw error;
  }
};

export const updateGradingActivity = async (id: string, updates: Partial<GradingActivity>) => {
  try {
    const activityDoc = doc(db, 'gradingActivities', id);
    await updateDoc(activityDoc, { ...updates, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error("Error updating grading activity:", error);
    throw error;
  }
};

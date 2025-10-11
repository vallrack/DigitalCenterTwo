// /src/services/activity-log-service.ts
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

// Define the structure of an activity log entry in the database
export interface ActivityLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  organizationId: string;
  message: string;
  details: ActivityDetails;
}

const activityLogCollection = collection(db, 'activityLog');

interface ActivityDetails {
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'APPROVE';
  collectionName: string;
  docId: string;
  changes?: Record<string, any>;
}

/**
 * Logs a specific user activity to the activityLog collection in Firestore.
 */
export const logActivity = async (
  user: UserProfile | null,
  details: ActivityDetails,
  customMessage?: string
) => {
  if (!user) return;

  try {
    let message = customMessage || '';
    if (!message) {
      const actionSpanish = {
        CREATE: 'creó',
        UPDATE: 'actualizó',
        DELETE: 'eliminó',
        LOGIN: 'inició sesión',
        APPROVE: 'aprobó',
      };
      const entitySpanish: { [key: string]: string } = {
        students: 'un estudiante',
        invoices: 'una factura',
        employees: 'un empleado',
        users: 'un usuario',
        organizations: 'una organización',
      };
      
      const action = actionSpanish[details.type] || 'realizó una acción en';
      const entity = entitySpanish[details.collectionName] || `un documento en ${details.collectionName}`;

      message = `${user.name} ${action} ${entity}.`;
    }

    await addDoc(activityLogCollection, {
      timestamp: serverTimestamp(),
      userId: user.uid,
      userName: user.name,
      organizationId: user.organizationId,
      message,
      details,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

/**
 * Listens for real-time updates to the activity log.
 * @param callback Function to call with the new list of activities.
 * @param onError Function to call on error.
 * @returns An unsubscribe function to stop listening.
 */
export const listenToActivityLog = (
  callback: (activities: ActivityLog[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(activityLogCollection, orderBy('timestamp', 'desc'), limit(50));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(), // Convert Firestore Timestamp to Date
    })) as ActivityLog[];
    callback(activities);
  }, (error) => {
    console.error("Error listening to activity log:", error);
    onError(error);
  });

  return unsubscribe;
};

// /src/services/settings-service.ts
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SystemSettings } from '@/lib/types';

const settingsDocRef = doc(db, 'system', 'settings');

// READ
export const getSystemSettings = async (): Promise<SystemSettings> => {
  try {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as SystemSettings;
    } else {
      // Return default settings if document doesn't exist
      return {
        taxRate: 19, // Default to 19%
      };
    }
  } catch (error) {
    console.error('Error getting system settings: ', error);
    throw error;
  }
};

// UPDATE
export const updateSystemSettings = async (
  settingsData: Partial<SystemSettings>
) => {
  try {
    await setDoc(settingsDocRef, {
      ...settingsData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating system settings: ', error);
    throw error;
  }
};

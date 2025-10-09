// /src/services/communications-settings-service.ts
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CommunicationsSettings } from '@/lib/types';

const getSettingsDocRef = (organizationId: string) => 
  doc(db, 'organizations', organizationId, 'settings', 'communications');

// READ
export const getCommunicationsSettings = async (organizationId: string): Promise<CommunicationsSettings> => {
  try {
    const docSnap = await getDoc(getSettingsDocRef(organizationId));
    if (docSnap.exists()) {
      return docSnap.data() as CommunicationsSettings;
    } else {
      // Return default settings if document doesn't exist
      return {
        defaultEmailFooter: `Atentamente,\nEl Equipo`,
      };
    }
  } catch (error) {
    console.error('Error getting communications settings: ', error);
    throw error;
  }
};

// UPDATE
export const updateCommunicationsSettings = async (
  organizationId: string,
  settingsData: Partial<CommunicationsSettings>
) => {
  try {
    await setDoc(getSettingsDocRef(organizationId), {
      ...settingsData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating communications settings: ', error);
    throw error;
  }
};

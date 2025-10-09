// /src/services/crm-settings-service.ts
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CrmSettings } from '@/lib/types';

const getSettingsDocRef = (organizationId: string) => 
  doc(db, 'organizations', organizationId, 'settings', 'crm');

// READ
export const getCrmSettings = async (organizationId: string): Promise<CrmSettings> => {
  try {
    const docSnap = await getDoc(getSettingsDocRef(organizationId));
    if (docSnap.exists()) {
      return docSnap.data() as CrmSettings;
    } else {
      // Return default settings if document doesn't exist
      return {
        acquisitionChannels: ['Referido', 'Pauta Digital', 'Redes Sociales', 'Evento', 'Llamada en Frío', 'Sitio Web'],
      };
    }
  } catch (error) {
    console.error('Error getting CRM settings: ', error);
    throw error;
  }
};

// UPDATE
export const updateCrmSettings = async (
  organizationId: string,
  settingsData: Partial<CrmSettings>
) => {
  try {
    await setDoc(getSettingsDocRef(organizationId), {
      ...settingsData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating CRM settings: ', error);
    throw error;
  }
};

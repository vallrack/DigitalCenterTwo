// /src/services/communications-service.ts
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
import type { Template, Campaign, TemplateType, UserProfile } from '@/lib/types';

const templatesCollection = collection(db, 'templates');
const campaignsCollection = collection(db, 'campaigns');

// --- Template Services ---

export const getTemplates = async (userProfile: UserProfile, type?: TemplateType): Promise<Template[]> => {
  try {
    const constraints = [];
    if (type) {
        constraints.push(where('type', '==', type));
    }
    
    let q;
    if (userProfile.role === 'SuperAdmin') {
        q = query(collection(db, 'templates'), ...constraints, orderBy('createdAt', 'desc'));
    } else if (userProfile.organizationId) {
        constraints.push(where('organizationId', '==', userProfile.organizationId));
        q = query(templatesCollection, ...constraints, orderBy('createdAt', 'desc'));
    } else {
        return [];
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
};

export const addTemplate = async (templateData: Omit<Template, 'id' | 'createdAt' | 'organizationId' | 'type'> & { type: TemplateType }, userProfile: UserProfile) => {
  if (!userProfile.organizationId) throw new Error("Authentication required.");

  try {
    const docRef = await addDoc(templatesCollection, { 
        ...templateData, 
        organizationId: userProfile.organizationId,
        createdAt: serverTimestamp() 
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding template:", error);
    throw error;
  }
};

export const updateTemplate = async (id: string, updates: Partial<Template>) => {
    try {
        const templateDoc = doc(db, 'templates', id);
        await updateDoc(templateDoc, { ...updates, updatedAt: serverTimestamp() });
    } catch (error) {
        console.error("Error updating template:", error);
        throw error;
    }
}

export const deleteTemplate = async (id: string) => {
    try {
        const templateDoc = doc(db, 'templates', id);
        await deleteDoc(templateDoc);
    } catch (error) {
        console.error("Error deleting template:", error);
        throw error;
    }
}

// --- Campaign Services ---

export const getCampaigns = async (userProfile: UserProfile): Promise<Campaign[]> => {
  try {
    let q;
    if (userProfile.role === 'SuperAdmin') {
        q = query(campaignsCollection, orderBy('createdAt', 'desc'));
    } else if (userProfile.organizationId) {
        q = query(campaignsCollection, where('organizationId', '==', userProfile.organizationId), orderBy('createdAt', 'desc'));
    } else {
        return [];
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};

export const addCampaign = async (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'organizationId'>, userProfile: UserProfile) => {
  if (!userProfile.organizationId) throw new Error("Authentication required.");

  try {
    const docRef = await addDoc(campaignsCollection, { 
        ...campaignData, 
        organizationId: userProfile.organizationId,
        createdAt: serverTimestamp() 
    });
    return docRef.id;
  } catch (error)
 {
    console.error("Error adding campaign:", error);
    throw error;
  }
};

export const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
        const campaignDoc = doc(db, 'campaigns', id);
        await updateDoc(campaignDoc, { ...updates, updatedAt: serverTimestamp() });
    } catch (error) {
        console.error("Error updating campaign:", error);
        throw error;
    }
}

export const deleteCampaign = async (id: string) => {
    try {
        const campaignDoc = doc(db, 'campaigns', id);
        await deleteDoc(campaignDoc);
    } catch (error) {
        console.error("Error deleting campaign:", error);
        throw error;
    }
}

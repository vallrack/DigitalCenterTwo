// /src/services/opportunity-service.ts
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
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Opportunity } from '@/lib/types';
import { auth } from '@/lib/firebase';

const getOpportunitiesCollection = () => {
    // This could be scoped per organization in a multi-tenant app
    return collection(db, 'opportunities');
}

// CREATE
export const addOpportunity = async (opportunityData: Omit<Opportunity, 'id'>) => {
  try {
    const docRef = await addDoc(getOpportunitiesCollection(), {
      ...opportunityData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding opportunity: ', error);
    throw error;
  }
};

// READ opportunities for a specific customer
export const getOpportunitiesByCustomer = async (customerId: string): Promise<Opportunity[]> => {
  try {
    // Query without ordering to prevent needing a composite index
    const q = query(
        getOpportunitiesCollection(), 
        where('customerId', '==', customerId)
    );
    const snapshot = await getDocs(q);
    
    const opportunities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Opportunity, 'id'>),
    }));

    // Sort the results in the client-side code
    return opportunities.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt as Timestamp).toMillis() : 0;
        const dateB = b.createdAt ? (b.createdAt as Timestamp).toMillis() : 0;
        return dateB - dateA; // Sort descending
    });

  } catch (error) {
    console.error('Error getting opportunities: ', error);
    throw error;
  }
};

// READ all opportunities (e.g., for a dashboard view)
export const getAllOpportunities = async (): Promise<Opportunity[]> => {
  try {
    // In a real multi-tenant app, you would add a where('organizationId', '==', user.orgId) clause
    const q = query(getOpportunitiesCollection(), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Opportunity, 'id'>),
    }));
  } catch (error) {
    console.error('Error getting all opportunities: ', error);
    throw error;
  }
};


// UPDATE
export const updateOpportunity = async (
  id: string,
  updates: Partial<Omit<Opportunity, 'id'>>
) => {
  try {
    const opportunityDoc = doc(db, 'opportunities', id);
    const updateData: any = { ...updates, updatedAt: serverTimestamp() };

    // If status is changed to 'Ganada' or 'Perdida', set the closedAt timestamp
    if (updates.status === 'Ganada' || updates.status === 'Perdida') {
        updateData.closedAt = serverTimestamp();
    }

    await updateDoc(opportunityDoc, updateData);
  } catch (error) {
    console.error('Error updating opportunity: ', error);
    throw error;
  }
};

// DELETE
export const deleteOpportunity = async (id: string) => {
  try {
    const opportunityDoc = doc(db, 'opportunities', id);
    await deleteDoc(opportunityDoc);
  } catch (error) {
    console.error('Error deleting opportunity: ', error);
    throw error;
  }
};

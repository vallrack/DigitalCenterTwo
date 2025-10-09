// /src/services/interaction-service.ts
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Interaction } from '@/lib/types';

const interactionsCollection = collection(db, 'interactions');

// CREATE
export const addInteraction = async (interactionData: Omit<Interaction, 'id'>) => {
  try {
    const docRef = await addDoc(interactionsCollection, {
      ...interactionData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding interaction: ', error);
    throw error;
  }
};

// READ interactions for a specific customer
export const getInteractionsByCustomer = async (customerId: string): Promise<Interaction[]> => {
  try {
    const q = query(
      interactionsCollection,
      where('customerId', '==', customerId)
    );
    const snapshot = await getDocs(q);
    
    const interactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Interaction, 'id'>),
    }));

    // Sort client-side to avoid composite index
    return interactions.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt as Timestamp).toMillis() : new Date(a.date).getTime();
        const dateB = b.createdAt ? (b.createdAt as Timestamp).toMillis() : new Date(b.date).getTime();
        return dateB - dateA;
    });

  } catch (error) {
    console.error('Error getting interactions: ', error);
    throw error;
  }
};

// DELETE
export const deleteInteraction = async (id: string) => {
  try {
    const interactionDoc = doc(db, 'interactions', id);
    await deleteDoc(interactionDoc);
  } catch (error) {
    console.error('Error deleting interaction: ', error);
    throw error;
  }
};

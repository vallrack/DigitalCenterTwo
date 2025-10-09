// /src/services/organization-service.ts
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
  writeBatch,
  where,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Organization } from '@/lib/types';

const organizationsCollection = collection(db, 'organizations');
const usersCollection = collection(db, 'users');

// CREATE
export const addOrganization = async (orgData: Omit<Organization, 'id'>) => {
  try {
    const docRef = await addDoc(organizationsCollection, {
      ...orgData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding organization: ', error);
    throw error;
  }
};

// READ
export const getOrganizations = async (): Promise<Organization[]> => {
  try {
    const q = query(organizationsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Organization, 'id'>),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting organizations: ', error);
    throw error;
  }
};

// UPDATE
export const updateOrganization = async (
  id: string,
  updates: Partial<Omit<Organization, 'id'>>
) => {
  const batch = writeBatch(db);
  try {
    const orgDoc = doc(db, 'organizations', id);
    batch.update(orgDoc, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Smart Activation Logic: If setting status to 'OnTrial', find the prospect and make them an Admin.
    if (updates.contractStatus === 'OnTrial') {
        const userQuery = query(
            usersCollection,
            where('organizationId', '==', id),
            where('role', '==', 'EnEspera'),
            limit(1)
        );
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userRef = doc(db, 'users', userDoc.id);
            batch.update(userRef, { role: 'Admin' });
        }
    }

    await batch.commit();
  } catch (error) {
    console.error('Error updating organization: ', error);
    throw error;
  }
};


// DELETE
export const deleteOrganization = async (id: string) => {
  try {
    const orgDoc = doc(db, 'organizations', id);
    await deleteDoc(orgDoc);
  } catch (error) {
    console.error('Error deleting organization: ', error);
    throw error;
  }
};

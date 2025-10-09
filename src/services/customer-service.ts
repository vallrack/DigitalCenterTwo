// /src/services/customer-service.ts
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
import type { Customer, UserProfile } from '@/lib/types';

const customersCollection = collection(db, 'customers');

// CREATE
export const addCustomer = async (
  customerData: Omit<Customer, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>,
  userProfile: UserProfile
) => {
  if (!userProfile.organizationId) {
    throw new Error("El usuario no está asociado a una organización.");
  }
  try {
    const docRef = await addDoc(customersCollection, {
      ...customerData,
      organizationId: userProfile.organizationId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding customer: ', error);
    throw error;
  }
};

// READ
export const getCustomers = async (userProfile?: UserProfile | null): Promise<Customer[]> => {
  if (!userProfile) return [];
  try {
    let q;
    if (userProfile.role === 'SuperAdmin') {
      q = query(customersCollection, orderBy('createdAt', 'desc'));
    } else if (userProfile.organizationId) {
      q = query(
        customersCollection,
        where('organizationId', '==', userProfile.organizationId)
      );
    } else {
      return []; // No organization, no customers
    }

    const snapshot = await getDocs(q);
    const customerList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Customer, 'id'>),
    }));

    // For non-superadmin, sort client-side
    if (userProfile.role !== 'SuperAdmin') {
      customerList.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt as Timestamp).toMillis() : 0;
        const dateB = b.createdAt ? (b.createdAt as Timestamp).toMillis() : 0;
        return dateB - dateA;
      });
    }

    return customerList;
  } catch (error) {
    console.error('Error getting customers: ', error);
    throw error;
  }
};

// UPDATE
export const updateCustomer = async (
  id: string,
  updates: Partial<Omit<Customer, 'id'>>
) => {
  try {
    const customerDoc = doc(db, 'customers', id);
    await updateDoc(customerDoc, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating customer: ', error);
    throw error;
  }
};

// DELETE
export const deleteCustomer = async (id: string) => {
  try {
    const customerDoc = doc(db, 'customers', id);
    await deleteDoc(customerDoc);
  } catch (error) {
    console.error('Error deleting customer: ', error);
    throw error;
  }
};

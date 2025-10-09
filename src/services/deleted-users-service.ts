// /src/services/deleted-users-service.ts
import {
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DeletedUserLog } from '@/lib/types';

const deletedUsersLogCollection = collection(db, 'deletedUsersLog');

export const getDeletedUsersLog = async (): Promise<DeletedUserLog[]> => {
  try {
    const q = query(deletedUsersLogCollection, orderBy('deletedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<DeletedUserLog, 'id'>),
    }));
  } catch (error) {
    console.error('Error getting deleted users log: ', error);
    throw error;
  }
};

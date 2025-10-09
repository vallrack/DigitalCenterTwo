// /src/services/contact-service.ts
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ContactMessage } from '@/lib/types';

const contactMessagesCollection = collection(db, 'contactMessages');

// CREATE
export const addContactMessage = async (
  messageData: Omit<ContactMessage, 'id'>
) => {
  try {
    const docRef = await addDoc(contactMessagesCollection, {
      ...messageData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding contact message: ', error);
    throw error;
  }
};

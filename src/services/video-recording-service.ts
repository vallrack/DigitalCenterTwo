// /src/services/video-recording-service.ts
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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { VideoRecording } from '@/lib/types';

const recordingsCollection = collection(db, 'videoRecordings');

// CREATE
export const addVideoRecording = async (recordingData: Omit<VideoRecording, 'id'>) => {
  try {
    const docRef = await addDoc(recordingsCollection, {
      ...recordingData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding video recording: ', error);
    throw error;
  }
};

// READ
export const getVideoRecordings = async (): Promise<VideoRecording[]> => {
  try {
    const q = query(recordingsCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<VideoRecording, 'id'>),
    }));
  } catch (error) {
    console.error('Error getting video recordings: ', error);
    throw error;
  }
};

// UPDATE
export const updateVideoRecording = async (
  id: string,
  updates: Partial<Omit<VideoRecording, 'id'>>
) => {
  try {
    const recordingDoc = doc(db, 'videoRecordings', id);
    await updateDoc(recordingDoc, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating video recording: ', error);
    throw error;
  }
};

// DELETE
export const deleteVideoRecording = async (id: string) => {
  try {
    const recordingDoc = doc(db, 'videoRecordings', id);
    await deleteDoc(recordingDoc);
  } catch (error) {
    console.error('Error deleting video recording: ', error);
    throw error;
  }
};

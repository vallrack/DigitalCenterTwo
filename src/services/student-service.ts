// /src/services/student-service.ts
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
import type { Student, UserProfile } from '@/lib/types';
import { logActivity } from './activity-log-service'; // Import the logger

const studentsCollection = collection(db, 'students');

// CREATE
export const addStudent = async (
  studentData: Omit<Student, 'id' | 'organizationId'>,
  userProfile: UserProfile
) => {
  try {
    const organizationId = userProfile.organizationId;
    if (!organizationId && userProfile.role !== 'SuperAdmin') {
      throw new Error('User does not belong to an organization.');
    }
    
    const finalOrganizationId = userProfile.role === 'SuperAdmin' 
      ? (studentData as any).organizationId 
      : organizationId;

    if (!finalOrganizationId) {
        throw new Error('Organization ID is required to create a student.');
    }

    const docRef = await addDoc(studentsCollection, {
      ...studentData,
      organizationId: finalOrganizationId,
      createdAt: serverTimestamp(),
    });
    
    // Log this activity
    logActivity(userProfile, {
      type: 'CREATE',
      collectionName: 'students',
      docId: docRef.id,
      changes: { name: studentData.name, grade: studentData.grade },
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding student: ', error);
    throw error;
  }
};

// READ all students (filtered by organization for non-SuperAdmins)
export const getStudents = async (userProfile?: UserProfile | null): Promise<Student[]> => {
  if (!userProfile) return [];
  
  try {
    let q;
    if (userProfile.role === 'SuperAdmin') {
      q = query(studentsCollection, orderBy('name', 'asc'));
    } else if (userProfile.organizationId) {
      q = query(
        studentsCollection,
        where('organizationId', '==', userProfile.organizationId),
        orderBy('name', 'asc')
      );
    } else {
      return [];
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Student, 'id'>),
    }));
  } catch (error) {
    console.error('Error getting students: ', error);
    throw error;
  }
};


// UPDATE
export const updateStudent = async (
  id: string,
  updates: Partial<Omit<Student, 'id'>>,
  userProfile: UserProfile // Added for logging
) => {
  try {
    const studentDoc = doc(db, 'students', id);
    await updateDoc(studentDoc, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    // Log this activity
    logActivity(userProfile, {
        type: 'UPDATE',
        collectionName: 'students',
        docId: id,
        changes: updates,
    });

  } catch (error) {
    console.error('Error updating student: ', error);
    throw error;
  }
};

// DELETE
export const deleteStudent = async (id: string, userProfile: UserProfile) => { // Added for logging
  try {
    const studentDoc = doc(db, 'students', id);
    await deleteDoc(studentDoc);
    
    // Log this activity
    logActivity(userProfile, {
        type: 'DELETE',
        collectionName: 'students',
        docId: id,
    });

  } catch (error) {
    console.error('Error deleting student: ', error);
    throw error;
  }
};

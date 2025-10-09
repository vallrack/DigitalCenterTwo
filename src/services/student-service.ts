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

const studentsCollection = collection(db, 'students');

// CREATE
export const addStudent = async (studentData: Omit<Student, 'id'>) => {
  try {
    const docRef = await addDoc(studentsCollection, {
      ...studentData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding student: ', error);
    throw error;
  }
};

// READ all students (filtered by organization for non-SuperAdmins)
export const getStudents = async (userProfile?: UserProfile | null): Promise<Student[]> => {
  // Add a guard clause to prevent error if userProfile is not ready
  if (!userProfile) {
    return [];
  }
  
  try {
    let q;
    if (userProfile.role === 'SuperAdmin') {
      // SuperAdmin gets all students, ordered by name
      q = query(studentsCollection, orderBy('name', 'asc'));
    } else if (userProfile.organizationId) {
      // Other roles get students from their organization, unordered from Firestore
      q = query(
        studentsCollection,
        where('organizationId', '==', userProfile.organizationId)
      );
    } else {
      // A non-SuperAdmin without an organizationId sees nothing.
      return [];
    }
    
    const snapshot = await getDocs(q);
    const studentList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Student, 'id'>),
    }));

    // If it wasn't a SuperAdmin query, sort the results here
    if (userProfile.role !== 'SuperAdmin') {
      studentList.sort((a, b) => a.name.localeCompare(b.name));
    }

    return studentList;
  } catch (error) {
    console.error('Error getting students: ', error);
    throw error;
  }
};


// UPDATE
export const updateStudent = async (
  id: string,
  updates: Partial<Omit<Student, 'id'>>
) => {
  try {
    const studentDoc = doc(db, 'students', id);
    await updateDoc(studentDoc, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating student: ', error);
    throw error;
  }
};

// DELETE
export const deleteStudent = async (id: string) => {
  try {
    const studentDoc = doc(db, 'students', id);
    await deleteDoc(studentDoc);
  } catch (error) {
    console.error('Error deleting student: ', error);
    throw error;
  }
};

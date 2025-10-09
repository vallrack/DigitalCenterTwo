// /src/services/employee-service.ts
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
  getDoc,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Employee, UserProfile } from '@/lib/types';

const employeesCollection = collection(db, 'employees');

// CREATE an employee (typically done via user creation now)
export const addEmployee = async (employeeData: Omit<Employee, 'id'>) => {
  try {
    const docRef = await addDoc(employeesCollection, {
      ...employeeData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding employee: ', error);
    throw error;
  }
};


// READ all employees (filtered by organization for non-SuperAdmins)
export const getEmployees = async (userProfile: UserProfile | null): Promise<Employee[]> => {
  if (!userProfile) return [];
  try {
    let q;
    if (userProfile.role === 'SuperAdmin') {
      q = query(employeesCollection, orderBy('name', 'asc'));
    } else if (userProfile.organizationId) {
      // Query only by organizationId to avoid composite index requirement
      q = query(
        employeesCollection,
        where('organizationId', '==', userProfile.organizationId)
      );
    } else {
      return []; // No organization, no employees
    }
    
    const snapshot = await getDocs(q);
    const employeeList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Employee, 'id'>),
    }));

    // If it wasn't a SuperAdmin query, sort the results client-side
    if (userProfile.role !== 'SuperAdmin') {
        employeeList.sort((a, b) => a.name.localeCompare(b.name));
    }

    return employeeList;
  } catch (error) {
    console.error('Error getting employees: ', error);
    throw error;
  }
};

// READ a single employee
export const getEmployee = async (id: string): Promise<Employee | null> => {
  try {
    const employeeDoc = doc(db, 'employees', id);
    const docSnap = await getDoc(employeeDoc);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Employee;
    }
    return null;
  } catch (error) {
    console.error('Error getting employee:', error);
    throw error;
  }
};


// UPDATE an employee's profile details
export const updateEmployee = async (
  id: string,
  updates: Partial<Omit<Employee, 'id'>>
) => {
  try {
    const employeeDoc = doc(db, 'employees', id);
    await updateDoc(employeeDoc, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating employee: ', error);
    throw error;
  }
};

// DELETE (This is now handled by the user-service and delete-user flow)
export const deleteEmployee = async (id: string) => {
  try {
    const employeeDoc = doc(db, 'employees', id);
    await deleteDoc(employeeDoc);
  } catch (error) {
    console.error('Error deleting employee: ', error);
    throw error;
  }
};

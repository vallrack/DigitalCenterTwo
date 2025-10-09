// /src/services/user-service.ts
import { 
    doc, 
    updateDoc, 
    serverTimestamp, 
    collection, 
    getDocs, 
    query, 
    orderBy,
    writeBatch,
    where,
    setDoc,
    addDoc,
    getDoc,
    deleteDoc,
    limit,
} from 'firebase/firestore';
import { 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    User,
    AuthProvider as FirebaseAuthProvider, // Renamed to avoid conflict
} from 'firebase/auth';
import { db, auth, googleProvider, appleProvider } from '@/lib/firebase';
import type { UserProfile, Organization, Employee, UserRole } from '@/lib/types';
import { addDays, format } from 'date-fns';
import { initializeChatRoomsForOrg } from './chat-service';
import { deleteUser } from '@/ai/flows/delete-user';
import { createNewUserServer } from '@/ai/flows/create-user-server';

const usersCollection = collection(db, 'users');
const employeesCollection = collection(db, 'employees');
const organizationsCollection = collection(db, 'organizations');

type SelectedModules = Partial<Organization['modules']>;

// This function is now ONLY used by the SIGNUP flow.
export const processNewUser = async (
    userCredentials: { name: string; email: string; password?: string },
    selectedModules: SelectedModules
) => {
    // Step 1: Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, userCredentials.email, userCredentials.password!);
    const user = userCredential.user;
    
    const batch = writeBatch(db);

    // Step 2: Create a new Organization for the user
    const newOrgRef = doc(organizationsCollection);
    const orgName = `Organización de ${userCredentials.name}`;
    
    const allModules: Organization['modules'] = {
        hr: selectedModules.hr || false,
        academics: selectedModules.academics || false,
        finance: selectedModules.finance || false,
        students: selectedModules.students || false,
        inventory: selectedModules.inventory || false,
        sales: selectedModules.sales || false,
        reports: selectedModules.reports || false,
        landingPage: selectedModules.landingPage || false,
        communications: selectedModules.communications || false,
    };
    
    const newOrganization: Partial<Omit<Organization, 'id'>> = {
        name: orgName,
        modules: allModules,
        createdAt: serverTimestamp() as any,
        contractStatus: 'Pending',
        subscriptionEnds: 'N/A', // Set to N/A until approved
    };
    batch.set(newOrgRef, newOrganization, { merge: true });

    // Step 3: Create the UserProfile with 'EnEspera' role
    const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        role: 'EnEspera',
        name: userCredentials.name,
        avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
        forcePasswordChange: false,
        status: 'Active',
        organizationId: newOrgRef.id,
    };
    const userDocRef = doc(db, 'users', user.uid);
    batch.set(userDocRef, newProfile);

    // Step 4: Commit the batch
    await batch.commit();
}


export const getUsers = async (role?: UserRole): Promise<UserProfile[]> => {
    try {
        const constraints = [];
        if (role) {
            constraints.push(where('role', '==', role));
        }
        
        const q = query(usersCollection, ...constraints);
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => doc.data() as UserProfile);

        // Sort client-side to avoid composite index issues
        users.sort((a, b) => a.name.localeCompare(b.name));

        return users;
    } catch (error) {
        console.error("Error getting users:", error);
        throw error;
    }
}

export const createUser = async (data: any) => {
    try {
        // Use the server-side flow to create the user without signing them in
        const result = await createNewUserServer(data);
        if (!result.uid) {
            throw new Error(result.error || "Failed to create user on server.");
        }
        return { uid: result.uid };
    } catch (error) {
        console.error("Error creating user via server flow:", error);
        throw error;
    }
};

export const updateUserProfileAndEmployee = async (
  uid: string,
  updates: Partial<UserProfile>
) => {
  const batch = writeBatch(db);
  try {
    const userDocRef = doc(db, 'users', uid);
    batch.update(userDocRef, { ...updates, updatedAt: serverTimestamp() });

    const employeeDocRef = doc(db, 'employees', uid);
    const employeeDocSnap = await getDoc(employeeDocRef);
    
    // Only update the employee record if it exists.
    if (employeeDocSnap.exists()) {
        const employeeUpdates: Partial<Employee> = {};
        if (updates.name) employeeUpdates.name = updates.name;
        if (updates.status) employeeUpdates.status = updates.status;
        if (updates.role) employeeUpdates.role = updates.role;
        if (updates.organizationId !== undefined) employeeUpdates.organizationId = updates.organizationId;

        if (Object.keys(employeeUpdates).length > 0) {
            batch.update(employeeDocRef, { ...employeeUpdates, updatedAt: serverTimestamp() });
        }
    }

    await batch.commit();
  } catch (error) {
    console.error('Error updating user profile and employee: ', error);
    throw error;
  }
};

export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { ...updates, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error updating user profile: ', error);
    throw error;
  }
};

export const deleteUserFromApp = async (uid: string) => {
    try {
       // The Genkit flow is robust enough to handle deletion from Auth
       // even if the Firestore document is missing.
       await deleteUser({ uid });
    } catch (error) {
        console.error("Error deleting user from app:", error);
        throw new Error("Failed to delete user completely.");
    }
};

export const approveProspect = async (uid: string, organizationId: string, organizationName: string, trialEndDate: Date) => {
    const batch = writeBatch(db);
    try {
        // 1. Update user role to Admin
        const userDocRef = doc(db, 'users', uid);
        batch.update(userDocRef, { role: 'Admin' });

        // 2. Update organization status to 'OnTrial' and set trial end date
        const orgDocRef = doc(db, 'organizations', organizationId);
        batch.update(orgDocRef, {
            contractStatus: 'OnTrial',
            subscriptionEnds: format(trialEndDate, 'yyyy-MM-dd'),
            updatedAt: serverTimestamp(),
        });

        // 3. Find SuperAdmin to add to new org's chat rooms
        const superAdminQuery = query(usersCollection, where('role', '==', 'SuperAdmin'), limit(1));
        const superAdminSnapshot = await getDocs(superAdminQuery);
        const superAdmin = superAdminSnapshot.empty ? null : superAdminSnapshot.docs[0].data() as UserProfile;

        const allUsers = await getUsers();
        let orgMemberIds = allUsers
            .filter(u => u.organizationId === organizationId || u.uid === uid)
            .map(u => u.uid);

        // Ensure SuperAdmin is included
        if (superAdmin && !orgMemberIds.includes(superAdmin.uid)) {
            orgMemberIds.push(superAdmin.uid);
        }
        
        await initializeChatRoomsForOrg(organizationId, organizationName, orgMemberIds);

        await batch.commit();

    } catch (error) {
        console.error('Error approving prospect:', error);
        throw error;
    }
}

// Placeholder for social login user creation logic
export const handleSocialLogin = async (provider: FirebaseAuthProvider) => {
    // This function will need to be implemented, perhaps using a modal
    // after social sign-in to ask for organization type, etc.
    // For now, it's a placeholder.
    console.log("Social login initiated, but user creation flow needs implementation.");
    return await signInWithPopup(auth, provider);
}

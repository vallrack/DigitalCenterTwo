'use server';
/**
 * @fileOverview A flow for completely resetting all Firebase data, except for the SuperAdmin user.
 *
 * - resetFirebaseData - Deletes all documents from all collections and all users from Auth,
 *   except for the specified SuperAdmin.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db, auth } from '@/lib/firebase-admin';

// The email of the user to preserve.
const SUPER_ADMIN_EMAIL = 'vallrack67@gmail.com';

const collectionNames = [
  'users', 'organizations', 'employees', 'students', 'customers',
  'opportunities', 'interactions', 'products', 'warehouses', 'sales',
  'payrolls', 'attendance', 'academicAttendance', 'academicPeriods',
  'gradingActivities', 'lessonPlans', 'subjects', 'grades', 'schedules',
  'videoRecordings', 'templates', 'campaigns', 'chatRooms',
  'contactMessages', 'deletedUsersLog', 'journalEntries', 'accounts',
  'activeSessions'
  // Add other collection names here as the app grows
];

async function deleteCollection(collectionPath: string, superAdminUid: string | null) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.limit(500).get();

  if (snapshot.size === 0) {
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    // For the 'users' collection, do not delete the SuperAdmin
    if (collectionPath === 'users' && doc.id === superAdminUid) {
      return;
    }
    batch.delete(doc.ref);
  });

  await batch.commit();

  // Recurse on the same collection to delete more documents
  await deleteCollection(collectionPath, superAdminUid);
}


const resetFirebaseDataFlow = ai.defineFlow(
  {
    name: 'resetFirebaseDataFlow',
    inputSchema: z.void(),
    outputSchema: z.object({ message: z.string() }),
  },
  async () => {
    console.log('Starting Firebase data reset...');

    // 1. Find the SuperAdmin UID to preserve it.
    let superAdminUid: string | null = null;
    try {
        const superAdminUserRecord = await auth.getUserByEmail(SUPER_ADMIN_EMAIL);
        superAdminUid = superAdminUserRecord.uid;
        console.log(`Preserving SuperAdmin: ${SUPER_ADMIN_EMAIL} (UID: ${superAdminUid})`);
    } catch (error) {
        console.warn(`Could not find SuperAdmin user with email ${SUPER_ADMIN_EMAIL}. No user will be preserved.`);
    }

    // 2. Delete all users from Firebase Auth, except the SuperAdmin
    const listUsersResult = await auth.listUsers(1000);
    const usersToDelete = listUsersResult.users.filter(user => user.uid !== superAdminUid);
    if (usersToDelete.length > 0) {
        await auth.deleteUsers(usersToDelete.map(u => u.uid));
        console.log(`Deleted ${usersToDelete.length} users from Firebase Auth.`);
    }

    // 3. Delete all documents from all collections in Firestore
    for (const collectionName of collectionNames) {
        console.log(`Deleting collection: ${collectionName}...`);
        await deleteCollection(collectionName, superAdminUid);
        console.log(`Collection ${collectionName} deleted.`);
    }

    console.log('Firebase data reset completed successfully.');
    return { message: 'Todos los datos han sido reiniciados, excepto el usuario SuperAdmin.' };
  }
);

export async function resetFirebaseData(): Promise<{ message: string }> {
  return await resetFirebaseDataFlow();
}

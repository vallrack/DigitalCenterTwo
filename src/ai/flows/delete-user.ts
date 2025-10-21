'use server';
/**
 * @fileOverview A flow for completely deleting a user from Firebase.
 *
 * - deleteUser - Deletes a user from Firebase Auth, Firestore 'users' collection,
 *   and Firestore 'employees' collection, after logging the deletion.
 */

import { googleAI } from '@genkit-ai/googleai';
import { configureGenkit } from 'genkit';
import { z } from 'genkit';
import { db, auth } from '@/lib/firebase-admin';
import type { UserProfile } from '@/lib/types';

// Configure Genkit directly in the file
const ai = configureGenkit({
  plugins: [
    googleAI({ 
      apiVersion: "v1beta",
      apiKey: process.env.GOOGLE_API_KEY
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

const DeleteUserInputSchema = z.object({
  uid: z.string().describe('The unique ID of the user to delete.'),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;

const deleteUserFlow = ai.defineFlow(
  {
    name: 'deleteUserFlow',
    inputSchema: DeleteUserInputSchema,
    outputSchema: z.void(),
  },
  async ({ uid }) => {
    const userDocRef = db.collection('users').doc(uid);
    const employeeDocRef = db.collection('employees').doc(uid);
    const logDocRef = db.collection('deletedUsersLog').doc();

    const userDocSnap = await userDocRef.get();
    const userProfile = userDocSnap.exists ? (userDocSnap.data() as UserProfile) : null;
    let authUserExists = true;
    let authUser = null;

    // Check if user exists in Auth
    try {
        authUser = await auth.getUser(uid);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            authUserExists = false;
        } else {
            // Rethrow other auth errors
            throw error;
        }
    }

    if (!userProfile && !authUserExists) {
        console.warn(`User with UID ${uid} not found in Auth or Firestore. No action taken.`);
        return;
    }

    // 1. Log the user deletion
    if (userProfile) {
        await logDocRef.set({
            deletedUid: uid,
            email: userProfile.email,
            name: userProfile.name,
            role: userProfile.role,
            organizationId: userProfile.organizationId || null,
            deletedAt: new Date(),
        });
    } else if (authUser) {
        // If no profile, try to get info from Auth before deleting
        await logDocRef.set({
            deletedUid: uid,
            email: authUser.email,
            name: authUser.displayName || 'N/A',
            role: 'EnEspera', // Role is unknown if not in DB, default to base role
            organizationId: null,
            deletedAt: new Date(),
        });
    }

    // 2. Delete from Firebase Authentication if the user exists there
    if (authUserExists) {
        await auth.deleteUser(uid);
    }

    // 3. Delete from Firestore collections in a batch if the documents exist
    const batch = db.batch();
    if (userDocSnap.exists) {
        batch.delete(userDocRef);
    }
    
    // Check if employee doc exists before trying to delete
    const employeeDocSnap = await employeeDocRef.get();
    if (employeeDocSnap.exists) {
        batch.delete(employeeDocRef);
    }
    
    await batch.commit();
  }
);

export async function deleteUser(input: DeleteUserInput): Promise<void> {
  await deleteUserFlow(input);
}

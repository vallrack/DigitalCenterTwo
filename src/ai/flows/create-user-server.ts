'use server';
/**
 * @fileOverview A server-side flow for creating a new user in Firebase
 * without affecting the current user's session.
 *
 * - createNewUserServer - Creates a user in Auth and their profile in Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db, auth } from '@/lib/firebase-admin';
import type { UserProfile, Employee, UserRole } from '@/lib/types';

const CreateUserInputSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(['SuperAdmin', 'Admin', 'Academico', 'RRHH', 'Finanzas', 'Estudiante', 'Empleado', 'EnEspera', 'SinAsignar', 'Ventas', 'Marketing', 'Soporte']),
  organizationId: z.string(),
  position: z.string().optional(),
  salary: z.number().optional(),
  contractedHours: z.number().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  eps: z.string().optional(),
  arl: z.string().optional(),
});

const CreateUserOutputSchema = z.object({
  uid: z.string().optional(),
  error: z.string().optional(),
});

const createNewUserServerFlow = ai.defineFlow(
  {
    name: 'createNewUserServerFlow',
    inputSchema: CreateUserInputSchema,
    outputSchema: CreateUserOutputSchema,
  },
  async (data) => {
    try {
      // 1. Create user in Firebase Authentication
      const userRecord = await auth.createUser({
        email: data.email,
        password: data.password,
        displayName: data.name,
      });

      const { uid } = userRecord;
      const batch = db.batch();

      // 2. Create the UserProfile document
      const newProfile: UserProfile = {
        uid,
        email: data.email,
        role: data.role,
        name: data.name,
        avatarUrl: `https://picsum.photos/seed/${uid}/100/100`,
        forcePasswordChange: true,
        status: 'Active',
        organizationId: data.organizationId === 'unassigned' ? '' : data.organizationId,
      };
      const userDocRef = db.collection('users').doc(uid);
      batch.set(userDocRef, newProfile);

      // 3. If the role is an employee type, create an Employee document
      const isEmployeeRole = !['Admin', 'SuperAdmin', 'Estudiante', 'EnEspera', 'SinAsignar'].includes(data.role);

      if (isEmployeeRole) {
        const newEmployee: Omit<Employee, 'id'> = {
          name: data.name,
          email: data.email,
          position: data.position || 'No Asignado',
          role: data.role as UserRole,
          status: 'Active',
          salary: data.salary || 0,
          contractedHours: data.contractedHours || 160,
          avatarUrl: newProfile.avatarUrl,
          organizationId: newProfile.organizationId,
          bankName: data.bankName || '',
          accountNumber: data.accountNumber || '',
          eps: data.eps || '',
          arl: data.arl || '',
          createdAt: new Date(),
        };
        const employeeDocRef = db.collection('employees').doc(uid);
        batch.set(employeeDocRef, newEmployee);
      }

      // 4. Commit all database operations
      await batch.commit();

      return { uid };

    } catch (error: any) {
      console.error('Error creating user on server:', error);
      // Return a structured error response
      return { error: error.code || error.message || 'An unknown error occurred.' };
    }
  }
);

export async function createNewUserServer(input: z.infer<typeof CreateUserInputSchema>): Promise<z.infer<typeof CreateUserOutputSchema>> {
  return createNewUserServerFlow(input);
}

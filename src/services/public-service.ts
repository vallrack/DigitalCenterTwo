// /src/services/public-service.ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Organization } from '@/lib/types';

/**
 * Fetches the public-safe data for a single organization.
 * Does not fetch sensitive data.
 * @param orgId The ID of the organization to fetch.
 * @returns The organization data or null if not found.
 */
export const getPublicOrganizationData = async (orgId: string): Promise<Organization | null> => {
  try {
    const orgDocRef = doc(db, 'organizations', orgId);
    const orgDocSnap = await getDoc(orgDocRef);
    
    if (orgDocSnap.exists()) {
      return { id: orgDocSnap.id, ...orgDocSnap.data() } as Organization;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching public organization data:', error);
    // Return null instead of throwing an error to the client
    return null;
  }
};

// /src/services/presence-service.ts
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  onSnapshot,
  query,
  where,
  Timestamp,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { UserPresence, UserRole } from '@/lib/types';

const sessionsCollection = collection(db, 'activeSessions');

export interface ActiveSession {
    uid: string;
    userName: string;
    role: UserRole;
    organizationId: string | null;
    organizationName: string;
}

// This function is called from the AuthProvider to update a user's presence.
export const updateUserPresence = async (uid: string, data: Omit<UserPresence, 'uid' | 'lastSeen'>) => {
  const sessionRef = doc(db, 'activeSessions', uid);
  try {
    await setDoc(sessionRef, {
        ...data,
        lastSeen: serverTimestamp(),
    });
    
    // Add a beforeunload event to remove the session doc when the user leaves.
    window.addEventListener('beforeunload', () => {
        deleteDoc(sessionRef);
    });

  } catch (error) {
    console.error("Error updating user presence:", error);
  }
};

// Listen to all active sessions (for SuperAdmin)
export const listenToActiveSessions = (
    callback: (sessions: ActiveSession[]) => void,
    onError: (error: Error) => void
) => {
    const q = query(sessionsCollection);
    return onSnapshot(q, (snapshot) => {
        const sessions: ActiveSession[] = [];
        snapshot.forEach(doc => {
            const data = doc.data() as UserPresence;
            sessions.push({
                uid: doc.id,
                userName: data.userName,
                role: data.role,
                organizationId: data.organizationId,
                organizationName: data.organizationName,
            });
        });
        callback(sessions);
    }, onError);
};

// Listen to active sessions for a specific organization (for Admin/HR)
export const listenToActiveSessionsForOrg = (
    organizationId: string,
    callback: (sessions: ActiveSession[]) => void,
    onError?: (error: Error) => void
) => {
    const q = query(sessionsCollection, where('organizationId', '==', organizationId));
    return onSnapshot(q, (snapshot) => {
        const sessions: ActiveSession[] = [];
        snapshot.forEach(doc => {
            const data = doc.data() as UserPresence;
             if (data.role !== 'Admin' && data.role !== 'SuperAdmin') {
                sessions.push({
                    uid: doc.id,
                    userName: data.userName,
                    role: data.role,
                    organizationId: data.organizationId,
                    organizationName: data.organizationName,
                });
            }
        });
        callback(sessions);
    }, onError);
};


// Cleanup inactive sessions on startup (optional but good practice)
export const cleanupInactiveSessions = async () => {
    const threshold = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = Date.now();
    
    try {
        const q = query(sessionsCollection);
        const snapshot = await getDocs(q);
        const batch = db.batch();

        snapshot.forEach(doc => {
            const session = doc.data() as UserPresence;
            if (session.lastSeen instanceof Timestamp) {
                const lastSeenTime = session.lastSeen.toMillis();
                if (now - lastSeenTime > threshold) {
                    batch.delete(doc.ref);
                }
            }
        });

        await batch.commit();
    } catch (error) {
        console.error("Error cleaning up inactive sessions:", error);
    }
};

onAuthStateChanged(auth, user => {
    if (!user) {
        // If user signs out, try to remove their session doc
        if (auth.currentUser) {
           const sessionRef = doc(db, 'activeSessions', auth.currentUser.uid);
           deleteDoc(sessionRef);
        }
    }
})

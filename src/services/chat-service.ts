// /src/services/chat-service.ts
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  writeBatch,
  serverTimestamp,
  addDoc,
  orderBy,
  onSnapshot,
  limit,
  or,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ChatRoom, ChatMessage, UserProfile, Organization, ChatCategory } from '@/lib/types';

const roomsCollection = collection(db, 'chatRooms');
const getMessagesCollection = (roomId: string) => collection(db, 'chatRooms', roomId, 'messages');

const chatCategories: { category: ChatCategory, name: string, type: 'organization' | 'support' }[] = [
    { category: 'Soporte', name: 'Soporte Técnico', type: 'support' },
    { category: 'Admin', name: 'Administración General', type: 'organization' },
    { category: 'Ventas', name: 'Consultas de Ventas', type: 'organization' },
    { category: 'Dudas', name: 'Dudas y Preguntas', type: 'organization' },
];

/**
 * Gets or creates chat rooms for an organization.
 * @param orgId The organization ID.
 * @param orgName The organization name.
 * @param allOrgMemberIds Array of all member UIDs in the organization.
 */
export const initializeChatRoomsForOrg = async (
    orgId: string, 
    orgName: string, 
    allOrgMemberIds: string[]
) => {
    const batch = writeBatch(db);

    for (const roomConfig of chatCategories) {
        // We only create organization rooms, support rooms are created differently.
        if (roomConfig.type !== 'organization') continue;

        const roomQuery = query(roomsCollection, where('organizationId', '==', orgId), where('category', '==', roomConfig.category));
        const roomSnap = await getDocs(roomQuery);
        
        if (roomSnap.empty) {
            const newRoomRef = doc(roomsCollection);
            
            const newRoomData: Omit<ChatRoom, 'id'> = {
                type: roomConfig.type,
                category: roomConfig.category,
                name: `${roomConfig.name} - ${orgName}`,
                organizationId: orgId,
                memberIds: allOrgMemberIds,
                createdAt: serverTimestamp(),
            };
            batch.set(newRoomRef, newRoomData);
        }
    }
    await batch.commit();
};


/**
 * Retrieves the chat rooms a user has access to.
 * @param userProfile The profile of the user.
 * @returns A promise that resolves to an array of ChatRoom objects.
 */
export const getChatRoomsForUser = async (userProfile: UserProfile): Promise<ChatRoom[]> => {
  if (userProfile.role === 'SuperAdmin') {
    // For SuperAdmin, fetch all support rooms and all rooms they are a member of, then de-duplicate.
    const supportQuery = query(roomsCollection, where('type', '==', 'support'));
    const memberQuery = query(roomsCollection, where('memberIds', 'array-contains', userProfile.uid));

    const [supportSnapshot, memberSnapshot] = await Promise.all([
        getDocs(supportQuery),
        getDocs(memberQuery)
    ]);
    
    const roomsMap = new Map<string, ChatRoom>();

    supportSnapshot.forEach(doc => {
        roomsMap.set(doc.id, { id: doc.id, ...doc.data() } as ChatRoom);
    });
    memberSnapshot.forEach(doc => {
        roomsMap.set(doc.id, { id: doc.id, ...doc.data() } as ChatRoom);
    });

    const rooms = Array.from(roomsMap.values());
    // The rest of the sorting logic remains the same.
    return rooms.sort((a, b) => {
      const categoryOrder = ['Soporte', 'Admin', 'Ventas', 'Dudas'];
      const orderA = categoryOrder.indexOf(a.category);
      const orderB = categoryOrder.indexOf(b.category);
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });

  } else {
    // Regular users only see rooms they are a member of.
    const q = query(roomsCollection, where('memberIds', 'array-contains', userProfile.uid));
    const snapshot = await getDocs(q);
    const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
  
    // Sort client-side to avoid complex composite indexes.
    return rooms.sort((a, b) => {
      const categoryOrder = ['Soporte', 'Admin', 'Ventas', 'Dudas'];
      const orderA = categoryOrder.indexOf(a.category);
      const orderB = categoryOrder.indexOf(b.category);
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
  }
};

/**
 * Sends a new message to a chat room.
 * @param roomId The ID of the chat room.
 * @param messageData The message data to send.
 */
export const sendMessage = async (roomId: string, messageData: Omit<ChatMessage, 'id' | 'roomId' | 'timestamp'>) => {
    const roomRef = doc(db, 'chatRooms', roomId);
    const messagesColRef = getMessagesCollection(roomId);

    const batch = writeBatch(db);

    const newMessageRef = doc(messagesColRef);
    const finalMessage = {
        ...messageData,
        roomId,
        timestamp: serverTimestamp(),
    };
    batch.set(newMessageRef, finalMessage);

    batch.update(roomRef, {
        lastMessage: {
            text: messageData.text,
            timestamp: serverTimestamp(),
        },
    });

    await batch.commit();
};


/**
 * Sets up a real-time listener for messages in a chat room.
 * @param roomId The ID of the chat room.
 * @param callback The function to call with new messages.
 * @returns The unsubscribe function from onSnapshot.
 */
export const listenToMessages = (
    roomId: string,
    callback: (messages: ChatMessage[]) => void
) => {
    const messagesColRef = getMessagesCollection(roomId);
    const q = query(messagesColRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
        callback(messages);
    });

    return unsubscribe;
};

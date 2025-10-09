'use server';
/**
 * @fileOverview Creates a temporary guest chat room and provides an anonymous auth token.
 *
 * - createGuestChatRoom - Creates a chat room and returns a custom auth token for the guest.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { serverTimestamp } from 'firebase-admin/firestore';
import { db, auth } from '@/lib/firebase-admin';

const CreateGuestChatRoomOutputSchema = z.object({
  roomId: z.string().describe('The ID of the newly created chat room.'),
  guestToken: z.string().describe('The anonymous authentication token for the guest.'),
  guestUid: z.string().describe('The unique ID for the guest user.'),
});

export type CreateGuestChatRoomOutput = z.infer<typeof CreateGuestChatRoomOutputSchema>;

const createGuestChatRoomFlow = ai.defineFlow(
  {
    name: 'createGuestChatRoomFlow',
    inputSchema: z.void(),
    outputSchema: CreateGuestChatRoomOutputSchema,
  },
  async () => {
    const guestUid = `guest_${Date.now()}`;
    const guestToken = await auth.createCustomToken(guestUid);

    const supportUserQuery = await db.collection('users').where('role', '==', 'SuperAdmin').limit(1).get();
    let supportUserId = 'default_support_id'; // Fallback
    if (!supportUserQuery.empty) {
        supportUserId = supportUserQuery.docs[0].id;
    }

    const newRoomRef = db.collection('chatRooms').doc();
    await newRoomRef.set({
      type: 'support',
      category: 'Soporte',
      name: `Soporte - Visitante ${guestUid.substring(6, 10)}`,
      organizationId: 'public', // Belongs to no specific org
      memberIds: [guestUid, supportUserId], 
      createdAt: serverTimestamp(),
    });

    return {
      roomId: newRoomRef.id,
      guestToken,
      guestUid,
    };
  }
);

export async function createGuestChatRoom(): Promise<CreateGuestChatRoomOutput> {
  return createGuestChatRoomFlow();
}

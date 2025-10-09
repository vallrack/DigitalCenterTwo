import { config } from 'dotenv';
config();

import '@/ai/flows/generate-class-recording-summary.ts';
import '@/ai/flows/generate-meeting-link.ts';
import '@/ai/flows/delete-user.ts';
import '@/ai/flows/create-guest-chat-room.ts';
import '@/ai/flows/reset-firebase-data.ts';
import '@/ai/flows/create-user-server.ts';
import '@/ai/flows/chat-assistant-flow.ts';

'use server';
/**
 * @fileOverview An AI chat assistant to guide user conversations using Google Generative AI.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// --- Inicialización del Cliente de IA de Google ---
// La clave se lee de las variables de entorno (GOOGLE_API_KEY).
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// --- Esquemas de Validación de Entrada y Salida ---
const ChatAssistantInputSchema = z.object({
  chatHistory: z.array(z.object({
    senderName: z.string(),
    text: z.string(),
  })).describe('The history of the conversation so far.'),
  currentMessage: z.string().describe('The latest message from the user.'),
  roomCategory: z.string().describe('The category of the chat room (e.g., Soporte, Ventas, Admin, Dudas).'),
});
export type ChatAssistantInput = z.infer<typeof ChatAssistantInputSchema>;

const ChatAssistantOutputSchema = z.object({
  response: z.string().describe('The helpful, guiding response from the AI assistant.'),
});
export type ChatAssistantOutput = z.infer<typeof ChatAssistantOutputSchema>;

// --- Función Principal del Asistente de Chat ---
export async function chatAssistant(
  input: ChatAssistantInput
): Promise<ChatAssistantOutput> {

  // 1. Validar la entrada (aunque Next.js ya lo hace, es una buena práctica)
  const validation = ChatAssistantInputSchema.safeParse(input);
  if (!validation.success) {
    console.error("Invalid input to chatAssistant:", validation.error.format());
    return { response: 'Error: La entrada no es válida.' };
  }

  // 2. Prevenir que el asistente se responda a sí mismo
  const lastMessage = input.chatHistory[input.chatHistory.length - 1];
  if (lastMessage?.senderName === 'Asistente Virtual') {
      return { response: '' }; // No hacer nada si el último mensaje fue del asistente
  }

  // 3. Construir el prompt para el modelo de IA
  const historyString = input.chatHistory
    .map(msg => `- ${msg.senderName}: ${msg.text}`)
    .join('\n');

  const prompt = `Eres un "Asistente Virtual" amigable y eficiente para una plataforma de gestión llamada DigitalCenter. Tu objetivo principal es entender la intención del usuario y guiar la conversación hacia el equipo correcto (Soporte, Ventas, Administración) usando preguntas claras y predefinidas. NO respondas directamente a la pregunta del usuario a menos que sea un saludo simple. Tu rol es enrutar.

Basado en el historial de la conversación y el mensaje actual del usuario, identifica a qué categoría pertenece su consulta. La categoría de la sala es: ${input.roomCategory}.

Aquí están tus flujos de conversación predefinidos. Elige UNO y SOLO UNO que mejor se ajuste a la consulta del usuario.

1.  **Flujo de Soporte Técnico:** (Si el usuario menciona un error, algo que no funciona, o un problema técnico).
    *   Tu respuesta: "Hola, soy el Asistente Virtual. Entiendo que necesitas ayuda con un problema técnico. Para poder asignarte al especialista correcto, ¿podrías indicarme en qué módulo de la plataforma (Ej: Académico, Finanzas, RRHH) estás experimentando el inconveniente?"

2.  **Flujo de Consultas de Ventas:** (Si el usuario pregunta sobre precios, nuevos módulos, o cómo comprar/expandir el servicio).
    *   Tu respuesta: "Hola, soy el Asistente Virtual. Veo que tienes una consulta comercial. Para ayudarte mejor, ¿estás interesado en conocer nuestros planes, añadir nuevos módulos a tu cuenta, o tienes otra pregunta sobre nuestros servicios?"

3.  **Flujo de Administración General:** (Si el usuario tiene preguntas sobre la gestión de su cuenta, usuarios, o temas administrativos).
    *   Tu respuesta: "Hola, soy el Asistente Virtual. Gracias por tu consulta administrativa. ¿Tu pregunta está relacionada con la gestión de usuarios, los detalles de tu suscripción, o algún otro tema general de la plataforma?"

4.  **Flujo de Dudas Generales:** (Si el usuario tiene una pregunta general sobre cómo usar una función o dónde encontrar algo).
    *   Tu respuesta: "Hola, soy el Asistente Virtual. ¡Estoy aquí para ayudarte a resolver tus dudas! Para darte la mejor guía, ¿podrías decirme qué funcionalidad o módulo te gustaría entender mejor?"
    
5.  **Flujo de Saludo:** (Si el usuario solo dice "hola", "buenos días", etc.).
    *   Tu respuesta: "¡Hola! Soy el Asistente Virtual de DigitalCenter. ¿En qué te puedo ayudar hoy? Puedes consultarme sobre soporte técnico, ventas, dudas generales o temas administrativos."

**Historial de la Conversación:**
${historyString}

**Mensaje Actual del Usuario:**
- ${input.currentMessage}

Basado en el mensaje actual y el contexto, genera la respuesta más apropiada del Asistente Virtual.`;

  try {
    // 4. Llamar al modelo de IA
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // 5. Devolver la respuesta en el formato correcto
    return { response: responseText };

  } catch (error) {
    console.error('[Chat Assistant] Error calling Google AI:', error);
    return { response: 'Lo siento, estoy teniendo problemas para conectarme. Por favor, intenta de nuevo más tarde.' };
  }
}

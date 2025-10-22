
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// --- Esquema de Validación ---
const SuggestionInputSchema = z.object({
  metric: z.string(),
  dimension: z.string(),
  data: z.any(),
});

// --- Inicialización del Cliente de IA de Google ---
// La clave de la API se lee automáticamente de las variables de entorno de Vercel (GOOGLE_API_KEY).
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// --- Ruta de la API ---
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validar los datos de entrada
    const validation = SuggestionInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Datos insuficientes para el análisis.', details: validation.error.format() }, { status: 400 });
    }

    const { metric, dimension, data } = validation.data;

    // 2. Preparar el prompt para el modelo de IA
    const prompt = `
      Eres un asistente de análisis de datos experto en negocios. Tu tarea es analizar los siguientes datos y proporcionar 3 sugerencias estratégicas y accionables en español.
      Los datos representan un resumen donde la métrica es '${metric}' y la dimensión de agrupación es '${dimension}'.

      Datos:
      ${JSON.stringify(data, null, 2)}

      Basado en estos datos, por favor genera un análisis conciso y luego 3 sugerencias claras y prácticas para un director o gerente de negocios.
      El formato de la respuesta debe ser un único bloque de texto. Usa saltos de línea para separar párrafos y listas.
      Ejemplo de respuesta:
      Análisis General: Se observa una tendencia clave en [aspecto de los datos].

      Sugerencias:
      1. **Acción Sugerida 1:** Detalle de la sugerencia y por qué es relevante según los datos.
      2. **Acción Sugerida 2:** Detalle de la sugerencia y por qué es relevante según los datos.
      3. **Acción Sugerida 3:** Detalle de la sugerencia y por qué es relevante según los datos.
    `;

    // 3. Llamar al modelo de IA
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestionText = response.text();

    if (!suggestionText) {
      return NextResponse.json({ error: 'No se pudo generar una sugerencia con el modelo de IA.' }, { status: 500 });
    }

    // 4. Devolver la respuesta
    return NextResponse.json({ suggestion: suggestionText });

  } catch (error) {
    console.error('[API /analysis/suggest] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error en el servidor.';
    return NextResponse.json({ error: 'Ocurrió un error en el servidor al generar la sugerencia.', details: errorMessage }, { status: 500 });
  }
}

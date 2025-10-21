
import { NextResponse } from 'next/server';
import { googleAI } from '@genkit-ai/googleai';
import { configureGenkit, defineFlow, z } from 'genkit';

// --- Configuración de Genkit --- 
// Estandarizado para usar el objeto `ai` y definir un flow.
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

// --- Definición del Flow de IA --- 
const SuggestionInputSchema = z.object({
    metric: z.string(),
    dimension: z.string(),
    data: z.any(), // Los datos pueden tener cualquier estructura JSON
});

const suggestionFlow = defineFlow(
  {
    name: 'suggestionFlow',
    inputSchema: SuggestionInputSchema,
    outputSchema: z.string(),
  },
  async ({ metric, dimension, data }) => {
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

    const llmResponse = await ai.generate({ 
      prompt,
      model: 'googleai/gemini-1.5-flash'
    });

    return llmResponse.text();
  }
);

// --- Ruta de la API --- 
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar con el Zod schema del flow
    const validation = SuggestionInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Datos insuficientes para el análisis.', details: validation.error.format() }, { status: 400 });
    }

    const suggestion = await suggestionFlow(validation.data);

    if (!suggestion) {
      return NextResponse.json({ error: 'No se pudo generar una sugerencia con el modelo de IA.' }, { status: 500 });
    }

    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('[API /analysis/suggest] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error en el servidor.';
    return NextResponse.json({ error: 'Ocurrió un error en el servidor al generar la sugerencia.', details: errorMessage }, { status: 500 });
  }
}

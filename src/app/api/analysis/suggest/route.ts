
// Importaciones de Next.js y Genkit
import { NextResponse } from 'next/server';
import { configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { generate } from '@genkit-ai/ai';

// --- Configuración de Genkit --- 
// Se mueve aquí para evitar problemas de tree-shaking en la compilación de Vercel.
configureGenkit({
  plugins: [
    googleAI({ 
      apiVersion: "v1beta",
      apiKey: process.env.GOOGLE_API_KEY
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// --- Lógica de la Acción de IA --- 
// Se mueve aquí para consolidar la funcionalidad.
async function generateSuggestion(metric: string, dimension: string, data: any): Promise<string> {
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

  const llmResponse = await generate({ 
    prompt,
    model: 'googleai/gemini-1.5-flash'
  });

  return llmResponse.text();
}

// --- Ruta de la API --- 
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, metric, dimension } = body;

    if (!data || !metric || !dimension) {
      return NextResponse.json({ error: 'Datos insuficientes para el análisis. Se requiere métrica, dimensión y data.' }, { status: 400 });
    }

    const suggestion = await generateSuggestion(metric, dimension, data);

    if (!suggestion) {
      return NextResponse.json({ error: 'No se pudo generar una sugerencia con el modelo de IA.' }, { status: 500 });
    }

    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('[API /analysis/suggest] Error:', error);
    return NextResponse.json({ error: 'Ocurrió un error en el servidor al generar la sugerencia con la IA de Google.' }, { status: 500 });
  }
}

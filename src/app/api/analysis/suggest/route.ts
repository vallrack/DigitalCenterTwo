import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// IMPORTANT: Remove the hardcoded key and use environment variables in a real-world scenario.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure to set this in your .env.local file
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, metric, dimension } = body;

    if (!data || !metric || !dimension) {
      return NextResponse.json({ error: 'Datos insuficientes para el análisis. Se requiere métrica, dimensión y data.' }, { status: 400 });
    }

    // Construct the prompt for the AI model
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

    // Call the OpenAI API
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4-turbo', // Or any other suitable model
    });

    const suggestion = chatCompletion.choices[0]?.message?.content;

    if (!suggestion) {
      return NextResponse.json({ error: 'No se pudo generar una sugerencia.' }, { status: 500 });
    }

    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('[API /analysis/suggest] Error:', error);
    // Generic error message to the client for security
    return NextResponse.json({ error: 'Ocurrió un error en el servidor al generar la sugerencia.' }, { status: 500 });
  }
}

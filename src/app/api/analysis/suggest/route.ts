import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// IMPORTANT: Authenticate with Google Cloud. Set your API key in a .env.local file.
// Get your API key from Google AI Studio: https://aistudio.google.com/app/apikey
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, metric, dimension } = body;

    if (!data || !metric || !dimension) {
      return NextResponse.json({ error: 'Datos insuficientes para el análisis. Se requiere métrica, dimensión y data.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestion = response.text();

    if (!suggestion) {
      return NextResponse.json({ error: 'No se pudo generar una sugerencia con el modelo de IA.' }, { status: 500 });
    }

    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('[API /analysis/suggest] Error:', error);
    // Provide a more generic error to the client for security
    return NextResponse.json({ error: 'Ocurrió un error en el servidor al generar la sugerencia con la IA de Google.' }, { status: 500 });
  }
}

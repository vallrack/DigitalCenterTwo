
import { NextResponse } from 'next/server';
import { generateSuggestion } from '@/ai/actions/suggestion';
import { ai } from '@/ai/genkit'; // We still need to import this to initialize Genkit

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
    // Provide a more generic error to the client for security
    return NextResponse.json({ error: 'Ocurrió un error en el servidor al generar la sugerencia con la IA de Google.' }, { status: 500 });
  }
}

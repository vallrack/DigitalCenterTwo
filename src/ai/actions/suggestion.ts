
import { generate } from '@genkit-ai/ai';

// This function encapsulates the AI logic for generating suggestions.
export async function generateSuggestion(metric: string, dimension: string, data: any): Promise<string> {
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

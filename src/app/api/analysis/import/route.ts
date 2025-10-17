
import { NextRequest, NextResponse } from 'next/server';
import { parseExcelFile } from '@/services/analysis-service';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se ha subido ningún archivo.' }, { status: 400 });
    }

    const fileContent = Buffer.from(await file.arrayBuffer());
    const data = await parseExcelFile(fileContent);

    // Por ahora, solo devolvemos los datos. Más adelante se podrán almacenar o procesar más.
    return NextResponse.json({ data });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return NextResponse.json({ error: 'Error al procesar el archivo', details: errorMessage }, { status: 500 });
  }
}

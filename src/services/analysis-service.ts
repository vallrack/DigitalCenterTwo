import ExcelJS from 'exceljs';

/**
 * Parsea el contenido de un archivo Excel a formato JSON usando exceljs.
 * @param fileContent - El contenido del archivo como un Buffer.
 * @returns Una promesa que se resuelve con un array de objetos, donde cada objeto representa una fila.
 */
export const parseExcelFile = async (fileContent: Buffer): Promise<any[]> => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileContent);

    const worksheet = workbook.worksheets[0]; // Usar la primera hoja de trabajo
    if (!worksheet) {
      throw new Error("El archivo Excel parece estar vacío o dañado.");
    }

    const jsonData: any[] = [];
    const headerRow = worksheet.getRow(1);

    if (!headerRow.values || headerRow.values.length === 0) {
        return []; // Retornar vacío si no hay encabezados
    }

    // Obtener los nombres de los encabezados de la primera fila
    const headers: string[] = [];
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
        // Manejar celdas de encabezado combinadas o vacías
        headers.push(cell.value ? cell.value.toString() : `Columna_${headers.length + 1}`);
    });

    worksheet.eachRow((row, rowNumber) => {
      // Omitir la fila de encabezado
      if (rowNumber > 1) {
        const rowData: { [key: string]: any } = {};
        let isEmpty = true;

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          // colNumber es 1-based, el array de headers es 0-based.
          const header = headers[colNumber - 1];
          if (header) {
              // Extraer el valor de la celda. Manejar hipervínculos y fórmulas.
              let cellValue;
              if (cell.value && typeof cell.value === 'object' && 'text' in cell.value) {
                cellValue = (cell.value as { text: string }).text; // Para hipervínculos
              } else if (cell.value && typeof cell.value === 'object' && 'result' in cell.value) {
                cellValue = (cell.value as { result: any }).result; // Para resultados de fórmulas
              } else {
                cellValue = cell.value;
              }

              rowData[header] = cellValue;
              if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                  isEmpty = false;
              }
          }
        });

        // Solo añadir la fila si no está completamente vacía
        if (!isEmpty) {
            jsonData.push(rowData);
        }
      }
    });

    return jsonData;

  } catch (error) {
    console.error("Error parsing Excel file with exceljs:", error);
    if (error instanceof Error) {
        throw new Error(`Fallo al procesar el archivo Excel: ${error.message}`);
    }
    throw new Error("Ocurrió un error desconocido al procesar el archivo Excel.");
  }
};

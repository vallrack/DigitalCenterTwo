import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

/**
 * Parsea el contenido de un archivo Excel a formato JSON.
 * Intenta primero con exceljs y, si falla, utiliza xlsx como fallback.
 * @param fileContent - El contenido del archivo como un Buffer.
 * @returns Una promesa que se resuelve con un array de objetos, donde cada objeto representa una fila.
 */
export const parseExcelFile = async (fileContent: Buffer): Promise<any[]> => {
  try {
    // Intenta procesar con exceljs
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileContent);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error("El archivo Excel parece estar vacío o dañado.");
    }

    const jsonData: any[] = [];
    const headerRow = worksheet.getRow(1);

    if (!headerRow.values || headerRow.values.length === 0) {
      return [];
    }

    const headers: string[] = [];
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      headers.push(cell.value ? cell.value.toString() : `Columna_${headers.length + 1}`);
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const rowData: { [key: string]: any } = {};
        let isEmpty = true;

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) {
            let cellValue;
            if (cell.value && typeof cell.value === 'object' && 'text' in cell.value) {
              cellValue = (cell.value as { text: string }).text;
            } else if (cell.value && typeof cell.value === 'object' && 'result' in cell.value) {
              cellValue = (cell.value as { result: any }).result;
            } else {
              cellValue = cell.value;
            }

            rowData[header] = cellValue;
            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
              isEmpty = false;
            }
          }
        });

        if (!isEmpty) {
          jsonData.push(rowData);
        }
      }
    });

    return jsonData;

  } catch (exceljsError) {
    console.log("exceljs falló, intentando con xlsx:", exceljsError);

    try {
      // Fallback a xlsx si exceljs falla
      const workbook = XLSX.read(fileContent, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) {
        throw new Error("El archivo Excel (XLS) parece estar vacío o dañado.");
      }

      // Convertir la hoja a JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Tratar la primera fila como encabezados
        defval: null, // Asignar null a celdas vacías
      });

      if (jsonData.length < 2) {
        return []; // No hay datos después del encabezado
      }

      const headers: string[] = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);

      return dataRows.map(row => {
        const rowData: { [key: string]: any } = {};
        (row as any[]).forEach((cellValue, index) => {
          const header = headers[index] || `Columna_${index + 1}`;
          rowData[header] = cellValue;
        });
        return rowData;
      });

    } catch (xlsxError) {
      console.error("Error parsing Excel file with both exceljs and xlsx:", xlsxError);
      if (xlsxError instanceof Error) {
        throw new Error(`Fallo al procesar el archivo Excel con ambos métodos: ${xlsxError.message}`);
      }
      throw new Error("Ocurrió un error desconocido al procesar el archivo Excel.");
    }
  }
};

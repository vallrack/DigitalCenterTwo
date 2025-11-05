import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Patient, OdontogramState, FollowUp } from '@/lib/types';

// Extiende la interfaz de jsPDF para incluir el plugin autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
  lastAutoTable: { finalY: number };
}

// Función para formatear fechas
const formatDate = (isoDate: string) => {
    if (!isoDate) return '';
    // Se añade un día porque al crear desde el input date, puede tomar el día anterior por la zona horaria UTC
    const date = new Date(isoDate);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

// Función auxiliar para renderizar campos de texto largos con manejo de páginas
const addTextField = (doc: jsPDFWithAutoTable, title: string, value: string | undefined, startY: number): number => {
    let currentY = startY;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    const text = doc.splitTextToSize(value || 'No reporta', pageWidth - margin * 2 - 5);
    const textHeight = text.length * 5;
    const requiredHeight = 12 + textHeight;

    if (currentY + requiredHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`${title}:`, margin, currentY);
    currentY += 6;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(text, margin + 5, currentY);
    currentY += textHeight + 6;

    return currentY;
};

export const generateDetailedOdontogramPDF = async (
  patient: Patient,
  odontogramState: OdontogramState,
  generalNotes: string,
  mainScreenshot: string, 
  toothScreenshots: { [key: number]: string } 
) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  let lastY = 15;

  // 1. Título y Fecha
  doc.setFontSize(20);
  doc.text('Historia Clínica Odontológica Detallada', pageWidth / 2, lastY, { align: 'center' });
  lastY += 10;
  doc.setFontSize(12);
  doc.text(`Fecha de Generación: ${new Date().toLocaleDateString()}`, pageWidth - 15, lastY, { align: 'right' });
  lastY += 15;

  // 2. Información del Paciente
  doc.setFontSize(16);
  doc.text('1. Datos del Paciente', 15, lastY);
  lastY += 8;

  const patientData = [
    ['Nombre Completo', patient.name],
    ['Número de Identificación', patient.identificationNumber],
    ['Edad', patient.age ? `${patient.age} años` : 'No especificada'],
    ['Género', patient.gender || 'No especificado'],
    ['Teléfono', patient.phone || 'No especificado'],
    ['Email', patient.email || 'No especificado'],
    ['Dirección', patient.address || 'No especificada'],
    ['Departamento', patient.department || 'No especificado'],
    ['Municipio', patient.municipality || 'No especificado'],
  ];

  doc.autoTable({
    startY: lastY,
    head: [['Campo', 'Valor']],
    body: patientData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
  });
  lastY = doc.lastAutoTable.finalY + 10;

  // 3. Anamnesis y Antecedentes Médicos
  if (lastY > 250) { doc.addPage(); lastY = 15; }
  doc.setFontSize(16);
  doc.text('2. Anamnesis y Antecedentes Médicos', 15, lastY);
  lastY += 8;

  lastY = addTextField(doc, 'Alergias', patient.allergies, lastY);
  lastY = addTextField(doc, 'Medicamentos Actuales', patient.currentMedications, lastY);
  lastY = addTextField(doc, 'Enfermedades Crónicas', patient.chronicDiseases, lastY);
  lastY = addTextField(doc, 'Antecedentes Quirúrgicos', patient.surgeries, lastY);
  lastY = addTextField(doc, 'Hábitos', patient.habits, lastY);
  lastY += 5;

  // 4. Notas de la Consulta Inicial
  lastY = addTextField(doc, '3. Notas de la Consulta Inicial', generalNotes, lastY);
  lastY += 5;

  // 5. Controles y Seguimiento
  if (lastY > 260) { doc.addPage(); lastY = 15; }
  doc.setFontSize(16);
  doc.text('4. Controles y Seguimiento', 15, lastY);
  lastY += 8;

  if (patient.followUps && patient.followUps.length > 0) {
    const sortedFollowUps = [...patient.followUps].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    for (const followUp of sortedFollowUps) {
      lastY = addTextField(doc, `Fecha del Control: ${formatDate(followUp.date)}`, followUp.notes, lastY);
    }
  } else {
    doc.setFontSize(10);
    doc.text('No se han registrado controles de seguimiento.', 15, lastY);
    lastY += 10;
  }
  
  // 6. Odontograma General
  const imgHeightEstimated = 100;
  if (lastY + imgHeightEstimated > doc.internal.pageSize.getHeight()) {
    doc.addPage();
    lastY = 15;
  }
  doc.setFontSize(16);
  doc.text('5. Odontograma 3D General', 15, lastY);
  lastY += 8;
  if (mainScreenshot) {
    try {
      const imgProps = doc.getImageProperties(mainScreenshot);
      const imgWidth = 180;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      doc.addImage(mainScreenshot, 'PNG', 15, lastY, imgWidth, imgHeight);
      lastY += imgHeight + 10;
    } catch (e) {
      console.error("Error adding main image to PDF:", e);
      doc.text("No se pudo cargar la imagen del odontograma.", 15, lastY);
      lastY += 10;
    }
  }
  
  // 7. Sección de Dientes con Hallazgos
  const teethWithFindings = Object.entries(odontogramState).filter(([_, sections]) =>
    Object.values(sections).some(data => data.condition.condition !== 'Sano')
  );

  if (teethWithFindings.length > 0) {
    doc.addPage();
    let currentY = 15;

    doc.setFillColor(243, 190, 50);
    doc.rect(10, currentY, pageWidth - 20, 12, 'F');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('6. DETALLE DE HALLAZGOS POR DIENTE', pageWidth / 2, currentY + 8, { align: 'center' });
    currentY += 22;

    for (const [toothNumber, sections] of teethWithFindings) {
      const findingsForTooth = Object.entries(sections).filter(([_, data]) => data.condition.condition !== 'Sano');
      if (findingsForTooth.length === 0) continue;
      
      const sectionHeight = 85;
      if (currentY + sectionHeight > doc.internal.pageSize.getHeight()) {
        doc.addPage();
        currentY = 15;
      }

      doc.setFillColor(41, 128, 185);
      doc.rect(15, currentY, pageWidth - 30, 10, 'F');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(`DIENTE #${toothNumber}`, 20, currentY + 7);
      currentY += 15;

      const imgX = 20;
      const imgY = currentY;
      const imgWidth = 70;
      const imgHeight = 55;
      const toothScreenshot = toothScreenshots[toothNumber as any];
      if (toothScreenshot) {
        try {
          doc.addImage(toothScreenshot, 'PNG', imgX, imgY, imgWidth, imgHeight);
        } catch (e) {
          console.error(`Error adding image for tooth ${toothNumber}:`, e);
          doc.text('Error de imagen', imgX, imgY + 10);
        }
      } else {
          doc.text('No hay imagen individual.', imgX, imgY + 10);
      }

      const tableX = imgX + imgWidth + 10;
      const tableData = findingsForTooth.map(([section, data]) => ({
        section: section.charAt(0).toUpperCase() + section.slice(1),
        condition: data.condition.condition,
        color: data.condition.color,
      }));

      doc.autoTable({
        startY: currentY,
        head: [['SECCIÓN', 'CONDICIÓN']],
        body: tableData.map(d => [d.section, d.condition]),
        theme: 'grid',
        tableWidth: pageWidth - tableX - 15,
        margin: { left: tableX },
        headStyles: { fillColor: false, textColor: 0, lineWidth: 0.2,lineColor: 150 },
        styles: { cellPadding: 2, fontSize: 10, lineColor: 150 },
        didParseCell: (data) => {
          if (data.column.index === 1) { 
            const rowData = tableData[data.row.index];
            if (rowData) {
              data.cell.styles.textColor = rowData.color; 
            }
          }
        }
      });

      const tableBottomY = doc.lastAutoTable.finalY;
      const imageBottomY = imgY + imgHeight;
      currentY = Math.max(tableBottomY, imageBottomY) + 15;
    }
  }

  // Guardar el PDF
  doc.save(`Historia_Clinica_${patient.name.replace(/ /g, '_')}.pdf`);
};

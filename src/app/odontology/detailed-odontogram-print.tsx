
"use client";

import jsPDF from 'jspdf';
import { Patient, OdontogramState } from '@/lib/types';
import *drei from '@react-three/drei';

// This is a placeholder for the actual 3D scene rendering logic
// In a real scenario, we would pass the scene, camera, and renderer
// to this function to generate the images.
const render3DScene = async (toothNumber?: number): Promise<string> => {
    // Placeholder: returns a gray box image
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = '#333';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        if (toothNumber) {
            ctx.fillText(`Zoom on Tooth ${toothNumber}`, 200, 150);
        } else {
            ctx.fillText('Full Odontogram View', 200, 150);
        }
    }
    return canvas.toDataURL('image/png');
};

const findConditionBySymbol = (symbol: string, section: string, conditions: any[]) => {
    // This is a placeholder. The actual logic would be more complex,
    // possibly involving a lookup of the sprite's properties.
    return conditions.find(c => c.symbol === symbol && c.section === section) || { condition: 'Unknown', color: '#000000' };
};

export const generateDetailedPdf = async (
    patient: Patient, 
    odontogramState: OdontogramState,
    generalNotes: string
) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPos = 20;

    // Header
    pdf.setFillColor(102, 126, 234);
    pdf.rect(0, 0, pageWidth, 30, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('REPORTE ODONTOLÓGICO', pageWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Paciente: ${patient.name}`, pageWidth / 2, 23, { align: 'center' });

    // Date
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    const fecha = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    pdf.text(`Fecha: ${fecha}`, 15, 40);
    yPos = 50;

    // General View
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('VISTA GENERAL', 15, yPos);
    yPos += 5;

    // --- This is where the magic happens ---
    // We need a way to get the *actual* rendered scene from Odontograma3D component
    const generalImg = await render3DScene(); // Placeholder
    pdf.addImage(generalImg, 'PNG', 15, yPos, 180, 100);
    yPos += 110;
    
    // Marked teeth
    const markedTeeth = Object.entries(odontogramState).filter(
        ([_, sections]) => Object.keys(sections).length > 0
    );

    if (markedTeeth.length > 0) {
        pdf.addPage();
        yPos = 20;
        
        pdf.setFillColor(241, 196, 15);
        pdf.rect(0, 0, pageWidth, 15, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text('DIENTES CON HALLAZGOS - VISTA DETALLADA', pageWidth / 2, 10, { align: 'center' });
        yPos = 25;

        for (const [toothNum, sections] of markedTeeth) {
            if (yPos > pageHeight - 80) {
                pdf.addPage();
                yPos = 20;
            }

            // Tooth Title
            pdf.setFillColor(52, 152, 219);
            pdf.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text(`DIENTE #${toothNum}`, 20, yPos + 2);
            yPos += 12;

            // --- Capture detailed view ---
            const toothImg = await render3DScene(parseInt(toothNum)); // Placeholder
            if (toothImg) {
                pdf.addImage(toothImg, 'PNG', 15, yPos, 80, 60);
            }

            // Findings Table
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(10);
            
            let tableY = yPos;
            const tableX = 100;
            
            pdf.setFont(undefined, 'bold');
            pdf.text('SECCIÓN', tableX, tableY);
            pdf.text('CONDICIÓN', tableX + 40, tableY);
            tableY += 5;
            pdf.setDrawColor(200, 200, 200);
            pdf.line(tableX, tableY, tableX + 90, tableY);
            tableY += 5;
            pdf.setFont(undefined, 'normal');

            // This needs the full conditions list
            const conditions: any[] = []; // Placeholder for actual conditions

            for (const [section, conditionSymbol] of Object.entries(sections)) {
                const conditionDetails = findConditionBySymbol(conditionSymbol as string, section, conditions);
                
                pdf.text(section.charAt(0).toUpperCase() + section.slice(1), tableX, tableY);
                pdf.setTextColor(conditionDetails.color);
                pdf.text(conditionDetails.condition, tableX + 40, tableY);
                pdf.setTextColor(0, 0, 0);
                tableY += 6;
            }
            
            yPos += 70;
        }
    }
    
    // Notes
    if (generalNotes) {
        if (yPos > pageHeight - 50) {
            pdf.addPage();
            yPos = 20;
        }
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('NOTAS DE LA CONSULTA', 15, yPos);
        yPos += 8;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        const notes = pdf.splitTextToSize(generalNotes, pageWidth - 30);
        pdf.text(notes, 15, yPos);
    }

    // Footer
    const totalPages = (pdf as any).internal.pages.length - 1;
    for (let i = 1; i <= totalPages + 1; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Página ${i} de ${totalPages + 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    pdf.save(`Odontograma_${patient.name.replace(/ /g, '_')}_${fecha.replace(/ /g, '_')}.pdf`);
};

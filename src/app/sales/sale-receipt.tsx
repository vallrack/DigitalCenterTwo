// /src/app/sales/sale-receipt.tsx
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import type { Sale } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

// Extend the jsPDF interface to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateSaleReceipt = (sale: Sale, organizationName: string) => {
  const doc = new jsPDF();
  
  const saleDate = sale.createdAt instanceof Timestamp 
    ? sale.createdAt.toDate() 
    : new Date(sale.createdAt);

  // Header
  doc.setFontSize(20);
  doc.text(organizationName, 14, 22);
  doc.setFontSize(12);
  doc.text('Recibo de Venta', 14, 30);
  
  doc.setFontSize(10);
  doc.text(`Fecha: ${format(saleDate, 'dd/MM/yyyy HH:mm')}`, 14, 40);
  doc.text(`Recibo #: ${sale.id.substring(0, 8).toUpperCase()}`, 14, 45);
  doc.text(`Método de Pago: ${sale.paymentMethod}`, 14, 50);

  // Table
  const tableColumn = ["Producto", "Cantidad", "Precio Unit.", "Total"];
  const tableRows: any[][] = [];

  sale.items.forEach(item => {
    const itemData = [
      item.productName,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.price * item.quantity).toFixed(2)}`,
    ];
    tableRows.push(itemData);
  });

  doc.autoTable({
    startY: 60,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [22, 160, 133] },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY;
  doc.setFontSize(10);
  doc.text(`Subtotal: $${sale.subtotal.toFixed(2)}`, 14, finalY + 10);
  doc.text(`Impuestos: $${sale.tax.toFixed(2)}`, 14, finalY + 15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: $${sale.total.toFixed(2)}`, 14, finalY + 22);
  
  // Footer
  doc.setFontSize(8);
  doc.text('¡Gracias por su compra!', 14, doc.internal.pageSize.height - 10);

  // Open PDF in new tab for preview
  doc.output('dataurlnewwindow');
};

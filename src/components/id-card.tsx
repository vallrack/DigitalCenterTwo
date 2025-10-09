// /src/components/id-card.tsx
"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Employee, Student, UserProfile } from '@/lib/types';
import { Printer } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

type UserLike = (Employee | Student | UserProfile) & { position?: string; grade?: string; role?: string };

interface IdCardProps {
  user: UserLike | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IdCard({ user, open, onOpenChange }: IdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { organization } = useAuth(); // Get organization info from context

  const handlePrint = () => {
    const printContent = cardRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open('', '', 'height=550,width=350');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Imprimir Carnet</title>');
      printWindow.document.write(`
        <style>
          @import url('https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap');
          body { font-family: 'PT Sans', sans-serif; display: flex; justify-content: center; align-items: center; height: 100%; margin: 0; padding: 1rem; background-color: #f0f0f0; }
          .id-card-print-container {
            border-radius: 1rem;
            width: 320px;
            height: 510px;
            border: 1px solid #e5e7eb;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            background-color: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
          }
          .id-card-header {
            background-color: #f9fafb;
            padding: 0.75rem;
            text-align: center;
            border-bottom: 1px solid #e5e7eb;
          }
          .id-card-header h3 {
            margin: 0;
            font-size: 0.875rem;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
          }
          .id-card-body {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem;
            flex-grow: 1;
            text-align: center;
          }
          .id-card-photo {
            width: 128px;
            height: 128px;
            border-radius: 9999px;
            object-fit: cover;
            border: 4px solid #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
            margin-bottom: 1rem;
          }
          .id-card-name {
            font-size: 1.25rem;
            font-weight: 700;
            color: #111827;
            margin: 0;
          }
          .id-card-role {
            font-size: 1rem;
            color: #4b5563;
            margin-top: 0.25rem;
          }
          .id-card-qr-container {
            margin-top: auto;
            margin-bottom: auto;
            padding: 1rem 0;
          }
          .id-card-footer {
            padding: 0.5rem;
            text-align: center;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      `);
      printWindow.document.write('</head><body><div class="id-card-print-container">');
      printWindow.document.write(printContent);
      printWindow.document.write('</div></body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  if (!user) return null;
  const userId = 'uid' in user ? user.uid : user.id;
  const userRole = user.position || user.grade || user.role || 'Miembro';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px] p-0 border-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Carnet de Identificación</DialogTitle>
          <DialogDescription>Carnet de identificación para {user.name} con rol de {userRole}.</DialogDescription>
        </DialogHeader>
        <div ref={cardRef} className="bg-white rounded-lg overflow-hidden flex flex-col items-stretch font-sans">
          {/* Header */}
          <div className="id-card-header bg-gray-50 p-3 text-center border-b">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{organization?.name || 'DigitalCenter'}</h3>
          </div>
          
          {/* Body */}
          <div className="id-card-body p-4 flex-grow flex flex-col items-center">
            <Image
              src={user.avatarUrl || `https://picsum.photos/seed/${userId}/128/128`}
              alt="Foto del usuario"
              width={128}
              height={128}
              className="id-card-photo rounded-full object-cover border-4 border-white shadow-lg mb-4"
              data-ai-hint="person portrait"
            />
            <h2 className="id-card-name text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="id-card-role text-base text-gray-500">{userRole}</p>
            
            <div className="id-card-qr-container my-auto py-4">
              <div className="p-2 bg-white rounded-lg shadow-inner">
                <QRCode value={userId} size={128} level="Q" />
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="id-card-footer p-2 bg-gray-50 border-t">
            <Barcode value={userId} height={30} fontSize={10} margin={5} displayValue={false} />
          </div>
        </div>

        <DialogFooter className="p-6 pt-0">
          <Button onClick={handlePrint} className="w-full">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Carnet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

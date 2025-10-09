// /src/app/hr/qr-scanner.tsx
"use client";

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';
import { recordAttendance } from '@/services/attendance-service';
import { getEmployee } from '@/services/employee-service';
import { useAuth } from '@/hooks/use-auth';

interface QrScannerProps {
  onScanSuccess: () => void;
}

export function QrScanner({ onScanSuccess }: QrScannerProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Only initialize the scanner if it hasn't been initialized yet.
    if (!scannerRef.current) {
      const qrScanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [],
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        },
        false
      );
      scannerRef.current = qrScanner;

      const handleSuccess = async (decodedText: string) => {
        if (scannerRef.current?.getState() === 2) { // 2 = SCANNING
          scannerRef.current.pause(true);
        }
        
        try {
          const employeeId = decodedText;
          if (!userProfile?.organizationId) {
              throw new Error("No se pudo identificar la organización del administrador.");
          }

          const employee = await getEmployee(employeeId);
          if (!employee) {
              throw new Error("Empleado no encontrado en la base de datos.");
          }

          const result = await recordAttendance(employee.id, employee.name, userProfile.organizationId);

          toast({
            title: `Registro Exitoso: ${result.name}`,
            description: `Se ha registrado su ${result.type === 'check-in' ? 'entrada' : 'salida'} a las ${result.time}.`,
          });
          
          onScanSuccess();

        } catch (error: any) {
          toast({
            title: 'Error al Registrar',
            description: error.message || 'El código QR no es válido o no se pudo procesar.',
            variant: 'destructive',
          });
        } finally {
          setTimeout(() => {
             if (scannerRef.current?.getState() === 3) { // 3 = PAUSED
               scannerRef.current.resume();
             }
          }, 3000);
        }
      };

      const handleError = (errorMessage: string) => {
        // This is called frequently on non-scans, so it's best to keep it silent.
      };

      qrScanner.render(handleSuccess, handleError);
    }

    // Cleanup function to stop the scanner on component unmount
    return () => {
      if (scannerRef.current && scannerRef.current.getState() !== 1) { // 1 = NOT_STARTED
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner.", error);
        });
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess, toast, userProfile]);

  return <div id="qr-reader" className="w-full"></div>;
}

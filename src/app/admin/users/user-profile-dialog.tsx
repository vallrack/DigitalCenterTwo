// /src/app/admin/users/user-profile-dialog.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, Employee, Organization } from '@/lib/types';
import { getEmployee } from '@/services/employee-service';
import { getOrganizations } from '@/services/organization-service';

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | Employee; // Accept both types
}

const InfoField = ({ label, value }: { label: string, value?: string | number }) => (
    <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base">{value || 'N/A'}</p>
    </div>
);

export function UserProfileDialog({ open, onOpenChange, user }: UserProfileDialogProps) {
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Safely access the user ID whether it's 'uid' or 'id'
  const userId = 'uid' in user ? user.uid : user.id;

  const organizationName = organizations.find(o => o.id === user.organizationId)?.name || 'Sin Asignar';

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [employee, orgs] = await Promise.all([
        getEmployee(userId),
        getOrganizations(),
      ]);
      setEmployeeData(employee);
      setOrganizations(orgs);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cargar la información completa del perfil.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Image
              src={user.avatarUrl || `https://picsum.photos/seed/${userId}/100/100`}
              alt="Foto del usuario"
              width={80}
              height={80}
              className="rounded-full object-cover border-2"
              data-ai-hint="person portrait"
            />
            <div>
              <DialogTitle className="text-2xl">{user.name}</DialogTitle>
              <DialogDescription>
                {user.email}
              </DialogDescription>
              <div className="flex gap-2 mt-1">
                 <Badge>{user.role}</Badge>
                 <Badge variant={user.status === 'Active' ? 'success' : 'secondary'}>{user.status}</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4 space-y-6">
            <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-medium text-sm text-primary">Información General</h4>
                <div className="grid grid-cols-2 gap-4">
                    <InfoField label="ID de Usuario" value={userId.substring(0, 10) + '...'} />
                    <InfoField label="Organización" value={organizationName} />
                </div>
            </div>
            
            {employeeData && (
                 <div className="space-y-4 rounded-md border p-4">
                    <h4 className="font-medium text-sm text-primary">Expediente de Empleado</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoField label="Cargo" value={employeeData.position} />
                        <InfoField label="Salario" value={employeeData.salary ? `$${employeeData.salary.toFixed(2)}` : 'No definido'} />
                        <InfoField label="Banco" value={employeeData.bankName} />
                        <InfoField label="Número de Cuenta" value={employeeData.accountNumber} />
                        <InfoField label="EPS" value={employeeData.eps} />
                        <InfoField label="ARL" value={employeeData.arl} />
                    </div>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

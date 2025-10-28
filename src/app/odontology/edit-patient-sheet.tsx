
// /src/app/odontology/edit-patient-sheet.tsx
"use client";

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea'; // Usar Textarea para campos más largos
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { updatePatient } from '@/services/odontology-service';
import { useToast } from '@/hooks/use-toast';
import { departments, getMunicipalitiesByDepartment } from '@/lib/colombia-geo';

interface EditPatientSheetProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: (updated?: boolean) => void;
}

export function EditPatientSheet({ patient, isOpen, onClose }: EditPatientSheetProps) {
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [municipalities, setMunicipalities] = useState<string[]>([]);

  useEffect(() => {
    if (patient) {
      setFormData({ ...patient });
      if (patient.department) {
        setMunicipalities(getMunicipalitiesByDepartment(patient.department) || []);
      }
    }
  }, [patient]);

  const handleDepartmentChange = (departmentName: string) => {
    setFormData(prev => ({ ...prev, department: departmentName, municipality: undefined }));
    setMunicipalities(getMunicipalitiesByDepartment(departmentName) || []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!patient) return;
    setIsSaving(true);
    try {
      // Asegurarse de que todos los campos relevantes se incluyen en el objeto de actualización
      const dataToUpdate: Partial<Patient> = {
        name: formData.name,
        identificationNumber: formData.identificationNumber,
        age: formData.age,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        department: formData.department,
        municipality: formData.municipality,
        allergies: formData.allergies,
        currentMedications: formData.currentMedications,
        chronicDiseases: formData.chronicDiseases,
        surgeries: formData.surgeries,
        habits: formData.habits,
      };
      await updatePatient(patient.id, dataToUpdate);
      toast({ title: "Éxito", description: "Paciente actualizado correctamente." });
      onClose(true);
    } catch (error) {
      console.error("Error updating patient:", error);
      toast({ title: "Error", description: "No se pudo actualizar el paciente.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!patient) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-2xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle>Editar Paciente</SheetTitle>
          <SheetDescription>
            Actualiza los detalles del paciente. Haz clic en guardar cuando termines.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto pr-4 -mr-6 space-y-4 py-4">
          <h3 className="text-lg font-semibold border-b pb-2">Información Personal</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre Completo</Label>
              <Input id="name" value={formData.name || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="identificationNumber">Número de Identificación</Label>
              <Input id="identificationNumber" value={formData.identificationNumber || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="age">Edad</Label>
              <Input id="age" type="number" value={formData.age || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="gender">Género</Label>
              <Select onValueChange={(v) => handleSelectChange('gender', v)} value={formData.gender}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar género..." /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>

          <h3 className="text-lg font-semibold border-b pb-2 pt-4">Contacto y Ubicación</h3>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" value={formData.phone || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email || ''} onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" value={formData.address || ''} onChange={handleChange} />
            </div>
            <div>
                <Label>Departamento</Label>
                <Select onValueChange={handleDepartmentChange} value={formData.department}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar departamento..." /></SelectTrigger>
                    <SelectContent>
                        {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Municipio</Label>
                <Select onValueChange={(v) => handleSelectChange('municipality', v)} value={formData.municipality} disabled={!formData.department}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar municipio..." /></SelectTrigger>
                    <SelectContent>
                        {municipalities.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>

          <h3 className="text-lg font-semibold border-b pb-2 pt-4">Antecedentes Médicos</h3>
           <div className="space-y-4">
              <div>
                  <Label htmlFor="allergies">Alergias</Label>
                  <Textarea id="allergies" value={formData.allergies || ''} onChange={handleChange} />
              </div>
              <div>
                  <Label htmlFor="currentMedications">Medicamentos Actuales</Label>
                  <Textarea id="currentMedications" value={formData.currentMedications || ''} onChange={handleChange} />
              </div>
              <div>
                  <Label htmlFor="chronicDiseases">Enfermedades Crónicas</Label>
                  <Textarea id="chronicDiseases" value={formData.chronicDiseases || ''} onChange={handleChange} />
              </div>
              <div>
                  <Label htmlFor="surgeries">Antecedentes Quirúrgicos</Label>
                  <Textarea id="surgeries" value={formData.surgeries || ''} onChange={handleChange} />
              </div>
              <div>
                  <Label htmlFor="habits">Hábitos (Alcohol, Tabaco, etc.)</Label>
                  <Textarea id="habits" value={formData.habits || ''} onChange={handleChange} />
              </div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="outline" onClick={() => onClose()}>Cancelar</Button>
          </SheetClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

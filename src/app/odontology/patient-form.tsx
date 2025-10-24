
// /src/app/odontology/patient-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { addPatient } from "@/services/odontology-service";
import { useToast } from "@/hooks/use-toast";
import { departments } from "@/lib/colombia-geo";

const formSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  identificationNumber: z.string().min(5, "La cédula es requerida"),
  age: z.coerce.number().min(1, "La edad debe ser mayor a 0"),
  gender: z.string({ required_error: "El género es requerido"}),
  phone: z.string().min(7, "El teléfono es requerido"),
  email: z.string().email("El formato del email no es válido").optional().or(z.literal('')),
  department: z.string({ required_error: "El departamento es requerido" }),
  municipality: z.string({ required_error: "El municipio es requerido" }),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  chronicDiseases: z.string().optional(),
  surgeries: z.string().optional(),
  habits: z.string().optional(),
});

interface PatientFormProps {
  onPatientAdded: () => void;
}

export function PatientForm({ onPatientAdded }: PatientFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      identificationNumber: "",
      age: 0,
      gender: undefined,
      phone: "",
      email: "",
      department: undefined,
      municipality: undefined,
      allergies: "",
      currentMedications: "",
      chronicDiseases: "",
      surgeries: "",
      habits: "",
    },
  });

  const department = form.watch('department');

  useEffect(() => {
    if (department) {
      const selectedDept = departments.find(d => d.name === department);
      setMunicipalities(selectedDept ? selectedDept.municipalities : []);
      form.setValue('municipality', '' as any);
    } else {
      setMunicipalities([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const patientData = { ...values, age: Number(values.age) };
      await addPatient(patientData);
      toast({ title: "Éxito", description: "Paciente agregado correctamente." });
      form.reset();
      setIsOpen(false);
      onPatientAdded();
    } catch (error) {
        if(error instanceof Error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Agregar Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Paciente</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del paciente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identificationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula</FormLabel>
                  <FormControl>
                    <Input placeholder="Cédula del paciente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Edad</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Edad del paciente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Género</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccione el género" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Teléfono de contacto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="correo@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccione un departamento" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map(dept => <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="municipality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Municipio</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={municipalities.length === 0}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccione un municipio" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {municipalities.map(muni => <SelectItem key={muni} value={muni}>{muni}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alergias</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Penicilina, AINES..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentMedications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicamentos Actuales</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Losartán 50mg/día..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chronicDiseases"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enfermedades Crónicas</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Hipertensión, Diabetes Mellitus tipo 2..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="surgeries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Antecedentes Quirúrgicos</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Apendicectomía en 2015..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="habits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hábitos</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Fumador, consume alcohol ocasionalmente..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Paciente"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

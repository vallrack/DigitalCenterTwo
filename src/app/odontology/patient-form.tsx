// /src/app/odontology/patient-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

const formSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  identificationNumber: z.string().min(5, "La cédula es requerida"),
  age: z.number().min(1, "La edad es requerida"),
  gender: z.string().min(1, "El género es requerido"),
  contact: z.string().min(1, "El contacto es requerido"),
  medicalHistory: z.string().optional(),
});

interface PatientFormProps {
  onPatientAdded: () => void;
}

export function PatientForm({ onPatientAdded }: PatientFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      identificationNumber: "",
      age: 0,
      gender: "",
      contact: "",
      medicalHistory: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await addPatient(values);
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
      <DialogContent>
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
                  <FormLabel>Nombre</FormLabel>
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
                    <Input type="number" placeholder="Edad del paciente" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
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
                  <FormControl>
                    <Input placeholder="Género del paciente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="Contacto del paciente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medicalHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Antecedentes Médicos</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Antecedentes médicos relevantes del paciente"
                      {...field}
                    />
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

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

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
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { updatePatient, getPatientById } from "@/services/odontology-service";
import { useToast } from "@/hooks/use-toast";

const followUpSchema = z.object({
  date: z.string().min(1, "La fecha es requerida"),
  notes: z.string().min(10, "Las notas deben tener al menos 10 caracteres"),
});

interface AddFollowUpDialogProps {
  patientId: string;
  onFollowUpAdded: () => void;
}

export function AddFollowUpDialog({ patientId, onFollowUpAdded }: AddFollowUpDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof followUpSchema>>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // Default to today
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof followUpSchema>) {
    setIsSubmitting(true);
    try {
      const patient = await getPatientById(patientId);
      if (!patient) {
        throw new Error("No se pudo encontrar el paciente.");
      }

      const newFollowUp = {
        id: uuidv4(),
        ...values
      };

      const updatedFollowUps = [...(patient.followUps || []), newFollowUp];
      
      await updatePatient(patientId, { followUps: updatedFollowUps });
      
      toast({ title: "Éxito", description: "Control de seguimiento agregado correctamente." });
      form.reset();
      setIsOpen(false);
      onFollowUpAdded();
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
        <Button variant="outline">
          <PlusCircle className="h-4 w-4 mr-2" />
          Agregar Control
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Control de Seguimiento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha del Control</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas del Control</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escriba aquí los detalles del seguimiento, evolución, procedimientos realizados, etc."
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : "Guardar Control"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

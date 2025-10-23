// /src/app/odontology/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Patient } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Printer, Trash, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { deletePatient } from "@/services/odontology-service"
import { useToast } from "@/hooks/use-toast"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

const CellActions = ({ patient, onPatientDeleted }: { patient: Patient, onPatientDeleted: () => void }) => {
    const router = useRouter();
    const { toast } = useToast();

    const handleDelete = async () => {
        if (confirm('¿Estás seguro de que quieres eliminar este paciente? Esta acción no se puede deshacer.')) {
            try {
                await deletePatient(patient.id);
                toast({ title: "Éxito", description: "Paciente eliminado correctamente." });
                onPatientDeleted();
            } catch (error) {
                toast({ title: "Error", description: "No se pudo eliminar el paciente.", variant: "destructive" });
            }
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/odontology/${patient.id}`)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Historia y Odontograma
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/odontology/${patient.id}?print=true`)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Historia
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar Paciente
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const getColumns = (onPatientDeleted: () => void): ColumnDef<Patient>[] => [
    {
        accessorKey: "name",
        header: "Nombre",
    },
    {
        accessorKey: "identificationNumber",
        header: "Cédula",
    },
    {
        accessorKey: "age",
        header: "Edad",
    },
    {
        accessorKey: "gender",
        header: "Género",
    },
    {
        accessorKey: "contact",
        header: "Contacto",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const patient = row.original
            return <CellActions patient={patient} onPatientDeleted={onPatientDeleted} />;
        },
    },
]

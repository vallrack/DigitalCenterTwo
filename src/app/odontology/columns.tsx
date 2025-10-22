// /src/app/odontology/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Patient } from "@/lib/types"

export const columns: ColumnDef<Patient>[] = [
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
  // We will add actions column later
]

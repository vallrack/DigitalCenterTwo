// /src/app/finance/expenses-client.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HardHat } from 'lucide-react';

export function ExpensesClient() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Gastos</CardTitle>
        <CardDescription>
          Registre y categorice los gastos y compras de su organización.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground p-10">
        <HardHat className="h-12 w-12 mb-4" />
        <p className="font-semibold">Módulo en Construcción</p>
        <p className="text-sm">Esta funcionalidad estará disponible próximamente.</p>
      </CardContent>
    </Card>
  );
}

// /src/app/finance/page.tsx
"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { AccountingClient } from './accounting-client';
import { InvoicesClient } from './invoices-client';
import { ExpensesClient } from './expenses-client';


export default function FinancePage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Finanzas y Contabilidad</h1>
      </div>
      <Tabs defaultValue="accounting">
        <TabsList>
          <TabsTrigger value="accounting">Contabilidad</TabsTrigger>
          <TabsTrigger value="invoices">Facturas</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
        </TabsList>
        <TabsContent value="accounting">
            <AccountingClient />
        </TabsContent>
        <TabsContent value="invoices">
          <InvoicesClient />
        </TabsContent>
         <TabsContent value="expenses">
          <ExpensesClient />
        </TabsContent>
      </Tabs>
    </>
  );
}

// /src/app/reports/page.tsx
"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ProfitabilityClient } from './profitability-client';
import { SalesReportClient } from './sales-report-client';
import { InventoryReportClient } from './inventory-report-client';

export default function ReportsPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Reportes y Analíticas</h1>
      </div>
      <Tabs defaultValue="profitability">
        <TabsList>
          <TabsTrigger value="profitability">Reporte de Rentabilidad</TabsTrigger>
          <TabsTrigger value="sales">Reporte de Ventas</TabsTrigger>
          <TabsTrigger value="inventory">Inventario Valorado</TabsTrigger>
        </TabsList>
        <TabsContent value="profitability">
          <ProfitabilityClient />
        </TabsContent>
        <TabsContent value="sales">
          <SalesReportClient />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryReportClient />
        </TabsContent>
      </Tabs>
    </>
  );
}

// /src/app/sales/page.tsx
"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { PosClient } from './pos-client';
import { SalesHistoryClient } from './sales-history-client';


export default function SalesPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Ventas (POS)</h1>
      </div>
      <Tabs defaultValue="pos">
        <TabsList>
          <TabsTrigger value="pos">Terminal Punto de Venta (POS)</TabsTrigger>
          <TabsTrigger value="history">Historial de Ventas</TabsTrigger>
        </TabsList>
        <TabsContent value="pos">
            <PosClient />
        </TabsContent>
        <TabsContent value="history">
            <SalesHistoryClient />
        </TabsContent>
      </Tabs>
    </>
  );
}

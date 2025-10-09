// /src/app/inventory/page.tsx
"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { InventoryClient } from './inventory-client';
import { WarehousesClient } from './warehouses-client';
import { TransfersClient } from './transfers-client';
import { CategoriesClient } from './categories-client';


export default function InventoryPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Gestión de Inventario</h1>
      </div>
      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="products">Productos y Servicios</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="warehouses">Almacenes</TabsTrigger>
          <TabsTrigger value="transfers">Traslados</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
            <InventoryClient />
        </TabsContent>
        <TabsContent value="categories">
            <CategoriesClient />
        </TabsContent>
        <TabsContent value="warehouses">
            <WarehousesClient />
        </TabsContent>
        <TabsContent value="transfers">
            <TransfersClient />
        </TabsContent>
      </Tabs>
    </>
  );
}

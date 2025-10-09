// /src/app/customers/page.tsx
"use client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { CustomersClient } from "./customers-client";
import { OpportunitiesClient } from './opportunities-client';
import { CrmSettingsClient } from './crm-settings-client';

export default function CustomersPage() {
    return (
        <>
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Gestión de Clientes (CRM)</h1>
            </div>
            <Tabs defaultValue="customers">
                <TabsList>
                    <TabsTrigger value="customers">Clientes</TabsTrigger>
                    <TabsTrigger value="opportunities">Oportunidades (Pipeline)</TabsTrigger>
                    <TabsTrigger value="settings">Configuraciones</TabsTrigger>
                </TabsList>
                <TabsContent value="customers">
                    <CustomersClient />
                </TabsContent>
                <TabsContent value="opportunities">
                    <OpportunitiesClient />
                </TabsContent>
                <TabsContent value="settings">
                    <CrmSettingsClient />
                </TabsContent>
            </Tabs>
        </>
    )
}

// /src/app/odontology/page.tsx
"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { OdontologyClient } from './odontology-client';
import { OdontogramClient } from './odontogram-client';


export default function OdontologyPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Odontología</h1>
      </div>
      <Tabs defaultValue="patients">
        <TabsList>
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
          <TabsTrigger value="odontogram">Odontograma</TabsTrigger>
        </TabsList>
        <TabsContent value="patients">
            <OdontologyClient />
        </TabsContent>
        <TabsContent value="odontogram">
            <OdontogramClient />
        </TabsContent>
      </Tabs>
    </>
  );
}

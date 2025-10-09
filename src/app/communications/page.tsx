// /src/app/communications/page.tsx
"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { CampaignsClient } from './campaigns-client';
import { WhatsappTemplatesClient } from './whatsapp-templates-client';
import { EmailTemplatesClient } from './email-templates-client';
import { CommunicationsSettingsClient } from './communications-settings-client';


export default function CommunicationsPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Comunicaciones</h1>
      </div>
      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campañas</TabsTrigger>
          <TabsTrigger value="whatsapp">Plantillas WhatsApp</TabsTrigger>
          <TabsTrigger value="email">Plantillas Email</TabsTrigger>
          <TabsTrigger value="settings">Configuraciones</TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns">
            <CampaignsClient />
        </TabsContent>
        <TabsContent value="whatsapp">
            <WhatsappTemplatesClient />
        </TabsContent>
        <TabsContent value="email">
            <EmailTemplatesClient />
        </TabsContent>
        <TabsContent value="settings">
            <CommunicationsSettingsClient />
        </TabsContent>
      </Tabs>
    </>
  );
}

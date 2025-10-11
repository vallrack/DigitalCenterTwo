// /src/app/admin/organizations/page.tsx
"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { OrganizationsClient } from './organizations-client';
import { OrganizationCustomizationForm } from './organization-customization-form';
import { UsersClient } from '../users/users-client';
import { LiveActivityClient } from './live-activity-client';
import { ActivityFeedClient } from '../activity-feed-client';
import { DeletedUsersClient } from '../deleted-users/deleted-users-client';
import { SettingsClient } from '../settings/settings-client';
import { ProspectsClient } from '../prospects/prospects-client';
import { useAuth } from '@/hooks/use-auth';

export default function AdminPage() {
  const { userProfile } = useAuth();
  
  if (!userProfile) {
    return null; 
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Administración</h1>
      </div>
      <Tabs defaultValue="organizations">
        <TabsList>
          <TabsTrigger value="organizations">Clientes (Organizaciones)</TabsTrigger>
          <TabsTrigger value="prospects">Prospectos</TabsTrigger>
          <TabsTrigger value="users">Usuarios del Sistema</TabsTrigger>
          <TabsTrigger value="deleted-users">Usuarios Eliminados</TabsTrigger>
          <TabsTrigger value="customization">Personalización de Marca</TabsTrigger>
          <TabsTrigger value="live-activity">Actividad en Vivo</TabsTrigger>
          <TabsTrigger value="settings">Parametrizaciones</TabsTrigger>
        </TabsList>
        <TabsContent value="organizations">
          <OrganizationsClient />
        </TabsContent>
         <TabsContent value="prospects">
          <ProspectsClient />
        </TabsContent>
        <TabsContent value="users">
          <UsersClient />
        </TabsContent>
        <TabsContent value="deleted-users">
          <DeletedUsersClient />
        </TabsContent>
        <TabsContent value="customization">
          <OrganizationCustomizationForm />
        </TabsContent>
        <TabsContent value="live-activity">
          <div className="space-y-6">
            <LiveActivityClient />
            <ActivityFeedClient />
          </div>
        </TabsContent>
        <TabsContent value="settings">
          <SettingsClient />
        </TabsContent>
      </Tabs>
    </>
  );
}

// /src/app/settings/settings-client.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ChangePasswordForm } from "./change-password-form";
import { SettingsForm } from "./settings-form";

export function SettingsClient() {
  const { user, userProfile } = useAuth();

  // This check is important because AuthProvider might render this component
  // before the userProfile is fully loaded.
  if (!user || !userProfile) {
    return null; // Or a loading skeleton
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Ajustes</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tu Perfil</CardTitle>
            <CardDescription>
              Actualiza tu información personal aquí.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm userProfile={userProfile} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>
              Cambia tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

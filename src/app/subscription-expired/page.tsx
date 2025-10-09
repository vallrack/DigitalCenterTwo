// /src/app/subscription-expired/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut, AlertTriangle } from "lucide-react";

export default function SubscriptionExpiredPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="mx-auto max-w-md text-center">
        <CardHeader className="items-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <CardTitle className="text-2xl">Acceso Denegado</CardTitle>
          <CardDescription>
            La suscripción de su organización ha finalizado o ha sido
            cancelada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Por favor, póngase en contacto con el administrador de su empresa o
            con el equipo de soporte para reactivar el servicio y recuperar el
`           acceso.
          </p>
          <Button
            onClick={handleLogout}
            variant="secondary"
            className="mt-6 w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

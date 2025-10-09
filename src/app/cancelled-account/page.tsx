// /src/app/cancelled-account/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { LogOut, XCircle } from "lucide-react";

export default function CancelledAccountPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="mx-auto max-w-md text-center">
        <CardHeader className="items-center">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
          <CardTitle className="text-2xl">Cuenta Cancelada</CardTitle>
          <CardDescription>
            Su cuenta ha sido cancelada y ya no tiene acceso a la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Si cree que esto es un error o desea reactivar su cuenta, por favor
            póngase en contacto con el soporte administrativo.
          </p>
          <Button onClick={handleLogout} variant="secondary" className="mt-6 w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

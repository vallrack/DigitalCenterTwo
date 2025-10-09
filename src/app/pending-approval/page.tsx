// /src/app/pending-approval/page.tsx
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
import { LogOut, Clock } from "lucide-react";

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="mx-auto max-w-md text-center">
        <CardHeader className="items-center">
            <Clock className="h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl">Cuenta Pendiente de Aprobación</CardTitle>
          <CardDescription>
            Gracias por registrarse. Su cuenta está esperando la aprobación de un
            administrador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Recibirá una notificación por correo electrónico una vez que su
            cuenta sea activada. Si tiene alguna pregunta, por favor contacte al
            soporte.
          </p>
          <Button onClick={handleLogout} className="mt-6 w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

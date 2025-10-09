// /src/app/student-portal/page.tsx
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BarChart2, CalendarCheck2 } from "lucide-react";

export default function StudentPortalPage() {
  const { userProfile } = useAuth();

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Bienvenido a tu Portal, {userProfile?.name}</h1>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portal del Estudiante</CardTitle>
            <CardDescription>
              Aquí podrás consultar tu información académica. ¡Más funcionalidades próximamente!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-muted/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Mis Calificaciones</CardTitle>
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Próximamente disponible</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Mi Asistencia</CardTitle>
                  <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Próximamente disponible</p>
                </CardContent>
              </Card>
               <Card className="bg-muted/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Mi Horario</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Próximamente disponible</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

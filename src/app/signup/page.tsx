// /src/app/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { processNewUser, handleSocialLogin } from "@/services/user-service";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import type { Organization } from "@/lib/types";

export const dynamic = 'force-dynamic';

type SelectedModules = Partial<Organization['modules']>;

const moduleLabels: { id: keyof Organization['modules']; label: string, description: string }[] = [
    { id: 'hr', label: 'Recursos Humanos', description: 'Gestión de empleados y nómina.' },
    { id: 'academics', label: 'Gestión Académica', description: 'Planes de lección, materias, horarios.' },
    { id: 'students', label: 'Gestión de Estudiantes', description: 'Administra expedientes estudiantiles.' },
    { id: 'studentPortal', label: 'Portal Estudiantil', description: 'Espacio para que estudiantes consulten notas.' },
    { id: 'finance', label: 'Finanzas', description: 'Contabilidad y facturación.' },
    { id: 'inventory', label: 'Inventario', description: 'Control de productos y stock.' },
    { id: 'sales', label: 'Ventas (POS)', description: 'Terminal punto de venta.' },
    { id: 'workshop', label: 'Gestión de Taller', description: 'Administra órdenes de servicio y reparaciones.' },
    { id: 'restaurant', label: 'Gestión de Restaurante', description: 'Administración de menús, mesas y pedidos.' },
    { id: 'coffee', label: 'Gestión de Caficultores', description: 'Administra lotes, cultivos y trazabilidad.' },
    { id: 'odontology', label: 'Módulo de Odontología', description: 'Gestiona historias clínicas y odontogramas 3D.' },
    { id: 'assets', label: 'Gestión de Activos', description: 'Control y mantenimiento de activos fijos.' },
    { id: 'reports', label: 'Reportes y Analíticas', description: 'Informes de gestión.' },
    { id: 'communications', label: 'Comunicaciones', description: 'Campañas de Email y WhatsApp.' },
    { id: 'landingPage', label: 'Página Pública', description: 'Página de inicio personalizable.' },
];


export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [selectedModules, setSelectedModules] = useState<SelectedModules>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  const bubbleSizes = ['w-4 h-4', 'w-8 h-8', 'w-3 h-3', 'w-6 h-6', 'w-5 h-5', 'w-7 h-7', 'w-2 h-2', 'w-4 h-4', 'w-5 h-5', 'w-8 h-8'];
  const animationDetails = [
    { duration: '18s', delay: '0s' }, { duration: '12s', delay: '1s' }, { duration: '15s', delay: '2s' },
    { duration: '20s', delay: '0s' }, { duration: '22s', delay: '3s' }, { duration: '18s', delay: '1s' },
    { duration: '16s', delay: '4s' }, { duration: '13s', delay: '2s' }, { duration: '19s', delay: '0s' },
    { duration: '14s', delay: '3s' }
  ];

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  }

  const goToNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
        toast({ title: 'Campos incompletos', description: 'Por favor, rellene todos los campos.', variant: 'destructive' });
        return;
    }
     if (formData.password.length < 6) {
        toast({ title: 'Contraseña insegura', description: 'La contraseña debe tener al menos 6 caracteres.', variant: 'destructive' });
        return;
    }
    setStep(2);
  }
  
  const handleModuleChange = (moduleId: keyof Organization['modules'], checked: boolean | string) => {
      setSelectedModules(prev => ({ ...prev, [moduleId]: checked }));
  }

  const handleFinalSignup = async () => {
    if (Object.values(selectedModules).every(v => !v)) {
      toast({ title: 'Selección requerida', description: 'Por favor, elija al menos un módulo que le interese.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await processNewUser(
        formData,
        selectedModules
      );
       // Redirect to pending approval page after successful registration
      router.push("/pending-approval");
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({
            title: "Error de registro",
            description: "Este correo electrónico ya está en uso. Por favor, intente con otro o inicie sesión si ya tiene una cuenta.",
            variant: "destructive",
        });
      } else {
        toast({
            title: "Error de registro",
            description: error.message || "No se pudo crear la cuenta.",
            variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full z-[1]">
          {Array.from({ length: 10 }).map((_, i) => (
              <div
              key={i}
              className={`absolute bottom-[-150px] bg-white/10 rounded-full animate-float-bubbles ${bubbleSizes[i % bubbleSizes.length]}`}
              style={{
                  left: `${Math.random() * 100}%`,
                  animationDuration: animationDetails[i % animationDetails.length].duration,
                  animationDelay: animationDetails[i % animationDetails.length].delay,
              }}
              />
          ))}
      </div>

      <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="mx-auto max-w-lg w-full z-10">
            {step === 1 && (
                <>
                <CardHeader>
                    <CardTitle className="text-xl">Solicite su Prueba (Paso 1 de 2)</CardTitle>
                    <CardDescription>
                    Cree su cuenta para solicitar una prueba personalizada. Requiere aprobación.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={goToNextStep}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input id="name" type="text" placeholder="Ej: Ana García" required value={formData.name} onChange={handleDataChange} />
                        </div>
                        <div className="grid gap-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input id="email" type="email" placeholder="nombre@ejemplo.com" required value={formData.email} onChange={handleDataChange} />
                        </div>
                        <div className="grid gap-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input id="password" type="password" required value={formData.password} onChange={handleDataChange} />
                        </div>
                        <Button type="submit" className="w-full">
                        Siguiente
                        </Button>
                    </div>
                    </form>
                    <div className="mt-4 text-center text-sm">
                    ¿Ya tiene una cuenta?{" "}
                    <Link href="/login" className="underline">Iniciar Sesión</Link>
                    </div>
                </CardContent>
                </>
            )}

            {step === 2 && (
                <>
                <CardHeader>
                    <CardTitle className="text-xl">Seleccione los Módulos de Interés (Paso 2 de 2)</CardTitle>
                    <CardDescription>
                    Su solicitud será revisada por un administrador para activar su prueba.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-1">
                        {moduleLabels.map(({ id, label, description }) => (
                            <div
                                key={id}
                                className="flex items-start space-x-3 rounded-lg border p-3"
                            >
                                <Checkbox
                                    id={id}
                                    checked={!!selectedModules[id]}
                                    onCheckedChange={(checked) => handleModuleChange(id, checked)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                <label
                                    htmlFor={id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {label}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                    {description}
                                </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="w-full" onClick={() => setStep(1)}>Atrás</Button>
                        <Button className="w-full" onClick={handleFinalSignup} disabled={isLoading}>
                            {isLoading ? "Enviando Solicitud..." : "Solicitar Prueba"}
                        </Button>
                    </div>
                </CardContent>
                </>
            )}
            <div className="mt-4 text-center text-sm pb-4">
                <Link href="/" className="underline">
                Volver a la página de inicio
                </Link>
            </div>
          </Card>
      </div>

       <div className="absolute bottom-0 left-0 w-full h-[150px] z-[5]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none">
              <defs>
                  <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
              </defs>
              <g className="fill-background">
                  <use xlinkHref="#gentle-wave" x="50" y="0" className="animate-move-forever opacity-40" style={{ animationDelay: '-2s', animationDuration: '4s' }} />
                  <use xlinkHref="#gentle-wave" x="50" y="3" className="animate-move-forever opacity-50" style={{ animationDelay: '-3s', animationDuration: '5s' }} />
                  <use xlinkHref="#gentle-wave" x="50" y="6" className="animate-move-forever opacity-20" style={{ animationDelay: '-4s', animationDuration: '6s' }} />
                  <use xlinkHref="#gentle-wave" x="50" y="9" className="animate-move-forever" style={{ animationDelay: '-5s', animationDuration: '7s' }} />
              </g>
          </svg>
      </div>
    </div>
  );
}

// /src/app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, appleProvider } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const isSignupEnabled = true;

  const bubbleSizes = ['w-4 h-4', 'w-8 h-8', 'w-3 h-3', 'w-6 h-6', 'w-5 h-5', 'w-7 h-7', 'w-2 h-2', 'w-4 h-4', 'w-5 h-5', 'w-8 h-8'];
  const animationDetails = [
    { duration: '18s', delay: '0s' }, { duration: '12s', delay: '1s' }, { duration: '15s', delay: '2s' },
    { duration: '20s', delay: '0s' }, { duration: '22s', delay: '3s' }, { duration: '18s', delay: '1s' },
    { duration: '16s', delay: '4s' }, { duration: '13s', delay: '2s' }, { duration: '19s', delay: '0s' },
    { duration: '14s', delay: '3s' }
  ];

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // La redirección es manejada por AuthProvider
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        toast({
          title: "Error de autenticación",
          description: "Las credenciales no son correctas. Por favor, intente de nuevo.",
          variant: "destructive",
        });
      } else {
        console.error("Unexpected login error:", error);
        toast({
          title: "Error Inesperado",
          description: "Ocurrió un problema al intentar iniciar sesión.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'apple') => {
      setIsLoading(true);
      try {
          const authProvider = provider === 'google' ? googleProvider : appleProvider;
          const result = await signInWithPopup(auth, authProvider);
          const user = result.user;

          // Crucial check: Verify if user profile exists in Firestore.
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists()) {
              // If profile doesn't exist, this login attempt is invalid.
              await auth.signOut(); // Force sign out
              throw new Error("Su perfil de usuario no se encontró. Si es un nuevo usuario, por favor regístrese primero.");
          }
          // If profile exists, AuthProvider will handle redirection.
      } catch(error: any) {
          toast({
              title: 'Error de Inicio de Sesión',
              description: error.message || 'No se pudo iniciar sesión. Por favor, regístrese si no tiene una cuenta.',
              variant: 'destructive',
          });
      } finally {
          setIsLoading(false);
      }
  }

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
        <Card className="mx-auto max-w-sm w-full z-10">
          <CardHeader className="items-center text-center">
              <Image src="https://dprogramadores.com.co/img/logoD.png" alt="DigitalCenter Logo" width={48} height={48} />
            <CardTitle className="text-2xl">Bienvenido a DigitalCenter</CardTitle>
            <CardDescription>
              Ingrese sus credenciales para acceder al sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                </Button>
              </div>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continuar con
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
               <Button variant="outline" onClick={() => socialLogin('google')} disabled={isLoading}>
                  {/* Google SVG Icon */}
                  <svg role="img" viewBox="0 0 24 24" className="h-4 w-4 mr-2"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-4.01 1.62-3.4 0-6.17-2.83-6.17-6.23s2.77-6.23 6.17-6.23c1.87 0 3.13.77 3.88 1.48l2.84-2.76C18.33 2.18 15.86 1 12.48 1 7.01 1 3 5.02 3 9.5s4.01 8.5 9.48 8.5c2.76 0 4.92-1 6.4-2.54 1.54-1.58 2.08-3.72 2.08-5.96 0-.62-.06-1.22-.17-1.8z"></path></svg>
                  Google
              </Button>
              <Button variant="outline" onClick={() => socialLogin('apple')} disabled={isLoading}>
                  {/* Apple SVG Icon */}
                  <svg role="img" viewBox="0 0 24 24" className="h-4 w-4 mr-2"><path fill="currentColor" d="M12.06,1.93C10.29,1.9,8.58,2.8,7.34,4.25c-2.43,2.7-2.67,6.86-0.5,9.63c1,1.29,2.3,2.15,3.78,2.29c0.23,0.02,0.47,0,0.72-0.03c1.06-0.12,2.23-0.66,3.3-1.63c0.82-0.75,1.52-1.72,1.86-2.73c0.01-0.03,0.02-0.06,0.03-0.09c-2.83,1.3-5.95,0.18-7.3-2.51c-1-2.04-0.45-4.4,1.4-5.83C11.1,2.5,11.58,2.22,12.06,1.93 M15.11,0c-0.1,0.01-2.04,0.3-3.69,1.75c-1.39,1.2-2.31,2.94-2.43,4.86c-0.13,2.21,0.67,4.24,2.22,5.59c1.07,0.95,2.37,1.53,3.77,1.56c0.1,0,0.2,0,0.3,0c1.47-0.12,2.83-0.89,3.8-2.05c2.61-3.13,1.98-7.92-1.3-10.33C17.06,0.51,16.14,0.1,15.11,0"></path></svg>
                  Apple
              </Button>
            </div>
            
             <div className="mt-4 text-center text-sm">
               <Link href="/" className="underline">
                  Volver a la página de inicio
                </Link>
              </div>
            {isSignupEnabled && (
              <div className="mt-4 text-center text-sm">
                ¿No tiene una cuenta?{" "}
                <Link href="/signup" className="underline">
                  Registrarse
                </Link>
              </div>
            )}
          </CardContent>
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

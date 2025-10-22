// /src/contexts/auth-context.tsx
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import Image from "next/image";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import type { UserProfile, Organization, UserRole } from "@/lib/types";
import { updateUserPresence } from "@/services/presence-service";
import { AppContent } from "@/app/app-content";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  organization: Organization | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null, organization: null, loading: true });

interface AuthProviderProps {
  children: ReactNode;
}

const publicRoutes = ["/", "/login", "/signup", "/pending-approval", "/cancelled-account", "/subscription-expired"];
const blockingRoutes = ["/pending-approval", "/cancelled-account", "/subscription-expired"];
const essentialRoutes = ["/settings"]; // Routes accessible even when password change is forced

const routesByRole: Record<UserRole, string[]> = {
    'SuperAdmin': ['/dashboard', '/admin', '/customers', '/sales', '/settings', '/hr', '/academics', '/finance', '/inventory', '/reports', '/student-portal', '/communications', '/caficultores', '/analysis', '/odontology'],
    'Admin': ['/dashboard', '/customers', '/sales', '/settings', '/hr', '/academics', '/finance', '/inventory', '/reports', '/communications', '/odontology'],
    'Ventas': ['/dashboard', '/customers', '/sales', '/settings', '/communications'],
    'Academico': ['/dashboard', '/academics', '/settings'],
    'RRHH': ['/dashboard', '/hr', '/settings'],
    'Finanzas': ['/dashboard', '/finance', '/settings'],
    'Estudiante': ['/dashboard', '/settings', '/student-portal'],
    'Empleado': ['/dashboard', '/settings'],
    'Marketing': ['/dashboard', '/settings', '/communications'],
    'Soporte': ['/dashboard', '/settings'],
    'EnEspera': ['/pending-approval'],
    'SinAsignar': ['/pending-approval'],
    'Cancelled': ['/cancelled-account'],
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            let profile = userDoc.data() as UserProfile;

            // Ensure SuperAdmin role if email matches
            if (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL && firebaseUser.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL && profile.role !== 'SuperAdmin') {
              profile.role = 'SuperAdmin';
              await updateDoc(userDocRef, { role: 'SuperAdmin' });
            }

            let org: Organization | null = null;
            if (profile.role !== 'SuperAdmin' && profile.organizationId) {
              const orgDocRef = doc(db, 'organizations', profile.organizationId);
              const orgDoc = await getDoc(orgDocRef);
              if (orgDoc.exists()) {
                org = { id: orgDoc.id, ...orgDoc.data() } as Organization;
              } else {
                console.warn(`Organization document ${profile.organizationId} not found.`);
              }
            }
            
            setUser(firebaseUser);
            setUserProfile(profile);
            setOrganization(org);

            updateUserPresence(firebaseUser.uid, {
                userName: profile.name,
                role: profile.role,
                organizationId: org?.id || null,
                organizationName: org?.name || (profile.role === 'SuperAdmin' ? 'Super Admin' : 'N/A'),
            });

          } else {
            console.warn(`User ${firebaseUser.uid} exists in Auth but not in Firestore. Forcing logout.`);
            toast({
              title: "Cuenta no encontrada",
              description: "Tu perfil de usuario ya no existe. Si es un error, contacta a soporte.",
              variant: "destructive",
            });
            await signOut(auth); // This will re-trigger the listener with a null user
          }
        } catch (error) {
            console.error("Error during auth state processing:", error);
            await signOut(auth);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setOrganization(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = publicRoutes.some(route => pathname === route) || pathname.startsWith('/o/');
    
    if (!user) {
        if (!isPublicRoute) {
            router.replace('/login');
        }
        return;
    }

    if (!userProfile) return;

    if (userProfile.status === 'cancelled') {
        if (pathname !== '/cancelled-account') router.replace('/cancelled-account');
        return;
    }

    if (userProfile.role === 'EnEspera' || userProfile.role === 'SinAsignar') {
        if (pathname !== '/pending-approval') router.replace('/pending-approval');
        return;
    }

    if (organization && userProfile.role !== 'SuperAdmin') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const subEndDate = new Date(organization.subscriptionEnds);
        const timezoneOffset = subEndDate.getTimezoneOffset() * 60000;
        const adjustedSubEndDate = new Date(subEndDate.getTime() + timezoneOffset);
        const isExpired = adjustedSubEndDate < today;
        const isCancelled = organization.contractStatus === 'Cancelled';

        if ((isExpired || isCancelled) && pathname !== '/subscription-expired') {
            router.replace('/subscription-expired');
            return;
        }
    }
    
    const isCurrentlyOnBlockingRoute = blockingRoutes.includes(pathname);
    if (isPublicRoute && !isCurrentlyOnBlockingRoute) {
      router.replace('/dashboard');
      return;
    }
    
    const isEssentialRoute = essentialRoutes.includes(pathname);
    if (userProfile.forcePasswordChange && !isEssentialRoute) {
        router.replace("/settings");
        return;
    }
    
    const allowedRoutes = routesByRole[userProfile.role] || [];
    const isAllowed = allowedRoutes.some(route => pathname.startsWith(route));
    
    if (!isPublicRoute && !isAllowed && !isEssentialRoute) {
        console.warn(`Redirecting: User with role ${userProfile.role} not allowed to access ${pathname}.`);
        router.replace("/dashboard");
    }

  }, [user, userProfile, organization, loading, pathname, router]);

  const isPublicPage = publicRoutes.some(route => pathname === route) || pathname.startsWith('/o/');

  if (loading && !isPublicPage) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <div className="flex items-center gap-2">
            <Image src="https://dprogramadores.com.co/img/logoD.png" alt="DigitalCenter Logo" width={32} height={32} />
            <span className="text-xl font-semibold">DigitalCenter</span>
        </div>
        <p className="mt-4 text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  const passwordChangeAlert = userProfile?.forcePasswordChange && pathname !== '/settings' ? (
    <Alert variant="destructive" className="mb-4">
      <Terminal className="h-4 w-4" />
      <AlertTitle>Acción Requerida</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>Por seguridad, debe establecer una nueva contraseña.</span>
        <Button asChild variant="secondary" size="sm">
            <Link href="/settings">Ir a Ajustes</Link>
        </Button>
      </AlertDescription>
    </Alert>
  ) : undefined;

  return (
    <AuthContext.Provider value={{ user, userProfile, organization, loading }}>
      <AppContent headerAlert={passwordChangeAlert}>
        {children}
      </AppContent>
    </AuthContext.Provider>
  );
};

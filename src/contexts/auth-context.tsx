// /src/contexts/auth-context.tsx
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import Image from "next/image";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
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
}

export const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null, organization: null });

interface AuthProviderProps {
  children: ReactNode;
}

const publicRoutes = ["/", "/login", "/signup", "/pending-approval", "/cancelled-account", "/subscription-expired"];
const blockingRoutes = ["/pending-approval", "/cancelled-account", "/subscription-expired"];
const essentialRoutes = ["/settings"]; // Routes accessible even when password change is forced

const routesByRole: Record<UserRole, string[]> = {
    'SuperAdmin': ['/dashboard', '/admin', '/customers', '/sales', '/settings', '/hr', '/academics', '/finance', '/inventory', '/reports', '/student-portal', '/communications'],
    'Admin': ['/dashboard', '/customers', '/sales', '/settings', '/hr', '/academics', '/finance', '/inventory', '/reports', '/communications'],
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
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        let profile: UserProfile | null = null;
        if (userDoc.exists()) {
            profile = userDoc.data() as UserProfile;

             if (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL && firebaseUser.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
                if (profile && profile.role !== 'SuperAdmin') {
                  profile.role = 'SuperAdmin';
                  await updateDoc(userDocRef, { role: 'SuperAdmin' });
                }
            }
            
            setUserProfile(profile);

            let orgName = 'N/A';
            if (profile.organizationId) {
                const orgDocRef = doc(db, 'organizations', profile.organizationId);
                const orgDoc = await getDoc(orgDocRef);
                if (orgDoc.exists()) {
                    const orgData = { id: orgDoc.id, ...orgDoc.data() } as Organization;
                    setOrganization(orgData);
                    orgName = orgData.name;
                } else {
                    console.warn(`Organization document ${profile.organizationId} not found.`);
                    setOrganization(null);
                }
            } else {
                setOrganization(null); 
            }

            updateUserPresence(firebaseUser.uid, {
                userName: profile.name,
                role: profile.role,
                organizationId: profile.organizationId || null,
                organizationName: orgName,
            });

        } else {
          console.warn(`User ${firebaseUser.uid} exists in Auth but not in Firestore. Forcing logout.`);
          await signOut(auth);
          setUser(null);
          setUserProfile(null);
          setOrganization(null);
          toast({
            title: "Cuenta no encontrada",
            description: "Tu perfil de usuario ya no existe. Si es un error, contacta a soporte.",
            variant: "destructive",
          });
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setOrganization(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    if (loading) {
        return; 
    }

    const isPublicRoute = publicRoutes.some(route => pathname === route) || pathname.startsWith('/o/');
    const isEssentialRoute = essentialRoutes.includes(pathname);

    if (!user) {
        if (!isPublicRoute) {
            router.replace('/login');
        }
        return;
    }

    if (!userProfile) {
        return;
    }

    // Block access if organization subscription is invalid
    if (organization && userProfile.role !== 'SuperAdmin') {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to beginning of the day

        const subEndDate = new Date(organization.subscriptionEnds);
        const timezoneOffset = subEndDate.getTimezoneOffset() * 60000;
        const adjustedSubEndDate = new Date(subEndDate.getTime() + timezoneOffset);

        const isExpired = adjustedSubEndDate < today;
        const isCancelled = organization.contractStatus === 'Cancelled';

        if ((isExpired || isCancelled) && pathname !== '/subscription-expired') {
            console.warn(`Blocking access for org ${organization.id} due to subscription status: ${organization.contractStatus}, ends: ${organization.subscriptionEnds}`);
            router.replace('/subscription-expired');
            return; // Stop further routing logic
        }
    }
    
    if (userProfile.status === 'cancelled') {
        if (pathname !== '/cancelled-account') {
            router.replace('/cancelled-account');
        }
        return;
    }

    if (userProfile.role === 'EnEspera' || userProfile.role === 'SinAsignar') {
        if (pathname !== '/pending-approval') {
            router.replace('/pending-approval');
        }
        return;
    }

    const isCurrentlyOnBlockingRoute = blockingRoutes.includes(pathname);
    if (isPublicRoute && !isCurrentlyOnBlockingRoute) {
      router.replace('/dashboard');
      return;
    }
    
    if (userProfile.forcePasswordChange && !isEssentialRoute) {
        router.replace("/settings");
        return;
    }
    
    const allowedRoutes = routesByRole[userProfile.role] || [];
    const isAllowed = allowedRoutes.some(route => pathname.startsWith(route));
    
    if (!isCurrentlyOnBlockingRoute && !isAllowed) {
        console.warn(`Redirecting: User with role ${userProfile.role} not allowed to access ${pathname}. Redirecting to /dashboard.`);
        router.replace("/dashboard");
    }

  }, [user, userProfile, organization, loading, pathname, router]);

  const isPublicPage = publicRoutes.some(route => pathname === route) || pathname.startsWith('/o/');

  if (loading || (!user && !isPublicPage)) {
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
    <AuthContext.Provider value={{ user, userProfile, organization }}>
      <AppContent headerAlert={passwordChangeAlert}>
        {children}
      </AppContent>
    </AuthContext.Provider>
  );
};

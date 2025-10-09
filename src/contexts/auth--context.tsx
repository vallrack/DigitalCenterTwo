// /src/contexts/auth-context.tsx
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import Image from "next/image";
import { onAuthStateChanged, User } from "firebase/auth";
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

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
}

export const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null });

interface AuthProviderProps {
  children: ReactNode;
}

const publicRoutes = ["/", "/login", "/signup", "/pending-approval"];
const essentialRoutes = ["/settings"]; // Routes accessible even when password change is forced

const routesByRole: Record<UserRole, string[]> = {
    'SuperAdmin': ['/dashboard', '/admin', '/customers', '/sales', '/settings', '/students', '/hr', '/academics', '/finance', '/inventory', '/reports', '/student-portal', '/communications'],
    'Admin': ['/dashboard', '/customers', '/sales', '/settings', '/students', '/hr', '/academics', '/finance', '/inventory', '/reports', '/communications'],
    'Ventas': ['/dashboard', '/customers', '/sales', '/settings', '/communications'],
    'Academico': ['/dashboard', '/students', '/academics', '/settings'],
    'RRHH': ['/dashboard', '/hr', '/settings'],
    'Finanzas': ['/dashboard', '/finance', '/settings'],
    'Estudiante': ['/dashboard', '/settings', '/student-portal'],
    'Empleado': ['/dashboard', '/settings'],
    'Marketing': ['/dashboard', '/settings', '/communications'],
    'Soporte': ['/dashboard', '/settings'],
    'SinAsignar': ['/pending-approval'],
};


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        let profile: UserProfile | null = null;
        if (userDoc.exists()) {
          profile = userDoc.data() as UserProfile;
        } else {
            profile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                role: 'SinAsignar',
                name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
                avatarUrl: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
                status: 'Active',
            };
            await setDoc(userDocRef, { ...profile, createdAt: serverTimestamp() });
        }

        if (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL && firebaseUser.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
            if (profile && profile.role !== 'SuperAdmin') {
              profile.role = 'SuperAdmin';
              await updateDoc(userDocRef, { role: 'SuperAdmin' });
            }
        }

        setUserProfile(profile);

        if (profile) {
            let orgName = 'N/A';
            if (profile.organizationId) {
                const orgDoc = await getDoc(doc(db, 'organizations', profile.organizationId));
                if (orgDoc.exists()) {
                    orgName = (orgDoc.data() as Organization).name;
                }
            }
            updateUserPresence(firebaseUser.uid, {
                userName: profile.name,
                role: profile.role,
                organizationId: profile.organizationId || null,
                organizationName: orgName,
            });
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) {
        return; // Wait until auth state is confirmed
    }

    const isPublicRoute = publicRoutes.some(route => pathname === route) || pathname.startsWith('/o/');
    const isEssentialRoute = essentialRoutes.includes(pathname);

    // Case 1: No user is logged in
    if (!user) {
        if (!isPublicRoute) {
            router.replace('/login');
        }
        return;
    }

    // Case 2: User is logged in, but profile is not yet loaded
    if (!userProfile) {
        // This can happen briefly. Let the loading screen handle it.
        return;
    }

    // Case 3: User profile is loaded
    if (userProfile.role === 'SinAsignar') {
        if (pathname !== '/pending-approval') {
            router.replace('/pending-approval');
        }
        return;
    }

    if (isPublicRoute) {
      router.replace('/dashboard');
      return;
    }
    
    if (userProfile.forcePasswordChange && !isEssentialRoute) {
        router.replace("/settings");
        return;
    }
    
    const allowedRoutes = routesByRole[userProfile.role] || [];
    const isAllowed = allowedRoutes.some(route => pathname.startsWith(route));
    
    if (!isAllowed) {
        console.warn(`Redirecting: User with role ${userProfile.role} not allowed to access ${pathname}. Redirecting to /dashboard.`);
        router.replace("/dashboard");
    }

  }, [user, userProfile, loading, pathname, router]);

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
    <AuthContext.Provider value={{ user, userProfile }}>
      <AppContent headerAlert={passwordChangeAlert}>
        {children}
      </AppContent>
    </AuthContext.Provider>
  );
};
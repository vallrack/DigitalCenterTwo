
// /src/app/app-content.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import {
  Bell,
  LogOut,
  Search,
  Settings,
  Users,
  Shield,
  MessageSquare,
  LayoutDashboard,
  UserPlus,
  BookOpen,
  DollarSign,
  Archive,
  ShoppingCart,
  AreaChart,
  BarChart,
  UserSquare,
  Mail,
  Leaf,
  HeartPulse,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChatClient } from '@/components/chat-client';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import type { UserRole, Organization } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  requiredModule?: keyof Organization['modules'];
  roles?: UserRole[];
};

const allNavLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/organizations', label: 'Administración', icon: Shield, roles: ['SuperAdmin'] },
  { href: '/customers', label: 'Clientes (CRM)', icon: UserPlus, requiredModule: 'sales', roles: ['Admin', 'Ventas', 'SuperAdmin'] },
  { href: '/student-portal', label: 'Portal Estudiantil', icon: UserSquare, roles: ['Estudiante', 'SuperAdmin'] },
  { href: '/hr', label: 'Recursos Humanos', icon: Users, requiredModule: 'hr', roles: ['Admin', 'RRHH', 'SuperAdmin'] },
  { href: '/academics', label: 'Gestión Académica', icon: BookOpen, requiredModule: 'academics', roles: ['Admin', 'Academico', 'SuperAdmin'] },
  { href: '/finance', label: 'Finanzas', icon: DollarSign, requiredModule: 'finance', roles: ['Admin', 'Finanzas', 'SuperAdmin'] },
  { href: '/inventory', label: 'Inventario', icon: Archive, requiredModule: 'inventory', roles: ['Admin', 'SuperAdmin'] },
  { href: '/sales', label: 'Ventas (POS)', icon: ShoppingCart, requiredModule: 'sales', roles: ['Admin', 'Ventas', 'SuperAdmin'] },
  { href: '/caficultores', label: 'Gestion Caficultores', icon: Leaf },
  { href: '/analysis', label: 'Análisis de Datos', icon: BarChart },
  { href: '/odontology', label: 'Odontología', icon: HeartPulse, requiredModule: 'odontology', roles: ['Admin', 'SuperAdmin'] },
  { href: '/communications', label: 'Comunicaciones', icon: Mail, requiredModule: 'communications', roles: ['Admin', 'Ventas', 'Marketing', 'SuperAdmin'] },
  { href: '/reports', label: 'Reportes', icon: AreaChart, requiredModule: 'reports', roles: ['Admin', 'Finanzas', 'SuperAdmin'] },
];

function MainContent({ children, headerAlert }: { children: React.ReactNode, headerAlert?: React.ReactNode }) {
  const { user, userProfile, organization } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile, setOpen, state } = useSidebar();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const collapsed = state === 'collapsed';

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };
  
  const handleLinkClick = () => {
    setOpenMobile(false);
  }

  const isPublicPage = ['/', '/login', '/signup', '/pending-approval'].includes(pathname) || pathname.startsWith('/o/');

  if (!user || !userProfile || isPublicPage) {
    return <>{children}</>;
  }
  
  const getVisibleNavLinks = () => {
    const userRole = userProfile.role;
    if (userRole === 'SuperAdmin') {
        return allNavLinks;
    }

    return allNavLinks.filter(link => {
        const hasRolePermission = !link.roles || link.roles.includes(userRole);
        const hasModulePermission = !link.requiredModule || (organization?.modules && organization.modules[link.requiredModule]);
        return hasRolePermission && hasModulePermission;
    });
  }
  
  const userNavLinks = getVisibleNavLinks();
  
  return (
    <>
       <Sidebar collapsible="icon" className="bg-[hsl(var(--sidebar-background))]">
        <SidebarHeader>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-0 top-3 translate-x-1/2 rounded-full text-foreground/50 hover:text-foreground",
              !collapsed && "hidden"
            )}
            onClick={() => setOpen(true)}
          >
            <PanelLeftOpen />
            <span className="sr-only">Expandir</span>
          </Button>
          <div
            className={cn(
              "flex h-14 items-center overflow-hidden p-2 px-4 transition-all",
              collapsed && "p-2"
            )}
          >
            <Logo isCollapsed={collapsed} />
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "-mr-2 shrink-0 rounded-full text-foreground/50 hover:text-foreground",
                collapsed && "hidden"
              )}
              onClick={() => setOpen(false)}
            >
              <PanelLeftClose />
              <span className="sr-only">Contraer</span>
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {userNavLinks.map(({ href, label, icon: Icon }) => (
                 <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={{ children: label }}
                      isActive={pathname.startsWith(href) && (href !== '/dashboard' || pathname === '/dashboard')}
                      className={cn(
                        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
                        collapsed && "justify-center"
                      )}
                      onClick={handleLinkClick}
                    >
                      <Link href={href}>
                        <Icon />
                        <span className={cn("whitespace-nowrap", collapsed && "sr-only")}>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setIsChatOpen(true)}
                    tooltip={{ children: "Chat" }}
                    className={cn(
                        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
                        collapsed && "justify-center"
                    )}
                  >
                    <MessageSquare />
                    <span className={cn("whitespace-nowrap", collapsed && "sr-only")}>Chat</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className={cn(
                    "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
                    collapsed && "justify-center"
                  )}
                  tooltip={{ children: "Cerrar sesión" }}
                >
                  <LogOut />
                  <span className={cn("whitespace-nowrap", collapsed && "sr-only")}>Cerrar Sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificaciones</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={userProfile?.avatarUrl || "https://picsum.photos/seed/user-avatar/100/100"}
                    alt="Avatar de usuario"
                  />
                  <AvatarFallback>
                    {user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userProfile?.name || "Usuario"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2" />
                    <span>Ajustes</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/50">
          {headerAlert}
          {children}
        </main>
      </SidebarInset>
      
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
          <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b">
                  <SheetTitle>Chat</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-hidden">
                <ChatClient />
              </div>
          </SheetContent>
      </Sheet>
    </>
  )
}

export function AppContent({
  children,
  headerAlert,
}: {
  children: React.ReactNode;
  headerAlert?: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPrinting = searchParams.get('print') === 'true';

  const isPublicPage = ['/', '/login', '/signup', '/pending-approval'].includes(pathname) || pathname.startsWith('/o/');
  
  if (isPublicPage || isPrinting) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <MainContent headerAlert={headerAlert}>{children}</MainContent>
    </SidebarProvider>
  );
}

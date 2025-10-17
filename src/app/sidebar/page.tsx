// /src/app/sidebar/page.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import {
  BarChart, // Importar el nuevo ícono
  Bell,
  BookOpen,
  ChevronDown,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  Leaf,
  LogOut,
  Search,
  Settings,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// You can find all the icons here: https://lucide.dev/
const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Estudiantes", icon: GraduationCap },
  { href: "/hr", label: "Recursos Humanos", icon: Users },
  { href: "/academics", label: "Gestión Académica", icon: BookOpen },
  { href: "/finance", label: "Finanzas", icon: DollarSign },
  { href: "/caficultores", label: "Gestion Caficultores", icon: Leaf },
  { href: "/analysis", label: "Análisis de Datos", icon: BarChart }, // Corregido
]

export default function SidebarPage() {
  const [openSubmenus, setOpenSubmenus] = React.useState<Record<string, boolean>>({})

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex h-14 items-center gap-2 p-2 px-4">
            {/* You can add a logo here. */}
            <span className="text-xl font-semibold text-sidebar-foreground">
              DigitalCenter
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {navLinks.map((link) =>
                link.subItems ? (
                  <SidebarMenuItem key={link.id} className="flex flex-col">
                    <SidebarMenuButton
                      onClick={() => toggleSubmenu(link.id)}
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <link.icon />
                        <span>{link.label}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "transition-transform",
                          openSubmenus[link.id] && "rotate-180"
                        )}
                      />
                    </SidebarMenuButton>
                    {openSubmenus[link.id] && (
                      <SidebarMenuSub>
                        {link.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.href}>
                             <Link href={subItem.href} passHref legacyBehavior>
                                <SidebarMenuSubButton>
                                    {subItem.label}
                                </SidebarMenuSubButton>
                            </Link>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ) : (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={{ children: link.label }}
                      className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <Link href={link.href}>
                        <link.icon />
                        {link.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{ children: "Logout" }}
              className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
            >
              <LogOut />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="https://picsum.photos/seed/user-avatar/100/100"
                    alt="User avatar"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Usuario</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    usuario@ejemplo.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Settings className="mr-2" />
                  <span>Ajustes</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6"></main>
      </SidebarInset>
    </SidebarProvider>
  )
}

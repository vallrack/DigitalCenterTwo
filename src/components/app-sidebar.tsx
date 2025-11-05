
// /src/components/app-sidebar.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import {
  BarChart,
  BookOpen,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  Leaf,
  LogOut,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Logo } from "./logo"

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Estudiantes", icon: GraduationCap },
  { href: "/hr", label: "Recursos Humanos", icon: Users },
  { href: "/academics", label: "Gestión Académica", icon: BookOpen },
  { href: "/finance", label: "Finanzas", icon: DollarSign },
  { href: "/caficultores", label: "Gestion Caficultores", icon: Leaf },
  { href: "/analysis", label: "Análisis de Datos", icon: BarChart },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-14 items-center justify-center p-2 px-4">
          <Logo />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navLinks.map((link) => (
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
            ))}
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
  );
}

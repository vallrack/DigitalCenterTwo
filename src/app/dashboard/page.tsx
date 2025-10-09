// /src/app/dashboard/page.tsx
"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Building,
  GraduationCap,
  Briefcase,
  DollarSign,
  Archive,
  MessageSquare,
  BarChart2,
  Mail,
  UserPlus,
} from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { format, getMonth } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import type { Organization, Product, Sale, ChatRoom } from '@/lib/types';
import { cn } from '@/lib/utils';

// Import all necessary services
import { getCustomers } from '@/services/customer-service';
import { getOrganizations } from '@/services/organization-service';
import { getStudents } from '@/services/student-service';
import { getEmployees } from '@/services/employee-service';
import { getSales } from '@/services/sales-service';
import { getProducts } from '@/services/inventory-service';
import { ChatClient } from '@/components/chat-client';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { getChatRoomsForUser } from '@/services/chat-service';


const StatCard = ({ title, value, icon: Icon, description, isLoading, className }: { title: string, value: string | number, icon?: React.ElementType, description: string, isLoading: boolean, className?: string }) => (
    <Card className={cn("hover:border-primary transition-colors", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium uppercase">{title}</CardTitle>
        {Icon && <div className="p-2 bg-secondary rounded-full">
            <Icon className="h-5 w-5 text-secondary-foreground" />
        </div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
           <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
        ) : (
          <>
            <div className="text-3xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
);

interface StatCardData {
    id: string;
    title: string;
    value: string | number;
    icon: React.ElementType;
    description: string;
    href: string;
    requiredModule?: keyof Organization['modules'];
}

export default function DashboardPage() {
  const { userProfile, organization } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [supportRooms, setSupportRooms] = useState<ChatRoom[]>([]);
  
  const isSuperAdmin = userProfile?.role === 'SuperAdmin';

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userProfile) return;
      
      setLoading(true);
      try {
          const promises = [
            getCustomers(userProfile),
            getStudents(userProfile),
            getEmployees(userProfile),
            getSales(),
            getProducts(),
          ];
          
          if (isSuperAdmin) {
              promises.push(getOrganizations());
              promises.push(getChatRoomsForUser(userProfile));
          } else {
              promises.push(Promise.resolve([])); // Placeholder for organizations
              promises.push(Promise.resolve([])); // Placeholder for chat rooms
          }

          const [
            customers,
            students,
            employees,
            salesData,
            products,
            organizations,
            chatRooms,
          ] = await Promise.all(promises);
          
          setSales(salesData);

          const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0);
          const inventoryValue = products.reduce((sum: number, product: Product) => {
              const totalStock = Object.values(product.stockLevels || {}).reduce((stockSum, qty) => stockSum + qty, 0);
              return sum + (totalStock * product.costPrice);
          }, 0);

          setStats({
              customerCount: customers.length,
              studentCount: students.length,
              employeeCount: employees.length,
              totalRevenue: totalRevenue.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }),
              inventoryValue: inventoryValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }),
              organizationCount: organizations.length,
              productCount: products.length,
          });

          if (isSuperAdmin) {
            setSupportRooms(chatRooms.filter((room: ChatRoom) => room.type === 'support'));
          }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) {
        fetchDashboardData();
    }
  }, [userProfile, isSuperAdmin]);
  
  const monthlySales = useMemo(() => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: format(new Date(0, i), 'MMM', { locale: es }),
      total: 0,
    }));

    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      if (saleDate.getFullYear() === new Date().getFullYear()) {
        const month = getMonth(saleDate);
        monthlyData[month].total += sale.total;
      }
    });

    return monthlyData;
  }, [sales]);

  const allStatCards: StatCardData[] = [
    { id: 'orgs', title: "Total Clientes (Orgs)", value: stats.organizationCount || 0, icon: Building, description: "Organizaciones activas", href: "/admin/organizations" },
    { id: 'crm', title: "Clientes (CRM)", value: stats.customerCount || 0, icon: UserPlus, description: "Clientes y prospectos registrados", href: "/customers", requiredModule: 'sales' },
    { id: 'students', title: "Estudiantes", value: stats.studentCount || 0, icon: GraduationCap, description: "Estudiantes activos registrados", href: "/academics", requiredModule: 'academics' },
    { id: 'employees', title: "Empleados", value: stats.employeeCount || 0, icon: Briefcase, description: "Personal activo en la organización", href: "/hr", requiredModule: 'hr' },
    { id: 'products', title: "Productos y Servicios", value: stats.productCount || 0, icon: Archive, description: "Productos y servicios registrados", href: "/inventory", requiredModule: 'inventory' },
    { id: 'sales', title: "Ingresos por Ventas", value: `${stats.totalRevenue || '$0'}`, icon: DollarSign, description: "Total de ingresos generados", href: "/sales", requiredModule: 'sales' },
    { id: 'inventory', title: "Valor del Inventario", value: `${stats.inventoryValue || '$0'}`, icon: Archive, description: "Costo total del stock actual", href: "/inventory", requiredModule: 'inventory' },
    { id: 'communications', title: "Comunicaciones", value: 0, icon: Mail, description: "Campañas y plantillas activas", href: "/communications", requiredModule: 'communications' },
  ];

  const visibleStatCards = useMemo(() => {
    if (!userProfile) return [];
    
    if (isSuperAdmin) {
      return allStatCards;
    }

    if (!organization) return [];
    
    return allStatCards.filter(card => {
        // SuperAdmin cards (like 'orgs') should not be shown to other users
        if (card.href.startsWith('/admin')) {
            return false;
        }
        return !card.requiredModule || (organization.modules && organization.modules[card.requiredModule]);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, organization, userProfile, stats]);
  
  const showSalesContent = isSuperAdmin || organization?.modules?.sales;


  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {visibleStatCards.map(card => (
            <Link href={card.href} key={card.id}>
                 <StatCard 
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    description={card.description}
                    isLoading={loading}
                />
            </Link>
        ))}
      </div>
      
      <div className="grid gap-4 grid-cols-1">
        {showSalesContent && (
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <BarChart2 />
                Ingresos por Ventas Mensuales (Año Actual)
                </CardTitle>
                <CardDescription>
                Un resumen de los ingresos totales generados cada mes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                <div className="h-[350px] w-full animate-pulse rounded-md bg-muted" />
                ) : (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={monthlySales}>
                    <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${(value as number / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--secondary))' }}
                        content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Mes
                                    </span>
                                    <span className="font-bold text-muted-foreground">
                                    {payload[0].payload.name}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Ingresos
                                    </span>
                                    <span className="font-bold">
                                    {(payload[0].value as number).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                                    </span>
                                </div>
                                </div>
                            </div>
                            )
                        }
                        return null
                        }}
                    />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                )}
            </CardContent>
            </Card>
        )}
      </div>

       {isSuperAdmin && (
         <Card>
            <CardHeader>
                <CardTitle>Salas de Chat de Soporte</CardTitle>
                <CardDescription>Conversaciones activas de visitantes y clientes que requieren atención.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? <p>Cargando chats...</p> : 
                 supportRooms.length === 0 ? <p>No hay salas de soporte activas.</p> :
                (
                  <div className="space-y-2">
                    {supportRooms.map(room => (
                      <div key={room.id} className="flex items-center justify-between p-2 rounded-md border">
                        <div>
                          <p className="font-semibold">{room.name}</p>
                          <p className="text-xs text-muted-foreground">{room.lastMessage?.text || 'Sin mensajes recientes'}</p>
                        </div>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Abrir Chat
                            </Button>
                          </SheetTrigger>
                           <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col">
                              <ChatClient />
                          </SheetContent>
                        </Sheet>
                      </div>
                    ))}
                  </div>
                )}
            </CardContent>
         </Card>
      )}
    </>
  );
}

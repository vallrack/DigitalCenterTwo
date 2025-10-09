// /src/app/hr/page.tsx
"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { EmployeesClient } from './employees-client';
import { PayrollClient } from './payroll-client';
import { AttendanceClient } from './attendance-client';


export default function HRPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Recursos Humanos</h1>
      </div>
      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">Expedientes de Empleados</TabsTrigger>
          <TabsTrigger value="payroll">Nómina</TabsTrigger>
          <TabsTrigger value="attendance">Asistencia</TabsTrigger>
        </TabsList>
        <TabsContent value="employees">
          <EmployeesClient />
        </TabsContent>
        <TabsContent value="payroll">
          <PayrollClient />
        </TabsContent>
        <TabsContent value="attendance">
          <AttendanceClient />
        </TabsContent>
      </Tabs>
    </>
  );
}

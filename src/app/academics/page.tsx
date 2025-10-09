// /src/app/academics/page.tsx
"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { LessonPlansClient } from './lesson-plans-client';
import { VirtualClassesClient } from './virtual-classes-client';
import { SubjectsClient } from './subjects-client';
import { GradesClient } from './grades-client';
import { ScheduleClient } from './schedule-client';
import { AcademicSettingsClient } from './academic-settings-client';
import { AttendanceClient } from './attendance-client';
import { StudentsListClient } from './students-list-client';


export default function AcademicsPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Gestión Académica</h1>
      </div>
      <Tabs defaultValue="students">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="students">Listado de Estudiantes</TabsTrigger>
          <TabsTrigger value="lesson-plans">Planes de Lección</TabsTrigger>
          <TabsTrigger value="subjects">Materias</TabsTrigger>
          <TabsTrigger value="schedule">Horarios</TabsTrigger>
          <TabsTrigger value="attendance">Asistencia (QR)</TabsTrigger>
          <TabsTrigger value="grades">Calificaciones</TabsTrigger>
          <TabsTrigger value="virtual-classes">Clases Virtuales</TabsTrigger>
          <TabsTrigger value="settings">Parametrizaciones</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
            <StudentsListClient />
        </TabsContent>
        <TabsContent value="lesson-plans">
            <LessonPlansClient />
        </TabsContent>
         <TabsContent value="subjects">
            <SubjectsClient />
        </TabsContent>
        <TabsContent value="schedule">
            <ScheduleClient />
        </TabsContent>
         <TabsContent value="attendance">
            <AttendanceClient />
        </TabsContent>
        <TabsContent value="grades">
            <GradesClient />
        </TabsContent>
        <TabsContent value="virtual-classes">
            <VirtualClassesClient />
        </TabsContent>
        <TabsContent value="settings">
            <AcademicSettingsClient />
        </TabsContent>
      </Tabs>
    </>
  );
}

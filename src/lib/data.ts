import type {
  Employee,
  Payroll,
  Attendance,
  LessonPlan,
  Invoice,
  VideoRecording,
} from '@/lib/types';

export const employees: Employee[] = [
  {
    id: 'EMP001',
    name: 'Ana García',
    email: 'ana.garcia@example.com',
    role: 'Academic',
    status: 'Active',
    avatarUrl: 'https://picsum.photos/seed/avatar1/100/100',
  },
  {
    id: 'EMP002',
    name: 'Luis Hernández',
    email: 'luis.hernandez@example.com',
    role: 'Academic',
    status: 'Active',
    avatarUrl: 'https://picsum.photos/seed/avatar2/100/100',
  },
  {
    id: 'EMP003',
    name: 'Carla Rodriguez',
    email: 'carla.rodriguez@example.com',
    role: 'Admin',
    status: 'Active',
    avatarUrl: 'https://picsum.photos/seed/avatar3/100/100',
  },
  {
    id: 'EMP004',
    name: 'Jorge Martinez',
    email: 'jorge.martinez@example.com',
    role: 'Finance',
    status: 'Inactive',
    avatarUrl: 'https://picsum.photos/seed/avatar4/100/100',
  },
];


export const lessonPlans: LessonPlan[] = [
  {
    id: 'LP001',
    title: 'Introducción a las Ecuaciones',
    subject: 'Matemáticas',
    teacher: 'Ana García',
    date: '2024-05-21',
    objectives: [
      'Entender el concepto de variable.',
      'Resolver ecuaciones lineales simples.',
    ],
  },
  {
    id: 'LP002',
    title: 'El Ciclo del Agua',
    subject: 'Ciencias',
    teacher: 'Luis Hernández',
    date: '2024-05-22',
    objectives: [
      'Identificar las fases del ciclo del agua.',
      'Explicar la importancia del agua para la vida.',
    ],
  },
];

export const videoRecordings: VideoRecording[] = [
  {
    id: 'VID001',
    title: 'Clase de Álgebra',
    subject: 'Matemáticas',
    date: '2024-05-15',
    url: 'https://www.youtube.com/watch?v=example1',
    summary:
      'Resumen inicial de la clase de Álgebra. Se cubrieron temas como variables, constantes y operaciones básicas. Los estudiantes participaron activamente en la resolución de ejercicios prácticos.',
  },
  {
    id: 'VID002',
    title: 'Laboratorio de Biología',
    subject: 'Ciencias',
    date: '2024-05-16',
    url: 'https://www.youtube.com/watch?v=example2',
  },
];

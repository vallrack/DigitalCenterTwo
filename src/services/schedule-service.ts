// /src/services/schedule-service.ts
import {
  collection,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
  query,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Schedule } from '@/lib/types';
import { eachDayOfInterval, format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

const schedulesCollection = collection(db, 'schedules');

type ScheduleInput = Omit<Schedule, 'id' | 'dayOfWeek'> & {
    startDate: Date;
    endDate: Date;
    repeatDays: string[];
};

// CREATE
export const addScheduleEntry = async (entryData: ScheduleInput) => {
  const batch = writeBatch(db);
  
  const interval = eachDayOfInterval({
    start: entryData.startDate,
    end: entryData.endDate,
  });

  const dayMapping: { [key: string]: number } = {
    'Domingo': 0,
    'Lunes': 1,
    'Martes': 2,
    'Miércoles': 3,
    'Jueves': 4,
    'Viernes': 5,
    'Sábado': 6,
  };

  const selectedDayNumbers = entryData.repeatDays.map(day => dayMapping[day]);

  interval.forEach(day => {
    if (selectedDayNumbers.includes(day.getDay())) {
        const dayOfWeek = format(day, 'EEEE', { locale: es });
        const newScheduleRef = doc(schedulesCollection);
        batch.set(newScheduleRef, {
            subjectId: entryData.subjectId,
            subjectName: entryData.subjectName,
            teacherId: entryData.teacherId,
            teacherName: entryData.teacherName,
            dayOfWeek: dayOfWeek,
            startTime: entryData.startTime,
            endTime: entryData.endTime,
            classroom: entryData.classroom,
            modality: entryData.modality,
            date: format(day, 'yyyy-MM-dd'),
            organizationId: entryData.organizationId,
            createdAt: serverTimestamp(),
        });
    }
  });

  try {
    await batch.commit();
  } catch (error) {
    console.error('Error adding schedule entries: ', error);
    throw error;
  }
};

// READ
export const getSchedules = async (): Promise<Schedule[]> => {
  try {
    const q = query(schedulesCollection);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Schedule, 'id'>),
    }));
  } catch (error) {
    console.error('Error getting schedules: ', error);
    throw error;
  }
};

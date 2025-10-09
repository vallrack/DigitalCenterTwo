// /src/services/attendance-service.ts
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Attendance } from '@/lib/types';
import { format } from 'date-fns';

const attendanceCollection = collection(db, 'attendance');

// READ all attendance records
export const getAttendanceRecords = async (): Promise<Attendance[]> => {
  try {
    const q = query(attendanceCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Attendance, 'id'>),
    }));
  } catch (error) {
    console.error('Error getting attendance records: ', error);
    throw error;
  }
};

// CREATE or UPDATE attendance record
export const recordAttendance = async (employeeId: string, employeeName: string, organizationId: string) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const nowStr = format(new Date(), 'HH:mm');

  const q = query(
    attendanceCollection,
    where('employeeId', '==', employeeId),
    where('date', '==', todayStr)
  );

  try {
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // No record for today, create a new one (Check-in)
      const newRecord: Omit<Attendance, 'id'> = {
        employeeId,
        employeeName,
        date: todayStr,
        checkIn: nowStr,
        checkOut: null,
        status: 'Presente',
        organizationId,
      };
      await addDoc(attendanceCollection, { ...newRecord, createdAt: serverTimestamp() });
      return { type: 'check-in', time: nowStr, name: employeeName };
    } else {
      // Record exists, update it (Check-out)
      const recordDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'attendance', recordDoc.id), {
        checkOut: nowStr,
        status: 'Jornada Finalizada',
        updatedAt: serverTimestamp(),
      });
      return { type: 'check-out', time: nowStr, name: employeeName };
    }
  } catch (error) {
    console.error('Error recording attendance: ', error);
    throw error;
  }
};

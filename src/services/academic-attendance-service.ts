// /src/services/academic-attendance-service.ts
import {
  collection,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AcademicAttendance } from '@/lib/types';
import { format } from 'date-fns';

const academicAttendanceCollection = collection(db, 'academicAttendance');

// CREATE or UPDATE attendance record for a student in a class
export const recordStudentAttendance = async (attendanceData: Omit<AcademicAttendance, 'id' | 'checkInTime' | 'status'>) => {
  const { studentId, subjectId, date, organizationId } = attendanceData;
  
  const q = query(
    academicAttendanceCollection,
    where('studentId', '==', studentId),
    where('subjectId', '==', subjectId),
    where('date', '==', date)
  );

  try {
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // No record for this class today, create a new one (Check-in)
      const newRecord: Omit<AcademicAttendance, 'id'> = {
        ...attendanceData,
        checkInTime: format(new Date(), 'HH:mm'),
        status: 'Presente',
        organizationId,
      };
      await addDoc(academicAttendanceCollection, { ...newRecord, createdAt: serverTimestamp() });
      return newRecord;
    } else {
      // Record already exists, do not create a new one.
      console.log(`Attendance for student ${studentId} in subject ${subjectId} on ${date} already exists.`);
      return snapshot.docs[0].data() as AcademicAttendance;
    }
  } catch (error) {
    console.error('Error recording student attendance: ', error);
    throw error;
  }
};


// READ attendance records for a specific class (subject + date)
export const getAttendanceForClass = async (subjectId: string, date: string): Promise<AcademicAttendance[]> => {
  try {
    const q = query(
        academicAttendanceCollection, 
        where('subjectId', '==', subjectId),
        where('date', '==', date)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<AcademicAttendance, 'id'>),
    }));
  } catch (error) {
    console.error('Error getting attendance for class: ', error);
    throw error;
  }
};

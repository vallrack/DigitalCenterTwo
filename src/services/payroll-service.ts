// /src/services/payroll-service.ts
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
  writeBatch,
  arrayUnion,
  arrayRemove,
  getDocsFromCache,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Payroll, Employee, UserProfile, PayrollNovelty, Attendance } from '@/lib/types';
import { getEmployees } from './employee-service';
import { format, parse, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';

const payrollsCollection = collection(db, 'payrolls');

// CREATE
export const addPayroll = async (payrollData: Omit<Payroll, 'id'>) => {
  try {
    const docRef = await addDoc(payrollsCollection, {
      ...payrollData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding payroll: ', error);
    throw error;
  }
};

// READ
export const getPayrolls = async (userProfile: UserProfile | null): Promise<Payroll[]> => {
    if (!userProfile) return [];
  try {
    let q;
    if (userProfile.role === 'SuperAdmin') {
        q = query(payrollsCollection, orderBy('period', 'desc'));
    } else if (userProfile.organizationId) {
        // Query only by organizationId to avoid composite index. Sorting will be done client-side.
        q = query(payrollsCollection, where('organizationId', '==', userProfile.organizationId));
    } else {
        return [];
    }
    
    const snapshot = await getDocs(q);
    const payrollList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Payroll, 'id'>),
    }));

    // For non-superadmin, sort client-side
    if (userProfile.role !== 'SuperAdmin') {
      payrollList.sort((a, b) => b.period.localeCompare(a.period));
    }
    
    return payrollList;

  } catch (error) {
    console.error('Error getting payrolls: ', error);
    throw error;
  }
};

// UPDATE (e.g., to mark as paid or add novelties)
export const updatePayroll = async (
  id: string,
  updates: Partial<Omit<Payroll, 'id'>>
) => {
  try {
    const payrollDoc = doc(db, 'payrolls', id);
    await updateDoc(payrollDoc, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating payroll: ', error);
    throw error;
  }
};

const recalculatePayrollTotals = (payroll: Payroll): Partial<Payroll> => {
    const totalBonuses = payroll.bonuses.reduce((sum, n) => sum + n.amount, 0);
    const totalManualDeductions = payroll.deductions.reduce((sum, n) => sum + n.amount, 0);
    const totalLegalDeductions = payroll.legalDeductions.reduce((sum, d) => sum + d.amount, 0);
    const netPay = payroll.baseSalary + totalBonuses - totalManualDeductions - totalLegalDeductions;
    return { totalBonuses, totalDeductions: totalManualDeductions, netPay };
};

export const addNoveltyToPayroll = async (payrollId: string, novelty: PayrollNovelty) => {
    const payrollRef = doc(db, 'payrolls', payrollId);
    const payrollSnap = await getDoc(payrollRef);
    if (!payrollSnap.exists()) throw new Error("Payroll not found.");

    const payrollData = { id: payrollSnap.id, ...payrollSnap.data() } as Payroll;
    const key = novelty.type === 'bonus' ? 'bonuses' : 'deductions';
    
    payrollData[key].push(novelty);
    const newTotals = recalculatePayrollTotals(payrollData);

    await updateDoc(payrollRef, {
        [key]: arrayUnion(novelty),
        ...newTotals,
    });
};

export const removeNoveltyFromPayroll = async (payrollId: string, noveltyId: string) => {
    const payrollRef = doc(db, 'payrolls', payrollId);
    const payrollSnap = await getDoc(payrollRef);
    if (!payrollSnap.exists()) throw new Error("Payroll not found.");

    const payrollData = { id: payrollSnap.id, ...payrollSnap.data() } as Payroll;
    const bonusToRemove = payrollData.bonuses.find(n => n.id === noveltyId);
    const deductionToRemove = payrollData.deductions.find(n => n.id === noveltyId);

    if (bonusToRemove) {
        payrollData.bonuses = payrollData.bonuses.filter(n => n.id !== noveltyId);
        const newTotals = recalculatePayrollTotals(payrollData);
        await updateDoc(payrollRef, { bonuses: arrayRemove(bonusToRemove), ...newTotals });
    } else if (deductionToRemove) {
        payrollData.deductions = payrollData.deductions.filter(n => n.id !== noveltyId);
        const newTotals = recalculatePayrollTotals(payrollData);
        await updateDoc(payrollRef, { deductions: arrayRemove(deductionToRemove), ...newTotals });
    }
};


// GENERATE payrolls for a given period
export const generatePayrollsForPeriod = async (startDate: Date, endDate: Date, userProfile: UserProfile): Promise<void> => {
    if (!userProfile?.organizationId) {
        throw new Error("El usuario no pertenece a una organización para generar la nómina.");
    }
    
    const organizationId = userProfile.organizationId;
    const period = `${format(startDate, 'yyyy-MM-dd')} a ${format(endDate, 'yyyy-MM-dd')}`;
    
    // 1. Check if payroll for this period already exists for the specific organization
    const existingQuery = query(
        payrollsCollection, 
        where("organizationId", "==", organizationId)
    );
    const existingSnapshot = await getDocs(existingQuery);
    const alreadyExists = existingSnapshot.docs.some(doc => doc.data().period === period);

    if (alreadyExists) {
        throw new Error(`La nómina para el periodo ${period} ya ha sido generada.`);
    }

    // 2. Get all employees the current user can see.
    const allVisibleEmployees = await getEmployees(userProfile);
    
    // 3. Filter for employees who are 'Active' AND belong to the target organization.
    const activeEmployees = allVisibleEmployees.filter(e => 
        e.status === 'Active' && e.organizationId === organizationId
    );
    
    if (activeEmployees.length === 0) {
        throw new Error("No hay empleados activos en esta organización para generar la nómina.");
    }

    const batch = writeBatch(db);

    for (const employee of activeEmployees) {
        // Calculate worked hours for this specific employee
        const attendanceQuery = query(collection(db, 'attendance'),
            where('employeeId', '==', employee.id),
            where('date', '>=', format(startDate, 'yyyy-MM-dd')),
            where('date', '<=', format(endDate, 'yyyy-MM-dd'))
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const attendanceRecords = attendanceSnapshot.docs.map(d => d.data() as Attendance);

        const workedHours = attendanceRecords
            .filter(r => r.checkIn && r.checkOut)
            .reduce((total, record) => {
                const checkInTime = parse(`${record.date} ${record.checkIn}`, 'yyyy-MM-dd HH:mm', new Date());
                const checkOutTime = parse(`${record.date} ${record.checkOut}`, 'yyyy-MM-dd HH:mm', new Date());
                if (!isNaN(checkInTime.getTime()) && !isNaN(checkOutTime.getTime())) {
                    return total + differenceInHours(checkOutTime, checkInTime);
                }
                return total;
            }, 0);
        
        const baseSalary = employee.salary || 0;
        const contractedHours = employee.contractedHours || 160;

        const healthDeduction: PayrollNovelty = { id: 'legal_health', description: 'Aporte Salud (4%)', amount: baseSalary * 0.04, type: 'deduction' };
        const pensionDeduction: PayrollNovelty = { id: 'legal_pension', description: 'Aporte Pensión (4%)', amount: baseSalary * 0.04, type: 'deduction' };
        
        const legalDeductions = [healthDeduction, pensionDeduction];
        const totalLegalDeductions = legalDeductions.reduce((sum, d) => sum + d.amount, 0);
        
        const netPay = baseSalary - totalLegalDeductions;

        const newPayroll: Omit<Payroll, 'id'> = {
            employeeId: employee.id,
            employeeName: employee.name,
            period,
            baseSalary,
            workedHours,
            contractedHours,
            deductions: [],
            bonuses: [],
            legalDeductions,
            totalDeductions: 0,
            totalBonuses: 0,
            netPay,
            status: 'Pending',
            organizationId,
        };
        
        const docRef = doc(payrollsCollection);
        batch.set(docRef, { ...newPayroll, createdAt: serverTimestamp() });
    }
    
    await batch.commit();
};

// /src/services/accounting-service.ts
import {
  collection,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
  writeBatch,
  increment,
  getDoc,
  updateDoc,
  deleteDoc,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Account, JournalEntry, Sale, UserProfile } from '@/lib/types';
import { pucData } from '@/lib/puc-data';
import { getSystemSettings } from './settings-service';
import { auth } from '@/lib/firebase';

const accountsCollection = collection(db, 'accounts');
const journalEntriesCollection = collection(db, 'journalEntries');

// Initialize Chart of Accounts
export const initializeChartOfAccounts = async (organizationId: string) => {
  const accountsQuery = query(accountsCollection, where("organizationId", "==", organizationId), limit(1));
  const accountsSnapshot = await getDocs(accountsQuery);
  if (!accountsSnapshot.empty) {
    console.log(`Chart of accounts for org ${organizationId} already initialized.`);
    return;
  }

  const batch = writeBatch(db);
  const { general } = pucData.sectores;

  general.clases.forEach(clase => {
    // Create parent class account
    const classDocRef = doc(accountsCollection);
    batch.set(classDocRef, {
      code: clase.clase_numero,
      name: clase.nombre,
      type: clase.type,
      isParent: true,
      balance: 0,
      organizationId: organizationId,
    });

    clase.grupos.forEach(grupo => {
      // Create child group account
      const groupDocRef = doc(accountsCollection);
      batch.set(groupDocRef, {
        code: `${clase.clase_numero}${grupo.numero}`,
        name: grupo.nombre,
        type: clase.type,
        isParent: false,
        parentCode: clase.clase_numero,
        balance: 0,
        organizationId: organizationId,
      });
    });
  });

  try {
    await batch.commit();
    console.log(`Chart of accounts for org ${organizationId} initialized successfully.`);
  } catch (error) {
    console.error("Error initializing chart of accounts: ", error);
    throw error;
  }
};


// READ all accounts (scoped to an organization)
export const getAccounts = async (): Promise<Account[]> => {
    const user = auth.currentUser;
    if (!user) return [];
    
    const userProfileDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userProfileDoc.exists()) return [];

    const userProfile = userProfileDoc.data() as UserProfile;
    const organizationId = userProfile.organizationId;
    
    if (!organizationId) return [];

  try {
    const q = query(accountsCollection, where("organizationId", "==", organizationId));
    const snapshot = await getDocs(q);

    const accounts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Account, 'id'>),
    }));

    // If no accounts exist for the org, initialize them
    if (accounts.length === 0) {
      await initializeChartOfAccounts(organizationId);
      const newSnapshot = await getDocs(q); // Re-fetch after initialization
      const newAccounts = newSnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Account, 'id'>),
      }));
      return newAccounts.sort((a, b) => a.code.localeCompare(b.code));
    }
    
    return accounts.sort((a, b) => a.code.localeCompare(b.code));

  } catch (error) {
    console.error('Error getting accounts: ', error);
    throw error;
  }
};

// CREATE a new Account
export const addAccount = async (accountData: Omit<Account, 'id' | 'organizationId' | 'balance'>) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated.");
  const userProfileDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userProfileDoc.exists()) throw new Error("User profile not found.");
  const organizationId = (userProfileDoc.data() as UserProfile).organizationId;
  if (!organizationId) throw new Error("Organization not found for current user.");
  
  try {
    await addDoc(accountsCollection, {
      ...accountData,
      organizationId,
      balance: 0,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding account:', error);
    throw error;
  }
}

// UPDATE an Account
export const updateAccount = async (id: string, updates: Partial<Account>) => {
  try {
    const accountDoc = doc(db, 'accounts', id);
    await updateDoc(accountDoc, { ...updates, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
}

// DELETE an Account
export const deleteAccount = async (id: string) => {
  const accountDoc = doc(db, 'accounts', id);
  const accountSnap = await getDoc(accountDoc);
  if (!accountSnap.exists()) throw new Error("Account not found.");
  
  const accountData = accountSnap.data() as Account;
  if (accountData.balance !== 0) {
    throw new Error("No se puede eliminar una cuenta con saldo. Realice los ajustes necesarios.");
  }
  if (accountData.isParent) {
    throw new Error("No se pueden eliminar cuentas de clase superior.");
  }

  try {
    await deleteDoc(accountDoc);
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}


// CREATE a Journal Entry
export const addJournalEntry = async (entryData: Omit<JournalEntry, 'id'>) => {
  const batch = writeBatch(db);
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated.");
  const userProfileDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userProfileDoc.exists()) throw new Error("User profile not found.");
  const organizationId = (userProfileDoc.data() as UserProfile).organizationId;
  if (!organizationId) throw new Error("Organization not found for current user.");

  try {
    const entryDocRef = doc(journalEntriesCollection);
    batch.set(entryDocRef, { ...entryData, organizationId, createdAt: serverTimestamp() });

    // Update balances for each account in the transaction
    for (const transaction of entryData.transactions) {
      const accountRef = doc(db, 'accounts', transaction.accountId);
      const accountSnap = await getDoc(accountRef);
      if(accountSnap.exists()) {
          const account = accountSnap.data() as Account;
          let balanceChange = 0;
          if (account.type === 'Activo' || account.type === 'Gasto') {
              balanceChange = transaction.debit - transaction.credit;
          } else { // Pasivo, Patrimonio, Ingreso
              balanceChange = transaction.credit - transaction.debit;
          }
          batch.update(accountRef, { balance: increment(balanceChange) });
      }
    }
    
    await batch.commit();
    return entryDocRef.id;
  } catch (error) {
    console.error('Error adding journal entry: ', error);
    throw error;
  }
};

// READ all journal entries
export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  const user = auth.currentUser;
  if (!user) return [];
  const userProfileDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userProfileDoc.exists()) return [];
  const organizationId = (userProfileDoc.data() as UserProfile).organizationId;
  if (!organizationId) return [];

  try {
    const q = query(journalEntriesCollection, where("organizationId", "==", organizationId));
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<JournalEntry, 'id'>),
    }));

    // Sort client-side to avoid composite index
    return entries.sort((a, b) => {
      const dateA = a.createdAt ? (a.createdAt as Timestamp).toMillis() : new Date(a.date).getTime();
      const dateB = b.createdAt ? (b.createdAt as Timestamp).toMillis() : new Date(b.date).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error getting journal entries: ', error);
    throw error;
  }
};


// --- Automatic Journal Entries ---

export const createJournalEntryForSale = async (sale: Sale) => {
    const settings = await getSystemSettings();
    if (!settings.defaultCashAccountId || !settings.defaultSalesRevenueAccountId || !settings.defaultTaxPayableAccountId || !settings.defaultInventoryAccountId || !settings.defaultCostOfGoodsSoldAccountId) {
        console.warn("Default accounting accounts not set. Skipping journal entry for sale.");
        return;
    }

    const totalCostOfGoods = sale.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

    // 1. Get account documents to retrieve names
    const accountsToFetch = [
        settings.defaultCashAccountId,
        settings.defaultSalesRevenueAccountId,
        settings.defaultTaxPayableAccountId,
        settings.defaultInventoryAccountId,
        settings.defaultCostOfGoodsSoldAccountId,
    ];
    const accountDocs = await Promise.all(accountsToFetch.map(id => getDoc(doc(db, 'accounts', id))));
    const accountData = accountDocs.reduce((acc, docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data() as Account;
            acc[docSnap.id] = { name: data.name, code: data.code };
        }
        return acc;
    }, {} as Record<string, {name: string, code: string}>);

    const entry: Omit<JournalEntry, 'id'> = {
        date: sale.date,
        description: `Asiento contable por venta #${sale.id.substring(0, 5)}`,
        organizationId: sale.organizationId,
        transactions: [
            // Registro de Ingreso
            { accountId: settings.defaultCashAccountId, accountName: accountData[settings.defaultCashAccountId].name, accountCode: accountData[settings.defaultCashAccountId].code, debit: sale.total, credit: 0 },
            { accountId: settings.defaultTaxPayableAccountId, accountName: accountData[settings.defaultTaxPayableAccountId].name, accountCode: accountData[settings.defaultTaxPayableAccountId].code, debit: 0, credit: sale.tax },
            { accountId: settings.defaultSalesRevenueAccountId, accountName: accountData[settings.defaultSalesRevenueAccountId].name, accountCode: accountData[settings.defaultSalesRevenueAccountId].code, debit: 0, credit: sale.subtotal },
            // Registro de Costo de Venta
            { accountId: settings.defaultCostOfGoodsSoldAccountId, accountName: accountData[settings.defaultCostOfGoodsSoldAccountId].name, accountCode: accountData[settings.defaultCostOfGoodsSoldAccountId].code, debit: totalCostOfGoods, credit: 0 },
            { accountId: settings.defaultInventoryAccountId, accountName: accountData[settings.defaultInventoryAccountId].name, accountCode: accountData[settings.defaultInventoryAccountId].code, debit: 0, credit: totalCostOfGoods },
        ]
    };

    try {
        await addJournalEntry(entry);
    } catch (error) {
        console.error(`Failed to create journal entry for sale ${sale.id}:`, error);
        // Decide how to handle this failure - maybe queue for retry?
    }
}

// /src/services/sales-service.ts
import {
  collection,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Sale } from '@/lib/types';
import { createJournalEntryForSale } from './accounting-service';

const salesCollection = collection(db, 'sales');

// CREATE a new sale and update inventory
export const addSale = async (saleData: Omit<Sale, 'id'>) => {
  const batch = writeBatch(db);
  try {
    // 1. Create the sale document
    const saleDocRef = doc(salesCollection);
    batch.set(saleDocRef, { ...saleData, createdAt: serverTimestamp() });

    // 2. Update inventory levels for each item sold
    for (const item of saleData.items) {
      const productRef = doc(db, 'products', item.productId);
      // Decrement the stock for the specific warehouse
      const stockUpdateKey = `stockLevels.${saleData.warehouseId}`;
      batch.update(productRef, { [stockUpdateKey]: increment(-item.quantity) });
    }
    
    // 3. (Optional but recommended) Create the accounting journal entry for the sale
    // This will be created after the sale is committed to get the final sale ID and data.
    
    await batch.commit();

    // Now create the journal entry
    await createJournalEntryForSale({ ...saleData, id: saleDocRef.id });

    return saleDocRef.id;
  } catch (error) {
    console.error('Error processing sale: ', error);
    throw error;
  }
};

// READ all sales
export const getSales = async (): Promise<Sale[]> => {
  try {
    const q = query(salesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Sale, 'id'>),
    }));
  } catch (error) {
    console.error('Error getting sales: ', error);
    throw error;
  }
};

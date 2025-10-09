// /src/services/inventory-service.ts
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, Warehouse } from '@/lib/types';

const productsCollection = collection(db, 'products');
const warehousesCollection = collection(db, 'warehouses');

// --- Product Services ---

// CREATE
export const addProduct = async (productData: Omit<Product, 'id'>) => {
  try {
    const docRef = await addDoc(productsCollection, {
      ...productData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product: ', error);
    throw error;
  }
};

// READ
export const getProducts = async (): Promise<Product[]> => {
  try {
    const q = query(productsCollection, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Product, 'id'>),
    }));
  } catch (error) {
    console.error('Error getting products: ', error);
    throw error;
  }
};

// UPDATE
export const updateProduct = async (
  id: string,
  updates: Partial<Omit<Product, 'id'>>
) => {
  try {
    const productDoc = doc(db, 'products', id);
    await updateDoc(productDoc, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating product: ', error);
    throw error;
  }
};

// DELETE
export const deleteProduct = async (id: string) => {
  try {
    const productDoc = doc(db, 'products', id);
    await deleteDoc(productDoc);
  } catch (error) {
    console.error('Error deleting product: ', error);
    throw error;
  }
};

// --- Warehouse Services ---

// CREATE
export const addWarehouse = async (warehouseData: Omit<Warehouse, 'id'>) => {
  try {
    const docRef = await addDoc(warehousesCollection, {
      ...warehouseData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding warehouse: ', error);
    throw error;
  }
};

// READ
export const getWarehouses = async (): Promise<Warehouse[]> => {
  try {
    const q = query(warehousesCollection, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Warehouse, 'id'>),
    }));
  } catch (error) {
    console.error('Error getting warehouses: ', error);
    throw error;
  }
};

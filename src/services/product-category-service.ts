// /src/services/product-category-service.ts
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ProductCategory, UserProfile } from '@/lib/types';

const categoriesCollection = collection(db, 'productCategories');

// CREATE
export const addProductCategory = async (
  categoryData: Omit<ProductCategory, 'id' | 'organizationId' | 'createdAt'>,
  userProfile: UserProfile
) => {
  if (!userProfile.organizationId) {
    throw new Error("El usuario no está asociado a una organización.");
  }
  try {
    const docRef = await addDoc(categoriesCollection, {
      ...categoryData,
      organizationId: userProfile.organizationId,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product category: ', error);
    throw error;
  }
};

// READ
export const getProductCategories = async (userProfile: UserProfile): Promise<ProductCategory[]> => {
  if (!userProfile) return [];
  try {
    let q;
    if (userProfile.role === 'SuperAdmin') {
      q = query(categoriesCollection, orderBy('name', 'asc'));
    } else if (userProfile.organizationId) {
      // Query only by organizationId to avoid composite index requirement.
      q = query(
        categoriesCollection,
        where('organizationId', '==', userProfile.organizationId)
      );
    } else {
      return [];
    }

    const snapshot = await getDocs(q);
    const categoryList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<ProductCategory, 'id'>),
    }));

    // For non-superadmin, sort client-side
    if (userProfile.role !== 'SuperAdmin') {
        categoryList.sort((a, b) => a.name.localeCompare(b.name));
    }

    return categoryList;
  } catch (error) {
    console.error('Error getting product categories: ', error);
    throw error;
  }
};

// DELETE
export const deleteProductCategory = async (id: string) => {
  try {
    const categoryDoc = doc(db, 'productCategories', id);
    await deleteDoc(categoryDoc);
  } catch (error) {
    console.error('Error deleting product category: ', error);
    throw error;
  }
};

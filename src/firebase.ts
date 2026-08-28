import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  GeladinhoProduct, 
  PromoCombo, 
  CategoryItem, 
  NeighborhoodFee, 
  StoreSettings, 
  OrderRecord, 
  StockMovement 
} from './types';
import { 
  PRODUCTS_DATA, 
  PROMO_COMBOS_DATA, 
  DEFAULT_CATEGORIES_DATA, 
  DEFAULT_NEIGHBORHOODS_DATA, 
  DEFAULT_STORE_SETTINGS 
} from './data/products';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with configured databaseId
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Collection References
export const PRODUCTS_COLLECTION = 'products';
export const COMBOS_COLLECTION = 'combos';
export const CATEGORIES_COLLECTION = 'categories';
export const NEIGHBORHOODS_COLLECTION = 'neighborhoods';
export const SETTINGS_COLLECTION = 'settings';
export const ORDERS_COLLECTION = 'orders';
export const MOVEMENTS_COLLECTION = 'stock_movements';

/**
 * Initialize Firestore data if empty (First-time seed)
 */
export async function initializeFirestoreIfEmpty(
  currentLocalProducts: GeladinhoProduct[],
  currentLocalCombos: PromoCombo[],
  currentLocalCategories: CategoryItem[],
  currentLocalNeighborhoods: NeighborhoodFee[],
  currentLocalSettings: StoreSettings
) {
  try {
    // Check products
    const productsSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (productsSnap.empty) {
      console.log('⚡ Initializing Firestore with store catalog...');
      const batch = writeBatch(db);

      // Seed products (prefer latest local or default data)
      const seedProducts = currentLocalProducts.length > 0 ? currentLocalProducts : PRODUCTS_DATA;
      for (const prod of seedProducts) {
        const prodRef = doc(db, PRODUCTS_COLLECTION, prod.id);
        batch.set(prodRef, prod);
      }

      // Seed combos
      const seedCombos = currentLocalCombos.length > 0 ? currentLocalCombos : PROMO_COMBOS_DATA;
      for (const combo of seedCombos) {
        const comboRef = doc(db, COMBOS_COLLECTION, combo.id);
        batch.set(comboRef, combo);
      }

      // Seed categories
      const seedCategories = currentLocalCategories.length > 0 ? currentLocalCategories : DEFAULT_CATEGORIES_DATA;
      for (const cat of seedCategories) {
        const catRef = doc(db, CATEGORIES_COLLECTION, cat.id);
        batch.set(catRef, cat);
      }

      // Seed neighborhoods
      const seedNeighborhoods = currentLocalNeighborhoods.length > 0 ? currentLocalNeighborhoods : DEFAULT_NEIGHBORHOODS_DATA;
      for (const n of seedNeighborhoods) {
        const nId = n.id || `bairro-${n.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const nRef = doc(db, NEIGHBORHOODS_COLLECTION, nId);
        batch.set(nRef, { ...n, id: nId });
      }

      // Seed store settings
      const settingsRef = doc(db, SETTINGS_COLLECTION, 'store');
      batch.set(settingsRef, currentLocalSettings || DEFAULT_STORE_SETTINGS);

      await batch.commit();
      console.log('✅ Firestore initialization complete!');
    }
  } catch (err) {
    console.error('Error initializing Firestore data:', err);
  }
}

/**
 * Realtime listener hooks for Firestore
 */

// Products Listener
export function subscribeToProducts(callback: (products: GeladinhoProduct[]) => void) {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const items: GeladinhoProduct[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as GeladinhoProduct), id: docSnap.id });
      });
      callback(items);
    }
  }, (err) => {
    console.error('Products subscription error:', err);
  });
}

// Combos Listener
export function subscribeToCombos(callback: (combos: PromoCombo[]) => void) {
  const colRef = collection(db, COMBOS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const items: PromoCombo[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as PromoCombo), id: docSnap.id });
      });
      callback(items);
    }
  }, (err) => {
    console.error('Combos subscription error:', err);
  });
}

// Categories Listener
export function subscribeToCategories(callback: (categories: CategoryItem[]) => void) {
  const colRef = collection(db, CATEGORIES_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const items: CategoryItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as CategoryItem), id: docSnap.id });
      });
      callback(items);
    }
  }, (err) => {
    console.error('Categories subscription error:', err);
  });
}

// Neighborhoods Listener
export function subscribeToNeighborhoods(callback: (neighborhoods: NeighborhoodFee[]) => void) {
  const colRef = collection(db, NEIGHBORHOODS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const items: NeighborhoodFee[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as NeighborhoodFee), id: docSnap.id });
      });
      // Sort alphabetically by name
      items.sort((a, b) => a.name.localeCompare(b.name));
      callback(items);
    }
  }, (err) => {
    console.error('Neighborhoods subscription error:', err);
  });
}

// Store Settings Listener
export function subscribeToStoreSettings(callback: (settings: StoreSettings) => void) {
  const docRef = doc(db, SETTINGS_COLLECTION, 'store');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ ...DEFAULT_STORE_SETTINGS, ...(docSnap.data() as StoreSettings) });
    }
  }, (err) => {
    console.error('Store settings subscription error:', err);
  });
}

// Orders History Listener
export function subscribeToOrders(callback: (orders: OrderRecord[]) => void) {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items: OrderRecord[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ ...(docSnap.data() as OrderRecord), id: docSnap.id });
    });
    if (items.length > 0) {
      callback(items);
    }
  }, (err) => {
    console.error('Orders subscription error:', err);
  });
}

// Stock Movements Listener
export function subscribeToStockMovements(callback: (movements: StockMovement[]) => void) {
  const q = query(collection(db, MOVEMENTS_COLLECTION), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items: StockMovement[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ ...(docSnap.data() as StockMovement), id: docSnap.id });
    });
    if (items.length > 0) {
      callback(items);
    }
  }, (err) => {
    console.error('Stock movements subscription error:', err);
  });
}

/**
 * Direct Database Mutation Operations
 */

// Save / Update a Product
export async function dbSaveProduct(product: GeladinhoProduct) {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(docRef, product, { merge: true });
  } catch (err) {
    console.error('Error saving product to Firebase:', err);
    throw err;
  }
}

// Delete a Product
export async function dbDeleteProduct(productId: string) {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting product from Firebase:', err);
    throw err;
  }
}

// Save All / Batch Update Products
export async function dbBatchSaveProducts(productsList: GeladinhoProduct[]) {
  try {
    const batch = writeBatch(db);
    for (const prod of productsList) {
      const ref = doc(db, PRODUCTS_COLLECTION, prod.id);
      batch.set(ref, prod, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error('Error batch updating products:', err);
    throw err;
  }
}

// Save / Update Combo
export async function dbSaveCombo(combo: PromoCombo) {
  try {
    const docRef = doc(db, COMBOS_COLLECTION, combo.id);
    await setDoc(docRef, combo, { merge: true });
  } catch (err) {
    console.error('Error saving combo to Firebase:', err);
    throw err;
  }
}

// Delete Combo
export async function dbDeleteCombo(comboId: string) {
  try {
    const docRef = doc(db, COMBOS_COLLECTION, comboId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting combo from Firebase:', err);
    throw err;
  }
}

// Save All / Batch Update Combos
export async function dbBatchSaveCombos(combosList: PromoCombo[]) {
  try {
    const batch = writeBatch(db);
    for (const c of combosList) {
      const ref = doc(db, COMBOS_COLLECTION, c.id);
      batch.set(ref, c, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error('Error batch updating combos:', err);
    throw err;
  }
}

// Save / Update Category
export async function dbSaveCategory(category: CategoryItem) {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, category.id);
    await setDoc(docRef, category, { merge: true });
  } catch (err) {
    console.error('Error saving category to Firebase:', err);
    throw err;
  }
}

// Delete Category
export async function dbDeleteCategory(categoryId: string) {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting category from Firebase:', err);
    throw err;
  }
}

// Save / Update Neighborhood
export async function dbSaveNeighborhood(neighborhood: NeighborhoodFee) {
  try {
    const id = neighborhood.id || `bairro-${neighborhood.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const docRef = doc(db, NEIGHBORHOODS_COLLECTION, id);
    await setDoc(docRef, { ...neighborhood, id }, { merge: true });
  } catch (err) {
    console.error('Error saving neighborhood to Firebase:', err);
    throw err;
  }
}

// Delete Neighborhood
export async function dbDeleteNeighborhood(neighborhoodId: string) {
  try {
    const docRef = doc(db, NEIGHBORHOODS_COLLECTION, neighborhoodId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting neighborhood from Firebase:', err);
    throw err;
  }
}

// Batch Save Neighborhoods
export async function dbBatchSaveNeighborhoods(neighborhoodsList: NeighborhoodFee[]) {
  try {
    const batch = writeBatch(db);
    for (const n of neighborhoodsList) {
      const id = n.id || `bairro-${n.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const ref = doc(db, NEIGHBORHOODS_COLLECTION, id);
      batch.set(ref, { ...n, id }, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error('Error batch updating neighborhoods:', err);
    throw err;
  }
}

// Save Store Settings
export async function dbSaveStoreSettings(settings: StoreSettings) {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'store');
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    console.error('Error saving store settings to Firebase:', err);
    throw err;
  }
}

// Save / Create Order
export async function dbSaveOrder(order: OrderRecord) {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(docRef, order, { merge: true });
  } catch (err) {
    console.error('Error saving order to Firebase:', err);
    throw err;
  }
}

// Record Stock Movement
export async function dbAddStockMovement(movement: StockMovement) {
  try {
    const docRef = doc(db, MOVEMENTS_COLLECTION, movement.id);
    await setDoc(docRef, movement, { merge: true });
  } catch (err) {
    console.error('Error recording stock movement in Firebase:', err);
  }
}

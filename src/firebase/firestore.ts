import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  runTransaction,
  writeBatch,
  QueryConstraint,
  DocumentData,
  Transaction,
  WriteBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { app } from './firebase';
import { firebaseConfig } from './config';
import { LoggerService } from '../core/services/LoggerService';
import { firestoreHealthManager } from './FirestoreHealthManager';

const rawDbId = firebaseConfig.firestoreDatabaseId;
const dbId = (rawDbId && rawDbId.trim() !== '' && rawDbId !== '(default)') ? rawDbId.trim() : undefined;

let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    dbId
  );
  LoggerService.info('Firestore', `Firestore initialized with force long-polling & persistent cache (db: ${dbId || 'default'})`);
} catch (e: any) {
  LoggerService.warn('Firestore', 'initializeFirestore with cache failed or already initialized, falling back to getFirestore:', e?.message || e);
  firestoreInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
}

export const db: Firestore = firestoreInstance;

export async function getDocData<T>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const snap = await getDoc(docRef);
    firestoreHealthManager.recordSuccess();
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as unknown as T;
    }
    return null;
  } catch (error) {
    firestoreHealthManager.recordError(error, `getDocData:${collectionName}/${docId}`);
    LoggerService.warn('Firestore', `getDocData failed for ${collectionName}/${docId}`, error);
    return null;
  }
}

export async function setDocData<T extends { id: string }>(
  collectionName: string,
  data: T,
  merge = true
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, data, { merge });
    firestoreHealthManager.recordSuccess();
  } catch (error) {
    firestoreHealthManager.recordError(error, `setDocData:${collectionName}/${data.id}`);
    LoggerService.warn('Firestore', `setDocData failed for ${collectionName}/${data.id}`, error);
  }
}

export async function updateDocData(
  collectionName: string,
  docId: string,
  updates: DocumentData
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, updates);
    firestoreHealthManager.recordSuccess();
  } catch (error) {
    firestoreHealthManager.recordError(error, `updateDocData:${collectionName}/${docId}`);
    LoggerService.warn('Firestore', `updateDocData failed for ${collectionName}/${docId}`, error);
  }
}

export async function deleteDocData(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    firestoreHealthManager.recordSuccess();
  } catch (error) {
    firestoreHealthManager.recordError(error, `deleteDocData:${collectionName}/${docId}`);
    LoggerService.warn('Firestore', `deleteDocData failed for ${collectionName}/${docId}`, error);
  }
}

export async function getCollectionDocs<T>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    firestoreHealthManager.recordSuccess();
    return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as unknown as T));
  } catch (error) {
    firestoreHealthManager.recordError(error, `getCollectionDocs:${collectionName}`);
    LoggerService.warn('Firestore', `getCollectionDocs failed for ${collectionName}`, error);
    return [];
  }
}

export async function queryCollectionDocs<T>(
  collectionName: string,
  constraints: QueryConstraint[]
): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...constraints);
    const snap = await getDocs(q);
    firestoreHealthManager.recordSuccess();
    return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as unknown as T));
  } catch (error) {
    firestoreHealthManager.recordError(error, `queryCollectionDocs:${collectionName}`);
    LoggerService.warn('Firestore', `queryCollectionDocs failed for ${collectionName}`, error);
    return [];
  }
}

export async function paginateCollectionDocs<T>(
  collectionName: string,
  pageSize: number,
  lastDocSnap?: DocumentData,
  sortField = 'createdAt',
  sortDirection: 'asc' | 'desc' = 'desc'
): Promise<{ items: T[]; lastDoc: DocumentData | null }> {
  try {
    const colRef = collection(db, collectionName);
    const constraints: QueryConstraint[] = [orderBy(sortField, sortDirection), limit(pageSize)];
    if (lastDocSnap) {
      constraints.push(startAfter(lastDocSnap));
    }
    const q = query(colRef, ...constraints);
    const snap = await getDocs(q);
    firestoreHealthManager.recordSuccess();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T));
    const newLastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
    return { items, lastDoc: newLastDoc };
  } catch (error) {
    firestoreHealthManager.recordError(error, `paginateCollectionDocs:${collectionName}`);
    LoggerService.warn('Firestore', `paginateCollectionDocs failed for ${collectionName}`, error);
    return { items: [], lastDoc: null };
  }
}

export function subscribeToCollection<T>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    const colRef = collection(db, collectionName);
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        firestoreHealthManager.recordSuccess();
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T));
        onData(items);
      },
      (err) => {
        firestoreHealthManager.recordError(err, `subscribeToCollection:${collectionName}`);
        if (err.message?.includes('NOT_FOUND') || (err as any).code === 'not-found') {
          LoggerService.warn('Firestore', `Collection ${collectionName} not found on Firestore instance.`);
        } else {
          LoggerService.warn('Firestore', `Snapshot error for collection ${collectionName}`, err);
        }
        if (onError) {
          try {
            onError(err);
          } catch (callbackErr) {
            LoggerService.warn('Firestore', `Error in subscription onError callback for ${collectionName}`, callbackErr);
          }
        }
      }
    );
    return () => {
      try {
        unsub();
      } catch (e) {
        // Safe unsubscribe
      }
    };
  } catch (initErr) {
    firestoreHealthManager.recordError(initErr, `subscribeToCollection:init:${collectionName}`);
    if (onError) {
      try {
        onError(initErr instanceof Error ? initErr : new Error(String(initErr)));
      } catch {}
    }
    return () => {};
  }
}

export async function runFirestoreTransaction<T>(
  updateFunction: (transaction: Transaction) => Promise<T>
): Promise<T | null> {
  try {
    const result = await runTransaction(db, updateFunction);
    firestoreHealthManager.recordSuccess();
    return result;
  } catch (error) {
    firestoreHealthManager.recordError(error, 'runFirestoreTransaction');
    LoggerService.warn('Firestore', 'Transaction failed', error);
    return null;
  }
}

export async function executeBatchWrite(
  operations: Array<{ type: 'set' | 'update' | 'delete'; collection: string; id: string; data?: DocumentData }>
): Promise<void> {
  try {
    const batch: WriteBatch = writeBatch(db);
    operations.forEach((op) => {
      const docRef = doc(db, op.collection, op.id);
      if (op.type === 'set' && op.data) {
        batch.set(docRef, op.data, { merge: true });
      } else if (op.type === 'update' && op.data) {
        batch.update(docRef, op.data);
      } else if (op.type === 'delete') {
        batch.delete(docRef);
      }
    });
    await batch.commit();
    firestoreHealthManager.recordSuccess();
  } catch (error) {
    firestoreHealthManager.recordError(error, 'executeBatchWrite');
    LoggerService.warn('Firestore', 'Batch write failed', error);
  }
}

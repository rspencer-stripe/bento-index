import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { MindItem } from '../types';

// IndexedDB schema
interface IndexDBSchema extends DBSchema {
  items: {
    key: string;
    value: MindItem & { 
      _syncedAt?: number;
      _dirty?: boolean; 
    };
    indexes: {
      'by-source': string;
      'by-tag': string;
      'by-lastTouched': string;
      'by-sync': number;
    };
  };
  syncState: {
    key: string;
    value: {
      source: string;
      lastSyncAt: number;
      cursor?: string;
    };
  };
  pendingOperations: {
    key: number;
    value: {
      id?: number;
      type: 'create' | 'update' | 'delete';
      itemId: string;
      data?: Partial<MindItem>;
      timestamp: number;
    };
  };
}

const DB_NAME = 'index-cache';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<IndexDBSchema> | null = null;

// Initialize database
async function getDB(): Promise<IDBPDatabase<IndexDBSchema>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<IndexDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Items store with indexes
      if (!db.objectStoreNames.contains('items')) {
        const itemStore = db.createObjectStore('items', { keyPath: 'id' });
        itemStore.createIndex('by-source', 'source');
        itemStore.createIndex('by-tag', 'tag');
        itemStore.createIndex('by-lastTouched', 'lastTouchedAt');
        itemStore.createIndex('by-sync', '_syncedAt');
      }
      
      // Sync state store
      if (!db.objectStoreNames.contains('syncState')) {
        db.createObjectStore('syncState', { keyPath: 'source' });
      }
      
      // Pending operations for offline queue
      if (!db.objectStoreNames.contains('pendingOperations')) {
        db.createObjectStore('pendingOperations', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
      }
    },
  });
  
  return dbInstance;
}

// Item operations
export async function getAllItems(): Promise<MindItem[]> {
  const db = await getDB();
  const items = await db.getAll('items');
  return items.map(({ _syncedAt, _dirty, ...item }) => item);
}

export async function getItemById(id: string): Promise<MindItem | undefined> {
  const db = await getDB();
  const item = await db.get('items', id);
  if (!item) return undefined;
  const { _syncedAt, _dirty, ...cleanItem } = item;
  return cleanItem;
}

export async function getItemsBySource(source: string): Promise<MindItem[]> {
  const db = await getDB();
  const items = await db.getAllFromIndex('items', 'by-source', source);
  return items.map(({ _syncedAt, _dirty, ...item }) => item);
}

export async function getItemsByTag(tag: string): Promise<MindItem[]> {
  const db = await getDB();
  const items = await db.getAllFromIndex('items', 'by-tag', tag);
  return items.map(({ _syncedAt, _dirty, ...item }) => item);
}

export async function putItem(item: MindItem): Promise<void> {
  const db = await getDB();
  await db.put('items', { 
    ...item, 
    _syncedAt: Date.now(),
    _dirty: false,
  });
}

export async function putItems(items: MindItem[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('items', 'readwrite');
  const now = Date.now();
  
  await Promise.all([
    ...items.map(item => tx.store.put({ 
      ...item, 
      _syncedAt: now,
      _dirty: false,
    })),
    tx.done,
  ]);
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('items', id);
}

export async function clearItems(): Promise<void> {
  const db = await getDB();
  await db.clear('items');
}

export async function clearItemsBySource(source: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('items', 'readwrite');
  const items = await tx.store.index('by-source').getAllKeys(source);
  await Promise.all([
    ...items.map(id => tx.store.delete(id)),
    tx.done,
  ]);
}

// Sync state operations
export async function getSyncState(source: string): Promise<{ lastSyncAt: number; cursor?: string } | undefined> {
  const db = await getDB();
  return db.get('syncState', source);
}

export async function setSyncState(source: string, lastSyncAt: number, cursor?: string): Promise<void> {
  const db = await getDB();
  await db.put('syncState', { source, lastSyncAt, cursor });
}

// Pending operations (offline queue)
export async function queueOperation(
  type: 'create' | 'update' | 'delete',
  itemId: string,
  data?: Partial<MindItem>
): Promise<void> {
  const db = await getDB();
  await db.add('pendingOperations', {
    type,
    itemId,
    data,
    timestamp: Date.now(),
  });
}

export async function getPendingOperations(): Promise<Array<{
  id: number;
  type: 'create' | 'update' | 'delete';
  itemId: string;
  data?: Partial<MindItem>;
  timestamp: number;
}>> {
  const db = await getDB();
  const ops = await db.getAll('pendingOperations');
  return ops.filter((op): op is typeof op & { id: number } => op.id !== undefined);
}

export async function clearPendingOperation(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('pendingOperations', id);
}

export async function clearAllPendingOperations(): Promise<void> {
  const db = await getDB();
  await db.clear('pendingOperations');
}

// Check if we have any cached data
export async function hasCachedData(): Promise<boolean> {
  const db = await getDB();
  const count = await db.count('items');
  return count > 0;
}

// Get item count
export async function getItemCount(): Promise<number> {
  const db = await getDB();
  return db.count('items');
}

// Export database instance for advanced operations
export { getDB };

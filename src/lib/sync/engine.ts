import { MindItem } from '../types';
import { integrationRegistry } from '../integrations';
import { useAppStore } from '../store';
import * as idb from './idb';
import { liveItems } from '../liveData';

// Sync result type
export interface SyncEngineResult {
  success: boolean;
  itemCount: number;
  sources: Record<string, { added: number; updated: number; errors: string[] }>;
  duration: number;
}

// Sync engine - coordinates data sync between sources and local cache
class SyncEngine {
  private syncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  // Get current data mode
  private getDataMode(): 'demo' | 'live' {
    return useAppStore.getState().preferences.dataMode;
  }

  // Load initial data
  async initialize(): Promise<MindItem[]> {
    const store = useAppStore.getState();
    
    // Check for cached data first
    const hasCached = await idb.hasCachedData();
    
    if (hasCached) {
      // Load from IndexedDB cache
      const cachedItems = await idb.getAllItems();
      store.setItems(cachedItems);
      store.setInitialized(true);
      
      // Trigger background refresh
      this.refreshInBackground();
      
      return cachedItems;
    }
    
    // No cache - load fresh data
    const items = await this.loadFreshData();
    store.setItems(items);
    store.setInitialized(true);
    
    return items;
  }

  // Load fresh data based on mode
  async loadFreshData(): Promise<MindItem[]> {
    const mode = this.getDataMode();
    
    if (mode === 'demo') {
      return this.loadDemoData();
    } else {
      return this.loadLiveData();
    }
  }

  // Load demo data
  private async loadDemoData(): Promise<MindItem[]> {
    // Save demo data to cache
    await idb.putItems(liveItems);
    return liveItems;
  }

  // Load live data from integrations
  private async loadLiveData(): Promise<MindItem[]> {
    const store = useAppStore.getState();
    store.setLoading(true);
    
    try {
      // Use 'default' as user ID for now (would come from auth in production)
      const items = await integrationRegistry.fetchAll('default');
      
      // Save to cache
      await idb.putItems(items);
      
      return items;
    } catch (err) {
      console.error('Failed to load live data:', err);
      // Fallback to cached data if available
      const cached = await idb.getAllItems();
      if (cached.length > 0) {
        return cached;
      }
      // Ultimate fallback - demo data
      return liveItems;
    } finally {
      store.setLoading(false);
    }
  }

  // Full sync - fetches all data and replaces cache
  async fullSync(): Promise<SyncEngineResult> {
    if (this.syncing) {
      return { 
        success: false, 
        itemCount: 0, 
        sources: {}, 
        duration: 0 
      };
    }

    this.syncing = true;
    const startTime = Date.now();
    const store = useAppStore.getState();
    store.setIntegrationSyncing(true);
    
    const sources: SyncEngineResult['sources'] = {};

    try {
      const mode = this.getDataMode();
      
      if (mode === 'demo') {
        // Demo mode - just use curated data
        await idb.clearItems();
        await idb.putItems(liveItems);
        store.setItems(liveItems);
        
        return {
          success: true,
          itemCount: liveItems.length,
          sources: { demo: { added: liveItems.length, updated: 0, errors: [] } },
          duration: Date.now() - startTime,
        };
      }

      // Live mode - sync from all integrations
      const allItems: MindItem[] = [];
      
      for (const integration of integrationRegistry.getAll()) {
        try {
          const status = await integration.isConfigured();
          if (!status) continue;
          
          if ('fetch' in integration && 'transform' in integration) {
            const result = await integration.fetch('default');
            const items = result.items.map(raw => integration.transform(raw, 'default'));
            
            // Clear old items for this source
            await idb.clearItemsBySource(integration.id);
            
            // Save new items
            if (items.length > 0) {
              await idb.putItems(items);
            }
            
            allItems.push(...items);
            sources[integration.id] = { 
              added: items.length, 
              updated: 0, 
              errors: [] 
            };
            
            // Update sync state
            await idb.setSyncState(integration.id, Date.now());
          }
        } catch (err) {
          console.error(`Sync failed for ${integration.id}:`, err);
          sources[integration.id] = {
            added: 0,
            updated: 0,
            errors: [`Sync failed: ${err}`],
          };
        }
      }

      // Update store
      store.setItems(allItems);
      
      return {
        success: true,
        itemCount: allItems.length,
        sources,
        duration: Date.now() - startTime,
      };
    } catch (err) {
      console.error('Full sync failed:', err);
      return {
        success: false,
        itemCount: 0,
        sources,
        duration: Date.now() - startTime,
      };
    } finally {
      this.syncing = false;
      store.setIntegrationSyncing(false);
    }
  }

  // Delta sync - only fetch updates since last sync
  async deltaSync(): Promise<SyncEngineResult> {
    // For now, just do a full sync
    // In production, this would use cursors/timestamps to fetch only new data
    return this.fullSync();
  }

  // Refresh data in background without blocking UI
  private async refreshInBackground(): Promise<void> {
    // Small delay to let UI settle
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const result = await this.deltaSync();
      if (result.success) {
        console.log(`Background sync completed: ${result.itemCount} items`);
      }
    } catch (err) {
      console.error('Background sync failed:', err);
    }
  }

  // Start auto-sync interval
  startAutoSync(intervalMs: number = 5 * 60 * 1000): void {
    this.stopAutoSync();
    
    this.syncInterval = setInterval(() => {
      this.deltaSync().catch(console.error);
    }, intervalMs);
  }

  // Stop auto-sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Process offline queue
  async processOfflineQueue(): Promise<void> {
    const pending = await idb.getPendingOperations();
    
    for (const op of pending) {
      try {
        // In production, this would send to server
        // For now, just clear the operation
        await idb.clearPendingOperation(op.id);
      } catch (err) {
        console.error('Failed to process operation:', err);
      }
    }
  }

  // Clear all cached data
  async clearCache(): Promise<void> {
    await idb.clearItems();
    await idb.clearAllPendingOperations();
    useAppStore.getState().clearItems();
  }

  // Switch data mode
  async switchMode(mode: 'demo' | 'live'): Promise<void> {
    const store = useAppStore.getState();
    store.setDataMode(mode);
    
    // Clear cache and reload
    await this.clearCache();
    await this.initialize();
  }
}

// Export singleton
export const syncEngine = new SyncEngine();

// Convenience hooks
export function useSyncEngine() {
  return syncEngine;
}

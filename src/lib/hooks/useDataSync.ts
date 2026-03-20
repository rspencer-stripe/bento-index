'use client';

import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store';
import { syncEngine } from '../sync';
import { liveItems } from '../liveData';

// Hook for data synchronization
export function useDataSync() {
  const {
    items,
    setItems,
    preferences,
    setLoading,
    setInitialized,
    initialized,
    loading,
  } = useAppStore();

  // Initialize data on mount
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (initialized) return;
      
      setLoading(true);
      try {
        // For client-side, we use the sync engine
        // which handles IndexedDB caching
        if (typeof window !== 'undefined') {
          const loadedItems = await syncEngine.initialize();
          if (mounted) {
            setItems(loadedItems);
          }
        } else {
          // Server-side - just use demo data
          if (mounted) {
            setItems(liveItems);
          }
        }
      } catch (err) {
        console.error('Failed to initialize data:', err);
        // Fallback to demo data
        if (mounted) {
          setItems(liveItems);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [initialized, setItems, setLoading, setInitialized]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await syncEngine.fullSync();
      return result;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  // Switch between demo and live mode
  const switchMode = useCallback(async (mode: 'demo' | 'live') => {
    setLoading(true);
    try {
      await syncEngine.switchMode(mode);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  // Toggle mode
  const toggleMode = useCallback(async () => {
    const newMode = preferences.dataMode === 'demo' ? 'live' : 'demo';
    await switchMode(newMode);
    return newMode;
  }, [preferences.dataMode, switchMode]);

  return {
    items,
    loading,
    initialized,
    dataMode: preferences.dataMode,
    refresh,
    switchMode,
    toggleMode,
  };
}

// Simpler hook for just reading data
export function useItems() {
  const items = useAppStore((state) => state.items);
  const initialized = useAppStore((state) => state.initialized);
  const loading = useAppStore((state) => state.loading);
  
  return { items, initialized, loading };
}

// Hook for integration status
export function useIntegrations() {
  const status = useAppStore((state) => state.integrations.status);
  const syncing = useAppStore((state) => state.integrations.syncing);
  const error = useAppStore((state) => state.integrations.error);
  
  return { status, syncing, error };
}

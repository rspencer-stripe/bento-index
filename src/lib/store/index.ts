import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MindItem } from '../types';
import { MeetingPrep } from '../intelligence';
import { IntegrationStatus } from '../integrations/types';

// Data mode - demo uses curated data, live uses real integrations
export type DataMode = 'demo' | 'live';

// View modes
export type ViewMode = 'timeline' | 'projects' | 'whatsNext' | 'companion';
export type TimelineMode = 'stream' | 'day';

// User preferences stored persistently
interface UserPreferences {
  dataMode: DataMode;
  defaultView: ViewMode;
  timelineMode: TimelineMode;
  enabledIntegrations: string[];
}

// Integration state
interface IntegrationState {
  status: Record<string, IntegrationStatus>;
  lastSyncAt: Date | null;
  syncing: boolean;
  error: string | null;
}

// Meeting prep state
interface MeetingPrepState {
  currentPrep: MeetingPrep | null;
  panelOpen: boolean;
}

// Main app state
interface AppState {
  // Data
  items: MindItem[];
  
  // View state
  currentView: ViewMode;
  timelineMode: TimelineMode;
  searchQuery: string;
  selectedTags: string[];
  
  // User preferences (persisted)
  preferences: UserPreferences;
  
  // Integration state
  integrations: IntegrationState;
  
  // Meeting prep
  meetingPrep: MeetingPrepState;
  
  // Loading state
  loading: boolean;
  initialized: boolean;
}

// Actions
interface AppActions {
  // Items
  setItems: (items: MindItem[]) => void;
  addItems: (items: MindItem[]) => void;
  updateItem: (id: string, updates: Partial<MindItem>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  
  // View
  setView: (view: ViewMode) => void;
  setTimelineMode: (mode: TimelineMode) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  toggleTag: (tag: string) => void;
  
  // Preferences
  setDataMode: (mode: DataMode) => void;
  toggleDataMode: () => void;
  setDefaultView: (view: ViewMode) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  
  // Integrations
  setIntegrationStatus: (status: Record<string, IntegrationStatus>) => void;
  setIntegrationSyncing: (syncing: boolean) => void;
  setIntegrationError: (error: string | null) => void;
  
  // Meeting prep
  setMeetingPrep: (prep: MeetingPrep | null) => void;
  toggleMeetingPrepPanel: () => void;
  closeMeetingPrepPanel: () => void;
  
  // Loading
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  
  // Utility
  reset: () => void;
}

// Default state
const defaultPreferences: UserPreferences = {
  dataMode: 'demo',
  defaultView: 'timeline',
  timelineMode: 'stream',
  enabledIntegrations: ['calendar', 'slack', 'drive', 'figma'],
};

const initialState: AppState = {
  items: [],
  currentView: 'timeline',
  timelineMode: 'stream',
  searchQuery: '',
  selectedTags: [],
  preferences: defaultPreferences,
  integrations: {
    status: {},
    lastSyncAt: null,
    syncing: false,
    error: null,
  },
  meetingPrep: {
    currentPrep: null,
    panelOpen: false,
  },
  loading: false,
  initialized: false,
};

// Create the store with persistence
export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Items
      setItems: (items) => set({ items }),
      addItems: (newItems) => set((state) => ({ 
        items: [...state.items, ...newItems] 
      })),
      updateItem: (id, updates) => set((state) => ({
        items: state.items.map((item) => 
          item.id === id ? { ...item, ...updates } : item
        ),
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      clearItems: () => set({ items: [] }),
      
      // View
      setView: (view) => set({ currentView: view }),
      setTimelineMode: (mode) => set((state) => ({ 
        timelineMode: mode,
        preferences: { ...state.preferences, timelineMode: mode },
      })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedTags: (tags) => set({ selectedTags: tags }),
      toggleTag: (tag) => set((state) => {
        const tags = state.selectedTags.includes(tag)
          ? state.selectedTags.filter((t) => t !== tag)
          : [...state.selectedTags, tag];
        return { selectedTags: tags };
      }),
      
      // Preferences
      setDataMode: (mode) => set((state) => ({
        preferences: { ...state.preferences, dataMode: mode },
      })),
      toggleDataMode: () => set((state) => ({
        preferences: {
          ...state.preferences,
          dataMode: state.preferences.dataMode === 'demo' ? 'live' : 'demo',
        },
      })),
      setDefaultView: (view) => set((state) => ({
        preferences: { ...state.preferences, defaultView: view },
      })),
      updatePreferences: (updates) => set((state) => ({
        preferences: { ...state.preferences, ...updates },
      })),
      
      // Integrations
      setIntegrationStatus: (status) => set((state) => ({
        integrations: { ...state.integrations, status },
      })),
      setIntegrationSyncing: (syncing) => set((state) => ({
        integrations: { ...state.integrations, syncing },
      })),
      setIntegrationError: (error) => set((state) => ({
        integrations: { ...state.integrations, error },
      })),
      
      // Meeting prep
      setMeetingPrep: (prep) => set((state) => ({
        meetingPrep: { ...state.meetingPrep, currentPrep: prep },
      })),
      toggleMeetingPrepPanel: () => set((state) => ({
        meetingPrep: { ...state.meetingPrep, panelOpen: !state.meetingPrep.panelOpen },
      })),
      closeMeetingPrepPanel: () => set((state) => ({
        meetingPrep: { ...state.meetingPrep, panelOpen: false },
      })),
      
      // Loading
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),
      
      // Utility
      reset: () => set(initialState),
    }),
    {
      name: 'index-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        items: state.items,
      }),
    }
  )
);

// Selectors for common derived state
export const selectCalendarItems = (state: AppState) => 
  state.items.filter((item) => item.source === 'calendar');

export const selectSlackItems = (state: AppState) => 
  state.items.filter((item) => item.source === 'slack');

export const selectDriveItems = (state: AppState) => 
  state.items.filter((item) => item.source === 'drive');

export const selectTags = (state: AppState) => 
  [...new Set(state.items.map((item) => item.tag))].sort();

export const selectItemsByTag = (tag: string) => (state: AppState) =>
  state.items.filter((item) => item.tag === tag);

export const selectHighPriorityItems = (state: AppState) =>
  state.items.filter((item) => item.priority >= 4);

// Get the imminent meeting (within next 30 minutes)
export const selectImminentMeeting = (state: AppState) => {
  const now = Date.now();
  const thirtyMins = 30 * 60 * 1000;
  
  return state.items.find((item) => {
    if (item.source !== 'calendar') return false;
    const meta = item.sourceMeta?.meta;
    if (!meta || typeof meta !== 'object' || !('startsAt' in meta)) return false;
    const startTime = new Date(meta.startsAt as string).getTime();
    return startTime > now && startTime - now <= thirtyMins;
  });
};

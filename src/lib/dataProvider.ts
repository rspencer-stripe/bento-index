import { MindItem } from './types';
import { liveItems } from './liveData';

export type DataMode = 'demo' | 'live';

const STORAGE_KEY = 'index-data-mode';

export function getDataMode(): DataMode {
  if (typeof window === 'undefined') return 'demo';
  const stored = localStorage.getItem(STORAGE_KEY);
  return (stored === 'live' ? 'live' : 'demo') as DataMode;
}

export function setDataMode(mode: DataMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, mode);
}

export function toggleDataMode(): DataMode {
  const current = getDataMode();
  const next = current === 'demo' ? 'live' : 'demo';
  setDataMode(next);
  return next;
}

// Demo data - always available
export function getDemoItems(): MindItem[] {
  return liveItems;
}

// Live data fetching - calls API routes that integrate with real services
export async function fetchLiveItems(): Promise<MindItem[]> {
  try {
    const [calendar, slack, drive] = await Promise.all([
      fetchCalendarEvents(),
      fetchSlackMessages(),
      fetchDriveFiles(),
    ]);
    
    return [...calendar, ...slack, ...drive];
  } catch (error) {
    console.error('Failed to fetch live data:', error);
    return [];
  }
}

async function fetchCalendarEvents(): Promise<MindItem[]> {
  try {
    const res = await fetch('/api/integrations/calendar');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchSlackMessages(): Promise<MindItem[]> {
  try {
    const res = await fetch('/api/integrations/slack');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchDriveFiles(): Promise<MindItem[]> {
  try {
    const res = await fetch('/api/integrations/drive');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Integration status checking
export interface IntegrationStatus {
  calendar: boolean;
  slack: boolean;
  drive: boolean;
  figma: boolean;
}

export async function checkIntegrationStatus(): Promise<IntegrationStatus> {
  try {
    const res = await fetch('/api/integrations/status');
    if (!res.ok) {
      return { calendar: false, slack: false, drive: false, figma: false };
    }
    return res.json();
  } catch {
    return { calendar: false, slack: false, drive: false, figma: false };
  }
}

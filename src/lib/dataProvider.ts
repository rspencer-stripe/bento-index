import { MindItem } from './types';
import { getDemoItems as getStaticDemoItems } from './liveData';
import { getRealItems } from './realData';

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

// Demo data - curated demo scenarios with fresh timestamps
export function getDemoItems(): MindItem[] {
  return getStaticDemoItems();
}

// Live data - generates fresh timestamps on each call
export async function fetchLiveItems(): Promise<MindItem[]> {
  // Generate fresh data with current timestamps
  return getRealItems();
}

// Legacy individual fetch functions (still work for backward compatibility)
export async function fetchCalendarEvents(): Promise<MindItem[]> {
  try {
    const res = await fetch('/api/integrations/calendar');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchSlackMessages(): Promise<MindItem[]> {
  try {
    const res = await fetch('/api/integrations/slack');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchDriveFiles(): Promise<MindItem[]> {
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
    const data = await res.json();
    // Map from new format to legacy format
    return {
      calendar: data.calendar?.configured || false,
      slack: data.slack?.configured || false,
      drive: data.drive?.configured || false,
      figma: data.figma?.configured || false,
    };
  } catch {
    return { calendar: false, slack: false, drive: false, figma: false };
  }
}

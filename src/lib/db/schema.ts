// Database Schema (TypeScript types only)
// For production with Vercel Postgres, install drizzle-orm when esbuild is available
// For now, these serve as type definitions for the data model

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  dataMode: 'demo' | 'live';
  defaultView: string;
  enabledIntegrations: string[];
}

export interface OAuthToken {
  id: string;
  userId: string;
  provider: string; // 'google' | 'slack' | 'figma'
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  scope?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  userId: string;
  tag: string;
  type: string;
  priority: number;
  title: string;
  snippet?: string;
  source: string;
  sourceMeta: Record<string, unknown>;
  sourceId?: string;
  sourceUrl?: string;
  createdAt: Date;
  lastTouchedAt: Date;
  syncedAt: Date;
  isArchived: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  momentId?: string;
}

export interface SyncLogEntry {
  id: string;
  userId: string;
  source: string;
  operation: string;
  itemsAdded: number;
  itemsUpdated: number;
  itemsDeleted: number;
  status: string;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

// Type aliases for creation
export type NewUser = Omit<User, 'createdAt' | 'updatedAt'>;
export type NewOAuthToken = Omit<OAuthToken, 'createdAt' | 'updatedAt'>;
export type NewItem = Omit<Item, 'syncedAt'>;

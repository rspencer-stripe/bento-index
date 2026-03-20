// Database Client (Placeholder)
// For production with Vercel Postgres, this would use drizzle-orm
// For now, data is stored in IndexedDB (client) and localStorage (fallback)

import * as schema from './schema';

// Check if database would be available (for future use)
export async function isDatabaseAvailable(): Promise<boolean> {
  // In production, this would check Vercel Postgres connection
  return false;
}

// Export schema for use elsewhere
export { schema };
export type { User, Item, OAuthToken, SyncLogEntry } from './schema';

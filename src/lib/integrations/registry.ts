import { ItemSource, MindItem } from '../types';
import { AnyIntegration, Integration, IntegrationStatus, isFullIntegration, SyncResult } from './types';
import { googleCalendarIntegration } from './google-calendar';
import { slackIntegration } from './slack';

// Integration registry - single source of truth for all integrations
class IntegrationRegistry {
  private integrations = new Map<ItemSource, AnyIntegration>();

  constructor() {
    // Register built-in integrations
    this.register(googleCalendarIntegration);
    this.register(slackIntegration);
    // Add more integrations here as they're implemented
  }

  register(integration: AnyIntegration): void {
    this.integrations.set(integration.id, integration);
  }

  get(id: ItemSource): AnyIntegration | undefined {
    return this.integrations.get(id);
  }

  getAll(): AnyIntegration[] {
    return Array.from(this.integrations.values());
  }

  getConfigured(): AnyIntegration[] {
    // This would need to be async in production
    return this.getAll();
  }

  // Get status of all integrations for a user
  async getAllStatus(userId: string): Promise<Record<ItemSource, IntegrationStatus>> {
    const statuses: Record<string, IntegrationStatus> = {};
    
    for (const integration of this.integrations.values()) {
      if (isFullIntegration(integration)) {
        statuses[integration.id] = await integration.getStatus(userId);
      } else {
        statuses[integration.id] = {
          configured: await integration.isConfigured(),
          authenticated: true, // Simple integrations don't need auth
        };
      }
    }
    
    return statuses as Record<ItemSource, IntegrationStatus>;
  }

  // Sync all integrations for a user
  async syncAll(userId: string): Promise<Record<ItemSource, SyncResult>> {
    const results: Record<string, SyncResult> = {};
    
    for (const integration of this.integrations.values()) {
      if (isFullIntegration(integration)) {
        try {
          results[integration.id] = await integration.sync(userId);
        } catch (err) {
          results[integration.id] = {
            added: 0,
            updated: 0,
            deleted: 0,
            errors: [`Sync failed: ${err}`],
          };
        }
      }
    }
    
    return results as Record<ItemSource, SyncResult>;
  }

  // Fetch items from all integrations
  async fetchAll(userId: string): Promise<MindItem[]> {
    const allItems: MindItem[] = [];
    
    for (const integration of this.integrations.values()) {
      try {
        if (isFullIntegration(integration)) {
          const status = await integration.getStatus(userId);
          if (status.configured && status.authenticated) {
            const result = await integration.fetch(userId, { limit: 50 });
            const items = result.items.map(raw => integration.transform(raw, userId));
            allItems.push(...items);
          }
        } else {
          // Simple integration
          const configured = await integration.isConfigured();
          if (configured) {
            const items = await integration.getItems(userId);
            allItems.push(...items);
          }
        }
      } catch (err) {
        console.error(`Failed to fetch from ${integration.id}:`, err);
      }
    }
    
    return allItems;
  }
}

// Export singleton registry
export const integrationRegistry = new IntegrationRegistry();

// Convenience exports
export { googleCalendarIntegration } from './google-calendar';
export { slackIntegration } from './slack';

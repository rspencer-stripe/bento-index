import { z } from 'zod';
import { MindItem, ItemSource } from '../types';
import { 
  Integration, 
  FetchOptions, 
  FetchResult, 
  SyncResult, 
  IntegrationStatus,
  OAuthConfig 
} from './types';

// Abstract base class for integrations
export abstract class BaseIntegration<TRawData, TConfig> implements Integration<TRawData, TConfig> {
  abstract readonly id: ItemSource;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly icon: string;
  abstract readonly color: string;
  abstract readonly configSchema: z.ZodSchema<TConfig>;
  abstract readonly oauth?: OAuthConfig;

  // Default implementations - can be overridden
  
  async isConfigured(): Promise<boolean> {
    // Check if required environment variables are set
    if (this.oauth) {
      const clientId = process.env[this.oauth.clientIdEnvVar];
      const clientSecret = process.env[this.oauth.clientSecretEnvVar];
      return !!(clientId && clientSecret);
    }
    return true;
  }

  async isAuthenticated(userId: string): Promise<boolean> {
    // Default: check if we have a token for this user
    // In production, this would check the database
    const token = await this.getAccessToken(userId);
    return !!token;
  }

  async getStatus(userId: string): Promise<IntegrationStatus> {
    const configured = await this.isConfigured();
    const authenticated = configured ? await this.isAuthenticated(userId) : false;
    
    return {
      configured,
      authenticated,
      lastSyncAt: undefined, // Would come from sync_log table
      itemCount: undefined,  // Would come from items count
    };
  }

  // Abstract methods - must be implemented by subclasses
  abstract fetch(userId: string, options?: FetchOptions): Promise<FetchResult<TRawData>>;
  abstract transform(raw: TRawData, userId: string): MindItem;

  // Default sync implementation
  async sync(userId: string, options?: FetchOptions): Promise<SyncResult> {
    const result: SyncResult = { added: 0, updated: 0, deleted: 0, errors: [] };
    
    try {
      let cursor: string | undefined;
      let hasMore = true;
      
      while (hasMore) {
        const fetchResult = await this.fetch(userId, { ...options, cursor });
        
        for (const raw of fetchResult.items) {
          try {
            const item = this.transform(raw, userId);
            // In production, this would upsert to database
            result.added++;
          } catch (err) {
            result.errors.push(`Failed to transform item: ${err}`);
          }
        }
        
        cursor = fetchResult.nextCursor;
        hasMore = fetchResult.hasMore;
      }
    } catch (err) {
      result.errors.push(`Sync failed: ${err}`);
    }
    
    return result;
  }

  // Helper methods
  
  protected async getAccessToken(userId: string): Promise<string | null> {
    // Check environment variable first (for simple single-user setup)
    const envToken = this.getEnvToken();
    if (envToken) return envToken;
    
    // In production, would fetch from oauth_tokens table
    // For now, return null
    return null;
  }

  protected getEnvToken(): string | null {
    // Override in subclasses to specify the env var name
    return null;
  }

  protected generateItemId(sourceId: string): string {
    return `${this.id}-${sourceId}`;
  }
}

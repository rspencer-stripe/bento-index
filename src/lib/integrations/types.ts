import { z } from 'zod';
import { MindItem, ItemSource } from '../types';

// OAuth configuration for an integration
export interface OAuthConfig {
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnvVar: string;
  clientSecretEnvVar: string;
}

// Fetch options for integration data
export interface FetchOptions {
  since?: Date;        // For delta sync
  limit?: number;      // Max items to fetch
  cursor?: string;     // Pagination cursor
}

// Result of a fetch operation
export interface FetchResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

// Sync result
export interface SyncResult {
  added: number;
  updated: number;
  deleted: number;
  errors: string[];
}

// Webhook configuration
export interface WebhookConfig {
  endpoint: string;
  secret?: string;
  events: string[];
}

// Integration status
export interface IntegrationStatus {
  configured: boolean;
  authenticated: boolean;
  lastSyncAt?: Date;
  lastError?: string;
  itemCount?: number;
}

// Base integration interface - all integrations implement this
export interface Integration<TRawData = unknown, TConfig = unknown> {
  // Identity
  readonly id: ItemSource;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly color: string;

  // Configuration schema (validated with Zod)
  readonly configSchema: z.ZodSchema<TConfig>;
  
  // OAuth configuration (if applicable)
  readonly oauth?: OAuthConfig;

  // Check if the integration is configured (has required env vars / tokens)
  isConfigured(): Promise<boolean>;
  
  // Check if user is authenticated (has valid token)
  isAuthenticated(userId: string): Promise<boolean>;
  
  // Get integration status
  getStatus(userId: string): Promise<IntegrationStatus>;

  // Fetch raw data from the source
  fetch(userId: string, options?: FetchOptions): Promise<FetchResult<TRawData>>;
  
  // Transform raw data to MindItem
  transform(raw: TRawData, userId: string): MindItem;
  
  // Full sync - fetch all and transform
  sync(userId: string, options?: FetchOptions): Promise<SyncResult>;

  // Webhook handling (optional)
  setupWebhook?(userId: string, config: WebhookConfig): Promise<void>;
  handleWebhook?(payload: unknown, signature?: string): Promise<MindItem[]>;
  
  // Cleanup (optional) - called when user disconnects
  disconnect?(userId: string): Promise<void>;
}

// Partial integration for simpler cases (demo data, manual input)
export interface SimpleIntegration {
  readonly id: ItemSource;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly color: string;
  
  isConfigured(): Promise<boolean>;
  getItems(userId: string): Promise<MindItem[]>;
}

// Union type for registry
export type AnyIntegration = Integration | SimpleIntegration;

// Type guard
export function isFullIntegration(integration: AnyIntegration): integration is Integration {
  return 'fetch' in integration && 'transform' in integration;
}

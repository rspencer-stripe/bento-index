import { z } from 'zod';
import { MindItem, SlackMeta } from '../types';
import { BaseIntegration } from './base';
import { FetchOptions, FetchResult, OAuthConfig } from './types';

// Slack message structure
interface SlackMessage {
  ts: string;
  text: string;
  user?: string;
  username?: string;
  channel?: { id: string; name: string };
  permalink?: string;
  iid?: string;
}

// Configuration schema
const configSchema = z.object({
  searchQueries: z.array(z.string()).default(['to:me', 'from:me has:reaction']),
  maxResults: z.number().default(50),
});

type SlackConfig = z.infer<typeof configSchema>;

export class SlackIntegration extends BaseIntegration<SlackMessage, SlackConfig> {
  readonly id = 'slack' as const;
  readonly name = 'Slack';
  readonly description = 'Import messages and threads';
  readonly icon = 'MessageSquare';
  readonly color = '#E01E5A';
  readonly configSchema = configSchema;
  
  readonly oauth: OAuthConfig = {
    authorizationUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scopes: [
      'channels:read',
      'channels:history',
      'search:read',
      'users:read',
      'im:read',
      'im:history',
    ],
    clientIdEnvVar: 'SLACK_CLIENT_ID',
    clientSecretEnvVar: 'SLACK_CLIENT_SECRET',
  };

  protected getEnvToken(): string | null {
    return process.env.SLACK_BOT_TOKEN || process.env.SLACK_USER_TOKEN || null;
  }

  async fetch(userId: string, options?: FetchOptions): Promise<FetchResult<SlackMessage>> {
    const token = await this.getAccessToken(userId);
    if (!token) {
      return { items: [], hasMore: false };
    }

    const config = this.configSchema.parse({});
    const allMessages: SlackMessage[] = [];
    
    // Run multiple search queries
    for (const query of config.searchQueries) {
      try {
        const messages = await this.searchMessages(token, query, options);
        allMessages.push(...messages);
      } catch (err) {
        console.error(`Slack search failed for query "${query}":`, err);
      }
    }
    
    // Deduplicate by timestamp
    const uniqueMessages = Array.from(
      new Map(allMessages.map(m => [m.ts, m])).values()
    );
    
    // Sort by timestamp (most recent first)
    uniqueMessages.sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts));
    
    return {
      items: uniqueMessages.slice(0, config.maxResults),
      hasMore: false, // Simplified - no pagination for now
    };
  }

  private async searchMessages(
    token: string, 
    query: string, 
    options?: FetchOptions
  ): Promise<SlackMessage[]> {
    const params = new URLSearchParams({
      query,
      count: '20',
      sort: 'timestamp',
      sort_dir: 'desc',
    });

    const response = await fetch('https://slack.com/api/search.messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    return data.messages?.matches || [];
  }

  transform(message: SlackMessage, userId: string): MindItem {
    const text = message.text || '';
    const timestamp = new Date(parseFloat(message.ts) * 1000).toISOString();
    
    // Detect urgency patterns
    const hasWaitingLanguage = /waiting on|blocked by|need.*from|can you|please review|your thoughts/i.test(text);
    const hasQuestion = text.includes('?');
    const hasCommitment = /I'll|I will|let me|I can/i.test(text);
    
    // Determine priority
    let priority: 1 | 2 | 3 | 4 | 5 = 3;
    if (hasWaitingLanguage) priority = 5;
    else if (hasQuestion) priority = 4;
    else if (hasCommitment) priority = 4;
    
    // Extract tag from channel
    const channelName = message.channel?.name || 'dm';
    const tag = this.extractTag(channelName);

    const meta: SlackMeta = {
      coreAsk: hasQuestion ? text.split('?')[0] + '?' : text.slice(0, 100),
      collaborator: { 
        name: message.username || message.user || 'unknown',
      },
      threadUrl: message.permalink || `https://slack.com/archives/${message.channel?.id}/p${message.ts.replace('.', '')}`,
      channel: `#${channelName}`,
    };

    return {
      id: this.generateItemId(message.ts),
      tag,
      type: 'note',
      priority,
      title: this.extractTitle(text),
      snippet: text.slice(0, 200),
      source: 'slack',
      sourceMeta: { source: 'slack', meta },
      createdAt: timestamp,
      lastTouchedAt: timestamp,
    };
  }

  private extractTag(channelName: string): string {
    if (/radar/i.test(channelName)) return '#Radar';
    if (/disputes?/i.test(channelName)) return '#Disputes';
    if (/terminal/i.test(channelName)) return '#Terminal';
    if (/payintel|payment/i.test(channelName)) return '#PayIntel';
    if (/design/i.test(channelName)) return '#Design';
    if (/link/i.test(channelName)) return '#Link';
    return '#Slack';
  }

  private extractTitle(text: string): string {
    if (!text) return 'Untitled';
    // Take first line, clean up mentions and emoji codes
    const firstLine = text.split('\n')[0]
      .replace(/<@[A-Z0-9]+>/g, '')  // Remove user mentions
      .replace(/:[a-z_]+:/g, '')      // Remove emoji codes
      .replace(/<[^>]+>/g, '')        // Remove other Slack formatting
      .trim();
    return firstLine.length > 60 ? firstLine.slice(0, 57) + '...' : firstLine || 'Message';
  }
}

// Export singleton instance
export const slackIntegration = new SlackIntegration();

import { z } from 'zod';
import { MindItem, CalendarMeta } from '../types';
import { BaseIntegration } from './base';
import { FetchOptions, FetchResult, OAuthConfig } from './types';

// Google Calendar event structure
interface GoogleCalendarEvent {
  id: string;
  status: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: Array<{ email: string; displayName?: string; responseStatus?: string }>;
  hangoutLink?: string;
  location?: string;
  created?: string;
  updated?: string;
  recurringEventId?: string;
  htmlLink?: string;
}

// Configuration schema
const configSchema = z.object({
  calendarId: z.string().default('primary'),
  syncDaysBack: z.number().default(7),
  syncDaysForward: z.number().default(14),
});

type GoogleCalendarConfig = z.infer<typeof configSchema>;

export class GoogleCalendarIntegration extends BaseIntegration<GoogleCalendarEvent, GoogleCalendarConfig> {
  readonly id = 'calendar' as const;
  readonly name = 'Google Calendar';
  readonly description = 'Import your meetings and schedule';
  readonly icon = 'Calendar';
  readonly color = '#34A853';
  readonly configSchema = configSchema;
  
  readonly oauth: OAuthConfig = {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly',
    ],
    clientIdEnvVar: 'GOOGLE_CLIENT_ID',
    clientSecretEnvVar: 'GOOGLE_CLIENT_SECRET',
  };

  protected getEnvToken(): string | null {
    return process.env.GOOGLE_ACCESS_TOKEN || null;
  }

  async fetch(userId: string, options?: FetchOptions): Promise<FetchResult<GoogleCalendarEvent>> {
    const token = await this.getAccessToken(userId);
    if (!token) {
      return { items: [], hasMore: false };
    }

    const config = this.configSchema.parse({});
    const now = new Date();
    
    // Calculate time range
    const timeMin = options?.since || new Date(now.getTime() - config.syncDaysBack * 24 * 60 * 60 * 1000);
    const timeMax = new Date(now.getTime() + config.syncDaysForward * 24 * 60 * 60 * 1000);
    
    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: String(options?.limit || 100),
    });
    
    if (options?.cursor) {
      params.set('pageToken', options.cursor);
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${config.calendarId}/events?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Calendar API error: ${error}`);
    }

    const data = await response.json();
    const events = (data.items || []).filter(
      (event: GoogleCalendarEvent) => event.status !== 'cancelled'
    );

    return {
      items: events,
      nextCursor: data.nextPageToken,
      hasMore: !!data.nextPageToken,
    };
  }

  transform(event: GoogleCalendarEvent, userId: string): MindItem {
    const startTime = event.start?.dateTime || event.start?.date || new Date().toISOString();
    const endTime = event.end?.dateTime || event.end?.date || new Date().toISOString();
    
    // Determine event type based on attendees
    const attendeeCount = event.attendees?.length || 0;
    const eventType = attendeeCount <= 2 ? 'oneOnOne' : attendeeCount <= 5 ? 'standup' : 'allHands';
    
    // Extract tag from summary
    const tag = this.extractTag(event.summary || '');
    
    // Extract zoom/meet link
    const zoomLink = this.extractMeetingLink(event);

    const meta: CalendarMeta = {
      eventType: eventType as CalendarMeta['eventType'],
      startsAt: startTime,
      endsAt: endTime,
      tetheredArtifacts: [],
      attendees: (event.attendees || []).map(a => ({
        name: a.email,
        avatarUrl: undefined,
      })),
    };

    // Add zoom link to meta if found
    if (zoomLink) {
      (meta as CalendarMeta & { zoomLink?: string }).zoomLink = zoomLink;
    }

    return {
      id: this.generateItemId(event.id),
      tag,
      type: 'event',
      priority: 4,
      title: event.summary || 'Untitled Event',
      snippet: event.description?.slice(0, 200) || '',
      source: 'calendar',
      sourceMeta: { source: 'calendar', meta },
      createdAt: event.created || new Date().toISOString(),
      lastTouchedAt: event.updated || new Date().toISOString(),
    };
  }

  private extractTag(summary: string): string {
    // Look for hashtags
    const hashtagMatch = summary.match(/#\w+/);
    if (hashtagMatch) return hashtagMatch[0];
    
    // Common project keywords
    if (/radar/i.test(summary)) return '#Radar';
    if (/disputes?/i.test(summary)) return '#Disputes';
    if (/terminal/i.test(summary)) return '#Terminal';
    if (/payintel|payment.*intel/i.test(summary)) return '#PayIntel';
    if (/link/i.test(summary)) return '#Link';
    
    return '#Calendar';
  }

  private extractMeetingLink(event: GoogleCalendarEvent): string | undefined {
    // Check hangout link first
    if (event.hangoutLink) return event.hangoutLink;
    
    // Check description for Zoom link
    const text = `${event.description || ''} ${event.location || ''}`;
    const zoomMatch = text.match(/https:\/\/[a-z]*\.?zoom\.us\/j\/\d+/);
    if (zoomMatch) return zoomMatch[0];
    
    // Check for Google Meet
    const meetMatch = text.match(/https:\/\/meet\.google\.com\/[a-z-]+/);
    if (meetMatch) return meetMatch[0];
    
    return undefined;
  }
}

// Export singleton instance
export const googleCalendarIntegration = new GoogleCalendarIntegration();

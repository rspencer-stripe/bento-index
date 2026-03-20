import { NextResponse } from 'next/server';
import { MindItem } from '@/lib/types';

// Fetch calendar events from Google Calendar API
export async function GET() {
  const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
  
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Google Calendar not configured. Set GOOGLE_ACCESS_TOKEN in .env.local' },
      { status: 503 }
    );
  }

  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    
    const params = new URLSearchParams({
      timeMin: startOfDay.toISOString(),
      timeMax: endOfWeek.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '50',
    });
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Calendar API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch calendar events' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    const events: MindItem[] = (data.items || [])
      .filter((event: GoogleCalendarEvent) => event.status !== 'cancelled')
      .map(transformCalendarEvent);
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

interface GoogleCalendarEvent {
  id: string;
  status: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: Array<{ email: string; displayName?: string }>;
  hangoutLink?: string;
  location?: string;
  created?: string;
  updated?: string;
}

function transformCalendarEvent(event: GoogleCalendarEvent): MindItem {
  const startTime = event.start?.dateTime || event.start?.date || new Date().toISOString();
  const endTime = event.end?.dateTime || event.end?.date || new Date().toISOString();
  
  // Extract zoom link from description or location
  const zoomLink = extractZoomLink(event.description || event.location || event.hangoutLink || '');
  
  // Determine event type based on attendee count
  const attendeeCount = event.attendees?.length || 0;
  const eventType = attendeeCount <= 2 ? 'oneOnOne' : attendeeCount <= 5 ? 'standup' : 'allHands';
  
  // Extract project tag from summary or default
  const tag = extractTag(event.summary || '');
  
  return {
    id: `cal-${event.id}`,
    tag,
    type: 'event',
    priority: 4,
    title: event.summary || 'Untitled Event',
    snippet: event.description?.slice(0, 150) || '',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType,
        startsAt: startTime,
        endsAt: endTime,
        tetheredArtifacts: [],
        attendees: (event.attendees || []).map(a => ({ name: a.email })),
        zoomLink,
      },
    },
    createdAt: event.created || new Date().toISOString(),
    lastTouchedAt: event.updated || new Date().toISOString(),
  };
}

function extractZoomLink(text: string): string | undefined {
  const zoomMatch = text.match(/https:\/\/[a-z]*\.?zoom\.us\/j\/\d+/);
  return zoomMatch?.[0];
}

function extractTag(summary: string): string {
  // Look for hashtags or common project names
  const hashtagMatch = summary.match(/#\w+/);
  if (hashtagMatch) return hashtagMatch[0];
  
  // Common project keywords
  if (/radar/i.test(summary)) return '#Radar';
  if (/disputes?/i.test(summary)) return '#Disputes';
  if (/terminal/i.test(summary)) return '#Terminal';
  if (/payintel|payment.*intel/i.test(summary)) return '#PayIntel';
  
  return '#Calendar';
}

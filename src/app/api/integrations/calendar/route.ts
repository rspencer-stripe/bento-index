import { NextResponse } from 'next/server';
import { MindItem } from '@/lib/types';

// Fetch calendar events from Google Calendar API
// This is a placeholder - implement with actual Google Calendar OAuth flow
export async function GET() {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Google Calendar not configured' },
      { status: 503 }
    );
  }

  try {
    // TODO: Implement actual Google Calendar API call
    // 1. Get user's OAuth token from session/cookies
    // 2. Call Google Calendar API
    // 3. Transform response to MindItem format
    
    const events: MindItem[] = [];
    
    // Example transformation (uncomment when implementing):
    // const response = await fetch(
    //   `https://www.googleapis.com/calendar/v3/calendars/primary/events?...`,
    //   { headers: { Authorization: `Bearer ${accessToken}` } }
    // );
    // const data = await response.json();
    // events = data.items.map(transformCalendarEvent);
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

// Transform Google Calendar event to MindItem
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformCalendarEvent(event: any): MindItem {
  return {
    id: `cal-${event.id}`,
    tag: '#Calendar',
    type: 'event',
    priority: 4,
    title: event.summary || 'Untitled Event',
    snippet: event.description?.slice(0, 100) || '',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: event.recurringEventId ? 'recurring' : 'oneTime',
        startsAt: event.start?.dateTime || event.start?.date,
        endsAt: event.end?.dateTime || event.end?.date,
        tetheredArtifacts: [],
        attendees: (event.attendees || []).map((a: { email: string }) => ({ name: a.email })),
        zoomLink: extractZoomLink(event.description || event.location || ''),
      },
    },
    createdAt: event.created,
    lastTouchedAt: event.updated,
  };
}

function extractZoomLink(text: string): string | undefined {
  const zoomMatch = text.match(/https:\/\/[a-z]*\.?zoom\.us\/j\/\d+/);
  return zoomMatch?.[0];
}

// Suppress unused variable warning
void transformCalendarEvent;

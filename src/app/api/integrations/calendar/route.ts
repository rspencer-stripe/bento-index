import { NextResponse } from 'next/server';
import { googleCalendarIntegration } from '@/lib/integrations';

export async function GET() {
  try {
    // Check if integration is configured
    const isConfigured = await googleCalendarIntegration.isConfigured();
    const isAuthenticated = await googleCalendarIntegration.isAuthenticated('default');
    
    if (!isConfigured || !isAuthenticated) {
      return NextResponse.json(
        { 
          error: 'Google Calendar not configured',
          configured: isConfigured,
          authenticated: isAuthenticated,
        },
        { status: 401 }
      );
    }
    
    // Fetch and transform calendar events
    const result = await googleCalendarIntegration.fetch('default', { limit: 50 });
    const items = result.items.map(event => 
      googleCalendarIntegration.transform(event, 'default')
    );
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

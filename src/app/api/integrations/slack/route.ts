import { NextResponse } from 'next/server';
import { slackIntegration } from '@/lib/integrations';

export async function GET() {
  try {
    // Check if integration is configured
    const isConfigured = await slackIntegration.isConfigured();
    const isAuthenticated = await slackIntegration.isAuthenticated('default');
    
    if (!isConfigured || !isAuthenticated) {
      return NextResponse.json(
        { 
          error: 'Slack not configured',
          configured: isConfigured,
          authenticated: isAuthenticated,
        },
        { status: 401 }
      );
    }
    
    // Fetch and transform slack messages
    const result = await slackIntegration.fetch('default', { limit: 50 });
    const items = result.items.map(message => 
      slackIntegration.transform(message, 'default')
    );
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to fetch Slack messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Slack messages' },
      { status: 500 }
    );
  }
}

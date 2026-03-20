import { NextResponse } from 'next/server';
import { MindItem } from '@/lib/types';

// Fetch Slack messages from Slack API
export async function GET() {
  const slackToken = process.env.SLACK_BOT_TOKEN;
  
  if (!slackToken) {
    return NextResponse.json(
      { error: 'Slack not configured' },
      { status: 503 }
    );
  }

  try {
    // Search for recent messages where user is mentioned or in DMs
    const messages: MindItem[] = [];
    
    // TODO: Implement actual Slack API calls
    // 1. Use conversations.list to get user's channels
    // 2. Use search.messages to find relevant messages
    // 3. Transform to MindItem format
    
    // Example:
    // const response = await fetch('https://slack.com/api/search.messages', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${slackToken}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     query: 'to:me OR from:me',
    //     count: 50,
    //     sort: 'timestamp',
    //   }),
    // });
    // const data = await response.json();
    // messages = data.messages.matches.map(transformSlackMessage);
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Slack API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Slack messages' },
      { status: 500 }
    );
  }
}

// Transform Slack message to MindItem
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformSlackMessage(message: any, channelName: string): MindItem {
  const hasQuestion = message.text?.includes('?');
  const hasWaitingLanguage = /waiting on|blocked by|need.*from|can you/i.test(message.text || '');
  
  return {
    id: `slack-${message.ts}`,
    tag: `#${channelName}`,
    type: 'note',
    priority: hasWaitingLanguage ? 5 : hasQuestion ? 4 : 3,
    title: extractTitle(message.text),
    snippet: message.text?.slice(0, 200) || '',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: hasQuestion ? message.text?.split('?')[0] + '?' : undefined,
        collaborator: { name: message.username || message.user },
        threadUrl: `https://slack.com/archives/${message.channel}/p${message.ts.replace('.', '')}`,
        channel: channelName,
      },
    },
    createdAt: new Date(parseFloat(message.ts) * 1000).toISOString(),
    lastTouchedAt: new Date(parseFloat(message.ts) * 1000).toISOString(),
  };
}

function extractTitle(text: string): string {
  if (!text) return 'Untitled';
  const firstLine = text.split('\n')[0];
  return firstLine.length > 60 ? firstLine.slice(0, 57) + '...' : firstLine;
}

// Suppress unused variable warning
void transformSlackMessage;

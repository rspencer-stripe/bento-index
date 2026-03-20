import { NextResponse } from 'next/server';
import { MindItem } from '@/lib/types';

// Fetch Slack messages using Slack API
export async function GET() {
  const slackToken = process.env.SLACK_BOT_TOKEN || process.env.SLACK_USER_TOKEN;
  
  if (!slackToken) {
    return NextResponse.json(
      { error: 'Slack not configured. Set SLACK_BOT_TOKEN or SLACK_USER_TOKEN in .env.local' },
      { status: 503 }
    );
  }

  try {
    // Search for messages mentioning the user or with high engagement
    const queries = [
      'to:me',           // Messages directed to me
      'from:me has:reaction', // My messages with reactions
      'in:my-dm',        // Direct messages
    ];
    
    const allMessages: MindItem[] = [];
    
    for (const query of queries) {
      const response = await fetch('https://slack.com/api/search.messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${slackToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          query,
          count: '20',
          sort: 'timestamp',
          sort_dir: 'desc',
        }),
      });
      
      if (!response.ok) continue;
      
      const data = await response.json();
      if (!data.ok || !data.messages?.matches) continue;
      
      const messages = data.messages.matches.map((msg: SlackMessage) => 
        transformSlackMessage(msg)
      );
      allMessages.push(...messages);
    }
    
    // Deduplicate by ID
    const uniqueMessages = Array.from(
      new Map(allMessages.map(m => [m.id, m])).values()
    );
    
    // Sort by most recent
    uniqueMessages.sort((a, b) => 
      new Date(b.lastTouchedAt).getTime() - new Date(a.lastTouchedAt).getTime()
    );
    
    return NextResponse.json(uniqueMessages.slice(0, 30));
  } catch (error) {
    console.error('Slack API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Slack messages' },
      { status: 500 }
    );
  }
}

interface SlackMessage {
  ts: string;
  text: string;
  user?: string;
  username?: string;
  channel?: { id: string; name: string };
  permalink?: string;
}

function transformSlackMessage(message: SlackMessage): MindItem {
  const text = message.text || '';
  const timestamp = new Date(parseFloat(message.ts) * 1000).toISOString();
  
  // Detect if someone is waiting on user
  const hasWaitingLanguage = /waiting on|blocked by|need.*from|can you|please review|your thoughts/i.test(text);
  const hasQuestion = text.includes('?');
  const hasCommitment = /I'll|I will|let me|I can/i.test(text);
  
  // Determine priority
  let priority = 3;
  if (hasWaitingLanguage) priority = 5;
  else if (hasQuestion) priority = 4;
  else if (hasCommitment) priority = 4;
  
  // Extract tag from channel name
  const channelName = message.channel?.name || 'dm';
  const tag = extractTagFromChannel(channelName);
  
  return {
    id: `slack-${message.ts}`,
    tag,
    type: 'note',
    priority,
    title: extractTitle(text),
    snippet: text.slice(0, 200),
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: hasQuestion ? text.split('?')[0] + '?' : undefined,
        collaborator: { name: message.username || message.user || 'unknown' },
        threadUrl: message.permalink || `https://slack.com/archives/${message.channel?.id}/p${message.ts.replace('.', '')}`,
        channel: `#${channelName}`,
      },
    },
    createdAt: timestamp,
    lastTouchedAt: timestamp,
  };
}

function extractTitle(text: string): string {
  if (!text) return 'Untitled';
  // Take first line, clean up mentions and emojis
  const firstLine = text.split('\n')[0]
    .replace(/<@[A-Z0-9]+>/g, '') // Remove user mentions
    .replace(/:[a-z_]+:/g, '')    // Remove emoji codes
    .trim();
  return firstLine.length > 60 ? firstLine.slice(0, 57) + '...' : firstLine;
}

function extractTagFromChannel(channelName: string): string {
  if (/radar/i.test(channelName)) return '#Radar';
  if (/disputes?/i.test(channelName)) return '#Disputes';
  if (/terminal/i.test(channelName)) return '#Terminal';
  if (/payintel|payment/i.test(channelName)) return '#PayIntel';
  if (/design/i.test(channelName)) return '#Design';
  return '#Slack';
}

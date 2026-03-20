import { NextResponse } from 'next/server';

// Check which integrations are configured
export async function GET() {
  // In production, check for valid OAuth tokens or API keys
  const status = {
    calendar: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    slack: !!process.env.SLACK_BOT_TOKEN,
    drive: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    figma: !!process.env.FIGMA_ACCESS_TOKEN,
  };

  return NextResponse.json(status);
}

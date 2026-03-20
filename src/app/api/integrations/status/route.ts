import { NextResponse } from 'next/server';

// Check which integrations are configured
export async function GET() {
  const status = {
    calendar: !!process.env.GOOGLE_ACCESS_TOKEN,
    slack: !!process.env.SLACK_BOT_TOKEN || !!process.env.SLACK_USER_TOKEN,
    drive: !!process.env.GOOGLE_ACCESS_TOKEN,
    figma: !!process.env.FIGMA_ACCESS_TOKEN,
  };

  return NextResponse.json(status);
}

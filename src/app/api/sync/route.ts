import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { fetchCalendarEvents, fetchDriveFiles } from '@/lib/services/google';
import { fetchSlackMessages } from '@/lib/services/slack';
import { prisma } from '@/lib/db/prisma';
import { liveItems } from '@/lib/liveData';
import { MindItem } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const mode = body.mode || 'live';
    
    if (mode === 'demo') {
      return NextResponse.json({
        success: true,
        mode: 'demo',
        items: liveItems,
        syncedAt: new Date().toISOString(),
      });
    }

    // Live mode - requires authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      // Fall back to demo data for unauthenticated users
      return NextResponse.json({
        success: true,
        mode: 'demo',
        items: liveItems,
        syncedAt: new Date().toISOString(),
        message: 'Sign in to access your live data',
      });
    }

    const userId = session.user.id;

    // Log sync start
    await prisma.syncLog.create({
      data: {
        userId,
        provider: 'all',
        status: 'started',
      },
    });

    // Fetch from all connected integrations in parallel
    const results: Record<string, { count: number; error?: string }> = {};
    
    const [calendarEvents, driveFiles, slackMessages] = await Promise.all([
      fetchCalendarEvents(userId)
        .then((items) => {
          results.calendar = { count: items.length };
          return items;
        })
        .catch((e) => {
          results.calendar = { count: 0, error: e.message };
          return [];
        }),
      fetchDriveFiles(userId)
        .then((items) => {
          results.drive = { count: items.length };
          return items;
        })
        .catch((e) => {
          results.drive = { count: 0, error: e.message };
          return [];
        }),
      fetchSlackMessages(userId)
        .then((items) => {
          results.slack = { count: items.length };
          return items;
        })
        .catch((e) => {
          results.slack = { count: 0, error: e.message };
          return [];
        }),
    ]);

    const items: MindItem[] = [
      ...calendarEvents,
      ...driveFiles,
      ...slackMessages,
    ];

    // Sort by time (calendar by start time, others by lastTouched)
    items.sort((a, b) => {
      const getTime = (item: MindItem) => {
        if (item.source === 'calendar' && item.sourceMeta?.meta) {
          const meta = item.sourceMeta.meta as { startsAt?: string };
          if (meta.startsAt) return new Date(meta.startsAt).getTime();
        }
        return new Date(item.lastTouchedAt || item.createdAt).getTime();
      };
      return getTime(b) - getTime(a);
    });

    // Log successful sync
    await prisma.syncLog.create({
      data: {
        userId,
        provider: 'all',
        status: 'completed',
        itemCount: items.length,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      mode: 'live',
      items,
      results,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json(
      { success: false, error: 'Sync failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({
      authenticated: false,
      integrations: {
        google: { connected: false },
        slack: { connected: false },
      },
    });
  }

  const userId = session.user.id;

  // Get connection status for each integration
  const connections = await prisma.integrationConnection.findMany({
    where: { userId },
    select: {
      provider: true,
      lastSyncAt: true,
      syncStatus: true,
    },
  });

  const integrations: Record<string, { connected: boolean; lastSyncAt?: Date | null; status?: string }> = {
    google: { connected: false },
    slack: { connected: false },
  };

  for (const conn of connections) {
    integrations[conn.provider] = {
      connected: true,
      lastSyncAt: conn.lastSyncAt,
      status: conn.syncStatus,
    };
  }

  // Get last sync log
  const lastSync = await prisma.syncLog.findFirst({
    where: { userId, status: 'completed' },
    orderBy: { completedAt: 'desc' },
  });

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
    integrations,
    lastSync: lastSync?.completedAt,
  });
}

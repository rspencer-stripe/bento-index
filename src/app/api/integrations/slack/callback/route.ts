import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { exchangeSlackCode } from '@/lib/services/slack';
import { prisma } from '@/lib/db/prisma';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/auth/signin', process.env.NEXTAUTH_URL));
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('Slack OAuth error:', error);
    return NextResponse.redirect(
      new URL('/settings?error=slack_denied', process.env.NEXTAUTH_URL)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/settings?error=slack_invalid', process.env.NEXTAUTH_URL)
    );
  }

  // Verify state
  const cookieStore = await cookies();
  const storedState = cookieStore.get('slack_oauth_state')?.value;
  
  if (state !== storedState) {
    return NextResponse.redirect(
      new URL('/settings?error=slack_state_mismatch', process.env.NEXTAUTH_URL)
    );
  }

  // Clear the state cookie
  cookieStore.delete('slack_oauth_state');

  try {
    const { accessToken, teamId, teamName } = await exchangeSlackCode(code);

    // Store the Slack connection
    await prisma.integrationConnection.upsert({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: 'slack',
        },
      },
      update: {
        accessToken,
        metadata: { teamId, teamName },
        lastSyncAt: null,
        syncStatus: 'idle',
      },
      create: {
        userId: session.user.id,
        provider: 'slack',
        accessToken,
        metadata: { teamId, teamName },
      },
    });

    return NextResponse.redirect(
      new URL('/settings?success=slack_connected', process.env.NEXTAUTH_URL)
    );
  } catch (error) {
    console.error('Slack OAuth exchange error:', error);
    return NextResponse.redirect(
      new URL('/settings?error=slack_exchange_failed', process.env.NEXTAUTH_URL)
    );
  }
}

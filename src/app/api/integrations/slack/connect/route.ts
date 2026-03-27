import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { getSlackAuthUrl } from '@/lib/services/slack';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/auth/signin', process.env.NEXTAUTH_URL));
  }

  // Generate state for CSRF protection
  const state = randomBytes(32).toString('hex');
  
  // Store state in cookie
  const cookieStore = await cookies();
  cookieStore.set('slack_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  });

  const authUrl = getSlackAuthUrl(state);
  
  return NextResponse.redirect(authUrl);
}

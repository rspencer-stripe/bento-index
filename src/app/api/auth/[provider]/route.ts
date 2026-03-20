import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl, isProviderConfigured } from '@/lib/auth/providers';
import { randomBytes } from 'crypto';

// GET /api/auth/[provider] - Start OAuth flow
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  
  // Check if provider is configured
  if (!isProviderConfigured(provider)) {
    return NextResponse.json(
      { error: `Provider ${provider} is not configured` },
      { status: 400 }
    );
  }
  
  // Generate state for CSRF protection
  const state = randomBytes(16).toString('hex');
  
  // Get redirect URI
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/${provider}/callback`;
  
  try {
    const authUrl = getAuthorizationUrl(provider, redirectUri, state);
    
    // Set state cookie for verification
    const response = NextResponse.redirect(authUrl);
    response.cookies.set(`oauth_state_${provider}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });
    
    return response;
  } catch (error) {
    console.error(`OAuth init failed for ${provider}:`, error);
    return NextResponse.json(
      { error: 'Failed to initialize OAuth flow' },
      { status: 500 }
    );
  }
}

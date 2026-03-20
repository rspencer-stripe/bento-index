import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/auth/providers';

// GET /api/auth/[provider]/callback - Handle OAuth callback
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const searchParams = request.nextUrl.searchParams;
  
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  // Check for OAuth errors
  if (error) {
    const errorDescription = searchParams.get('error_description') || error;
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(errorDescription)}`, request.url)
    );
  }
  
  // Verify state
  const storedState = request.cookies.get(`oauth_state_${provider}`)?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(
      new URL('/settings?error=Invalid+state', request.url)
    );
  }
  
  // Exchange code for tokens
  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?error=No+authorization+code', request.url)
    );
  }
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/${provider}/callback`;
    
    const tokens = await exchangeCodeForTokens(provider, code, redirectUri);
    
    // In production, store tokens securely in database
    // For now, we'll store in a cookie (NOT recommended for production)
    // This is just for demo/development purposes
    
    const response = NextResponse.redirect(
      new URL(`/settings?success=${provider}+connected`, request.url)
    );
    
    // Clear state cookie
    response.cookies.delete(`oauth_state_${provider}`);
    
    // Store token info (in production, store in database)
    // For development, we'll just log success
    console.log(`Successfully connected ${provider}`, {
      tokenType: tokens.tokenType,
      expiresIn: tokens.expiresIn,
      hasRefreshToken: !!tokens.refreshToken,
    });
    
    return response;
  } catch (error) {
    console.error(`OAuth callback failed for ${provider}:`, error);
    return NextResponse.redirect(
      new URL(`/settings?error=Token+exchange+failed`, request.url)
    );
  }
}

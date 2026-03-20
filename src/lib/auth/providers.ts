// OAuth provider configurations
// In production, these would be fully implemented with NextAuth.js or similar

export interface OAuthProvider {
  id: string;
  name: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnvVar: string;
  clientSecretEnvVar: string;
}

export const providers: Record<string, OAuthProvider> = {
  google: {
    id: 'google',
    name: 'Google',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'openid',
      'email',
      'profile',
    ],
    clientIdEnvVar: 'GOOGLE_CLIENT_ID',
    clientSecretEnvVar: 'GOOGLE_CLIENT_SECRET',
  },
  
  slack: {
    id: 'slack',
    name: 'Slack',
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scopes: [
      'channels:read',
      'channels:history',
      'search:read',
      'users:read',
      'im:read',
      'im:history',
    ],
    clientIdEnvVar: 'SLACK_CLIENT_ID',
    clientSecretEnvVar: 'SLACK_CLIENT_SECRET',
  },
  
  figma: {
    id: 'figma',
    name: 'Figma',
    authUrl: 'https://www.figma.com/oauth',
    tokenUrl: 'https://www.figma.com/api/oauth/token',
    scopes: [
      'file_read',
    ],
    clientIdEnvVar: 'FIGMA_CLIENT_ID',
    clientSecretEnvVar: 'FIGMA_CLIENT_SECRET',
  },
};

// Generate OAuth authorization URL
export function getAuthorizationUrl(
  providerId: string,
  redirectUri: string,
  state: string
): string {
  const provider = providers[providerId];
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);
  
  const clientId = process.env[provider.clientIdEnvVar];
  if (!clientId) throw new Error(`Missing ${provider.clientIdEnvVar}`);
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: provider.scopes.join(' '),
    state,
    access_type: 'offline', // For Google - to get refresh token
    prompt: 'consent',
  });
  
  return `${provider.authUrl}?${params}`;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  providerId: string,
  code: string,
  redirectUri: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
}> {
  const provider = providers[providerId];
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);
  
  const clientId = process.env[provider.clientIdEnvVar];
  const clientSecret = process.env[provider.clientSecretEnvVar];
  
  if (!clientId || !clientSecret) {
    throw new Error(`Missing OAuth credentials for ${providerId}`);
  }
  
  const response = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }
  
  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type || 'Bearer',
  };
}

// Refresh an access token
export async function refreshAccessToken(
  providerId: string,
  refreshToken: string
): Promise<{
  accessToken: string;
  expiresIn?: number;
}> {
  const provider = providers[providerId];
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);
  
  const clientId = process.env[provider.clientIdEnvVar];
  const clientSecret = process.env[provider.clientSecretEnvVar];
  
  if (!clientId || !clientSecret) {
    throw new Error(`Missing OAuth credentials for ${providerId}`);
  }
  
  const response = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }
  
  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

// Check if provider is configured
export function isProviderConfigured(providerId: string): boolean {
  const provider = providers[providerId];
  if (!provider) return false;
  
  const clientId = process.env[provider.clientIdEnvVar];
  const clientSecret = process.env[provider.clientSecretEnvVar];
  
  return !!(clientId && clientSecret);
}

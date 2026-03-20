// Authentication module
// Provides OAuth infrastructure for integrations

export * from './providers';

// Session types
export interface UserSession {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  connectedProviders: string[];
}

// For now, we use a simple session based on localStorage
// In production, this would use NextAuth.js or similar
export function getCurrentUser(): UserSession | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('index-user-session');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('index-user-session', JSON.stringify(user));
}

export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('index-user-session');
}

// Default user for single-user/demo mode
export const defaultUser: UserSession = {
  id: 'default',
  email: 'user@example.com',
  name: 'Demo User',
  connectedProviders: [],
};

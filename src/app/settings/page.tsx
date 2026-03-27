'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  MessageSquare, 
  FileText, 
  CheckCircle,
  XCircle,
  Zap,
  LogOut,
  LogIn,
  RefreshCw,
  User,
  Loader2,
} from 'lucide-react';

interface IntegrationStatus {
  connected: boolean;
  lastSyncAt?: string | null;
  status?: string;
}

interface SyncStatus {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  integrations: {
    google: IntegrationStatus;
    slack: IntegrationStatus;
  };
  lastSync?: string;
}

export default function SettingsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSyncStatus();
  }, [session]);

  const fetchSyncStatus = async () => {
    try {
      const res = await fetch('/api/sync');
      const data = await res.json();
      setSyncStatus(data);
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'live' }),
      });
      await fetchSyncStatus();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectSlack = () => {
    window.location.href = '/api/integrations/slack/connect';
  };

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Settings</h1>
              <p className="text-white/50 text-sm">Manage your connections</p>
            </div>
          </div>
          
          {session && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>

        {/* Account Section */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Account</h2>
          
          {session ? (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt="" 
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <User size={24} className="text-white/50" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{session.user?.name}</div>
                    <div className="text-sm text-white/50">{session.user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-white/50" />
              </div>
              <h3 className="text-lg font-medium mb-2">Sign in to sync your data</h3>
              <p className="text-white/50 text-sm mb-6">
                Connect your Google account to access your calendar, drive, and more.
              </p>
              <button
                onClick={() => signIn('google')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors"
              >
                <LogIn size={18} />
                Sign in with Google
              </button>
            </div>
          )}
        </section>

        {/* Integrations Section */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Integrations</h2>
          
          <div className="space-y-4">
            {/* Google (Calendar + Drive) */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    syncStatus?.integrations?.google?.connected 
                      ? 'bg-emerald-500/20' 
                      : 'bg-white/10'
                  }`}>
                    <Calendar size={20} className={
                      syncStatus?.integrations?.google?.connected 
                        ? 'text-emerald-400' 
                        : 'text-white/50'
                    } />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Google</span>
                      {syncStatus?.integrations?.google?.connected ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle size={12} />
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-white/40">
                          <XCircle size={12} />
                          Not connected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/50">
                      Calendar events and Drive documents
                    </p>
                  </div>
                </div>
                
                {!session && (
                  <button
                    onClick={() => signIn('google')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>

            {/* Slack */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    syncStatus?.integrations?.slack?.connected 
                      ? 'bg-emerald-500/20' 
                      : 'bg-white/10'
                  }`}>
                    <MessageSquare size={20} className={
                      syncStatus?.integrations?.slack?.connected 
                        ? 'text-emerald-400' 
                        : 'text-white/50'
                    } />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Slack</span>
                      {syncStatus?.integrations?.slack?.connected ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle size={12} />
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-white/40">
                          <XCircle size={12} />
                          Not connected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/50">
                      Messages and threads
                    </p>
                  </div>
                </div>
                
                {session && !syncStatus?.integrations?.slack?.connected && (
                  <button
                    onClick={handleConnectSlack}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Data Mode Section */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Data Mode</h2>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/70 text-sm mb-4">
              INDEX supports two modes:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-violet-400 mt-2" />
                <div>
                  <div className="font-medium text-violet-400">Demo Mode</div>
                  <p className="text-sm text-white/50">Curated sample data showcasing all features.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2" />
                <div>
                  <div className="font-medium text-emerald-400">Live Mode</div>
                  <p className="text-sm text-white/50">Your real data from connected integrations.</p>
                </div>
              </div>
            </div>
            <p className="text-white/40 text-xs mt-4">
              Toggle between modes with <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60">⌘⇧D</kbd>
            </p>
          </div>
        </section>

        {/* Last Sync Info */}
        {syncStatus?.lastSync && (
          <section>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Zap size={14} />
                Last synced: {new Date(syncStatus.lastSync).toLocaleString()}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

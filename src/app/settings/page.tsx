'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Figma,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

interface IntegrationStatus {
  calendar: boolean;
  slack: boolean;
  drive: boolean;
  figma: boolean;
}

const integrations = [
  {
    id: 'calendar',
    name: 'Google Calendar',
    icon: Calendar,
    description: 'Import your meetings and schedule',
    envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    docsUrl: 'https://developers.google.com/calendar/api/quickstart/js',
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: MessageSquare,
    description: 'Import messages and threads',
    envVars: ['SLACK_BOT_TOKEN'],
    docsUrl: 'https://api.slack.com/authentication/token-types',
  },
  {
    id: 'drive',
    name: 'Google Drive',
    icon: FileText,
    description: 'Import documents and files',
    envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    docsUrl: 'https://developers.google.com/drive/api/quickstart/js',
  },
  {
    id: 'figma',
    name: 'Figma',
    icon: Figma,
    description: 'Import design files',
    envVars: ['FIGMA_ACCESS_TOKEN'],
    docsUrl: 'https://www.figma.com/developers/api#access-tokens',
  },
];

export default function SettingsPage() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/integrations/status')
      .then(res => res.json())
      .then(setStatus)
      .catch(() => setStatus({ calendar: false, slack: false, drive: false, figma: false }));
  }, []);

  const copyEnvTemplate = (envVars: string[]) => {
    const template = envVars.map(v => `${v}=your_value_here`).join('\n');
    navigator.clipboard.writeText(template);
    setCopiedVar(envVars.join(','));
    setTimeout(() => setCopiedVar(null), 2000);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-white/50 text-sm">Configure your integrations</p>
          </div>
        </div>

        {/* Data Mode */}
        <section className="mb-12">
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
                  <p className="text-sm text-white/50">Curated sample data showcasing all features. Perfect for demos and exploration.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2" />
                <div>
                  <div className="font-medium text-emerald-400">Live Mode</div>
                  <p className="text-sm text-white/50">Your real data from connected integrations. Requires API setup below.</p>
                </div>
              </div>
            </div>
            <p className="text-white/40 text-xs mt-4">
              Toggle between modes with <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60">⌘⇧D</kbd> or click the mode indicator in the header.
            </p>
          </div>
        </section>

        {/* Integrations */}
        <section>
          <h2 className="text-lg font-medium mb-4">Integrations</h2>
          <div className="space-y-4">
            {integrations.map(integration => {
              const Icon = integration.icon;
              const isConnected = status?.[integration.id as keyof IntegrationStatus] ?? false;
              
              return (
                <div 
                  key={integration.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isConnected ? 'bg-emerald-500/20' : 'bg-white/10'
                      }`}>
                        <Icon size={20} className={isConnected ? 'text-emerald-400' : 'text-white/50'} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{integration.name}</span>
                          {isConnected ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                              <CheckCircle size={12} />
                              Connected
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-white/40">
                              <XCircle size={12} />
                              Not configured
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/50">{integration.description}</p>
                      </div>
                    </div>
                    <a
                      href={integration.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/70"
                      title="View documentation"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  
                  <div className="mt-3 p-3 rounded-lg bg-black/30 font-mono text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/40 text-xs">Required environment variables:</span>
                      <button
                        onClick={() => copyEnvTemplate(integration.envVars)}
                        className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
                      >
                        {copiedVar === integration.envVars.join(',') ? (
                          <>
                            <Check size={12} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    {integration.envVars.map(envVar => (
                      <div key={envVar} className="text-white/70">
                        {envVar}=<span className="text-white/30">your_value_here</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Setup Instructions */}
        <section className="mt-12">
          <h2 className="text-lg font-medium mb-4">Quick Setup</h2>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <div>
              <div className="font-medium mb-1">1. Create a <code className="px-1.5 py-0.5 bg-white/10 rounded">.env.local</code> file</div>
              <p className="text-sm text-white/50">In the project root, create this file with your API credentials.</p>
            </div>
            <div>
              <div className="font-medium mb-1">2. Add your credentials</div>
              <p className="text-sm text-white/50">Copy the environment variable templates from each integration above.</p>
            </div>
            <div>
              <div className="font-medium mb-1">3. Restart the dev server</div>
              <p className="text-sm text-white/50">Run <code className="px-1.5 py-0.5 bg-white/10 rounded">npm run dev</code> to pick up the new environment variables.</p>
            </div>
            <div>
              <div className="font-medium mb-1">4. Switch to Live mode</div>
              <p className="text-sm text-white/50">Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded">⌘⇧D</kbd> to toggle from Demo to Live mode.</p>
            </div>
          </div>
        </section>

        {/* For Vercel deployment */}
        <section className="mt-12">
          <h2 className="text-lg font-medium mb-4">Vercel Deployment</h2>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/70 text-sm mb-3">
              For Vercel deployments, add environment variables in your project settings:
            </p>
            <ol className="list-decimal list-inside text-sm text-white/50 space-y-1">
              <li>Go to your Vercel project dashboard</li>
              <li>Navigate to Settings → Environment Variables</li>
              <li>Add each required variable for your integrations</li>
              <li>Redeploy to apply changes</li>
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}

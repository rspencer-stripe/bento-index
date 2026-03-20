'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Figma,
  CheckCircle,
  Zap,
  ExternalLink,
  Copy,
  Check,
  Search,
  Globe,
} from 'lucide-react';

const integrations = [
  {
    id: 'calendar',
    name: 'Google Calendar',
    icon: Calendar,
    description: 'Import your meetings and schedule',
    mcpServer: 'user-google calendar',
    mcpStatus: 'connected',
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: MessageSquare,
    description: 'Import messages and threads',
    mcpServer: 'user-toolshed_extras',
    mcpStatus: 'connected',
  },
  {
    id: 'drive',
    name: 'Google Drive',
    icon: FileText,
    description: 'Import documents and files',
    mcpServer: 'user-google drive',
    mcpStatus: 'connected',
  },
  {
    id: 'figma',
    name: 'Figma',
    icon: Figma,
    description: 'Import design files',
    mcpServer: 'user-toolshed_extras',
    mcpStatus: 'connected',
  },
  {
    id: 'internal-search',
    name: 'Internal Search',
    icon: Search,
    description: 'Search internal documentation and wiki',
    mcpServer: 'user-internal search',
    mcpStatus: 'connected',
  },
  {
    id: 'web-search',
    name: 'Web Search',
    icon: Globe,
    description: 'Search and gather external context',
    mcpServer: 'user-web_search',
    mcpStatus: 'connected',
  },
];

export default function SettingsPage() {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const copyEnvTemplate = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(text);
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

        {/* MCP Status Banner */}
        <section className="mb-8">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Zap size={20} className="text-emerald-400" />
              </div>
              <div>
                <div className="font-medium text-emerald-400">MCP Connected</div>
                <p className="text-sm text-white/50">
                  Running in Cursor with MCP enabled. All integrations are connected via Model Context Protocol.
                </p>
              </div>
            </div>
          </div>
        </section>

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
                  <p className="text-sm text-white/50">Your real data via MCP (in Cursor) or API credentials (deployed).</p>
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
              
              return (
                <div 
                  key={integration.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/20">
                        <Icon size={20} className="text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{integration.name}</span>
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle size={12} />
                            Connected via MCP
                          </span>
                        </div>
                        <p className="text-sm text-white/50">{integration.description}</p>
                        <p className="text-xs text-white/30 mt-1 font-mono">
                          Server: {integration.mcpServer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Deployment Note */}
        <section className="mt-12">
          <h2 className="text-lg font-medium mb-4">Deploying Outside Cursor</h2>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/70 text-sm mb-3">
              When deploying to Vercel or running outside Cursor, you&apos;ll need to configure API credentials:
            </p>
            <div className="mt-3 p-3 rounded-lg bg-black/30 font-mono text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/40 text-xs">Environment variables for .env.local:</span>
                <button
                  onClick={() => copyEnvTemplate('GOOGLE_ACCESS_TOKEN=\nSLACK_BOT_TOKEN=\nFIGMA_ACCESS_TOKEN=')}
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  {copiedVar ? (
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
              <div className="text-white/70 space-y-1">
                <div>GOOGLE_ACCESS_TOKEN=<span className="text-white/30">your_token</span></div>
                <div>SLACK_BOT_TOKEN=<span className="text-white/30">xoxb-your-token</span></div>
                <div>FIGMA_ACCESS_TOKEN=<span className="text-white/30">your_token</span></div>
              </div>
            </div>
            <p className="text-white/40 text-xs mt-3">
              See the README for detailed setup instructions for each integration.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

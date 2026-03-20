# INDEX

**Unified context for knowledge workers.** INDEX synthesizes your work streams (Calendar, Slack, Drive, Figma) into a single, intelligent workspace that answers "what should I be working on?" without requiring you to ask.

## Quick Start

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev

# Open in browser
open http://localhost:3000
```

## Demo vs Live Mode

INDEX supports two data modes:

| Mode | Description | Toggle |
|------|-------------|--------|
| **Demo** (violet) | Curated sample data showcasing all features | Default |
| **Live** (green) | Your real data from connected integrations | Requires setup |

**Toggle between modes:** Press `⌘⇧D` (Mac) or `Ctrl+Shift+D` (Windows), or click the mode indicator in the header.

## Setting Up Live Integrations

### 1. Create environment file

Create a `.env.local` file in the project root:

```bash
# Google (Calendar + Drive)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Slack
SLACK_BOT_TOKEN=xoxb-your-token

# Figma
FIGMA_ACCESS_TOKEN=your_figma_token
```

### 2. Get API Credentials

#### Google Calendar & Drive
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Calendar API and Drive API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

#### Slack
1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new app
3. Add required scopes: `channels:read`, `channels:history`, `search:read`, `users:read`
4. Install to your workspace
5. Copy the Bot User OAuth Token

#### Figma
1. Go to [Figma Settings](https://www.figma.com/settings)
2. Generate a personal access token

### 3. Restart & Switch to Live Mode

```bash
npm run dev
```

Then press `⌘⇧D` to switch to Live mode.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `1-6` | Switch between views (Timeline, Focus, Meetings, Projects, Digest, Commitments) |
| `⌘K` | Open OmniBar for quick capture or scheduling |
| `⌘⇧D` | Toggle Demo/Live mode |

## Views

1. **Timeline** - Continuous vertical scroll through all your context, anchored at "now"
2. **Focus** - What needs your attention right now
3. **Meetings** - Today's meetings with prep materials auto-generated
4. **Projects** - Health status of active projects by tag
5. **Digest** - Daily summary of activity
6. **Commitments** - Track promises made in conversations

## Deploy to Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com/new)
3. Add environment variables in project settings
4. Deploy

## Architecture

INDEX is built with a production-ready, extensible architecture:

```
src/
├── app/
│   ├── page.tsx              # Main app with Suspense boundary
│   ├── settings/page.tsx     # Integration configuration
│   └── api/
│       ├── auth/[provider]/  # OAuth flow endpoints
│       ├── integrations/     # Per-integration API routes
│       └── sync/             # Unified sync endpoint
├── components/               # UI components (Bento tiles, timeline, etc.)
├── lib/
│   ├── auth/                 # OAuth provider configs
│   │   ├── providers.ts      # Google, Slack, Figma OAuth
│   │   └── index.ts
│   ├── db/                   # Database layer (Drizzle ORM)
│   │   ├── schema.ts         # Users, tokens, items, sync log
│   │   └── client.ts         # Vercel Postgres connection
│   ├── integrations/         # Plugin architecture
│   │   ├── types.ts          # Integration interface
│   │   ├── base.ts           # Abstract base class
│   │   ├── google-calendar.ts
│   │   ├── slack.ts
│   │   └── registry.ts       # Integration registry
│   ├── store/                # State management (Zustand)
│   │   └── index.ts          # Global app store with persistence
│   ├── sync/                 # Sync engine
│   │   ├── idb.ts            # IndexedDB for offline cache
│   │   └── engine.ts         # Sync orchestration
│   ├── hooks/                # React hooks
│   │   └── useDataSync.ts    # Data sync hook
│   ├── types.ts              # Core type definitions
│   ├── intelligence.ts       # AI features (meeting prep, nudges)
│   └── liveData.ts           # Curated demo dataset
```

### Key Design Decisions

| Component | Technology | Why |
|-----------|------------|-----|
| Database | Drizzle ORM + Vercel Postgres | Type-safe, serverless-ready |
| State | Zustand | Simple, performant, persisted |
| Cache | IndexedDB | Offline-first, large data support |
| Auth | OAuth 2.0 | Standard, multi-provider |
| Integrations | Plugin pattern | Easy to extend |

### Adding a New Integration

1. Create `src/lib/integrations/your-integration.ts`
2. Extend `BaseIntegration` class
3. Implement `fetch()` and `transform()` methods
4. Register in `registry.ts`

```typescript
import { BaseIntegration } from './base';

export class MyIntegration extends BaseIntegration<RawType, ConfigType> {
  readonly id = 'my-integration';
  readonly name = 'My Integration';
  // ... implement abstract methods
}
```

## For Stripe Employees

This tool is designed to work with Stripe's internal tooling. When running locally in Cursor with MCP enabled, the live integrations can also leverage:
- Toolshed MCP for Slack search
- Google Calendar MCP for events
- Internal Drive access

See `/settings` in the app for detailed setup instructions.

---

Built with Next.js, Tailwind CSS, and Framer Motion.

import { MindItem } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// LIVE MCP DATA - Ryan Spencer, Design Lead
// Payment Intelligence / Radar Experience @ Stripe
// Last synced: March 19, 2026
// ═══════════════════════════════════════════════════════════════════════════

// Dynamic time helpers - recalculated on each access
const getNow = () => new Date();
const minsAgo = (m: number) => new Date(getNow().getTime() - m * 60 * 1000).toISOString();
const hoursAgo = (h: number) => new Date(getNow().getTime() - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) => new Date(getNow().getTime() - d * 24 * 60 * 60 * 1000).toISOString();

// Create date for today at a specific hour
const todayAt = (hour: number, min: number = 0) => {
  const d = new Date();
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

// Create date for tomorrow at a specific hour  
const tomorrowAt = (hour: number, min: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

export const mockItems: MindItem[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // CALENDAR - Real events from Google Calendar MCP
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'cal-craft-crit-1',
    tag: '#Design',
    type: 'event',
    priority: 4,
    title: 'Craft and quality crit: slot 1',
    snippet: 'Product Design craft review session',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'crit',
        startsAt: todayAt(9, 30),
        endsAt: todayAt(10, 15),
        tetheredArtifacts: ['http://go/pd/craft/agenda'],
        attendees: [
          { name: 'swanson@stripe.com' },
          { name: 'soya@stripe.com' },
          { name: 'annacb@stripe.com' },
          { name: 'chrisg@stripe.com' },
          { name: 'svila@stripe.com' },
        ],
      },
    },
    createdAt: daysAgo(7),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-craft-crit-2',
    tag: '#Link',
    type: 'event',
    priority: 4,
    title: 'Craft and quality crit: Incentives for returning Link users',
    snippet: 'Design review for Link incentives feature',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'crit',
        startsAt: todayAt(10, 15),
        endsAt: todayAt(11, 0),
        tetheredArtifacts: ['http://go/pd/craft/agenda', 'https://stripe.zoom.us/j/98503893123'],
        attendees: [
          { name: 'swanson@stripe.com' },
          { name: 'akwan@stripe.com' },
          { name: 'annacb@stripe.com' },
        ],
      },
    },
    createdAt: daysAgo(7),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-payintel-review',
    tag: '#PayIntel',
    type: 'event',
    priority: 5,
    title: 'PayIntel Product Review [Weekly]',
    snippet: 'Weekly product review with PayIntel team',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'standup',
        startsAt: todayAt(10, 30),
        endsAt: todayAt(11, 30),
        tetheredArtifacts: [
          'https://docs.google.com/spreadsheets/d/1PXbJtq4vKP07e1bFzXq112ybabL0r8OaP7LBom8EC5I/edit',
          'https://stripe.zoom.us/j/96169299256',
        ],
        attendees: [{ name: 'jackerman@stripe.com' }],
      },
    },
    createdAt: daysAgo(30),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-ian-catchup',
    tag: '#1on1',
    type: 'event',
    priority: 3,
    title: 'Ian / Ryan: Catch Up',
    snippet: '1:1 sync with Ian Collins',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'oneOnOne',
        startsAt: todayAt(11, 0),
        endsAt: todayAt(11, 30),
        tetheredArtifacts: ['https://stripe.zoom.us/j/96381176120'],
        attendees: [{ name: 'iancollins@stripe.com' }],
      },
    },
    createdAt: daysAgo(14),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-dispute-demo',
    tag: '#Disputes',
    type: 'event',
    priority: 5,
    title: 'Dispute Prevention Design Demo',
    snippet: 'Demo of dispute prevention design work',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'crit',
        startsAt: todayAt(12, 30),
        endsAt: todayAt(13, 0),
        tetheredArtifacts: [
          'https://docs.google.com/document/d/1UJVN9ivBsgRK7lmcWk2SQuOMqFX7dIwQdkI6A7V__2s/edit',
          'https://stripe.zoom.us/j/92794948960',
        ],
        attendees: [
          { name: 'ishanvirk@stripe.com' },
          { name: 'jesstam@stripe.com' },
          { name: 'maddmeier@stripe.com' },
          { name: 'shaobo@stripe.com' },
          { name: 'yemi@stripe.com' },
        ],
      },
    },
    createdAt: daysAgo(3),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-smart-refunds',
    tag: '#SmartRefunds',
    type: 'event',
    priority: 4,
    title: '[w] Smart Refunds',
    snippet: 'Weekly Smart Refunds sync',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'standup',
        startsAt: todayAt(13, 30),
        endsAt: todayAt(13, 55),
        tetheredArtifacts: [
          'https://docs.google.com/document/d/1lMX9KNMH9wf8AQX_IlDB9B50f2TepuTDQov14j41qzY/edit',
          'https://stripe.zoom.us/j/99388746795',
        ],
        attendees: [
          { name: 'shaobo@stripe.com' },
          { name: 'abhishek@stripe.com' },
          { name: 'gkropf@stripe.com' },
        ],
      },
    },
    createdAt: daysAgo(30),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-sr-updates',
    tag: '#SmartRefunds',
    type: 'event',
    priority: 3,
    title: 'Updates to SR',
    snippet: 'Working session on Smart Refunds updates',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'focus',
        startsAt: todayAt(14, 30),
        endsAt: todayAt(15, 0),
        tetheredArtifacts: [],
        attendees: [],
      },
    },
    createdAt: daysAgo(1),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-jamming',
    tag: '#Design',
    type: 'event',
    priority: 3,
    title: 'more jamming?',
    snippet: 'Design jam session with Yuhsin',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'focus',
        startsAt: todayAt(15, 0),
        endsAt: todayAt(15, 45),
        tetheredArtifacts: ['https://stripe.zoom.us/j/92713647039'],
        attendees: [{ name: 'yuhsin@stripe.com' }],
      },
    },
    createdAt: daysAgo(1),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-apollo-standup',
    tag: '#Apollo',
    type: 'event',
    priority: 4,
    title: 'Apollo - Fraud optimization standup',
    snippet: 'Daily standup for Apollo fraud optimization team',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'standup',
        startsAt: tomorrowAt(8, 45),
        endsAt: tomorrowAt(9, 0),
        tetheredArtifacts: [
          'https://docs.google.com/document/d/1F4nY_i-9tEevcVM0uuOxENIoja03hRJNS4toqi3TovE/edit',
          'https://stripe.zoom.us/j/99161809057',
        ],
        attendees: [
          { name: 'jacobmeltzer@stripe.com' },
          { name: 'yuhsin@stripe.com' },
          { name: 'sberrebi@stripe.com' },
        ],
      },
    },
    createdAt: daysAgo(30),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-friday-fireside',
    tag: '#Company',
    type: 'event',
    priority: 2,
    title: 'Friday Fireside',
    snippet: 'Stripe-wide Friday Fireside event',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'external',
        startsAt: tomorrowAt(9, 0),
        endsAt: tomorrowAt(10, 0),
        tetheredArtifacts: ['https://go/stripetv/live'],
        attendees: [],
      },
    },
    createdAt: daysAgo(7),
    lastTouchedAt: todayAt(8, 0),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SLACK - Real messages from Slack MCP
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'slack-console-ai',
    tag: '#AI',
    type: 'note',
    priority: 5,
    title: 'Console AI Experience Review',
    snippet: 'Have you explored Console yet? I was just playing with it and it\'s quite a poor experience. Asked "what\'s my fraud rate" and it took ages to generate a response only for it to not know what I was talking about.',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Reviewing Console AI experience for Radar queries',
        collaborator: { name: 'Direct Message' },
        threadUrl: 'https://stripe.slack.com/archives/D05SUBXP78F/p1773976956519509',
        channel: 'DM',
      },
    },
    createdAt: todayAt(8, 30),
    lastTouchedAt: todayAt(8, 30),
  },
  {
    id: 'slack-handoff',
    tag: '#Disputes',
    type: 'note',
    priority: 4,
    title: 'Disputes Handoff Discussion',
    snippet: 'That\'d be great, we had a handoff discussion this afternoon but would be great to develop a tighter sync and workflow with the team.',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Improving handoff workflow with disputes team',
        collaborator: { name: 'ishanvirk, shayperez, katiek' },
        threadUrl: 'https://stripe.slack.com/archives/C0AGL2J6KFX/p1773959373523239',
        channel: 'mpdm-disputes',
      },
    },
    createdAt: todayAt(9, 15),
    lastTouchedAt: todayAt(9, 15),
  },
  {
    id: 'slack-smart-disputes-research',
    tag: '#Disputes',
    type: 'note',
    priority: 5,
    title: 'Smart Disputes Desk Research',
    snippet: 'TL;DR: Stripe\'s automation is seen as a "Safety Net" (for forgotten deadlines) vs. a "Black Box" (for weak evidence and surprise fees). It\'s highly expected for SaaS/Digital goods but viewed with skepticism for physical shipping.',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Customer sentiment research on dispute auto-submit behavior',
        collaborator: { name: 'Katie Koch, Jess Tam' },
        threadUrl: 'https://stripe.slack.com/archives/C08QZC57TD4/p1773956055380819',
        channel: '#radar-disputes',
      },
    },
    createdAt: todayAt(10, 0),
    lastTouchedAt: todayAt(10, 0),
  },
  {
    id: 'slack-designing-ai',
    tag: '#DesigningAI',
    type: 'note',
    priority: 3,
    title: 'AI Design: Recruiting + Fictional Data',
    snippet: 'The process of recruiting specific users → generating fictional data to make the product feel like their own is such a great unlock!',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Discussing AI-first design methodologies',
        collaborator: { name: '#designing-ai' },
        threadUrl: 'https://stripe.slack.com/archives/C08P4284UTV/p1773957167506239',
        channel: '#designing-ai',
      },
    },
    createdAt: todayAt(11, 0),
    lastTouchedAt: todayAt(11, 0),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // GOOGLE DRIVE - Real documents from Drive MCP
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'drive-radar-strategy',
    tag: '#Radar',
    type: 'artifact',
    priority: 5,
    title: 'Radar design strategy',
    snippet: 'Core strategy document for Radar design direction',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Radar design strategy',
        executiveSummary: 'Strategic design direction for Radar product',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: todayAt(9, 0) }],
        webUrl: 'https://docs.google.com/document/d/1goBEpIar-rL9d9KvPBr-cP4uRdQUF_aDqud-_Dxr0T8/edit',
      },
    },
    createdAt: daysAgo(10),
    lastTouchedAt: todayAt(9, 0),
  },
  {
    id: 'drive-radar-planning',
    tag: '#Radar',
    type: 'artifact',
    priority: 4,
    title: 'Notes - Radar Design: Planning & Sync',
    snippet: 'Planning and sync notes for Radar design team',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Notes - Radar Design: Planning & Sync',
        executiveSummary: 'Weekly planning notes for design team',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: todayAt(10, 30) }],
        webUrl: 'https://docs.google.com/document/d/1qKmbHpjI8CGx4j9TNHRCJFttT5PYX-oZVv2Xa1PNoLs/edit',
      },
    },
    createdAt: daysAgo(120),
    lastTouchedAt: todayAt(10, 30),
  },
  {
    id: 'drive-radar-prototype',
    tag: '#Radar',
    type: 'artifact',
    priority: 5,
    title: 'Radar overview prototype analysis',
    snippet: 'Analysis of Radar overview prototype explorations',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Radar overview prototype analysis',
        executiveSummary: 'Prototype analysis and findings',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: todayAt(14, 0) }],
        webUrl: 'https://docs.google.com/document/d/1jvWFjLtp7ohi8vn-jptgKqu307L0SaAiMu_sJWgz1z0/edit',
      },
    },
    createdAt: daysAgo(1),
    lastTouchedAt: todayAt(14, 0),
  },
  {
    id: 'drive-radar-ux-brief',
    tag: '#Radar',
    type: 'artifact',
    priority: 4,
    title: 'Radar Overview/Performance: UX Brief',
    snippet: 'UX brief for Radar Overview and Performance features',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Radar Overview/Performance: UX Brief',
        executiveSummary: 'Design brief for overview and performance',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: todayAt(11, 30) }],
        webUrl: 'https://docs.google.com/document/d/1l4rj4_0acf8Xtb1IGcDGkv5M2gmLdSbeuKL4sga2TBQ/edit',
      },
    },
    createdAt: daysAgo(95),
    lastTouchedAt: todayAt(11, 30),
  },
  {
    id: 'drive-radar-journeys',
    tag: '#Radar',
    type: 'artifact',
    priority: 3,
    title: 'Radar User Journey',
    snippet: 'User journey mapping for Radar product',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Radar User Journey',
        executiveSummary: 'User journey documentation',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: todayAt(12, 0) }],
        webUrl: 'https://docs.google.com/document/d/1SdKA7OIfqp5f4WAoKfvx8w1Z5VVwr1gr4JqTmJt8sm4/edit',
      },
    },
    createdAt: daysAgo(130),
    lastTouchedAt: todayAt(12, 0),
  },
  {
    id: 'drive-future-radar',
    tag: '#Radar',
    type: 'artifact',
    priority: 4,
    title: 'Future of Radar • Mar 11, 2026',
    snippet: 'Vision document for future of Radar',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Future of Radar • Mar 11, 2026',
        executiveSummary: 'Future vision and roadmap',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: todayAt(13, 0) }],
        webUrl: 'https://docs.google.com/document/d/1wAZCTsf5XyvgrDubEAauk9hRsEHvWMLGYCGDjWShWBk/edit',
      },
    },
    createdAt: daysAgo(10),
    lastTouchedAt: todayAt(13, 0),
  },
  {
    id: 'drive-radar-design-review',
    tag: '#Radar',
    type: 'artifact',
    priority: 3,
    title: 'Notes - Radar Design Review, weekly',
    snippet: 'Weekly design review notes',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Notes - Radar Design Review, weekly',
        executiveSummary: 'Design review meeting notes',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: todayAt(8, 45) }],
        webUrl: 'https://docs.google.com/document/d/18HAr0M5l_VeNhtkvkabruoH-6fP7roav6GPw9GN0zPg/edit',
      },
    },
    createdAt: daysAgo(125),
    lastTouchedAt: todayAt(8, 45),
  },
];

// Legacy tiles export (for backwards compatibility)
export const mockTiles = [];

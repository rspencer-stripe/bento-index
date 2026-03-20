import { MindItem } from './types';

// Demo data designed to showcase all 10 Essential Journeys
// Times are relative to "now" so the demo always works

// Helper functions for relative times
const now = () => new Date();
const minsFromNow = (mins: number) => new Date(now().getTime() + mins * 60 * 1000).toISOString();
const hoursFromNow = (hours: number) => new Date(now().getTime() + hours * 60 * 60 * 1000).toISOString();
const daysFromNow = (days: number) => new Date(now().getTime() + days * 24 * 60 * 60 * 1000).toISOString();
const minsAgo = (mins: number) => new Date(now().getTime() - mins * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => new Date(now().getTime() - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => new Date(now().getTime() - days * 24 * 60 * 60 * 1000).toISOString();

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 1: 5-Minute Meeting Prep
// Need: A meeting starting in ~12 minutes with attendees and related context
// ═══════════════════════════════════════════════════════════════════════════

const imminentMeeting: MindItem = {
  id: 'cal-imminent-katie-1on1',
  tag: '#Radar',
  type: 'event',
  priority: 4,
  title: 'Ryan / Katie',
  snippet: '1:1 sync - discuss Radar overview progress and SKU refresh timeline',
  source: 'calendar',
  sourceMeta: {
    source: 'calendar',
    meta: {
      eventType: 'oneOnOne',
      startsAt: minsFromNow(12),
      endsAt: minsFromNow(42),
      tetheredArtifacts: ['https://docs.google.com/document/d/1q-wZhopMpi0aqNJV1RSqjnfGNUKivplIZYjv5iaRvNo'],
      attendees: [
        { name: 'katiek@stripe.com' },
      ],
      zoomLink: 'https://stripe.zoom.us/j/95949759347',
    },
  },
  createdAt: daysAgo(30),
  lastTouchedAt: hoursAgo(1),
};

// Related context for the imminent meeting
const katieSlackThread: MindItem = {
  id: 'slack-katie-radar-question',
  tag: '#Radar',
  type: 'note',
  priority: 4,
  title: 'Radar SKU timeline question',
  snippet: 'Katie: "Can you send me the updated timeline for the SKU refresh? Need to sync with product on Monday."',
  source: 'slack',
  sourceMeta: {
    source: 'slack',
    meta: {
      coreAsk: 'Timeline for SKU refresh needed',
      collaborator: { name: 'katiek' },
      threadUrl: 'https://stripe.slack.com/archives/D05SUBXP78F/p1773976956519509',
      channel: 'DM with Katie',
    },
  },
  createdAt: daysAgo(2),
  lastTouchedAt: daysAgo(1),
};

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 3: Morning Scan - Items with WAITING badges
// Need: Items where someone is waiting on you
// ═══════════════════════════════════════════════════════════════════════════

const waitingItems: MindItem[] = [
  {
    id: 'slack-waiting-review',
    tag: '#Radar',
    type: 'note',
    priority: 5,
    title: 'Design review request from Jacob',
    snippet: 'Hey Ryan, waiting on your review of the Radar Overview mocks. Can you take a look when you get a chance? Need your thoughts before the eng sync.',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Review Radar Overview mocks',
        collaborator: { name: 'jacobmeltzer' },
        threadUrl: 'https://stripe.slack.com/archives/C0A1GU3K9KM/p1773952660621959',
        channel: '#radar-design',
      },
    },
    createdAt: hoursAgo(4),
    lastTouchedAt: hoursAgo(4),
  },
  {
    id: 'slack-waiting-decision',
    tag: '#Disputes',
    type: 'note',
    priority: 4,
    title: 'Auto-submit behavior decision',
    snippet: 'Let me know your thoughts on the auto-submit UX. Waiting on you to make the call on whether we show the preview or not.',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Decision needed on auto-submit UX',
        collaborator: { name: 'shayperez' },
        threadUrl: 'https://stripe.slack.com/archives/C08QZC57TD4/p1773956055380819',
        channel: '#radar-disputes',
      },
    },
    createdAt: hoursAgo(6),
    lastTouchedAt: hoursAgo(6),
  },
  {
    id: 'slack-please-review',
    tag: '#RiskPlatform',
    type: 'note',
    priority: 4,
    title: 'Risk Platform spec for your review',
    snippet: 'Please review the attached spec when you can. Anne Catherine and I are blocked until we get your feedback on the IA changes.',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Spec review blocking team',
        collaborator: { name: 'sadhika' },
        threadUrl: 'https://stripe.slack.com/archives/C09RUL37EN7/p1773942724595549',
        channel: '#risk-platform-design',
      },
    },
    createdAt: daysAgo(1),
    lastTouchedAt: daysAgo(1),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 4: Commitment Catch
// Need: Items with "I'll..." language that are 4+ days old
// ═══════════════════════════════════════════════════════════════════════════

const commitmentItems: MindItem[] = [
  {
    id: 'slack-commitment-timeline',
    tag: '#Radar',
    type: 'note',
    priority: 4,
    title: 'Commitment: Send SKU timeline',
    snippet: "I'll send over the updated SKU timeline by end of week. Let me put together a quick summary of where we're at.",
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Promised to send SKU timeline',
        collaborator: { name: 'katiek' },
        threadUrl: 'https://stripe.slack.com/archives/D05SUBXP78F/p1773976956519510',
        channel: 'DM with Katie',
      },
    },
    createdAt: daysAgo(5),
    lastTouchedAt: daysAgo(5),
  },
  {
    id: 'slack-commitment-prototype',
    tag: '#Radar',
    type: 'note',
    priority: 3,
    title: 'Commitment: Share prototype link',
    snippet: "Let me share the prototype link with you tomorrow. I'll make sure it's ready for the review.",
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Promised to share prototype',
        collaborator: { name: 'winfield' },
        threadUrl: 'https://stripe.slack.com/archives/C0A1GU3K9KM/p1773952660621960',
        channel: '#radar-design',
      },
    },
    createdAt: daysAgo(4),
    lastTouchedAt: daysAgo(4),
  },
  {
    id: 'slack-commitment-feedback',
    tag: '#PayIntel',
    type: 'note',
    priority: 3,
    title: 'Commitment: Compile feedback',
    snippet: "I can put together a summary of the user feedback we've collected. Will do that this week.",
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Promised to compile user feedback',
        collaborator: { name: 'jackerman' },
        threadUrl: 'https://stripe.slack.com/archives/C0A1GU3K9KM/p1773952660621961',
        channel: '#payintel',
      },
    },
    createdAt: daysAgo(6),
    lastTouchedAt: daysAgo(6),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 9: Stale Item Nudge
// Need: P5 items untouched for 5+ days
// ═══════════════════════════════════════════════════════════════════════════

const staleItems: MindItem[] = [
  {
    id: 'drive-stale-vision-doc',
    tag: '#Radar',
    type: 'artifact',
    priority: 5,
    title: 'Radar 2026 Vision Document',
    snippet: 'Vision document needs final review before sharing with leadership. Draft complete but not reviewed.',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Radar 2026 Vision Document',
        executiveSummary: 'Strategic vision for Radar product line',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: daysAgo(7) }],
        webUrl: 'https://docs.google.com/document/d/1yP0ZjpUWipGCHub0e9MFRdxHnh1NOFLoHNs9t6Qaxbs/edit',
      },
    },
    createdAt: daysAgo(14),
    lastTouchedAt: daysAgo(7),
  },
  {
    id: 'slack-stale-decision',
    tag: '#Disputes',
    type: 'note',
    priority: 5,
    title: 'Disputes IA decision pending',
    snippet: 'We need to decide on the information architecture for the new disputes dashboard. This is blocking the eng team.',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'IA decision for disputes dashboard',
        collaborator: { name: 'jesstam' },
        threadUrl: 'https://stripe.slack.com/archives/C08QZC57TD4/p1773956055380820',
        channel: '#radar-disputes',
      },
    },
    createdAt: daysAgo(6),
    lastTouchedAt: daysAgo(5),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 2 & 10: Timeline context (past and future items)
// Need: Items spread across yesterday, today, tomorrow
// ═══════════════════════════════════════════════════════════════════════════

const timelineItems: MindItem[] = [
  // Recent items (today)
  {
    id: 'slack-console-ai-review',
    tag: '#AI',
    type: 'note',
    priority: 5,
    title: 'Console AI Experience Review',
    snippet: "Have you explored Console yet? We need to find a better way to integrate with it. Asked \"what's my fraud rate\" and it didn't know how to calculate.",
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Reviewing Console AI experience',
        collaborator: { name: 'annecath' },
        threadUrl: 'https://stripe.slack.com/archives/D05SUBXP78F/p1773976956519509',
        channel: 'DM',
      },
    },
    createdAt: hoursAgo(2),
    lastTouchedAt: hoursAgo(2),
  },
  {
    id: 'drive-radar-planning-notes',
    tag: '#Radar',
    type: 'artifact',
    priority: 5,
    title: 'Notes - Radar Design: Planning & Sync',
    snippet: 'Planning and sync notes for Radar design team - updated this morning',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Notes - Radar Design: Planning & Sync',
        executiveSummary: 'Weekly planning notes',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: hoursAgo(3) }],
        webUrl: 'https://docs.google.com/document/d/1qKmbHpjI8CGx4j9TNHRCJFttT5PYX-oZVv2Xa1PNoLs/edit',
      },
    },
    createdAt: daysAgo(30),
    lastTouchedAt: hoursAgo(3),
  },
  // Yesterday items
  {
    id: 'slack-disputes-research',
    tag: '#Disputes',
    type: 'note',
    priority: 4,
    title: 'Smart Disputes Desk Research',
    snippet: 'TL;DR: Stripe\'s automation seen as "Safety Net" vs "Black Box". Expected for SaaS but skepticism for physical shipping.',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Customer sentiment on auto-submit',
        collaborator: { name: 'katiek, jesstam' },
        threadUrl: 'https://stripe.slack.com/archives/C08QZC57TD4/p1773956055380819',
        channel: '#radar-disputes',
      },
    },
    createdAt: daysAgo(1),
    lastTouchedAt: daysAgo(1),
  },
  {
    id: 'drive-prototype-analysis',
    tag: '#Radar',
    type: 'artifact',
    priority: 4,
    title: 'Radar overview prototype analysis',
    snippet: 'Analysis of prototype explorations from user testing sessions',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Radar overview prototype analysis',
        executiveSummary: 'User testing findings',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: daysAgo(1) }],
        webUrl: 'https://docs.google.com/document/d/1jvWFjLtp7ohi8vn-jptgKqu307L0SaAiMu_sJWgz1z0/edit',
      },
    },
    createdAt: daysAgo(3),
    lastTouchedAt: daysAgo(1),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 6: Project Pulse Check
// Need: Multiple projects with varying health states
// ═══════════════════════════════════════════════════════════════════════════

const projectItems: MindItem[] = [
  // Active project with momentum
  {
    id: 'figma-radar-overview',
    tag: '#Radar',
    type: 'artifact',
    priority: 4,
    title: 'Radar Overview - v3 explorations',
    snippet: 'Latest iteration on the overview dashboard with performance metrics',
    source: 'figma',
    sourceMeta: {
      source: 'figma',
      meta: {
        fileName: 'Radar Overview - v3 explorations',
        lastModified: hoursAgo(1),
        desktopUrl: 'figma://file/abc123',
      },
    },
    createdAt: daysAgo(7),
    lastTouchedAt: hoursAgo(1),
  },
  // Stale project
  {
    id: 'slack-terminal-design',
    tag: '#Terminal',
    type: 'note',
    priority: 3,
    title: 'Terminal reader UX feedback',
    snippet: 'Some thoughts on the reader configuration flow that came up in testing.',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Reader UX feedback',
        collaborator: { name: 'perry' },
        threadUrl: 'https://stripe.slack.com/archives/terminal/p123',
        channel: '#terminal-design',
      },
    },
    createdAt: daysAgo(12),
    lastTouchedAt: daysAgo(10),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 8: End-of-Day Digest
// Need: Mix of items touched today
// ═══════════════════════════════════════════════════════════════════════════

const todayItems: MindItem[] = [
  {
    id: 'slack-design-ai',
    tag: '#DesigningAI',
    type: 'note',
    priority: 3,
    title: 'AI Design: Recruiting + Fictional Data',
    snippet: 'The process of recruiting users → generating fictional data to make the product feel real is such a great unlock!',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'AI-first design methodologies',
        collaborator: { name: '#designing-ai' },
        threadUrl: 'https://stripe.slack.com/archives/C08P4284UTV/p1773957167506239',
        channel: '#designing-ai',
      },
    },
    createdAt: hoursAgo(5),
    lastTouchedAt: hoursAgo(5),
  },
  {
    id: 'drive-payintel-tracker',
    tag: '#PayIntel',
    type: 'artifact',
    priority: 4,
    title: 'Payment intelligence design tracker',
    snippet: 'go/payintel-design-tracker - Updated project status this morning',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Payment intelligence design tracker',
        executiveSummary: 'Design project tracker',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: hoursAgo(4) }],
        webUrl: 'https://docs.google.com/spreadsheets/d/1gN_F70CgKP8WYHK_EGyJVgfHChPGkHLkObppLwVQOK8/edit',
      },
    },
    createdAt: daysAgo(180),
    lastTouchedAt: hoursAgo(4),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UPCOMING MEETINGS (for meeting companion & timeline)
// ═══════════════════════════════════════════════════════════════════════════

const upcomingMeetings: MindItem[] = [
  imminentMeeting,
  {
    id: 'cal-radar-weekly',
    tag: '#Radar',
    type: 'event',
    priority: 4,
    title: 'Radar Plus Weekly',
    snippet: 'Weekly sync for Radar Plus team',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'standup',
        startsAt: hoursFromNow(2),
        endsAt: hoursFromNow(2.5),
        tetheredArtifacts: [],
        attendees: [
          { name: 'jacobmeltzer@stripe.com' },
          { name: 'shayperez@stripe.com' },
          { name: 'yuhsin@stripe.com' },
        ],
        zoomLink: 'https://stripe.zoom.us/j/91961598884',
      },
    },
    createdAt: daysAgo(30),
    lastTouchedAt: hoursAgo(1),
  },
  {
    id: 'cal-design-crit',
    tag: '#Design',
    type: 'event',
    priority: 4,
    title: 'Payments Acceptance Crit',
    snippet: 'Weekly design critique session',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'standup',
        startsAt: hoursFromNow(4),
        endsAt: hoursFromNow(5),
        tetheredArtifacts: [],
        attendees: [
          { name: 'katiek@stripe.com' },
          { name: 'annecath@stripe.com' },
        ],
        zoomLink: 'https://stripe.zoom.us/j/91889757983',
      },
    },
    createdAt: daysAgo(30),
    lastTouchedAt: hoursAgo(1),
  },
  {
    id: 'cal-tomorrow-standup',
    tag: '#Radar',
    type: 'event',
    priority: 4,
    title: 'Radar Staff Weekly',
    snippet: 'Weekly staff meeting for Radar team',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'standup',
        startsAt: daysFromNow(1),
        endsAt: new Date(new Date(daysFromNow(1)).getTime() + 30 * 60 * 1000).toISOString(),
        tetheredArtifacts: [],
        attendees: [
          { name: 'jackerman@stripe.com' },
          { name: 'jacobmeltzer@stripe.com' },
        ],
        zoomLink: 'https://stripe.zoom.us/j/92172716597',
      },
    },
    createdAt: daysAgo(30),
    lastTouchedAt: hoursAgo(1),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMBINE ALL ITEMS
// ═══════════════════════════════════════════════════════════════════════════

export const liveItems: MindItem[] = [
  // Journey 1: Meeting Prep
  ...upcomingMeetings,
  katieSlackThread,
  
  // Journey 3: Morning Scan (Waiting items)
  ...waitingItems,
  
  // Journey 4: Commitment Catch
  ...commitmentItems,
  
  // Journey 9: Stale Nudges
  ...staleItems,
  
  // Journeys 2 & 10: Timeline context
  ...timelineItems,
  
  // Journey 6: Project variety
  ...projectItems,
  
  // Journey 8: Today's activity
  ...todayItems,
];

// Export helpers for meeting prep
export function getAllCollaborators(items: MindItem[]): string[] {
  const collaborators = new Set<string>();
  
  items.forEach(item => {
    if (item.source === 'calendar') {
      const meta = item.sourceMeta.meta as { attendees?: { name: string }[] };
      meta.attendees?.forEach(a => {
        const username = a.name.split('@')[0];
        collaborators.add(username);
      });
    }
  });
  
  return Array.from(collaborators);
}

export function getItemsRelatedToMeeting(meeting: MindItem, allItems: MindItem[]): MindItem[] {
  if (meeting.source !== 'calendar') return [];
  
  const meta = meeting.sourceMeta.meta as { attendees?: { name: string }[] };
  const attendeeNames = new Set(meta.attendees?.map(a => a.name.split('@')[0].toLowerCase()) || []);
  const meetingTag = meeting.tag;
  
  return allItems.filter(item => {
    if (item.id === meeting.id) return false;
    if (item.tag === meetingTag) return true;
    
    if (item.source === 'slack') {
      const slackMeta = item.sourceMeta.meta as { collaborator?: { name: string } };
      const collaboratorNames = slackMeta.collaborator?.name.split(/[,\s]+/).map(n => n.toLowerCase()) || [];
      return collaboratorNames.some(name => attendeeNames.has(name));
    }
    
    return false;
  });
}

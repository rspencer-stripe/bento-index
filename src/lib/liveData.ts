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
      startsAt: minsFromNow(18),
      endsAt: minsFromNow(48),
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

// Related context for the imminent meeting - rich Katie context
const katieRelatedItems: MindItem[] = [
  // Recent Slack thread about SKU timeline
  {
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
  },
  // Figma file Katie commented on
  {
    id: 'figma-katie-overview-comments',
    tag: '#Radar',
    type: 'artifact',
    priority: 4,
    title: 'Radar Overview - Katie\'s feedback',
    snippet: 'Katie left 3 comments: "Love the direction on the summary cards" / "Can we make the fraud rate more prominent?" / "What about mobile?"',
    source: 'figma',
    sourceMeta: {
      source: 'figma',
      meta: {
        fileName: 'Radar Overview - v3 explorations',
        lastModified: daysAgo(1),
        desktopUrl: 'figma://file/abc123',
      },
    },
    createdAt: daysAgo(3),
    lastTouchedAt: daysAgo(1),
  },
  // Shared 1:1 doc
  {
    id: 'drive-katie-1on1-doc',
    tag: '#Radar',
    type: 'artifact',
    priority: 4,
    title: 'Ryan / Katie 1:1 Notes',
    snippet: 'Running notes from weekly syncs. Last topic: Radar overview timeline, SKU refresh dependencies',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Ryan / Katie 1:1 Notes',
        executiveSummary: '1:1 running notes',
        lastEditors: [{ name: 'Katie Koch', editedAt: daysAgo(7) }],
        webUrl: 'https://docs.google.com/document/d/1q-wZhopMpi0aqNJV1RSqjnfGNUKivplIZYjv5iaRvNo/edit',
      },
    },
    createdAt: daysAgo(90),
    lastTouchedAt: daysAgo(7),
  },
  // Another recent Slack thread
  {
    id: 'slack-katie-user-research',
    tag: '#Radar',
    type: 'note',
    priority: 3,
    title: 'User research sync with Katie',
    snippet: 'Katie: "The research findings are really compelling. Should we present to leadership next week? What do you think about the fraud rate insights?"',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Present research to leadership?',
        collaborator: { name: 'katiek' },
        threadUrl: 'https://stripe.slack.com/archives/D05SUBXP78F/p1773890000000001',
        channel: 'DM with Katie',
      },
    },
    createdAt: daysAgo(3),
    lastTouchedAt: daysAgo(3),
  },
  // Discussion about priorities
  {
    id: 'slack-katie-priorities',
    tag: '#Radar',
    type: 'note',
    priority: 4,
    title: 'Q2 priorities discussion',
    snippet: 'Katie: "For Q2, I think we should focus on the overview dashboard first, then tackle the detailed views. Does that align with your thinking?"',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Q2 priority alignment',
        collaborator: { name: 'katiek' },
        threadUrl: 'https://stripe.slack.com/archives/D05SUBXP78F/p1773800000000002',
        channel: 'DM with Katie',
      },
    },
    createdAt: daysAgo(5),
    lastTouchedAt: daysAgo(5),
  },
];

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
];

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 2 & 10: Timeline context (past and future items)
// Need: Items spread across yesterday, today, tomorrow for "What Was That Thing?" recovery
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
  // Journey 2: "What Was That Thing?" - items from earlier this week
  {
    id: 'drive-user-research-doc',
    tag: '#Radar',
    type: 'artifact',
    priority: 4,
    title: 'Radar User Research Findings',
    snippet: 'Key insights from 12 user interviews. "Users want to see fraud in context of their business, not abstract charts."',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Radar User Research Findings',
        executiveSummary: 'User research summary for Radar redesign',
        lastEditors: [{ name: 'Katie Koch', editedAt: daysAgo(3) }],
        webUrl: 'https://docs.google.com/document/d/1abc123/edit',
      },
    },
    createdAt: daysAgo(5),
    lastTouchedAt: daysAgo(3),
  },
  {
    id: 'slack-figma-link-share',
    tag: '#Radar',
    type: 'note',
    priority: 3,
    title: 'Figma link from Katie',
    snippet: 'Here\'s the latest Figma file with the performance metrics exploration: figma.com/file/xyz',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Shared design file',
        collaborator: { name: 'katiek' },
        threadUrl: 'https://stripe.slack.com/archives/D05SUBXP78F/p1773890000000000',
        channel: 'DM with Katie',
      },
    },
    createdAt: daysAgo(4),
    lastTouchedAt: daysAgo(4),
  },
  // 2 days ago
  {
    id: 'figma-disputes-flow',
    tag: '#Disputes',
    type: 'artifact',
    priority: 4,
    title: 'Disputes Flow Redesign',
    snippet: 'Updated flow with auto-submit preview screen and user controls',
    source: 'figma',
    sourceMeta: {
      source: 'figma',
      meta: {
        fileName: 'Disputes Flow Redesign',
        lastModified: daysAgo(2),
        desktopUrl: 'figma://file/disputes123',
      },
    },
    createdAt: daysAgo(10),
    lastTouchedAt: daysAgo(2),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 6: Project Pulse Check
// Need: Multiple projects with varying health states (active, stale, blocked)
// ═══════════════════════════════════════════════════════════════════════════

const projectItems: MindItem[] = [
  // Active project with momentum (#Radar - healthy)
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
  // #Disputes project - needs attention (pending decision)
  {
    id: 'slack-disputes-pending-decision',
    tag: '#Disputes',
    type: 'note',
    priority: 5,
    title: 'Pending: Auto-submit rollout scope',
    snippet: 'Need to decide: do we launch auto-submit to all merchants or start with subset? Engineering waiting on this call.',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Rollout scope decision needed',
        collaborator: { name: 'jesstam' },
        threadUrl: 'https://stripe.slack.com/archives/C08QZC57TD4/p1773956055380821',
        channel: '#radar-disputes',
      },
    },
    createdAt: daysAgo(3),
    lastTouchedAt: daysAgo(2),
  },
  // #Terminal project - stale (no activity in 8 days)
  {
    id: 'slack-terminal-feedback',
    tag: '#Terminal',
    type: 'note',
    priority: 3,
    title: 'Terminal reader UX feedback',
    snippet: 'Some thoughts on the reader configuration flow. Users find it confusing when they have multiple readers.',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'UX feedback on reader config',
        collaborator: { name: 'perryh' },
        threadUrl: 'https://stripe.slack.com/archives/C0terminal/p123',
        channel: '#terminal-design',
      },
    },
    createdAt: daysAgo(12),
    lastTouchedAt: daysAgo(8),
  },
  // #PayIntel project - active with recent doc
  {
    id: 'drive-payintel-roadmap',
    tag: '#PayIntel',
    type: 'artifact',
    priority: 4,
    title: 'PayIntel Q2 Roadmap',
    snippet: 'Prioritized list of payment intelligence features for Q2',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'PayIntel Q2 Roadmap',
        executiveSummary: 'Q2 feature priorities',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: hoursAgo(6) }],
        webUrl: 'https://docs.google.com/document/d/payintel-roadmap/edit',
      },
    },
    createdAt: daysAgo(30),
    lastTouchedAt: hoursAgo(6),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 8: End-of-Day Digest
// Need: Mix of items touched today showing full day's activity
// ═══════════════════════════════════════════════════════════════════════════

const todayItems: MindItem[] = [
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
  {
    id: 'slack-design-ai-thread',
    tag: '#DesigningAI',
    type: 'note',
    priority: 3,
    title: 'AI Design: Fictional Data Unlock',
    snippet: 'The process of recruiting users → generating fictional data to make the product feel real is such a great unlock!',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'AI design methodologies',
        collaborator: { name: '#designing-ai' },
        threadUrl: 'https://stripe.slack.com/archives/C08P4284UTV/p1773957167506239',
        channel: '#designing-ai',
      },
    },
    createdAt: hoursAgo(5),
    lastTouchedAt: hoursAgo(5),
  },
  {
    id: 'figma-radar-components',
    tag: '#Radar',
    type: 'artifact',
    priority: 3,
    title: 'Radar Component Library',
    snippet: 'Updated chart components with new color palette',
    source: 'figma',
    sourceMeta: {
      source: 'figma',
      meta: {
        fileName: 'Radar Component Library',
        lastModified: hoursAgo(3),
        desktopUrl: 'figma://file/components123',
      },
    },
    createdAt: daysAgo(60),
    lastTouchedAt: hoursAgo(3),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 10: Context Handoff - Past meetings for continuity
// ═══════════════════════════════════════════════════════════════════════════

const pastMeetings: MindItem[] = [
  {
    id: 'cal-yesterday-standup',
    tag: '#Radar',
    type: 'event',
    priority: 3,
    title: 'Radar Design Standup',
    snippet: 'Yesterday\'s standup - discussed overview progress',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'standup',
        startsAt: daysAgo(1),
        endsAt: daysAgo(1),
        tetheredArtifacts: [],
        attendees: [
          { name: 'jacobmeltzer@stripe.com' },
          { name: 'katiek@stripe.com' },
        ],
        zoomLink: 'https://stripe.zoom.us/j/91961598884',
      },
    },
    createdAt: daysAgo(7),
    lastTouchedAt: daysAgo(1),
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
];

// ═══════════════════════════════════════════════════════════════════════════
// COMBINE ALL ITEMS
// ═══════════════════════════════════════════════════════════════════════════

export const liveItems: MindItem[] = [
  // Journey 1: Meeting Prep - Katie 1:1 with rich context
  ...upcomingMeetings,
  ...katieRelatedItems,
  
  // Journey 3: Morning Scan (Waiting items)
  ...waitingItems,
  
  // Journey 4: Commitment Catch
  ...commitmentItems,
  
  // Journey 9: Stale Nudges
  ...staleItems,
  
  // Journeys 2 & 10: Timeline context + past meetings
  ...timelineItems,
  ...pastMeetings,
  
  // Journey 6: Project variety (multiple projects, different health)
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

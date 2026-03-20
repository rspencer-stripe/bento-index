import { MindItem } from './types';

// Transform real MCP data into MindItems
// This data was fetched from live MCP sources on March 20, 2026

const now = new Date();
const todayAt = (hour: number, min: number = 0) => {
  const d = new Date();
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

// Calendar events from Google Calendar MCP
const calendarItems: MindItem[] = [
  {
    id: 'cal-ai-day-jam',
    tag: '#Design',
    type: 'event',
    priority: 5,
    title: 'AI Day Jam',
    snippet: 'Booking a room in the morning for people in Oyster Point to hang out and design with AI together.',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'focus',
        startsAt: todayAt(8, 30),
        endsAt: todayAt(12, 0),
        tetheredArtifacts: [],
        attendees: [
          { name: 'jeffreyg@stripe.com' },
          { name: 'mcao@stripe.com' },
          { name: 'katb@stripe.com' },
        ],
        location: 'SSF-B1-3-24-Internet',
      },
    },
    createdAt: todayAt(0, 0),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-friday-fireside',
    tag: '#Company',
    type: 'event',
    priority: 3,
    title: 'Friday Fireside',
    snippet: 'Stripe-wide Friday Fireside event',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'external',
        startsAt: todayAt(9, 0),
        endsAt: todayAt(10, 0),
        tetheredArtifacts: ['https://go/stripetv/live'],
        attendees: [],
        zoomLink: 'https://stripe.zoom.us/j/92764267390',
      },
    },
    createdAt: todayAt(0, 0),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-radar-plus-weekly',
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
        startsAt: todayAt(11, 30),
        endsAt: todayAt(12, 0),
        tetheredArtifacts: ['https://docs.google.com/document/d/1RTKIp_q7MjhB5OC99LrzCLMz8evthlV3-gCI_B1jOeY/edit'],
        attendees: [
          { name: 'tpianta@stripe.com' },
          { name: 'yuhsin@stripe.com' },
          { name: 'jacobmeltzer@stripe.com' },
          { name: 'shayperez@stripe.com' },
        ],
        zoomLink: 'https://stripe.zoom.us/j/91961598884',
      },
    },
    createdAt: todayAt(0, 0),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-pas-biweekly',
    tag: '#PAS',
    type: 'event',
    priority: 4,
    title: '🍩 PAS bi-weekly',
    snippet: 'Payments and Support design bi-weekly sync',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'standup',
        startsAt: '2026-03-23T10:00:00',
        endsAt: '2026-03-23T10:30:00',
        tetheredArtifacts: ['https://docs.google.com/document/d/15dn9jt75ISH75lsw_HSkoOTLrI67nn9sxuFqam-nAUo/edit'],
        attendees: [
          { name: 'katiek@stripe.com' },
        ],
        zoomLink: 'https://stripe.zoom.us/j/97520487207',
      },
    },
    createdAt: todayAt(0, 0),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-anne-catherine-ryan',
    tag: '#1on1',
    type: 'event',
    priority: 3,
    title: 'Anne Catherine / Ryan',
    snippet: '1:1 sync with Anne Catherine',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'oneOnOne',
        startsAt: '2026-03-23T10:30:00',
        endsAt: '2026-03-23T11:00:00',
        tetheredArtifacts: [],
        attendees: [
          { name: 'annecath@stripe.com' },
        ],
        zoomLink: 'https://stripe.zoom.us/j/96644612889',
      },
    },
    createdAt: todayAt(0, 0),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-ryan-katie',
    tag: '#1on1',
    type: 'event',
    priority: 4,
    title: 'Ryan / Katie',
    snippet: '1:1 sync with Katie Koch',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'oneOnOne',
        startsAt: '2026-03-24T12:30:00',
        endsAt: '2026-03-24T13:00:00',
        tetheredArtifacts: ['https://drive.google.com/open?id=1q-wZhopMpi0aqNJV1RSqjnfGNUKivplIZYjv5iaRvNo'],
        attendees: [
          { name: 'katiek@stripe.com' },
        ],
        zoomLink: 'https://stripe.zoom.us/j/95949759347',
      },
    },
    createdAt: todayAt(0, 0),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-radar-enterprise-xfn',
    tag: '#Radar',
    type: 'event',
    priority: 4,
    title: '[Radar Enterprise] XFN Meeting',
    snippet: 'Cross-functional meeting for Radar Enterprise',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'meeting',
        startsAt: '2026-03-24T10:00:00',
        endsAt: '2026-03-24T10:30:00',
        tetheredArtifacts: [],
        attendees: [
          { name: 'katiek@stripe.com' },
          { name: 'jacobmeltzer@stripe.com' },
          { name: 'blair@stripe.com' },
        ],
        zoomLink: 'https://stripe.zoom.us/j/92289006928',
      },
    },
    createdAt: todayAt(0, 0),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-radar-overview-weekly',
    tag: '#Radar',
    type: 'event',
    priority: 4,
    title: 'Radar Overview: Weekly Working Group',
    snippet: 'Weekly working group for Radar Overview feature',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'standup',
        startsAt: '2026-03-24T11:00:00',
        endsAt: '2026-03-24T11:25:00',
        tetheredArtifacts: ['https://docs.google.com/document/d/1dVaW0c0XqayqnU6Yds6pdHcqY6BFlS_DpemnaTldB_Y/edit'],
        attendees: [
          { name: 'sreeramv@stripe.com' },
          { name: 'winfield@stripe.com' },
          { name: 'rogerlai@stripe.com' },
        ],
        zoomLink: 'https://stripe.zoom.us/j/97883467333',
      },
    },
    createdAt: todayAt(0, 0),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-risk-platform-design',
    tag: '#RiskPlatform',
    type: 'event',
    priority: 4,
    title: 'Risk platform design x-org [weekly]',
    snippet: 'Cross-org design sync for Risk platform',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'standup',
        startsAt: '2026-03-26T09:00:00',
        endsAt: '2026-03-26T10:00:00',
        tetheredArtifacts: ['https://docs.google.com/document/d/1ZJYhVfKxdwiwsOvyL6xVAcPaEgy5Twt6GPWbea2DW1o/edit'],
        attendees: [
          { name: 'katiek@stripe.com' },
          { name: 'sadhika@stripe.com' },
          { name: 'annecath@stripe.com' },
        ],
        zoomLink: 'https://stripe.zoom.us/j/97366039462',
      },
    },
    createdAt: todayAt(0, 0),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-radar-staff-weekly',
    tag: '#Radar',
    type: 'event',
    priority: 5,
    title: 'Radar Staff Weekly',
    snippet: 'Weekly staff meeting for Radar team',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'standup',
        startsAt: '2026-03-26T10:00:00',
        endsAt: '2026-03-26T10:25:00',
        tetheredArtifacts: ['https://docs.google.com/document/d/1fNP1pku-9n3qerHZghvNdTtM-UTuYU6piCCM8taUaqg/edit'],
        attendees: [
          { name: 'jackerman@stripe.com' },
          { name: 'jacobmeltzer@stripe.com' },
          { name: 'yuhsin@stripe.com' },
        ],
        zoomLink: 'https://stripe.zoom.us/j/92172716597',
      },
    },
    createdAt: todayAt(0, 0),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-payintel-product-review',
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
        startsAt: '2026-03-26T10:30:00',
        endsAt: '2026-03-26T11:30:00',
        tetheredArtifacts: ['https://docs.google.com/spreadsheets/d/1PXbJtq4vKP07e1bFzXq112ybabL0r8OaP7LBom8EC5I/edit'],
        attendees: [
          { name: 'jackerman@stripe.com' },
        ],
        zoomLink: 'https://stripe.zoom.us/j/96169299256',
      },
    },
    createdAt: todayAt(0, 0),
    lastTouchedAt: todayAt(8, 0),
  },
  {
    id: 'cal-radar-design-planning',
    tag: '#Radar',
    type: 'event',
    priority: 4,
    title: 'Radar Design: Planning & Sync',
    snippet: 'Planning and sync for Radar design team',
    source: 'calendar',
    sourceMeta: {
      source: 'calendar',
      meta: {
        eventType: 'standup',
        startsAt: '2026-03-26T11:30:00',
        endsAt: '2026-03-26T12:00:00',
        tetheredArtifacts: ['https://docs.google.com/document/d/1qKmbHpjI8CGx4j9TNHRCJFttT5PYX-oZVv2Xa1PNoLs/edit'],
        attendees: [
          { name: 'annecath@stripe.com' },
          { name: 'shayperez@stripe.com' },
          { name: 'katiek@stripe.com' },
        ],
        zoomLink: 'https://stripe.zoom.us/j/96883372595',
      },
    },
    createdAt: todayAt(0, 0),
    lastTouchedAt: todayAt(8, 0),
  },
];

// Slack messages from Slack MCP
const slackItems: MindItem[] = [
  {
    id: 'slack-console-ai-review',
    tag: '#AI',
    type: 'note',
    priority: 5,
    title: 'Console AI Experience Review',
    snippet: "Have you explored Console yet? I was just playing with it and we'll need to find a better way to integrate with it. Asked \"what's my fraud rate\" and it didn't know how to calculate the info.",
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
    createdAt: todayAt(10, 0),
    lastTouchedAt: todayAt(10, 0),
  },
  {
    id: 'slack-disputes-handoff',
    tag: '#Disputes',
    type: 'note',
    priority: 4,
    title: 'Disputes Handoff Discussion',
    snippet: "That'd be great, we had a handoff discussion this afternoon but would be great to develop a tighter sync and workflow with the team.",
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
    createdAt: todayAt(9, 30),
    lastTouchedAt: todayAt(9, 30),
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
        collaborator: { name: 'katiek, jesstam' },
        threadUrl: 'https://stripe.slack.com/archives/C08QZC57TD4/p1773956055380819',
        channel: '#radar-disputes',
        hasResearchFindings: true,
      },
    },
    createdAt: todayAt(9, 0),
    lastTouchedAt: todayAt(9, 0),
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
    createdAt: todayAt(8, 45),
    lastTouchedAt: todayAt(8, 45),
  },
  {
    id: 'slack-radar-overview-jam',
    tag: '#Radar',
    type: 'note',
    priority: 4,
    title: 'Radar Overview Jam Session',
    snippet: 'With the product meeting canceled anyone want to jam on overview until the hour? Made a version to click through that idea this morning.',
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Organizing impromptu design jam for Radar overview',
        collaborator: { name: '#radar-design' },
        threadUrl: 'https://stripe.slack.com/archives/C0A1GU3K9KM/p1773952660621959',
        channel: '#radar-design',
        hasPrototype: true,
      },
    },
    createdAt: todayAt(8, 30),
    lastTouchedAt: todayAt(8, 30),
  },
  {
    id: 'slack-risk-platform-feedback',
    tag: '#RiskPlatform',
    type: 'note',
    priority: 3,
    title: 'Risk Platform Design Feedback',
    snippet: "I do too but the problem is that then it's a duplicate of the module below it. Need to think about it more.",
    source: 'slack',
    sourceMeta: {
      source: 'slack',
      meta: {
        coreAsk: 'Design feedback on Risk Platform module',
        collaborator: { name: '#risk-platform-design' },
        threadUrl: 'https://stripe.slack.com/archives/C09RUL37EN7/p1773942724595549',
        channel: '#risk-platform-design',
        needsDecision: true,
      },
    },
    createdAt: todayAt(7, 30),
    lastTouchedAt: todayAt(7, 30),
  },
];

// Drive documents from Google Drive MCP
const driveItems: MindItem[] = [
  {
    id: 'drive-radar-design-planning',
    tag: '#Radar',
    type: 'artifact',
    priority: 5,
    title: 'Notes - Radar Design: Planning & Sync',
    snippet: 'Planning and sync notes for Radar design team - last modified today',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Notes - Radar Design: Planning & Sync',
        executiveSummary: 'Weekly planning notes for design team',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: todayAt(11, 47) }],
        webUrl: 'https://docs.google.com/document/d/1qKmbHpjI8CGx4j9TNHRCJFttT5PYX-oZVv2Xa1PNoLs/edit',
      },
    },
    createdAt: '2025-11-12T16:28:29Z',
    lastTouchedAt: todayAt(11, 47),
  },
  {
    id: 'drive-radar-overview-prototype',
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
        lastEditors: [{ name: 'Ryan Spencer', editedAt: '2026-03-18T23:20:23Z' }],
        webUrl: 'https://docs.google.com/document/d/1jvWFjLtp7ohi8vn-jptgKqu307L0SaAiMu_sJWgz1z0/edit',
      },
    },
    createdAt: '2026-03-18T22:38:12Z',
    lastTouchedAt: '2026-03-18T23:20:23Z',
  },
  {
    id: 'drive-payintel-design-tracker',
    tag: '#PayIntel',
    type: 'artifact',
    priority: 4,
    title: 'Payment intelligence design tracker',
    snippet: 'go/payintel-design-tracker - Project tracking spreadsheet',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Payment intelligence design tracker',
        executiveSummary: 'Design project tracker for PayIntel',
        lastEditors: [{ name: 'Katie Koch', editedAt: '2026-03-16T15:47:27Z' }],
        webUrl: 'https://docs.google.com/spreadsheets/d/1gN_F70CgKP8WYHK_EGyJVgfHChPGkHLkObppLwVQOK8/edit',
      },
    },
    createdAt: '2024-05-30T21:02:48Z',
    lastTouchedAt: '2026-03-16T15:47:27Z',
  },
  {
    id: 'drive-disputes-prevention-notes',
    tag: '#Disputes',
    type: 'artifact',
    priority: 4,
    title: 'Disputes Prevention | Design Notes',
    snippet: 'Design notes for dispute prevention feature',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Disputes Prevention | Design Notes',
        executiveSummary: 'Design documentation for disputes prevention',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: '2025-03-26T23:35:42Z' }],
        webUrl: 'https://docs.google.com/document/d/1UJVN9ivBsgRK7lmcWk2SQuOMqFX7dIwQdkI6A7V__2s/edit',
      },
    },
    createdAt: '2025-02-10T18:48:35Z',
    lastTouchedAt: '2025-03-26T23:35:42Z',
  },
  {
    id: 'drive-radar-sku-notes',
    tag: '#Radar',
    type: 'artifact',
    priority: 4,
    title: 'Radar SKU Design: Notes & AIs',
    snippet: 'Notes and action items for Radar SKU design work',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Radar SKU Design: Notes & AIs',
        executiveSummary: 'SKU design notes and action items',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: '2025-09-06T04:59:05Z' }],
        webUrl: 'https://docs.google.com/document/d/1Pf2D_oQYoXIBTMY8qMNpc1_fKGGAM0cjLHy2f6Cywhg/edit',
      },
    },
    createdAt: '2025-08-13T16:30:55Z',
    lastTouchedAt: '2025-09-06T04:59:05Z',
  },
  {
    id: 'drive-radar-overview-ux-brief',
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
        lastEditors: [{ name: 'Ryan Spencer', editedAt: '2026-01-27T21:26:11Z' }],
        webUrl: 'https://docs.google.com/document/d/1l4rj4_0acf8Xtb1IGcDGkv5M2gmLdSbeuKL4sga2TBQ/edit',
      },
    },
    createdAt: '2025-12-15T19:36:28Z',
    lastTouchedAt: '2026-01-27T21:26:11Z',
  },
  {
    id: 'drive-radar-design-vision',
    tag: '#Radar',
    type: 'artifact',
    priority: 4,
    title: 'Radar design vision 2026: Trust layer',
    snippet: 'Vision document for future of Radar - Trust layer concept',
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: 'Radar design vision 2026: Trust layer',
        executiveSummary: 'Future vision and roadmap for Radar',
        lastEditors: [{ name: 'Ryan Spencer', editedAt: '2025-08-27T23:12:42Z' }],
        webUrl: 'https://docs.google.com/document/d/1yP0ZjpUWipGCHub0e9MFRdxHnh1NOFLoHNs9t6Qaxbs/edit',
      },
    },
    createdAt: '2025-08-16T06:49:43Z',
    lastTouchedAt: '2025-08-27T23:12:42Z',
  },
];

// Combine all items
export const liveItems: MindItem[] = [
  ...calendarItems,
  ...slackItems,
  ...driveItems,
];

// Extract all unique attendees from calendar events
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

// Get items related to a specific meeting (by shared attendees or tags)
export function getItemsRelatedToMeeting(meeting: MindItem, allItems: MindItem[]): MindItem[] {
  if (meeting.source !== 'calendar') return [];
  
  const meta = meeting.sourceMeta.meta as { attendees?: { name: string }[] };
  const attendeeNames = new Set(meta.attendees?.map(a => a.name.split('@')[0].toLowerCase()) || []);
  const meetingTag = meeting.tag;
  
  return allItems.filter(item => {
    if (item.id === meeting.id) return false;
    
    // Same tag
    if (item.tag === meetingTag) return true;
    
    // Shared collaborators (for Slack items)
    if (item.source === 'slack') {
      const slackMeta = item.sourceMeta.meta as { collaborator?: { name: string } };
      const collaboratorNames = slackMeta.collaborator?.name.split(/[,\s]+/).map(n => n.toLowerCase()) || [];
      return collaboratorNames.some(name => attendeeNames.has(name));
    }
    
    return false;
  });
}

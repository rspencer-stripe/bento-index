import { MindItem } from './types';

// Dynamic date helpers - compute fresh values on each call
const getNow = () => new Date();
const getToday = () => {
  const n = getNow();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};
const getTomorrow = () => new Date(getToday().getTime() + 24 * 60 * 60 * 1000);

const todayAt = (hour: number, minute: number = 0) => {
  const d = new Date(getToday());
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const tomorrowAt = (hour: number, minute: number = 0) => {
  const d = new Date(getTomorrow());
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const hoursAgo = (h: number) => new Date(getNow().getTime() - h * 60 * 60 * 1000).toISOString();
const minsAgo = (m: number) => new Date(getNow().getTime() - m * 60 * 1000).toISOString();
const daysAgo = (d: number) => new Date(getNow().getTime() - d * 24 * 60 * 60 * 1000).toISOString();

// Generate fresh calendar events with current timestamps
function generateCalendarEvents(): MindItem[] {
  return [
    {
      id: 'cal-craft-crit-slot1',
      tag: '#Design',
      type: 'event',
      priority: 4,
      title: 'Craft and quality crit: slot 1',
      snippet: 'Weekly design critique with Product Design team',
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
          ],
          zoomLink: 'https://stripe.zoom.us/j/98503893123',
        },
      },
      createdAt: daysAgo(30),
      lastTouchedAt: getNow().toISOString(),
    },
    {
      id: 'cal-craft-crit-link',
      tag: '#Link',
      type: 'event',
      priority: 4,
      title: 'Craft and quality crit: Incentives for returning Link users',
      snippet: 'Design review with akwan presenting',
      source: 'calendar',
      sourceMeta: {
        source: 'calendar',
        meta: {
          eventType: 'crit',
          startsAt: todayAt(10, 15),
          endsAt: todayAt(11, 0),
          tetheredArtifacts: ['http://go/pd/craft/agenda'],
          attendees: [
            { name: 'akwan@stripe.com' },
            { name: 'swanson@stripe.com' },
            { name: 'annacb@stripe.com' },
          ],
          zoomLink: 'https://stripe.zoom.us/j/98503893123',
          location: 'SSF-B1-F3-3.12-Calendar',
        },
      },
      createdAt: daysAgo(30),
      lastTouchedAt: getNow().toISOString(),
    },
    {
      id: 'cal-payintel-review',
      tag: '#PayIntel',
      type: 'event',
      priority: 4,
      title: 'PayIntel Product Review [Weekly]',
      snippet: 'Weekly sync with jackerman',
      source: 'calendar',
      sourceMeta: {
        source: 'calendar',
        meta: {
          eventType: 'standup',
          startsAt: todayAt(10, 30),
          endsAt: todayAt(11, 30),
          tetheredArtifacts: ['https://docs.google.com/spreadsheets/d/1PXbJtq4vKP07e1bFzXq112ybabL0r8OaP7LBom8EC5I/edit'],
          attendees: [{ name: 'jackerman@stripe.com' }],
          zoomLink: 'https://stripe.zoom.us/j/96169299256',
          location: 'DUB-1-104-Danube',
        },
      },
      createdAt: daysAgo(30),
      lastTouchedAt: getNow().toISOString(),
    },
    {
      id: 'cal-ian-catchup',
      tag: '#1on1',
      type: 'event',
      priority: 4,
      title: 'Ian / Ryan: Catch Up',
      snippet: '1:1 sync with Ian Collins',
      source: 'calendar',
      sourceMeta: {
        source: 'calendar',
        meta: {
          eventType: 'oneOnOne',
          startsAt: todayAt(11, 0),
          endsAt: todayAt(11, 30),
          tetheredArtifacts: [],
          attendees: [{ name: 'iancollins@stripe.com' }],
          zoomLink: 'https://stripe.zoom.us/j/96381176120',
        },
      },
      createdAt: daysAgo(30),
      lastTouchedAt: getNow().toISOString(),
    },
    {
      id: 'cal-dispute-prevention-demo',
      tag: '#Disputes',
      type: 'event',
      priority: 5,
      title: 'Dispute Prevention Design Demo',
      snippet: 'Demo with Ishan, Jess, and team',
      source: 'calendar',
      sourceMeta: {
        source: 'calendar',
        meta: {
          eventType: 'external',
          startsAt: todayAt(12, 30),
          endsAt: todayAt(13, 0),
          tetheredArtifacts: ['https://docs.google.com/document/d/1UJVN9ivBsgRK7lmcWk2SQuOMqFX7dIwQdkI6A7V__2s/edit'],
          attendees: [
            { name: 'ishanvirk@stripe.com' },
            { name: 'jesstam@stripe.com' },
            { name: 'yemi@stripe.com' },
            { name: 'maddmeier@stripe.com' },
          ],
          zoomLink: 'https://stripe.zoom.us/j/92794948960',
          location: 'NYC-31-7-Didgeridoo',
        },
      },
      createdAt: daysAgo(5),
      lastTouchedAt: getNow().toISOString(),
    },
    {
      id: 'cal-smart-refunds',
      tag: '#Refunds',
      type: 'event',
      priority: 4,
      title: '[w] Smart Refunds',
      snippet: 'Weekly with Yemi, Michael, Shaobo',
      source: 'calendar',
      sourceMeta: {
        source: 'calendar',
        meta: {
          eventType: 'standup',
          startsAt: todayAt(13, 30),
          endsAt: todayAt(13, 55),
          tetheredArtifacts: ['https://docs.google.com/document/d/1lMX9KNMH9wf8AQX_IlDB9B50f2TepuTDQov14j41qzY/edit'],
          attendees: [
            { name: 'linmichaelj@stripe.com' },
            { name: 'shaobo@stripe.com' },
            { name: 'yemi-archive@stripe.com' },
          ],
          zoomLink: 'https://stripe.zoom.us/j/99388746795',
        },
      },
      createdAt: daysAgo(30),
      lastTouchedAt: getNow().toISOString(),
    },
    {
      id: 'cal-sr-updates',
      tag: '#SmartResponses',
      type: 'event',
      priority: 3,
      title: 'Updates to SR',
      snippet: 'Smart Responses sync',
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
      createdAt: daysAgo(2),
      lastTouchedAt: getNow().toISOString(),
    },
    {
      id: 'cal-jamming',
      tag: '#Design',
      type: 'event',
      priority: 4,
      title: 'more jamming?',
      snippet: 'Design jam session with yuhsin',
      source: 'calendar',
      sourceMeta: {
        source: 'calendar',
        meta: {
          eventType: 'oneOnOne',
          startsAt: todayAt(15, 0),
          endsAt: todayAt(15, 45),
          tetheredArtifacts: [],
          attendees: [{ name: 'yuhsin@stripe.com' }],
          zoomLink: 'https://stripe.zoom.us/j/92713647039',
        },
      },
      createdAt: daysAgo(1),
      lastTouchedAt: getNow().toISOString(),
    },
    // Tomorrow's events
    {
      id: 'cal-apollo-standup',
      tag: '#Apollo',
      type: 'event',
      priority: 4,
      title: 'Apollo - Fraud optimization standup',
      snippet: 'Daily standup with Jacob, Yuhsin, and team',
      source: 'calendar',
      sourceMeta: {
        source: 'calendar',
        meta: {
          eventType: 'standup',
          startsAt: tomorrowAt(8, 45),
          endsAt: tomorrowAt(9, 0),
          tetheredArtifacts: ['https://docs.google.com/document/d/1F4nY_i-9tEevcVM0uuOxENIoja03hRJNS4toqi3TovE/edit'],
          attendees: [
            { name: 'jacobmeltzer@stripe.com' },
            { name: 'yuhsin@stripe.com' },
            { name: 'nialloh@stripe.com' },
          ],
          zoomLink: 'https://stripe.zoom.us/j/99161809057',
        },
      },
      createdAt: daysAgo(30),
      lastTouchedAt: getNow().toISOString(),
    },
    {
      id: 'cal-friday-fireside',
      tag: '#Stripe',
      type: 'event',
      priority: 3,
      title: 'Friday Fireside',
      snippet: 'Company-wide update',
      source: 'calendar',
      sourceMeta: {
        source: 'calendar',
        meta: {
          eventType: 'allHands',
          startsAt: tomorrowAt(9, 0),
          endsAt: tomorrowAt(10, 0),
          tetheredArtifacts: ['https://go/stripetv/live'],
          attendees: [],
        },
      },
      createdAt: daysAgo(30),
      lastTouchedAt: getNow().toISOString(),
    },
    {
      id: 'cal-apollo-next-steps',
      tag: '#Apollo',
      type: 'event',
      priority: 4,
      title: 'apollo product/design next steps',
      snippet: 'Planning session with Jacob and Yuhsin',
      source: 'calendar',
      sourceMeta: {
        source: 'calendar',
        meta: {
          eventType: 'standup',
          startsAt: tomorrowAt(15, 0),
          endsAt: tomorrowAt(15, 30),
          tetheredArtifacts: [],
          attendees: [
            { name: 'jacobmeltzer@stripe.com' },
            { name: 'yuhsin@stripe.com' },
          ],
          zoomLink: 'https://stripe.zoom.us/j/94502063918',
        },
      },
      createdAt: daysAgo(1),
      lastTouchedAt: getNow().toISOString(),
    },
  ];
}

// Generate fresh Slack messages with current timestamps
function generateSlackMessages(): MindItem[] {
  return [
    {
      id: 'slack-katiek-yep',
      tag: '#Radar',
      type: 'message',
      priority: 4,
      title: 'Katie: "yep"',
      snippet: 'Recent message from Katie in DM',
      source: 'slack',
      sourceMeta: {
        source: 'slack',
        meta: {
          coreAsk: 'Confirmation',
          collaborator: { name: 'katiek' },
          threadUrl: 'https://stripe.slack.com/archives/D05SUBXP78F/p1774030063180269',
          channel: 'DM with Katie',
        },
      },
      createdAt: minsAgo(5),
      lastTouchedAt: minsAgo(5),
    },
    {
      id: 'slack-katiek-nice',
      tag: '#Radar',
      type: 'message',
      priority: 3,
      title: 'Katie: "nice!"',
      snippet: 'Positive feedback from Katie',
      source: 'slack',
      sourceMeta: {
        source: 'slack',
        meta: {
          coreAsk: 'Feedback',
          collaborator: { name: 'katiek' },
          threadUrl: 'https://stripe.slack.com/archives/D05SUBXP78F/p1774027976324619',
          channel: 'DM with Katie',
        },
      },
      createdAt: minsAgo(30),
      lastTouchedAt: minsAgo(30),
    },
    {
      id: 'slack-winfield-fireside',
      tag: '#Stripe',
      type: 'message',
      priority: 4,
      title: 'Winfield: "you in the fireside?"',
      snippet: 'Was the Ryan you? that John just mentioned?',
      source: 'slack',
      sourceMeta: {
        source: 'slack',
        meta: {
          coreAsk: 'Were you mentioned in the fireside?',
          collaborator: { name: 'winfield' },
          threadUrl: 'https://stripe.slack.com/archives/D08E9ESBWAD/p1774023516088329',
          channel: 'DM with Winfield',
        },
      },
      createdAt: hoursAgo(2),
      lastTouchedAt: hoursAgo(2),
    },
    {
      id: 'slack-winfield-fraud',
      tag: '#Radar',
      type: 'message',
      priority: 5,
      title: 'Fraud over-allowing insights',
      snippet: 'Yeah and then a branch also from fraud that would be nice is am I over-allowing resulting in too much fraud e.g. with bad rules or bad changes to threshold etc.',
      source: 'slack',
      sourceMeta: {
        source: 'slack',
        meta: {
          coreAsk: 'Fraud detection insight',
          collaborator: { name: 'winfield' },
          threadUrl: 'https://stripe.slack.com/archives/D08E9ESBWAD/p1774018854744889',
          channel: 'DM with Winfield',
        },
      },
      createdAt: hoursAgo(3),
      lastTouchedAt: hoursAgo(3),
    },
    {
      id: 'slack-katiek-vision',
      tag: '#Radar',
      type: 'message',
      priority: 5,
      title: 'Radar vision beliefs from Katie',
      snippet: 'As Radar becomes more automated, the Radar product surface will become smaller and more oriented on observability and configuring the automation. Rule creation will increasingly become the domain of experts...',
      source: 'slack',
      sourceMeta: {
        source: 'slack',
        meta: {
          coreAsk: 'Vision document input',
          collaborator: { name: 'katiek' },
          threadUrl: 'https://stripe.slack.com/archives/D05SUBXP78F/p1774014066731949',
          channel: 'DM with Katie',
        },
      },
      createdAt: hoursAgo(4),
      lastTouchedAt: hoursAgo(4),
    },
    {
      id: 'slack-katiek-console',
      tag: '#Radar',
      type: 'message',
      priority: 5,
      title: 'HMW make Radar consumable in Console?',
      snippet: 'yes. this is top of mind for me. HMW make Radar immediately consumable in Console? I think this is where the fabric needs to head.',
      source: 'slack',
      sourceMeta: {
        source: 'slack',
        meta: {
          coreAsk: 'Console integration strategy',
          collaborator: { name: 'katiek' },
          threadUrl: 'https://stripe.slack.com/archives/D05SUBXP78F/p1774013933980759',
          channel: 'DM with Katie',
        },
      },
      createdAt: hoursAgo(5),
      lastTouchedAt: hoursAgo(5),
    },
    {
      id: 'slack-shayperez-meeting',
      tag: '#Disputes',
      type: 'message',
      priority: 4,
      title: 'Shay: sync request',
      snippet: 'shall we find time on Monday or Tuesday? would love to meet all of us just so i have a better idea of the current state',
      source: 'slack',
      sourceMeta: {
        source: 'slack',
        meta: {
          coreAsk: 'Schedule meeting for Disputes sync',
          collaborator: { name: 'shayperez' },
          threadUrl: 'https://stripe.slack.com/archives/C0AGL2J6KFX/p1773958211893999',
          channel: 'MPDM with Ishan, Shay, Katie',
        },
      },
      createdAt: hoursAgo(20),
      lastTouchedAt: hoursAgo(20),
    },
  ];
}

// Generate fresh Drive files with current timestamps
function generateDriveFiles(): MindItem[] {
  return [
    {
      id: 'drive-radar-strategy',
      tag: '#Radar',
      type: 'artifact',
      priority: 5,
      title: 'Radar design strategy',
      snippet: 'Strategic direction for Radar design - updated today',
      source: 'drive',
      sourceMeta: {
        source: 'drive',
        meta: {
          docTitle: 'Radar design strategy',
          executiveSummary: 'Strategic design direction for Radar',
          lastEditors: [{ name: 'Ryan Spencer', editedAt: hoursAgo(1) }],
          webUrl: 'https://docs.google.com/document/d/1goBEpIar-rL9d9KvPBr-cP4uRdQUF_aDqud-_Dxr0T8/edit',
        },
      },
      createdAt: daysAgo(10),
      lastTouchedAt: hoursAgo(1),
    },
    {
      id: 'drive-radar-planning-notes',
      tag: '#Radar',
      type: 'artifact',
      priority: 4,
      title: 'Notes - Radar Design: Planning & Sync',
      snippet: 'Running notes from Radar design planning meetings',
      source: 'drive',
      sourceMeta: {
        source: 'drive',
        meta: {
          docTitle: 'Notes - Radar Design: Planning & Sync',
          executiveSummary: 'Planning and sync notes',
          lastEditors: [{ name: 'Ryan Spencer', editedAt: daysAgo(1) }],
          webUrl: 'https://docs.google.com/document/d/1qKmbHpjI8CGx4j9TNHRCJFttT5PYX-oZVv2Xa1PNoLs/edit',
        },
      },
      createdAt: daysAgo(120),
      lastTouchedAt: daysAgo(1),
    },
    {
      id: 'drive-radar-vision-2026',
      tag: '#Radar',
      type: 'artifact',
      priority: 5,
      title: 'Radar design vision 2026: Trust layer',
      snippet: '2026 vision document for Radar as the Trust layer',
      source: 'drive',
      sourceMeta: {
        source: 'drive',
        meta: {
          docTitle: 'Radar design vision 2026: Trust layer',
          executiveSummary: 'Vision for Radar product direction',
          lastEditors: [{ name: 'Ryan Spencer', editedAt: daysAgo(7) }],
          webUrl: 'https://docs.google.com/document/d/1yP0ZjpUWipGCHub0e9MFRdxHnh1NOFLoHNs9t6Qaxbs/edit',
        },
      },
      createdAt: daysAgo(200),
      lastTouchedAt: daysAgo(7),
    },
    {
      id: 'drive-radar-overview-options',
      tag: '#Radar',
      type: 'artifact',
      priority: 4,
      title: 'Radar Overview: Design Options',
      snippet: 'Design exploration for Radar Overview page',
      source: 'drive',
      sourceMeta: {
        source: 'drive',
        meta: {
          docTitle: 'Radar Overview: Design Options',
          executiveSummary: 'Overview design exploration',
          lastEditors: [{ name: 'Ryan Spencer', editedAt: daysAgo(3) }],
          webUrl: 'https://docs.google.com/document/d/1GYbpeJOQySkY-1tkKGtKVEGZBQtN_4DC3tMR0ui-FNw/edit',
        },
      },
      createdAt: daysAgo(50),
      lastTouchedAt: daysAgo(3),
    },
    {
      id: 'drive-apollo-design-brief',
      tag: '#Apollo',
      type: 'artifact',
      priority: 4,
      title: 'Apollo | Design Brief & User Scenarios',
      snippet: 'Design brief and user scenarios for Apollo project',
      source: 'drive',
      sourceMeta: {
        source: 'drive',
        meta: {
          docTitle: 'Apollo | Design Brief & User Scenarios',
          executiveSummary: 'Apollo design brief',
          lastEditors: [{ name: 'Ryan Spencer', editedAt: daysAgo(5) }],
          webUrl: 'https://docs.google.com/document/d/1b8ShVGOyMUj6qLghqKqqrD38Z-NFdwsc_bsayKE6Yeo/edit',
        },
      },
      createdAt: daysAgo(365),
      lastTouchedAt: daysAgo(5),
    },
    {
      id: 'drive-disputes-feedback-analysis',
      tag: '#Disputes',
      type: 'artifact',
      priority: 5,
      title: 'Stripe Dispute Automation Feedback Analysis',
      snippet: 'Analysis of user feedback on dispute automation - created yesterday',
      source: 'drive',
      sourceMeta: {
        source: 'drive',
        meta: {
          docTitle: 'Stripe Dispute Automation Feedback Analysis',
          executiveSummary: 'Feedback analysis spreadsheet',
          lastEditors: [{ name: 'Ryan Spencer', editedAt: daysAgo(1) }],
          webUrl: 'https://docs.google.com/spreadsheets/d/1Q_DIY_SUWmEyfUJw91oVD3Jxsf9DxN4mBqf52uUdlGg/edit',
        },
      },
      createdAt: daysAgo(1),
      lastTouchedAt: daysAgo(1),
    },
    {
      id: 'drive-smart-disputes-feedback',
      tag: '#Disputes',
      type: 'artifact',
      priority: 4,
      title: 'Smart Disputes Feedback',
      snippet: 'Collected feedback on Smart Disputes feature',
      source: 'drive',
      sourceMeta: {
        source: 'drive',
        meta: {
          docTitle: 'Smart Disputes Feedback',
          executiveSummary: 'User feedback document',
          lastEditors: [{ name: 'Ryan Spencer', editedAt: daysAgo(6) }],
          webUrl: 'https://docs.google.com/document/d/1c1OV6kr9zuZZPBmDF9Wm_VeSgSRM6lDRRvHjlvi9vlw/edit',
        },
      },
      createdAt: daysAgo(17),
      lastTouchedAt: daysAgo(6),
    },
    {
      id: 'drive-disputes-prevention-scenarios',
      tag: '#Disputes',
      type: 'artifact',
      priority: 4,
      title: 'Disputes Prevention | User Scenarios',
      snippet: 'User scenarios for dispute prevention feature',
      source: 'drive',
      sourceMeta: {
        source: 'drive',
        meta: {
          docTitle: 'Disputes Prevention | User Scenarios',
          executiveSummary: 'User scenario documentation',
          lastEditors: [{ name: 'Ryan Spencer', editedAt: daysAgo(30) }],
          webUrl: 'https://docs.google.com/document/d/1G4_cMlWVD5Y7zdl_qpSu5pP3KoQLX5BgJlRq_OS5mOc/edit',
        },
      },
      createdAt: daysAgo(400),
      lastTouchedAt: daysAgo(30),
    },
  ];
}

// Export a function that generates fresh data on each call
export function getRealItems(): MindItem[] {
  return [
    ...generateCalendarEvents(),
    ...generateSlackMessages(),
    ...generateDriveFiles(),
  ];
}

// For backward compatibility - but prefer getRealItems()
export const realItems = getRealItems();
export const realCalendarEvents = generateCalendarEvents();
export const realSlackMessages = generateSlackMessages();
export const realDriveFiles = generateDriveFiles();

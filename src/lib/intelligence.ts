// INDEX Intelligence Layer
// Powers: Meeting Companion, What's Next, Project Pulse, Daily Digest, Commitment Tracker

import { MindItem, CalendarMeta } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UpcomingMeeting {
  item: MindItem;
  startsAt: Date;
  endsAt: Date;
  attendees: string[];
  minsUntil: number;
  relatedItems: MindItem[];
  suggestedTopics: string[];
  openQuestions: string[];
}

export interface NextAction {
  item: MindItem;
  reason: string;
  urgency: 'now' | 'soon' | 'today' | 'this_week';
  actionType: 'respond' | 'review' | 'prepare' | 'decide' | 'create' | 'follow_up';
  estimatedMins: number;
}

export interface ProjectHealth {
  tag: string;
  displayName: string;
  itemCount: number;
  lastActivity: Date;
  daysSinceActivity: number;
  status: 'active' | 'stale' | 'blocked' | 'completed';
  openItems: number;
  recentMomentum: 'rising' | 'steady' | 'falling';
  topItems: MindItem[];
  pendingDecisions: string[];
}

export interface Commitment {
  id: string;
  text: string;
  extractedFrom: MindItem;
  dueDate?: Date;
  status: 'pending' | 'done' | 'overdue';
  relatedTo?: string[];
}

export interface DailyDigest {
  date: Date;
  summary: string;
  completedCount: number;
  newItemsCount: number;
  meetingsHad: number;
  topMoments: Array<{ title: string; items: MindItem[] }>;
  stillOpen: MindItem[];
  tomorrowPrep: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MEETING COMPANION
// ═══════════════════════════════════════════════════════════════════════════

export function getUpcomingMeetings(items: MindItem[], withinHours: number = 4): UpcomingMeeting[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() + withinHours * 60 * 60 * 1000);

  const meetings = items
    .filter(item => item.source === 'calendar')
    .map(item => {
      const meta = item.sourceMeta.meta as CalendarMeta;
      const startsAt = new Date(meta.startsAt);
      const endsAt = new Date(meta.endsAt);
      return { item, meta, startsAt, endsAt };
    })
    .filter(({ startsAt }) => startsAt > now && startsAt <= cutoff)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  return meetings.map(({ item, meta, startsAt, endsAt }) => {
    const attendeeNames = meta.attendees.map(a => a.name);
    const minsUntil = Math.round((startsAt.getTime() - now.getTime()) / 60000);

    // Find related items by attendee names or similar tags
    const relatedItems = items.filter(i => {
      if (i.id === item.id) return false;
      
      // Check if item mentions any attendee
      const mentionsAttendee = attendeeNames.some(name => 
        i.title.toLowerCase().includes(name.toLowerCase().split(' ')[0]) ||
        i.snippet?.toLowerCase().includes(name.toLowerCase().split(' ')[0])
      );
      
      // Check if same project/tag
      const sameTag = i.tag === item.tag;
      
      // Check recency (within last 7 days)
      const isRecent = (now.getTime() - new Date(i.lastTouchedAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
      
      return (mentionsAttendee || sameTag) && isRecent;
    }).slice(0, 5);

    // Generate suggested topics from related items
    const suggestedTopics = relatedItems
      .filter(i => i.type === 'note' || i.type === 'task')
      .map(i => i.title)
      .slice(0, 3);

    // Extract open questions from snippets
    const openQuestions = relatedItems
      .filter(i => i.snippet?.includes('?'))
      .map(i => {
        const match = i.snippet?.match(/[^.!?]*\?/);
        return match ? match[0].trim() : null;
      })
      .filter(Boolean)
      .slice(0, 3) as string[];

    return {
      item,
      startsAt,
      endsAt,
      attendees: attendeeNames,
      minsUntil,
      relatedItems,
      suggestedTopics,
      openQuestions,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// WHAT'S NEXT (Focus Mode)
// ═══════════════════════════════════════════════════════════════════════════

export function getNextActions(items: MindItem[], limit: number = 5): NextAction[] {
  const now = new Date();
  
  const scoredItems = items
    .filter(item => item.source !== 'calendar') // Exclude meetings themselves
    .map(item => {
      let score = 0;
      let reason = '';
      let urgency: NextAction['urgency'] = 'this_week';
      let actionType: NextAction['actionType'] = 'review';
      let estimatedMins = 15;

      const hoursSinceTouch = (now.getTime() - new Date(item.lastTouchedAt).getTime()) / (1000 * 60 * 60);
      const daysSinceTouch = hoursSinceTouch / 24;

      // Priority boost
      score += item.priority * 20;

      // Recency - things touched recently might need follow-up
      if (hoursSinceTouch < 2) {
        score += 30;
        reason = 'Recently active';
        urgency = 'now';
      } else if (hoursSinceTouch < 8) {
        score += 20;
        reason = 'From earlier today';
        urgency = 'soon';
      }

      // Staleness penalty for items that should have been addressed
      if (daysSinceTouch > 2 && daysSinceTouch < 7 && item.priority >= 4) {
        score += 25;
        reason = 'High priority, needs attention';
        urgency = 'today';
        actionType = 'follow_up';
      }

      // Slack messages often need responses
      if (item.source === 'slack') {
        score += 15;
        if (hoursSinceTouch < 4) {
          actionType = 'respond';
          reason = 'Awaiting response';
          estimatedMins = 5;
        }
      }

      // Figma comments need review
      if (item.source === 'figma') {
        actionType = 'review';
        reason = 'Design feedback needed';
        estimatedMins = 10;
      }

      // Tasks are actionable
      if (item.type === 'task') {
        score += 20;
        actionType = 'decide';
        reason = 'Action required';
      }

      // Check for question marks (someone asking something)
      if (item.snippet?.includes('?') || item.title.includes('?')) {
        score += 15;
        actionType = 'respond';
        if (!reason) reason = 'Question needs answer';
      }

      // Check for mentions of "waiting" or "blocked"
      const text = `${item.title} ${item.snippet || ''}`.toLowerCase();
      if (text.includes('waiting') || text.includes('blocked') || text.includes('need')) {
        score += 20;
        actionType = 'follow_up';
        if (!reason) reason = 'May be blocked';
      }

      // Check for decision language
      if (text.includes('decide') || text.includes('choice') || text.includes('option')) {
        actionType = 'decide';
        if (!reason) reason = 'Decision pending';
      }

      return { item, score, reason, urgency, actionType, estimatedMins };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scoredItems.map(({ item, reason, urgency, actionType, estimatedMins }) => ({
    item,
    reason: reason || 'Review and process',
    urgency,
    actionType,
    estimatedMins,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// PROJECT PULSE
// ═══════════════════════════════════════════════════════════════════════════

export function getProjectHealth(items: MindItem[]): ProjectHealth[] {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Group by tag
  const byTag = items.reduce((acc, item) => {
    if (!acc[item.tag]) acc[item.tag] = [];
    acc[item.tag].push(item);
    return acc;
  }, {} as Record<string, MindItem[]>);

  return Object.entries(byTag)
    .map(([tag, tagItems]) => {
      // Find most recent activity
      const sortedByRecency = [...tagItems].sort(
        (a, b) => new Date(b.lastTouchedAt).getTime() - new Date(a.lastTouchedAt).getTime()
      );
      
      const lastActivity = new Date(sortedByRecency[0].lastTouchedAt);
      const daysSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);

      // Count items in different time windows
      const recentWeek = tagItems.filter(i => new Date(i.lastTouchedAt) > oneWeekAgo).length;
      const previousWeek = tagItems.filter(i => {
        const touched = new Date(i.lastTouchedAt);
        return touched > twoWeeksAgo && touched <= oneWeekAgo;
      }).length;

      // Determine momentum
      let recentMomentum: ProjectHealth['recentMomentum'] = 'steady';
      if (recentWeek > previousWeek * 1.5) recentMomentum = 'rising';
      else if (recentWeek < previousWeek * 0.5) recentMomentum = 'falling';

      // Determine status
      let status: ProjectHealth['status'] = 'active';
      if (daysSinceActivity > 7) status = 'stale';
      if (daysSinceActivity > 14) status = 'blocked';

      // Count open items (tasks, high-priority notes)
      const openItems = tagItems.filter(i => 
        i.type === 'task' || (i.type === 'note' && i.priority >= 4)
      ).length;

      // Extract pending decisions
      const pendingDecisions = tagItems
        .filter(i => {
          const text = `${i.title} ${i.snippet || ''}`.toLowerCase();
          return text.includes('decide') || text.includes('choice') || text.includes('option') || text.includes('?');
        })
        .map(i => i.title)
        .slice(0, 3);

      return {
        tag,
        displayName: tag.replace('#', ''),
        itemCount: tagItems.length,
        lastActivity,
        daysSinceActivity: Math.round(daysSinceActivity),
        status,
        openItems,
        recentMomentum,
        topItems: sortedByRecency.slice(0, 3),
        pendingDecisions,
      };
    })
    .sort((a, b) => {
      // Sort by: active first, then by recency
      const statusOrder = { active: 0, stale: 1, blocked: 2, completed: 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.daysSinceActivity - b.daysSinceActivity;
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMITMENT TRACKER
// ═══════════════════════════════════════════════════════════════════════════

const COMMITMENT_PATTERNS = [
  /I'll\s+([^.!?]+)/gi,
  /I will\s+([^.!?]+)/gi,
  /Let me\s+([^.!?]+)/gi,
  /I can\s+([^.!?]+)/gi,
  /I'm going to\s+([^.!?]+)/gi,
  /Will do\s*([^.!?]*)/gi,
  /On it\s*([^.!?]*)/gi,
  /I'll follow up\s*([^.!?]*)/gi,
  /Action:\s*([^.!?\n]+)/gi,
  /TODO:\s*([^.!?\n]+)/gi,
  /Need to\s+([^.!?]+)/gi,
];

export function extractCommitments(items: MindItem[]): Commitment[] {
  const commitments: Commitment[] = [];
  const now = new Date();

  items.forEach(item => {
    // Only check slack messages and notes from the user
    if (item.source !== 'slack' && item.source !== 'omnibar') return;

    const text = `${item.title} ${item.snippet || ''}`;
    
    COMMITMENT_PATTERNS.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const commitmentText = match[1]?.trim();
        if (commitmentText && commitmentText.length > 5 && commitmentText.length < 200) {
          const itemDate = new Date(item.createdAt);
          const daysSince = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
          
          commitments.push({
            id: `commitment-${item.id}-${commitments.length}`,
            text: commitmentText,
            extractedFrom: item,
            status: daysSince > 3 ? 'overdue' : 'pending',
            relatedTo: [item.tag],
          });
        }
      }
    });
  });

  return commitments
    .sort((a, b) => {
      const statusOrder = { overdue: 0, pending: 1, done: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    })
    .slice(0, 20); // Limit to top 20
}

// ═══════════════════════════════════════════════════════════════════════════
// DAILY DIGEST
// ═══════════════════════════════════════════════════════════════════════════

export function generateDailyDigest(items: MindItem[], forDate: Date = new Date()): DailyDigest {
  const startOfDay = new Date(forDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(forDate);
  endOfDay.setHours(23, 59, 59, 999);

  const todayItems = items.filter(item => {
    const touched = new Date(item.lastTouchedAt);
    return touched >= startOfDay && touched <= endOfDay;
  });

  const newItems = items.filter(item => {
    const created = new Date(item.createdAt);
    return created >= startOfDay && created <= endOfDay;
  });

  const meetings = todayItems.filter(item => item.source === 'calendar');

  // Group by tag for top moments
  const byTag = todayItems.reduce((acc, item) => {
    if (!acc[item.tag]) acc[item.tag] = [];
    acc[item.tag].push(item);
    return acc;
  }, {} as Record<string, MindItem[]>);

  const topMoments = Object.entries(byTag)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([tag, tagItems]) => ({
      title: tag.replace('#', ''),
      items: tagItems.slice(0, 3),
    }));

  // Find still open items (high priority, not completed)
  const stillOpen = todayItems
    .filter(item => item.priority >= 4 && item.type !== 'event')
    .slice(0, 5);

  // Tomorrow prep - upcoming meetings
  const tomorrow = new Date(forDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStart = new Date(tomorrow);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const tomorrowMeetings = items
    .filter(item => {
      if (item.source !== 'calendar') return false;
      const meta = item.sourceMeta.meta as CalendarMeta;
      const starts = new Date(meta.startsAt);
      return starts >= tomorrowStart && starts <= tomorrowEnd;
    })
    .map(item => item.title);

  // Generate summary
  const summary = todayItems.length === 0 
    ? 'No activity tracked today.'
    : `${todayItems.length} items touched across ${Object.keys(byTag).length} projects. ${meetings.length} meetings.`;

  return {
    date: forDate,
    summary,
    completedCount: todayItems.filter(i => i.type === 'artifact').length,
    newItemsCount: newItems.length,
    meetingsHad: meetings.length,
    topMoments,
    stillOpen,
    tomorrowPrep: tomorrowMeetings.slice(0, 5),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKDAY BOUNDS
// ═══════════════════════════════════════════════════════════════════════════

export interface WorkdayBounds {
  start: Date;
  end: Date;
  durationHours: number;
}

export function getWorkdayBounds(items: MindItem[], forDate: Date = new Date()): WorkdayBounds {
  const dayStart = new Date(forDate);
  dayStart.setHours(0, 0, 0, 0);
  
  const dayEnd = new Date(forDate);
  dayEnd.setHours(23, 59, 59, 999);

  // Get all timestamps for today
  const timestamps: Date[] = [];

  items.forEach(item => {
    const touched = new Date(item.lastTouchedAt);
    if (touched >= dayStart && touched <= dayEnd) {
      timestamps.push(touched);
    }

    if (item.source === 'calendar') {
      const meta = item.sourceMeta.meta as CalendarMeta;
      const starts = new Date(meta.startsAt);
      const ends = new Date(meta.endsAt);
      
      if (starts >= dayStart && starts <= dayEnd) {
        timestamps.push(starts);
        timestamps.push(ends);
      }
    }
  });

  if (timestamps.length === 0) {
    // Default to 9am-6pm
    const defaultStart = new Date(forDate);
    defaultStart.setHours(9, 0, 0, 0);
    const defaultEnd = new Date(forDate);
    defaultEnd.setHours(18, 0, 0, 0);
    return { start: defaultStart, end: defaultEnd, durationHours: 9 };
  }

  timestamps.sort((a, b) => a.getTime() - b.getTime());
  
  // Add 30 min buffer on each end
  const start = new Date(timestamps[0].getTime() - 30 * 60 * 1000);
  const end = new Date(timestamps[timestamps.length - 1].getTime() + 30 * 60 * 1000);
  
  // Ensure reasonable bounds (not before 6am or after 11pm)
  if (start.getHours() < 6) start.setHours(6, 0, 0, 0);
  if (end.getHours() >= 23) end.setHours(23, 0, 0, 0);

  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  return { start, end, durationHours };
}

// ═══════════════════════════════════════════════════════════════════════════
// MEETING PREP (Auto-generated meeting context)
// ═══════════════════════════════════════════════════════════════════════════

export interface MeetingPrep {
  meeting: MindItem;
  startsAt: Date;
  minsUntil: number;
  attendees: string[];
  relatedDocs: MindItem[];
  recentConversations: MindItem[];
  openQuestions: string[];
  suggestedTopics: string[];
  lastMeetingNotes?: MindItem;
  personContext: PersonContext[];
}

export interface PersonContext {
  name: string;
  recentInteractions: MindItem[];
  pendingItems: MindItem[];
  lastContact?: Date;
}

export function generateMeetingPrep(items: MindItem[], meeting: MindItem): MeetingPrep | null {
  if (meeting.source !== 'calendar') return null;
  
  const now = new Date();
  const meta = meeting.sourceMeta.meta as CalendarMeta;
  const startsAt = new Date(meta.startsAt);
  const minsUntil = Math.round((startsAt.getTime() - now.getTime()) / 60000);
  const attendees = meta.attendees?.map(a => a.name.split('@')[0]) || [];
  const meetingTag = meeting.tag;

  // Find related documents - same tag or mentions attendees
  const relatedDocs = items.filter(item => {
    if (item.id === meeting.id || item.source === 'calendar') return false;
    if (item.source !== 'drive' && item.source !== 'figma') return false;
    
    const sameTag = item.tag === meetingTag;
    const mentionsAttendee = attendees.some(name => 
      item.title.toLowerCase().includes(name.toLowerCase()) ||
      item.snippet?.toLowerCase().includes(name.toLowerCase())
    );
    
    return sameTag || mentionsAttendee;
  }).slice(0, 5);

  // Find recent conversations (Slack messages)
  const recentConversations = items.filter(item => {
    if (item.source !== 'slack') return false;
    
    const daysSince = (now.getTime() - new Date(item.lastTouchedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 7) return false;
    
    const sameTag = item.tag === meetingTag;
    const mentionsAttendee = attendees.some(name => 
      item.title.toLowerCase().includes(name.toLowerCase()) ||
      item.snippet?.toLowerCase().includes(name.toLowerCase())
    );
    
    return sameTag || mentionsAttendee;
  }).slice(0, 5);

  // Extract open questions from related items
  const openQuestions: string[] = [];
  [...relatedDocs, ...recentConversations].forEach(item => {
    const text = `${item.title} ${item.snippet || ''}`;
    const questions = text.match(/[^.!?]*\?/g) || [];
    questions.forEach(q => {
      const cleaned = q.trim();
      if (cleaned.length > 10 && cleaned.length < 200 && !openQuestions.includes(cleaned)) {
        openQuestions.push(cleaned);
      }
    });
  });

  // Generate suggested topics based on related items
  const suggestedTopics = [...relatedDocs, ...recentConversations]
    .filter(i => i.priority >= 3)
    .map(i => i.title)
    .slice(0, 5);

  // Find last meeting notes with same title pattern
  const lastMeetingNotes = items.find(item => {
    if (item.source !== 'drive') return false;
    return item.title.toLowerCase().includes('notes') && 
           (item.tag === meetingTag || item.title.toLowerCase().includes(meeting.title.toLowerCase().split(/\s+/)[0]));
  });

  // Build person context for each attendee
  const personContext: PersonContext[] = attendees.slice(0, 4).map(name => {
    const nameLower = name.toLowerCase();
    
    const recentInteractions = items.filter(item => {
      if (item.source === 'calendar') return false;
      const text = `${item.title} ${item.snippet || ''}`.toLowerCase();
      return text.includes(nameLower);
    }).slice(0, 3);

    const pendingItems = recentInteractions.filter(item => 
      item.priority >= 4 || item.snippet?.toLowerCase().includes('waiting')
    );

    const lastInteraction = recentInteractions[0];
    const lastContact = lastInteraction ? new Date(lastInteraction.lastTouchedAt) : undefined;

    return {
      name,
      recentInteractions,
      pendingItems,
      lastContact,
    };
  });

  return {
    meeting,
    startsAt,
    minsUntil,
    attendees,
    relatedDocs,
    recentConversations,
    openQuestions: openQuestions.slice(0, 5),
    suggestedTopics,
    lastMeetingNotes,
    personContext,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// STALE ITEM NUDGES
// ═══════════════════════════════════════════════════════════════════════════

export interface StaleNudge {
  item: MindItem;
  daysSinceTouch: number;
  reason: string;
  suggestedAction: 'archive' | 'follow_up' | 'reschedule' | 'delegate';
  relatedActiveItems: MindItem[];
}

export function getStaleNudges(items: MindItem[], staleDaysThreshold: number = 5): StaleNudge[] {
  const now = new Date();
  const nudges: StaleNudge[] = [];

  items.forEach(item => {
    if (item.source === 'calendar') return;
    
    const daysSince = (now.getTime() - new Date(item.lastTouchedAt).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSince < staleDaysThreshold) return;

    let reason = '';
    let suggestedAction: StaleNudge['suggestedAction'] = 'archive';

    // High priority items need follow-up
    if (item.priority >= 4) {
      reason = `High priority (P${item.priority}) item hasn't been touched in ${Math.round(daysSince)} days`;
      suggestedAction = 'follow_up';
    } else if (item.priority >= 3 && daysSince > 10) {
      reason = `Medium priority item may need attention or archiving`;
      suggestedAction = daysSince > 14 ? 'archive' : 'follow_up';
    } else if (daysSince > 14) {
      reason = `This item has been inactive for over 2 weeks`;
      suggestedAction = 'archive';
    } else {
      return; // Skip low priority recent-ish items
    }

    // Find related active items (same tag, touched recently)
    const relatedActiveItems = items.filter(other => {
      if (other.id === item.id) return false;
      if (other.tag !== item.tag) return false;
      const otherDays = (now.getTime() - new Date(other.lastTouchedAt).getTime()) / (1000 * 60 * 60 * 24);
      return otherDays < 3;
    }).slice(0, 3);

    // If related items are active, suggest follow-up instead of archive
    if (relatedActiveItems.length > 0 && suggestedAction === 'archive') {
      suggestedAction = 'follow_up';
      reason += ` (but related items in ${item.tag} are still active)`;
    }

    // Check for waiting/blocked language
    const text = `${item.title} ${item.snippet || ''}`.toLowerCase();
    if (text.includes('waiting') || text.includes('blocked')) {
      suggestedAction = 'follow_up';
      reason = `This may be blocked - no activity in ${Math.round(daysSince)} days`;
    }

    nudges.push({
      item,
      daysSinceTouch: Math.round(daysSince),
      reason,
      suggestedAction,
      relatedActiveItems,
    });
  });

  return nudges
    .sort((a, b) => {
      // Sort by priority first, then by staleness
      if (a.item.priority !== b.item.priority) return b.item.priority - a.item.priority;
      return b.daysSinceTouch - a.daysSinceTouch;
    })
    .slice(0, 10);
}

// ═══════════════════════════════════════════════════════════════════════════
// CROSS-ITEM RELATIONSHIPS
// ═══════════════════════════════════════════════════════════════════════════

export interface ItemRelationship {
  sourceItem: MindItem;
  relatedItem: MindItem;
  relationshipType: 'same_project' | 'same_person' | 'same_topic' | 'temporal' | 'reference';
  strength: number; // 0-1
}

export function findItemRelationships(item: MindItem, allItems: MindItem[]): ItemRelationship[] {
  const relationships: ItemRelationship[] = [];
  const now = new Date();
  const itemText = `${item.title} ${item.snippet || ''}`.toLowerCase();

  allItems.forEach(other => {
    if (other.id === item.id) return;
    
    let strength = 0;
    let relationshipType: ItemRelationship['relationshipType'] = 'same_project';

    // Same tag/project
    if (other.tag === item.tag) {
      strength += 0.4;
      relationshipType = 'same_project';
    }

    // Extract potential person names (words starting with capital)
    const names = itemText.match(/\b[A-Z][a-z]+\b/g) || [];
    const otherText = `${other.title} ${other.snippet || ''}`.toLowerCase();
    const sharedNames = names.filter(name => otherText.includes(name.toLowerCase()));
    if (sharedNames.length > 0) {
      strength += 0.3 * Math.min(sharedNames.length, 2);
      relationshipType = 'same_person';
    }

    // Temporal proximity (touched around the same time)
    const itemTime = new Date(item.lastTouchedAt).getTime();
    const otherTime = new Date(other.lastTouchedAt).getTime();
    const hoursBetween = Math.abs(itemTime - otherTime) / (1000 * 60 * 60);
    if (hoursBetween < 2) {
      strength += 0.2;
      if (relationshipType === 'same_project') relationshipType = 'temporal';
    }

    // Keyword overlap (simple word matching)
    const itemWords = new Set(itemText.split(/\s+/).filter(w => w.length > 4));
    const otherWords = new Set(otherText.split(/\s+/).filter(w => w.length > 4));
    const sharedWords = [...itemWords].filter(w => otherWords.has(w));
    if (sharedWords.length >= 2) {
      strength += 0.15 * Math.min(sharedWords.length, 4);
      relationshipType = 'same_topic';
    }

    // URL/document references
    const urlMatch = itemText.match(/https?:\/\/[^\s]+/g) || [];
    const hasSharedUrl = urlMatch.some(url => otherText.includes(url));
    if (hasSharedUrl) {
      strength += 0.5;
      relationshipType = 'reference';
    }

    if (strength >= 0.3) {
      relationships.push({
        sourceItem: item,
        relatedItem: other,
        relationshipType,
        strength: Math.min(strength, 1),
      });
    }
  });

  return relationships
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 8);
}

// ═══════════════════════════════════════════════════════════════════════════
// WAITING ON OTHERS (Items where someone is waiting on you or you're waiting)
// ═══════════════════════════════════════════════════════════════════════════

export interface WaitingItem {
  item: MindItem;
  direction: 'waiting_on_me' | 'waiting_on_others';
  person?: string;
  daysSinceRaised: number;
  urgency: 'high' | 'medium' | 'low';
}

export function getWaitingItems(items: MindItem[]): WaitingItem[] {
  const now = new Date();
  const waitingItems: WaitingItem[] = [];

  const waitingOnMePatterns = [
    /waiting on you/i,
    /can you/i,
    /could you/i,
    /when can/i,
    /need your/i,
    /your thoughts/i,
    /let me know/i,
    /please review/i,
    /for your review/i,
    /awaiting your/i,
  ];

  const waitingOnOthersPatterns = [
    /waiting on/i,
    /blocked by/i,
    /pending from/i,
    /need (\w+) to/i,
    /waiting for/i,
    /expecting from/i,
  ];

  items.forEach(item => {
    if (item.source === 'calendar') return;
    
    const text = `${item.title} ${item.snippet || ''}`;
    const daysSince = (now.getTime() - new Date(item.lastTouchedAt).getTime()) / (1000 * 60 * 60 * 24);

    // Check if someone is waiting on me
    for (const pattern of waitingOnMePatterns) {
      if (pattern.test(text)) {
        const urgency = item.priority >= 4 || daysSince > 2 ? 'high' : 
                       item.priority >= 3 || daysSince > 1 ? 'medium' : 'low';
        waitingItems.push({
          item,
          direction: 'waiting_on_me',
          daysSinceRaised: Math.round(daysSince),
          urgency,
        });
        return; // Only add once per item
      }
    }

    // Check if I'm waiting on others
    for (const pattern of waitingOnOthersPatterns) {
      const match = text.match(pattern);
      if (match) {
        // Try to extract person name
        const personMatch = text.match(/waiting (?:on|for) (\w+)/i);
        const person = personMatch ? personMatch[1] : undefined;
        
        const urgency = daysSince > 5 ? 'high' : daysSince > 2 ? 'medium' : 'low';
        waitingItems.push({
          item,
          direction: 'waiting_on_others',
          person,
          daysSinceRaised: Math.round(daysSince),
          urgency,
        });
        return;
      }
    }
  });

  return waitingItems
    .sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      if (a.urgency !== b.urgency) return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (a.direction !== b.direction) return a.direction === 'waiting_on_me' ? -1 : 1;
      return b.daysSinceRaised - a.daysSinceRaised;
    })
    .slice(0, 15);
}

// ═══════════════════════════════════════════════════════════════════════════
// URGENT ALERTS
// ═══════════════════════════════════════════════════════════════════════════

export interface UrgentAlert {
  id: string;
  type: 'meeting_soon' | 'overdue_commitment' | 'waiting_response' | 'stale_high_priority' | 'blocked';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  item?: MindItem;
  action?: {
    label: string;
    type: 'navigate' | 'dismiss' | 'snooze';
  };
}

export function getUrgentAlerts(items: MindItem[]): UrgentAlert[] {
  const alerts: UrgentAlert[] = [];
  const now = new Date();

  // Meeting in next 30 minutes
  const upcomingMeetings = getUpcomingMeetings(items, 0.5);
  upcomingMeetings.forEach(meeting => {
    alerts.push({
      id: `meeting-${meeting.item.id}`,
      type: 'meeting_soon',
      title: `${meeting.item.title} in ${meeting.minsUntil}m`,
      description: meeting.attendees.slice(0, 2).join(', '),
      severity: meeting.minsUntil <= 10 ? 'critical' : 'warning',
      item: meeting.item,
      action: { label: 'View prep', type: 'navigate' },
    });
  });

  // People waiting on me (high urgency)
  const waitingItems = getWaitingItems(items);
  waitingItems
    .filter(w => w.direction === 'waiting_on_me' && w.urgency === 'high')
    .slice(0, 3)
    .forEach(waiting => {
      alerts.push({
        id: `waiting-${waiting.item.id}`,
        type: 'waiting_response',
        title: 'Response needed',
        description: waiting.item.title,
        severity: 'warning',
        item: waiting.item,
        action: { label: 'View', type: 'navigate' },
      });
    });

  // Overdue commitments
  const commitments = extractCommitments(items);
  const overdueCommitments = commitments.filter(c => c.status === 'overdue');
  if (overdueCommitments.length > 0) {
    alerts.push({
      id: 'overdue-commitments',
      type: 'overdue_commitment',
      title: `${overdueCommitments.length} overdue commitment${overdueCommitments.length > 1 ? 's' : ''}`,
      description: overdueCommitments[0].text.slice(0, 50) + (overdueCommitments[0].text.length > 50 ? '...' : ''),
      severity: overdueCommitments.length > 2 ? 'critical' : 'warning',
      action: { label: 'Review', type: 'navigate' },
    });
  }

  // High priority stale items
  const staleNudges = getStaleNudges(items, 3);
  const criticalStale = staleNudges.filter(n => n.item.priority >= 5);
  if (criticalStale.length > 0) {
    alerts.push({
      id: 'stale-critical',
      type: 'stale_high_priority',
      title: `${criticalStale.length} P5 item${criticalStale.length > 1 ? 's' : ''} need attention`,
      description: `Untouched for ${criticalStale[0].daysSinceTouch}+ days`,
      severity: 'warning',
      item: criticalStale[0].item,
      action: { label: 'Review', type: 'navigate' },
    });
  }

  return alerts
    .sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, 5);
}

// ═══════════════════════════════════════════════════════════════════════════
// SMART INSIGHTS
// ═══════════════════════════════════════════════════════════════════════════

export interface SmartInsight {
  type: 'warning' | 'suggestion' | 'celebration';
  title: string;
  description: string;
  relatedItems?: MindItem[];
}

export function generateInsights(items: MindItem[]): SmartInsight[] {
  const insights: SmartInsight[] = [];
  const now = new Date();

  // Check for overdue high-priority items
  const overdueHighPriority = items.filter(item => {
    const daysSince = (now.getTime() - new Date(item.lastTouchedAt).getTime()) / (1000 * 60 * 60 * 24);
    return item.priority >= 4 && daysSince > 3;
  });

  if (overdueHighPriority.length > 0) {
    insights.push({
      type: 'warning',
      title: `${overdueHighPriority.length} high-priority items need attention`,
      description: 'These items haven\'t been touched in over 3 days.',
      relatedItems: overdueHighPriority.slice(0, 3),
    });
  }

  // Check for meeting in next hour
  const upcomingMeeting = getUpcomingMeetings(items, 1)[0];
  if (upcomingMeeting) {
    insights.push({
      type: 'suggestion',
      title: `Meeting in ${upcomingMeeting.minsUntil} minutes`,
      description: `${upcomingMeeting.item.title} with ${upcomingMeeting.attendees.slice(0, 2).join(', ')}`,
      relatedItems: upcomingMeeting.relatedItems.slice(0, 2),
    });
  }

  // Check for waiting items
  const waitingItems = getWaitingItems(items);
  const waitingOnMe = waitingItems.filter(w => w.direction === 'waiting_on_me');
  if (waitingOnMe.length > 0) {
    insights.push({
      type: 'warning',
      title: `${waitingOnMe.length} item${waitingOnMe.length > 1 ? 's' : ''} waiting on you`,
      description: waitingOnMe.map(w => w.item.title).slice(0, 2).join(', '),
      relatedItems: waitingOnMe.map(w => w.item).slice(0, 3),
    });
  }

  // Check for productive day
  const todayItems = items.filter(item => {
    const touched = new Date(item.lastTouchedAt);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return touched >= startOfDay;
  });

  if (todayItems.length >= 10) {
    insights.push({
      type: 'celebration',
      title: 'Productive day!',
      description: `You've touched ${todayItems.length} items today across ${new Set(todayItems.map(i => i.tag)).size} projects.`,
    });
  }

  // Check for stale projects
  const projectHealth = getProjectHealth(items);
  const staleProjects = projectHealth.filter(p => p.status === 'stale' || p.status === 'blocked');
  
  if (staleProjects.length > 0) {
    insights.push({
      type: 'warning',
      title: `${staleProjects.length} project${staleProjects.length > 1 ? 's' : ''} may be stalled`,
      description: staleProjects.map(p => p.displayName).join(', '),
    });
  }

  return insights;
}

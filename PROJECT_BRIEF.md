# INDEX

A context engine for knowledge work.

---

## The Problem

Modern knowledge work is fragmented across a dozen tools. Slack threads, Figma files, Google Docs, calendar invites, Zoom recordings—each holds a piece of the picture, but no shows the whole.

The result is **Context Retrieval Time**: the invisible tax paid every time you ask yourself *"What was that thing?"* or *"What should I be working on?"* You spend minutes (sometimes hours) piecing together context that should be immediately available.

Existing dashboards don't solve this. They display data but don't synthesize it. They show you *everything* but don't tell you *what matters*. They're passive mirrors of your fragmented reality.

INDEX is different. It's not a dashboard—it's a **Context Engine**.

---

## The Vision

INDEX operates on the principle of **Always Be Processing (ABP)**. Rather than waiting for you to search, click, and piece together context, INDEX continuously ingests, normalizes, and prioritizes your work streams.

The goal is to eliminate the question: *"What should I be working on right now?"*

INDEX should feel like a brilliant assistant who has already:
- Read all your Slack threads
- Knows what meetings are coming up and what context you'll need
- Remembers what you said you'd do
- Understands which projects are moving and which are stuck
- Can tell you, at any moment, what deserves your attention

---

## Top 10 Flows

These flows demonstrate the promise of INDEX—moments where it transforms fragmented context into immediate clarity.

### 1. The 5-Minute Meeting Prep
*You have a 1:1 with Katie in 10 minutes.*

A banner appears at the top of your screen: "Ryan / Katie in 10m". You tap "Prep" and a panel slides out showing:
- The 3 Slack threads you've had with Katie this week
- The Figma file you both commented on yesterday
- An open question extracted from your last conversation: "What's the timeline for the SKU refresh?"
- A link to your shared 1:1 doc

You walk into the meeting knowing exactly what to discuss—without opening Slack, searching Drive, or trying to remember what happened last time.

### 2. The "What Was That Thing?" Recovery
*Someone mentioned a doc in Slack last week. You need it now.*

Instead of searching Slack, then Drive, then asking the person again—you open INDEX, scroll back in the Timeline to last Thursday, and see the Drive doc sitting right there next to the Slack message that mentioned it. One click opens it.

### 3. The Morning Scan
*You sit down with coffee. What happened overnight?*

The Day View shows you Today's board: 3 meetings, 2 Slack threads marked "WAITING" (someone needs your input), a Figma file that was updated, and a high-priority note you added yesterday about the Radar overview. In 30 seconds, you know the shape of your day.

### 4. The Commitment Catch
*Three days ago you said "I'll send that by Friday."*

The Commitments view shows it, highlighted as overdue. You didn't forget—INDEX remembered for you. You complete the task and mark it done, or you defer it to tomorrow with one click.

### 5. The Natural Language Schedule
*You need to find time with someone.*

You press ⌘K, type "Schedule 30 minutes with Jacob Meltzer", and hit Enter. INDEX parses your intent, shows you 5 available slots in the next week (scored by meeting-free time and calendar patterns), and creates the event when you pick one. No switching to Calendar, no back-and-forth emails.

### 6. The Project Pulse Check
*Is the Radar project stuck?*

You press "4" to jump to Projects. The Radar card shows: 12 items, momentum rising (↑), last activity 2 hours ago. But there's a warning: "2 pending decisions." You tap the card and see exactly which items are blocked. The project isn't stuck—it's waiting on two specific choices.

### 7. The Quick Capture
*Someone shares a link in conversation. You'll need it later.*

You press ⌘K, paste the URL, add "#Disputes", hit Enter. The link is captured, tagged, and timestamped. Later, when you're working on Disputes, it's there waiting for you—no bookmark folders, no "where did I put that?" panic.

### 8. The End-of-Day Digest
*It's 5:30pm. What happened today?*

The Digest view shows: 14 items touched, 3 meetings attended, 2 commitments made, 1 still open (high priority). Tomorrow's preview: 4 meetings including "Radar Staff Weekly"—and INDEX has already surfaced the related items you'll need.

### 9. The Stale Item Nudge
*A P5 item has been sitting untouched for 5 days.*

An amber alert appears at the bottom of your screen: "1 P5 item needs attention." You tap it and see the item, why it's important, and a suggested action: "Follow up—related items in #Radar are still active." You either handle it or consciously defer it. Nothing slips through the cracks.

### 10. The Context Handoff
*You're picking up where you left off yesterday.*

You open INDEX and the Timeline is already scrolled to "now". Looking up, you see tomorrow's meetings. Looking down, you see yesterday's activity—the Figma file you were reviewing, the Slack thread you were in, the doc you edited. The context is spatial and temporal. You don't have to remember what you were doing; you can *see* it.

---

## How It Works

INDEX operates in four stages:

### 1. Ingestion
Data flows in from your work tools—Slack, Figma, Google Drive, Calendar, Zoom—via MCP (Model Context Protocol) integrations. Each source contributes a different type of context.

### 2. Normalization
Every piece of context becomes a **MindItem**—a unified representation regardless of source. A Slack thread, a Figma file, and a calendar event all speak the same language internally.

### 3. Intelligence
The intelligence layer processes MindItems to derive meaning: scoring priority, detecting urgency, extracting commitments, surfacing relationships. This is where raw data becomes actionable insight.

### 4. Presentation
Multiple "lenses" let you view your context from different angles. The same underlying data, presented for different needs: focus, preparation, review, planning.

---

## The Lenses

INDEX offers six view modes, each solving a different problem:

### Timeline
*"What's happening across my work?"*

A time-anchored masonry grid of all items. Two viewing modes, toggled via icons in the bottom-left:

**Stream Mode** (default)
- Continuous vertical scroll: future items above, past items below
- A fixed horizontal "now" line marks the present, always centered on screen
- The line pulses green when viewing the present; turns red and shows time offset when scrolled away (e.g., "2h ago", "in 3h")
- Click the time label to snap back to now
- Calendar events positioned by start time; other items by last-touched time

**Day Mode**
- Shows items relevant to a specific day with left/right navigation
- Calendar events: scheduled for that day
- Slack/Drive items surfaced by recency and importance:
  - **Today**: Recent items (last 48h) OR high priority (≥4)
  - **Tomorrow**: High priority items for prep
  - **Yesterday**: Items actually touched that day
  - **Omnibar items**: Always show on today/yesterday (manually added = important)
- Calendar events appear first (sorted by time), then other items sorted by priority → recency
- Items interleaved by source for visual variety

**Item Actions** (on hover)
- ✓ Complete: removes item from view
- → Defer: moves item to tomorrow (sets to 9 AM next day)

### Focus
*"What should I do next?"*

The single most important action right now, with context. Scored by priority, recency, and urgency signals. Includes estimated time and suggested action type (respond, review, prepare, decide).

### Meetings
*"What do I need to know before this call?"*

Upcoming meetings with auto-surfaced context: related items by attendee and project, suggested discussion topics, open questions. Join buttons for video calls.

### Projects
*"How are my projects doing?"*

Health and momentum by #hashtag. Projects are automatically grouped from item tags.

**Filters** (tab bar):
- **Active**: Non-hidden projects with recent activity (default)
- **Needs Attention**: Projects that are stale, blocked, OR have pending decisions
- **Hidden**: Projects you've manually hidden from view

**Sorting**: By activity (most recent), by item count, or by status

**Project Cards** show:
- Status indicator (active/stale/blocked)
- Momentum arrow (↑ rising, → steady, ↓ falling)
- Open item count
- Pending decisions
- Last activity time

**Actions**: Click eye icon to hide/show projects. Hidden projects can be restored from the Hidden filter.

### Digest
*"What happened today?"*

End-of-day summary: items touched, items completed, items carrying over. Tomorrow's meetings for prep. The closure view before you sign off.

### Commitments
*"What did I say I'd do?"*

Auto-extracted from your messages. Phrases like "I'll...", "Let me...", "I can..." become tracked commitments. Items over 3 days old surface as overdue.

---

## Data Sources

Each source contributes a distinct type of context:

### Slack — Context
The conversations around work. What people are asking, what decisions are being made, what's blocked.
- **Extracted**: Core ask (summarized), collaborator, channel, thread URL
- **Signals**: Questions needing response, commitments made, urgency language

### Figma — Artifacts
The design work itself. Files, pages, recent activity.
- **Extracted**: File name, page name, last modified, desktop URL, thumbnail
- **Signals**: Recent edits, comment activity

### Google Drive — Strategy
Documents, specs, proposals. The written record of decisions and plans.
- **Extracted**: Title, executive summary, last editors, web URL
- **Signals**: Recent edits, stakeholder involvement

### Calendar — Temporal
The time structure of your work. Meetings, deadlines, commitments.
- **Extracted**: Event type, start/end time, attendees, video link, attached artifacts
- **Signals**: Imminent meetings, prep needed

### Zoom — Recordings
The institutional memory of meetings past.
- **Extracted**: Transcript summary, key decisions, recording URL
- **Signals**: Action items mentioned, decisions made

### OmniBar — Intent
Manual input. Notes, tasks, links you explicitly add.
- **Extracted**: Text, detected hashtags, URLs
- **Signals**: User-assigned priority

---

## The Intelligence Layer

Intelligence transforms data into insight. These are the core functions:

### Priority Scoring (What's Next)

Items are scored to determine what deserves attention. Scoring signals:

| Signal | Score | Urgency | Action |
|--------|-------|---------|--------|
| Priority level (1-5) | +20 per level | — | — |
| Touched in last 2 hours | +30 | "now" | — |
| Slack message, not from self | +15 | — | respond |
| Contains question mark | +15 | — | respond |
| Contains "waiting" or "blocked" | +20 | — | follow_up |
| High priority, untouched >2 days | +25 | "soon" | follow_up |
| Calendar event in <2 hours | +40 | "now" | prepare |

### Commitment Extraction

Regex patterns detect self-commitments in messages:
- "I'll...", "I will..."
- "Let me...", "I can..."
- "I'm going to...", "I need to..."

Commitments inherit the source item's project tag and become trackable items. Items >3 days old without completion surface as overdue.

### Meeting Prep Generation

For each upcoming meeting, INDEX automatically generates a prep package:

**Context Surfacing:**
- Related documents (same tag or mentions attendees)
- Recent Slack conversations (last 7 days, related by tag or attendee)
- Previous meeting notes (title pattern matching)

**Extracted Insights:**
- Open questions (? patterns in related items)
- Suggested discussion topics (from high-priority related items)

**Person Context:**
For each attendee:
- Recent interactions (items mentioning them)
- Pending items (high priority or "waiting" language)
- Last contact date

### Stale Item Nudges

Items that need attention are surfaced based on:
- High priority (≥4) items untouched for 3+ days
- Medium priority items untouched for 10+ days
- Items with "waiting" or "blocked" language

Each nudge includes:
- Days since last touch
- Reason for surfacing
- Suggested action (archive, follow up, reschedule, delegate)
- Related active items in same project

### Cross-Item Relationships

Automatic relationship detection with strength scoring (0-1):

| Relationship Type | Signal | Strength |
|------------------|--------|----------|
| same_project | Matching #tag | +0.4 |
| same_person | Shared name mentions | +0.3 per name |
| temporal | Touched within 2 hours | +0.2 |
| same_topic | 2+ shared keywords | +0.15 per keyword |
| reference | Shared URL | +0.5 |

Relationships with strength ≥0.3 are surfaced.

### Waiting Detection

Pattern matching identifies items where action is needed:

**Waiting On Me:**
- "waiting on you", "can you", "could you"
- "need your", "your thoughts", "let me know"
- "please review", "for your review", "awaiting your"

**Waiting On Others:**
- "waiting on [person]", "blocked by"
- "pending from", "waiting for"

Items include urgency level (high/medium/low) based on priority and age.

### Urgent Alerts

Real-time alert generation for:
- Meetings in next 30 minutes (critical if ≤10 min)
- High-urgency waiting items (someone waiting on you)
- Overdue commitments (>3 days old)
- Critical stale items (P5, untouched 3+ days)

Alerts include severity, action button, and related item reference.

### Project Health

Items are grouped by #tag. For each project:
- **Item count**: Total items in the last 30 days
- **Momentum**: Comparing last 7 days to previous 7 days (rising/steady/falling)
- **Status**: Active (recent edits), stalled (no activity >7 days), needs decision (blocking language detected)

---

## Design Principles

These principles guide the visual and interaction design of INDEX:

### Dark and Recessive
The interface should disappear. Pure black background (#000), dark cards (#111), subtle borders (#222). Content comes forward; chrome recedes. No visual noise competing with your actual work.

### Color is Signal
Color is used *only* for status and urgency—never decoration. Source badges get a hint of brand color. Priority indicators use red/amber/green. Everything else is grayscale. When you see color, it means something.

### Monospace Metadata
Times, tags, counts, and system information use monospace typography. This creates a clear visual distinction between content (what humans wrote) and metadata (what the system added).

### High-Tension Motion
Animations should feel responsive and decisive, not floaty. Spring animations with high stiffness (400) and moderate damping (30) create a sense of elements "settling" into place with confidence.

### Cohesive Transitions
When a view loads, elements animate in together as a page—staggered but coordinated. Individual elements don't animate independently. The whole view breathes as one.

### Consistent Card Anatomy
Every card, regardless of view, follows the same structure:
- Source badge (top left)
- Status/urgency indicators (top right)
- Title (prominent)
- Snippet/context (secondary)
- Metadata footer (tag, time, priority dot)

---

## Interaction Principles

### OmniBar as Universal Input
One input for everything: notes, tasks, URLs, searches, and scheduling. Press ⌘K to focus.

**Capabilities:**
- **Notes/Tasks**: Type text, optionally with #hashtags for project assignment
- **URLs**: Paste links to capture as web items
- **Scheduling**: Natural language like "Schedule 30 minutes with Katie Koch"
  - Detects person name and duration
  - Shows green preview badge while typing
  - Opens scheduling modal with suggested time slots
  - Creates calendar event on confirmation

### Hover to Reveal
Actions (open, complete, dismiss) appear on hover. The default state is clean; interaction reveals capability. This keeps the interface scannable while maintaining full functionality.

### Direct Manipulation
Drag cards to reorder. Drag to trash to delete. Click the time indicator to return to "now." Interactions should feel physical and immediate.

### One-Click to Source
Every item links back to its source. Click to open the Slack thread, Figma file, or Google Doc. INDEX is a synthesis layer, not a replacement for source tools.

### Keyboard First
Number keys (1-6) switch between views instantly. ⌘K opens OmniBar. Keyboard users should never need to reach for the mouse for primary navigation.

---

## Technical Guidelines

These patterns ensure consistency as INDEX evolves:

### Unified Data Schema
Every piece of context normalizes to a MindItem. Source-specific metadata lives in a typed `sourceMeta` field. This allows uniform processing while preserving source fidelity.

### Intelligence as Pure Functions
The intelligence layer (`intelligence.ts`) contains pure functions that take MindItems and return derived data. No side effects, no state. This makes the logic testable and predictable.

### Local-First, Sync-Ready
Day 1 uses localStorage for persistence. The architecture assumes eventual sync: items have stable IDs, timestamps are ISO strings, state is serializable.

### MCP for Integration
Data ingestion uses MCP (Model Context Protocol). Each source has a corresponding MCP server with typed tools. This provides a consistent integration pattern across all data sources.

---

## Current State

### Essential Journeys

Each journey maps to the Top 10 Flows that demonstrate INDEX's promise.

---

**1. The 5-Minute Meeting Prep** ✓
- Meeting prep pill appears in header toolbar when meeting is ≤30 minutes away
- Shows: pulsing green dot, meeting title, countdown
- One-click opens Meeting Prep Panel with:
  - Related documents (by tag and attendee)
  - Recent Slack conversations with attendees
  - Open questions extracted from items
  - Suggested discussion topics
  - Person context (last interaction, pending items)
  - Link to previous meeting notes

**2. The "What Was That Thing?" Recovery** ✓
- Timeline with continuous vertical scroll
- Fixed "now" line marks present; scroll to navigate time
- All items (Slack, Drive, Figma, Calendar) positioned temporally
- Cross-item relationships link related content
- One-click opens source item

**3. The Morning Scan** ✓
- Day View shows today's board at a glance
- Calendar events sorted by time
- "WAITING" badges on items needing your response
- High-priority items surfaced automatically
- Header toolbar shows: meeting prep pill, waiting count (⚡), overdue count
- Subtle dot badges on nav icons indicate state

**4. The Commitment Catch** ✓
- Commitments auto-extracted from messages ("I'll...", "Let me...")
- Commitments view (press 6) shows all tracked promises
- Items >3 days old surface as overdue
- Header indicator shows overdue count

**5. The Natural Language Schedule** ✓
- OmniBar parses "Schedule 30 minutes with Katie Koch"
- Green preview badge shows parsed intent
- Modal presents 5-6 available time slots
- Pick a slot → calendar event created
- Event appears in Timeline immediately

**6. The Project Pulse Check** ✓
- Projects view (press 4) groups items by #tag
- Each project shows: status, momentum (↑→↓), open items, pending decisions
- Filters: Active / Needs Attention / Hidden
- Stale item nudges for projects going quiet
- Click to see project's top items

**7. The Quick Capture** ✓
- ⌘K opens OmniBar from anywhere
- Paste URL → auto-detected source (Figma, Drive, Slack, etc.)
- Add #hashtag for project assignment
- Item captured with timestamp, tagged, searchable
- Appears in Timeline at current position

**8. The End-of-Day Digest** ✓
- Digest view (press 5) summarizes the day
- Shows: items touched, meetings attended, commitments made
- "Still open" section for high-priority carryovers
- Tomorrow preview: upcoming meetings
- Clean closure before signing off

**9. The Stale Item Nudge** ✓
- Intelligence detects high-priority items untouched 3+ days
- Stale items surfaced in Focus view with suggested actions
- Nudge includes: reason, suggested action (follow up, archive, delegate)
- Related active items shown for context
- Projects view shows stale project warnings

**10. The Context Handoff** ✓
- Timeline opens scrolled to "now"
- Future meetings visible above
- Yesterday's activity visible below
- Items grouped spatially and temporally
- Click time indicator to snap back to present

---

**Foundation**
- Six-view architecture (Timeline, Focus, Meetings, Projects, Digest, Commitments)
- Keyboard shortcuts 1-6 for instant view switching
- Live data from Calendar, Slack, Drive via MCP
- localStorage persistence with version-based refresh
- Consistent dark design language across all views
- Refined header toolbar: larger icons, better spacing, subtle state indicators
- Empty states with crisp icons and clear messaging
- Smooth opacity transitions eliminate layout flash on load

### Near-Term Focus
- Inline quick replies without leaving INDEX
- OAuth flow for real-time calendar event creation
- Deeper thread context fetching for Slack
- Status tracking (inbox → in progress → done)

### Longer-Term Vision
- Claude-powered semantic routing for OmniBar
- Quick reply templates for common responses
- Focus session timer with distraction blocking
- Impact Mode: filter to only authoring actions (for performance reviews)
- Team view: shared context across collaborators

---

## Summary

INDEX exists to solve context fragmentation. It ingests your work streams, normalizes them into a unified model, applies intelligence to surface what matters, and presents it through purpose-built lenses.

The principles are:
- **Synthesis over display**: Don't just show data—derive meaning
- **Ambient over active**: Context should be available without searching
- **Action over information**: Every view should answer "what should I do?"

If INDEX is working, you never have to ask "what was that thing?" or "what should I be working on?" again.

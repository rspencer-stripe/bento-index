# INDEX

A context engine for knowledge work.

---

## The Problem

Modern knowledge work is fragmented across a dozen tools. Slack threads, Figma files, Google Docs, calendar invites, Zoom recordings—each holds a piece of the picture, but none shows the whole.

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

A time-anchored masonry grid of all items. Scroll up for the future, down for the past. A horizontal "now" line marks the present. This is the ambient awareness view—everything at a glance.

### Focus
*"What should I do next?"*

The single most important action right now, with context. Scored by priority, recency, and urgency signals. Includes estimated time and suggested action type (respond, review, prepare, decide).

### Meetings
*"What do I need to know before this call?"*

Upcoming meetings with auto-surfaced context: related items by attendee and project, suggested discussion topics, open questions. Join buttons for video calls.

### Projects
*"How are my projects doing?"*

Health and momentum by #hashtag. See which projects are active, which are stalled, which need decisions. Momentum indicators show whether activity is rising, steady, or falling.

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

### Meeting Context

For each upcoming meeting, INDEX surfaces related items by:
- Matching attendee names in item content
- Matching project #tags
- Recency to the meeting time

Suggested topics are derived from open items related to attendees.

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
One input for everything: notes, tasks, URLs, searches. Press ⌘K to focus. Hashtags detected inline for project assignment. Items route to the current timeline position.

### Hover to Reveal
Actions (open, complete, dismiss) appear on hover. The default state is clean; interaction reveals capability. This keeps the interface scannable while maintaining full functionality.

### Direct Manipulation
Drag cards to reorder. Drag to trash to delete. Click the time indicator to return to "now." Interactions should feel physical and immediate.

### One-Click to Source
Every item links back to its source. Click to open the Slack thread, Figma file, or Google Doc. INDEX is a synthesis layer, not a replacement for source tools.

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

### What's Working
- Six-view architecture with consistent design language
- Intelligence layer with priority scoring and commitment extraction
- Time-anchored masonry timeline with scroll-synced "now" line
- Meeting companion with context surfacing
- OmniBar with hashtag detection
- Action buttons for opening source apps and completing items
- localStorage persistence

### Near-Term Focus
- Live MCP data fetching (currently using representative mock data)
- Status tracking (inbox → in progress → done)
- Relationship mapping between items
- Thread context fetching for richer Slack integration

### Longer-Term Vision
- Claude-powered semantic routing for OmniBar (natural language → structured action)
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

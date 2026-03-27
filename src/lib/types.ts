// INDEX Core Type System

export type ItemSource =
  | 'slack'
  | 'figma'
  | 'drive'
  | 'calendar'
  | 'web'
  | 'zoom'
  | 'omnibar';

export type ItemType =
  | 'task'
  | 'note'
  | 'event'
  | 'artifact'
  | 'reference'
  | 'message';

export type TileSize = 'large' | 'medium' | 'small';

export type Priority = 1 | 2 | 3 | 4 | 5;

export type EventType = 'oneOnOne' | 'crit' | 'standup' | 'external' | 'focus' | 'allHands';

// Source-Specific Metadata

export interface SlackMeta {
  coreAsk: string;
  collaborator: {
    name: string;
    avatarUrl?: string;
  };
  threadUrl: string;
  channel: string;
}

export interface FigmaMeta {
  fileName: string;
  pageName?: string;
  lastModified: string;
  desktopUrl: string;
  thumbnailUrl?: string;
}

export interface DriveMeta {
  docTitle: string;
  executiveSummary?: string;
  lastEditors: Array<{
    name: string;
    avatarUrl?: string;
    editedAt: string;
  }>;
  webUrl: string;
  thumbnailUrl?: string;
}

export interface CalendarMeta {
  eventType: EventType;
  startsAt: string;
  endsAt: string;
  tetheredArtifacts: string[];
  attendees: Array<{
    name: string;
    avatarUrl?: string;
  }>;
  zoomLink?: string;
  location?: string;
}

export interface WebMeta {
  semanticTitle: string;
  originalTitle: string;
  faviconUrl?: string;
  thumbnailUrl?: string;
  whyThisMatters?: string;
  url: string;
}

export interface ZoomMeta {
  meetingTitle: string;
  recordingUrl?: string;
  transcriptSummary?: string;
  keyDecisions?: string[];
  recordedAt: string;
  thumbnailUrl?: string;
}

export type SourceMeta =
  | { source: 'slack'; meta: SlackMeta }
  | { source: 'figma'; meta: FigmaMeta }
  | { source: 'drive'; meta: DriveMeta }
  | { source: 'calendar'; meta: CalendarMeta }
  | { source: 'web'; meta: WebMeta }
  | { source: 'zoom'; meta: ZoomMeta }
  | { source: 'omnibar'; meta: null };

// The Unified MindItem

export interface MindItem {
  id: string;
  tag: string;
  type: ItemType;
  priority: Priority;
  title: string;
  snippet?: string;
  source: ItemSource;
  sourceMeta: SourceMeta;
  createdAt: string;
  lastTouchedAt: string;
  momentId?: string;
}

// Bento Tile (Project/Theme Container)

export interface BentoTile {
  id: string;
  tag: string;
  displayName: string;
  size: TileSize;
  gridPosition: { row: number; col: number };
  itemCount: number;
  recentUpdateCount: number;
  nextEventAt?: string;
  situationalReport?: string[];
  opacity: number;
  items: MindItem[];
}

// Moment (Grouped Mental Context)

export interface Moment {
  id: string;
  tag: string;
  timestamp: string;
  itemIds: string[];
  aiSummary?: string;
}

// Omni-Bar

export interface OmniBarInput {
  raw: string;
  detectedUrls: string[];
  timestamp: string;
}

export interface ProcessedInput {
  items: MindItem[];
  routingFeedback: string;
}

// App State

export interface IndexState {
  items: MindItem[];
  tiles: BentoTile[];
  moments: Moment[];
  expandedTileId: string | null;
  impactModeEnabled: boolean;
  lastSyncAt: string;
}

// MCP Tool Mapping

export const MCP_SERVERS = {
  toolshed: 'user-toolshed_extras',
  calendar: 'user-google calendar',
  web: 'user-web_search',
} as const;

export const MCP_TOOLS = {
  slack: {
    search: 'search_slack_messages',
    thread: 'read_slack_message_thread',
    history: 'read_slack_channel_history',
    dms: 'read_slack_dms',
  },
  figma: {
    metadata: 'figma_get_metadata',
    screenshot: 'figma_get_screenshot',
    context: 'figma_get_design_context',
  },
  drive: {
    search: 'search_google_drive',
    file: 'get_google_drive_file',
    contents: 'get_google_drive_doc_tab_contents',
  },
  calendar: {
    events: 'get_google_calendar_events',
    calendars: 'get_available_google_calendars',
  },
  org: {
    person: 'org_info_get_person_details',
    team: 'org_info_get_team_members',
  },
  zoom: {
    transcript: 'get_zoom_transcript',
    recordings: 'list_zoom_recordings',
  },
  web: {
    search: 'web_search',
  },
} as const;

// Utility types

export type TileSizeConfig = {
  cols: number;
  rows: number;
};

export const TILE_SIZE_CONFIG: Record<TileSize, TileSizeConfig> = {
  large: { cols: 2, rows: 2 },
  medium: { cols: 2, rows: 1 },
  small: { cols: 1, rows: 1 },
};

// Source icons mapping
export const SOURCE_ICONS: Record<ItemSource, string> = {
  slack: 'MessageSquare',
  figma: 'Figma',
  drive: 'FileText',
  calendar: 'Calendar',
  web: 'Globe',
  zoom: 'Video',
  omnibar: 'Sparkles',
};

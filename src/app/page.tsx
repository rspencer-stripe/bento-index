'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid,
  Target,
  Calendar,
  Layers,
  Sun,
  GitCommit,
  AlertCircle,
  X,
  Hash,
  ExternalLink,
  Check,
  MessageSquare,
  FileText,
  Globe,
  Video,
  Sparkles,
  Zap,
  Database,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { SlackMeta, FigmaMeta, DriveMeta, WebMeta, ZoomMeta } from '@/lib/types';
import Image from 'next/image';
import { 
  MasonryTimeline, 
  OmniBar, 
  MeetingCompanion,
  WhatsNext,
  ProjectPulse,
  DailyDigest,
  CommitmentTracker,
  SchedulingModal,
  MeetingPrepPanel,
} from '@/components';
import type { SchedulingRequest } from '@/components/OmniBar';
import { mockItems } from '@/lib/mockData';
import { liveItems } from '@/lib/liveData';
import { MindItem } from '@/lib/types';
import { DataMode, getDataMode, setDataMode, fetchLiveItems, checkIntegrationStatus, IntegrationStatus } from '@/lib/dataProvider';
import {
  getUpcomingMeetings,
  getNextActions,
  getProjectHealth,
  extractCommitments,
  generateDailyDigest,
  getUrgentAlerts,
  getStaleNudges,
  getWaitingItems,
  generateMeetingPrep,
  MeetingPrep,
} from '@/lib/intelligence';

type ViewMode = 'timeline' | 'focus' | 'meetings' | 'projects' | 'digest' | 'commitments';

const viewModes: Array<{ id: ViewMode; icon: React.ElementType }> = [
  { id: 'timeline', icon: LayoutGrid },
  { id: 'focus', icon: Target },
  { id: 'meetings', icon: Calendar },
  { id: 'projects', icon: Layers },
  { id: 'digest', icon: Sun },
  { id: 'commitments', icon: GitCommit },
];

const sourceColors: Record<string, string> = {
  slack: '#E01E5A',
  figma: '#A259FF',
  drive: '#4285F4',
  calendar: '#34A853',
  web: '#71717A',
  zoom: '#2D8CFF',
  omnibar: '#6366F1',
};

const sourceIcons: Record<string, React.ElementType> = {
  slack: MessageSquare,
  figma: FileText,
  drive: FileText,
  calendar: Calendar,
  web: Globe,
  zoom: Video,
  omnibar: Sparkles,
};

const sourceLabels: Record<string, string> = {
  slack: 'Slack',
  figma: 'Figma',
  drive: 'Drive',
  calendar: 'Calendar',
  web: 'Web',
  zoom: 'Zoom',
  omnibar: 'Note',
};

function getItemUrl(item: MindItem): string | null {
  const { source, sourceMeta } = item;
  if (!sourceMeta || sourceMeta.meta === null) return null;
  
  switch (source) {
    case 'slack':
      return (sourceMeta.meta as SlackMeta).threadUrl || null;
    case 'figma':
      return (sourceMeta.meta as FigmaMeta).desktopUrl || null;
    case 'drive':
      return (sourceMeta.meta as DriveMeta).webUrl || null;
    case 'web':
      return (sourceMeta.meta as WebMeta).url || null;
    case 'zoom':
      return (sourceMeta.meta as ZoomMeta).recordingUrl || null;
    default:
      return null;
  }
}

function getItemThumbnail(item: MindItem): string | null {
  const { source, sourceMeta } = item;
  if (!sourceMeta || sourceMeta.meta === null) return null;
  
  switch (source) {
    case 'figma':
      return (sourceMeta.meta as FigmaMeta).thumbnailUrl || null;
    case 'drive':
      return (sourceMeta.meta as DriveMeta).thumbnailUrl || null;
    case 'web':
      return (sourceMeta.meta as WebMeta).thumbnailUrl || null;
    case 'zoom':
      return (sourceMeta.meta as ZoomMeta).thumbnailUrl || null;
    default:
      return null;
  }
}

const STORAGE_KEY = 'index-items';
const STORAGE_VERSION_KEY = 'index-version';
const CURRENT_VERSION = '18'; // Exclude mock calendar events to show Katie 1:1

const validViewModes: ViewMode[] = ['timeline', 'focus', 'meetings', 'projects', 'digest', 'commitments'];

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [items, setItems] = useState<MindItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedItem, setExpandedItem] = useState<MindItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewedTime, setViewedTime] = useState(new Date());
  const [isViewingNow, setIsViewingNow] = useState(true);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [schedulingModalOpen, setSchedulingModalOpen] = useState(false);
  const [schedulingRequest, setSchedulingRequest] = useState<SchedulingRequest | null>(null);
  const [dataMode, setDataModeState] = useState<DataMode>('demo');
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null);
  const [isLoadingLiveData, setIsLoadingLiveData] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [meetingPrepOpen, setMeetingPrepOpen] = useState(false);
  const [activeMeetingPrep, setActiveMeetingPrep] = useState<MeetingPrep | null>(null);
  const [showModeToast, setShowModeToast] = useState(false);

  // Get view mode from URL, default to 'focus'
  const viewParam = searchParams.get('view');
  const viewMode: ViewMode = validViewModes.includes(viewParam as ViewMode) 
    ? (viewParam as ViewMode) 
    : 'focus';

  // Update URL when changing view mode
  const setViewMode = useCallback((mode: ViewMode) => {
    router.push(`?view=${mode}`, { scroll: false });
  }, [router]);

  // Initialize data mode from localStorage
  useEffect(() => {
    const savedMode = getDataMode();
    setDataModeState(savedMode);
    
    // Check integration status
    checkIntegrationStatus().then(setIntegrationStatus);
  }, []);

  // Load items based on data mode
  useEffect(() => {
    const loadData = async () => {
      const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      
      if (dataMode === 'demo') {
        // Demo mode: use curated demo data
        if (storedVersion !== CURRENT_VERSION) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
        }
        // Demo mode: use liveItems + mockItems (excluding mock calendar events to keep Katie 1:1)
        const combinedData = [...liveItems, ...mockItems.filter(m => 
          m.source !== 'calendar' && !liveItems.some(l => l.title === m.title)
        )];
        setItems(combinedData);
        setIsLoaded(true);
      } else {
        // Live mode: fetch from real integrations
        setIsLoadingLiveData(true);
        try {
          const liveData = await fetchLiveItems();
          if (liveData.length > 0) {
            setItems(liveData);
          } else {
            // Fallback to demo data if no live data available
            const combinedData = [...liveItems, ...mockItems.filter(m => 
              m.source !== 'calendar' && !liveItems.some(l => l.title === m.title)
            )];
            setItems(combinedData);
          }
        } catch (error) {
          console.error('Failed to load live data:', error);
          // Fallback to demo data
          const combinedData = [...liveItems, ...mockItems.filter(m => 
            m.source !== 'calendar' && !liveItems.some(l => l.title === m.title)
          )];
          setItems(combinedData);
        }
        setIsLoadingLiveData(false);
        setIsLoaded(true);
      }
    };
    
    loadData();
  }, [dataMode]);

  // Save items to localStorage when they change
  useEffect(() => {
    if (isLoaded && items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // Scroll to top when view mode changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [viewMode]);

  // Keyboard shortcuts: 1-6 for view modes, Cmd+Shift+D for data mode toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Cmd+Shift+D (Mac) or Ctrl+Shift+D (Windows) toggles data mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const newMode = dataMode === 'demo' ? 'live' : 'demo';
        setDataMode(newMode);
        setDataModeState(newMode);
        setShowModeToast(true);
        setTimeout(() => setShowModeToast(false), 2000);
        return;
      }
      
      const key = e.key;
      if (key >= '1' && key <= '6') {
        const index = parseInt(key) - 1;
        if (viewModes[index]) {
          setViewMode(viewModes[index].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setViewMode, dataMode]);

  // Computed intelligence
  const upcomingMeetings = useMemo(() => getUpcomingMeetings(items, 8), [items]);
  const nextActions = useMemo(() => getNextActions(items, 5), [items]);
  const projectHealth = useMemo(() => getProjectHealth(items), [items]);
  const commitments = useMemo(() => extractCommitments(items), [items]);
  const dailyDigest = useMemo(() => generateDailyDigest(items), [items]);
  const urgentAlerts = useMemo(() => getUrgentAlerts(items), [items]);
  const staleNudges = useMemo(() => getStaleNudges(items), [items]);
  const waitingItems = useMemo(() => getWaitingItems(items), [items]);

  const overdueCount = commitments.filter(c => c.status === 'overdue').length;
  const waitingOnMeCount = waitingItems.filter(w => w.direction === 'waiting_on_me').length;

  // Check for imminent meeting and prep
  const imminentMeeting = upcomingMeetings.find(m => m.minsUntil <= 30);
  const imminentMeetingPrep = useMemo(() => {
    if (!imminentMeeting) return null;
    return generateMeetingPrep(items, imminentMeeting.item);
  }, [imminentMeeting, items]);

  const handleTimeChange = useCallback((time: Date, isNow: boolean) => {
    setViewedTime(time);
    setIsViewingNow(isNow);
  }, []);

  const handleOmniBarSubmit = useCallback(async (input: string) => {
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));

    // Extract URL first (before hashtag parsing)
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    const url = urlMatch?.[0];
    
    // Remove URL from input before looking for hashtags
    const textWithoutUrl = url ? input.replace(url, '').trim() : input;
    
    // Look for hashtags only in the non-URL text
    const hashtags = textWithoutUrl.match(/#[a-zA-Z]\w*/g);
    
    // Determine source and default tag based on URL
    let source: 'omnibar' | 'figma' | 'web' | 'drive' | 'slack' = 'omnibar';
    let defaultTag = '#Inbox';
    let title = textWithoutUrl.replace(/#[a-zA-Z]\w*/g, '').trim();
    
    // Helper to extract a readable title from URL
    const extractTitleFromUrl = (urlStr: string): string => {
      try {
        const parsed = new URL(urlStr);
        const pathSegments = parsed.pathname.split('/').filter(s => s.length > 0);
        
        // Get the last meaningful segment
        let segment = pathSegments[pathSegments.length - 1] || '';
        
        // Remove common file extensions
        segment = segment.replace(/\.(html?|php|aspx?|jsp)$/i, '');
        
        // Remove common URL patterns like IDs, hashes
        if (segment.match(/^[a-f0-9-]{20,}$/i)) {
          // Looks like a hash/ID, try the previous segment
          segment = pathSegments[pathSegments.length - 2] || '';
        }
        
        // Decode URI and clean up
        segment = decodeURIComponent(segment);
        
        // Convert separators to spaces
        segment = segment.replace(/[-_]/g, ' ');
        
        // Capitalize first letter of each word
        segment = segment.replace(/\b\w/g, c => c.toUpperCase());
        
        // If we got something meaningful, use it
        if (segment.length > 2) {
          return segment;
        }
        
        // Fallback to domain name
        const domain = parsed.hostname.replace(/^www\./, '').split('.')[0];
        return domain.charAt(0).toUpperCase() + domain.slice(1);
      } catch {
        return 'Link';
      }
    };

    if (url) {
      if (url.includes('figma.com')) {
        source = 'figma';
        defaultTag = '#Figma';
        // Extract file name from Figma URL: /design/{key}/{name} or /file/{key}/{name}
        const figmaMatch = url.match(/figma\.com\/(?:design|file)\/[^/]+\/([^?#]+)/);
        if (figmaMatch && figmaMatch[1]) {
          const slug = decodeURIComponent(figmaMatch[1]);
          title = title || slug.replace(/-/g, ' ');
        } else {
          title = title || 'Figma file';
        }
      } else if (url.includes('docs.google.com')) {
        source = 'drive';
        defaultTag = '#Docs';
        title = title || 'Google Doc';
      } else if (url.includes('sheets.google.com')) {
        source = 'drive';
        defaultTag = '#Sheets';
        title = title || 'Google Sheet';
      } else if (url.includes('slack.com')) {
        source = 'slack';
        defaultTag = '#Slack';
        title = title || 'Slack thread';
      } else if (url.includes('notion.so') || url.includes('notion.site')) {
        source = 'web';
        defaultTag = '#Notion';
        title = title || extractTitleFromUrl(url);
      } else if (url.includes('linear.app')) {
        source = 'web';
        defaultTag = '#Linear';
        title = title || extractTitleFromUrl(url);
      } else if (url.includes('github.com')) {
        source = 'web';
        defaultTag = '#GitHub';
        // Extract repo/path from GitHub URL
        const ghMatch = url.match(/github\.com\/([^/]+\/[^/]+)/);
        title = title || (ghMatch ? ghMatch[1] : extractTitleFromUrl(url));
      } else if (url.includes('jira') || url.includes('atlassian')) {
        source = 'web';
        defaultTag = '#Jira';
        title = title || extractTitleFromUrl(url);
      } else {
        source = 'web';
        defaultTag = '#Web';
        title = title || extractTitleFromUrl(url);
      }
    }
    
    const tag = hashtags?.[0] || defaultTag;
    const type = url ? 'reference' : 'note';

    const itemTime = viewedTime.toISOString();
    const newItemId = `item-${Date.now()}`;

    // Build source meta based on detected source
    let sourceMeta: MindItem['sourceMeta'];
    if (source === 'figma' && url) {
      sourceMeta = {
        source: 'figma',
        meta: {
          fileName: title,
          lastModified: itemTime,
          desktopUrl: url,
        },
      };
    } else if (source === 'drive' && url) {
      sourceMeta = {
        source: 'drive',
        meta: {
          docTitle: title,
          lastEditors: [],
          webUrl: url,
        },
      };
    } else if (source === 'slack' && url) {
      sourceMeta = {
        source: 'slack',
        meta: {
          coreAsk: title,
          collaborator: { name: 'Unknown' },
          threadUrl: url,
          channel: 'Unknown',
        },
      };
    } else if (source === 'web' && url) {
      sourceMeta = {
        source: 'web',
        meta: {
          semanticTitle: title,
          originalTitle: title,
          url: url,
        },
      };
    } else {
      sourceMeta = { source: 'omnibar', meta: null };
    }

    const newItem: MindItem = {
      id: newItemId,
      tag,
      type,
      priority: 3,
      title,
      source,
      sourceMeta,
      createdAt: itemTime,
      lastTouchedAt: itemTime,
    };

    setItems(prev => [newItem, ...prev]);
    setNewlyAddedId(newItemId);
    setIsProcessing(false);

    setTimeout(() => setNewlyAddedId(null), 2000);

    const timeContext = isViewingNow ? '' : ` at ${viewedTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    return { 
      feedback: `Routed to ${tag} as ${type.charAt(0).toUpperCase() + type.slice(1)}${timeContext}` 
    };
  }, [viewedTime, isViewingNow]);

  const handleItemClick = useCallback((item: MindItem) => {
    setExpandedItem(item);
  }, []);

  const handleItemDelete = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const handleItemComplete = useCallback((item: MindItem) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    setExpandedItem(null);
  }, []);

  const handleItemDefer = useCallback((item: MindItem) => {
    // Defer item to tomorrow by updating lastTouchedAt to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Set to 9 AM tomorrow
    
    setItems(prev => prev.map(i => 
      i.id === item.id 
        ? { ...i, lastTouchedAt: tomorrow.toISOString() }
        : i
    ));
  }, []);

  const handleScheduleRequest = useCallback((request: SchedulingRequest) => {
    setSchedulingRequest(request);
    setSchedulingModalOpen(true);
  }, []);

  const handleScheduleConfirm = useCallback((slot: { date: string; startTime: string; endTime: string; dateLabel: string; timeLabel: string }, title: string) => {
    // Create a new calendar item for the scheduled meeting
    const [year, month, day] = slot.date.split('-').map(Number);
    const [startHour, startMin] = slot.startTime.split(':').map(Number);
    const [endHour, endMin] = slot.endTime.split(':').map(Number);
    
    const startDate = new Date(year, month - 1, day, startHour, startMin);
    const endDate = new Date(year, month - 1, day, endHour, endMin);
    
    const newItem: MindItem = {
      id: `cal-scheduled-${Date.now()}`,
      tag: '#Meeting',
      type: 'event',
      priority: 4,
      title: title,
      snippet: `Scheduled via INDEX • ${slot.dateLabel} at ${slot.timeLabel}`,
      source: 'calendar',
      sourceMeta: {
        source: 'calendar',
        meta: {
          eventType: 'meeting',
          startsAt: startDate.toISOString(),
          endsAt: endDate.toISOString(),
          tetheredArtifacts: [],
          attendees: schedulingRequest ? [{ name: `${schedulingRequest.person.toLowerCase().replace(/\s+/g, '')}@stripe.com` }] : [],
        },
      },
      createdAt: new Date().toISOString(),
      lastTouchedAt: new Date().toISOString(),
    };
    
    setItems(prev => [newItem, ...prev]);
    setNewlyAddedId(newItem.id);
    setTimeout(() => setNewlyAddedId(null), 3000);
    setSchedulingModalOpen(false);
    setSchedulingRequest(null);
  }, [schedulingRequest]);

  const handleAlertDismiss = useCallback((alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
  }, []);

  const handleAlertNavigate = useCallback((alert: { item?: MindItem; type: string }) => {
    if (alert.item) {
      setExpandedItem(alert.item);
    } else if (alert.type === 'overdue_commitment') {
      setViewMode('commitments');
    } else if (alert.type === 'meeting_soon') {
      setViewMode('meetings');
    }
  }, [setViewMode]);

  const handleOpenMeetingPrep = useCallback(() => {
    if (imminentMeetingPrep) {
      setActiveMeetingPrep(imminentMeetingPrep);
      setMeetingPrepOpen(true);
    }
  }, [imminentMeetingPrep]);

  const handleUpdateItemTitle = useCallback((itemId: string, newTitle: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, title: newTitle } : item
    ));
    setExpandedItem(prev => prev && prev.id === itemId ? { ...prev, title: newTitle } : prev);
  }, []);

  const renderContent = () => {
    if (viewMode === 'timeline') {
      return (
        <MasonryTimeline 
          items={items}
          onItemClick={handleItemClick}
          onTimeChange={handleTimeChange}
          onItemDelete={handleItemDelete}
          onItemComplete={handleItemComplete}
          onItemDefer={handleItemDefer}
          newlyAddedId={newlyAddedId}
        />
      );
    }

    const content = (() => {
      switch (viewMode) {
        case 'focus':
          return (
            <WhatsNext 
              actions={nextActions}
              onItemClick={handleItemClick}
              onComplete={handleItemDelete}
            />
          );
        case 'meetings':
          return (
            <MeetingCompanion 
              meetings={upcomingMeetings}
              onItemClick={handleItemClick}
            />
          );
        case 'projects':
          return (
            <ProjectPulse 
              projects={projectHealth}
              onItemClick={handleItemClick}
            />
          );
        case 'digest':
          return (
            <DailyDigest 
              digest={dailyDigest}
              onItemClick={handleItemClick}
            />
          );
        case 'commitments':
          return (
            <CommitmentTracker 
              commitments={commitments}
              onItemClick={handleItemClick}
              onMarkDone={() => {}}
              onDismiss={() => {}}
            />
          );
      }
    })();

    return (
      <div className="w-full max-w-4xl mx-auto px-6 py-8">
        {content}
      </div>
    );
  };

  // Show loading state
  if (!isLoaded) {
    return (
      <main className="min-h-screen flex flex-col bg-black items-center justify-center">
        <div className="text-white/30 text-sm font-mono">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-black" style={{ scrollbarGutter: 'stable' }}>
      {/* Minimal Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-[#222]">
        <div className="flex items-center h-16 px-6 gap-8">
          {/* Logo */}
          <h1 className="text-base font-semibold tracking-tight text-white/80">INDEX</h1>
          
          {/* Mode Switcher - Icon only, subtle */}
          <div className="flex items-center gap-1">
            {viewModes.map(mode => {
              const Icon = mode.icon;
              const isActive = viewMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`
                    relative p-2.5 rounded-lg transition-all
                    ${isActive 
                      ? 'text-white' 
                      : 'text-white/30 hover:text-white/60'
                    }
                  `}
                  title={mode.id.charAt(0).toUpperCase() + mode.id.slice(1)}
                >
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10" />

          {/* OmniBar - Left aligned after modes */}
          <OmniBar 
            onSubmit={handleOmniBarSubmit}
            onScheduleRequest={handleScheduleRequest}
            isProcessing={isProcessing}
          />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Contextual alerts - minimal */}
          <div className="flex items-center gap-4">
            {/* Meeting prep pill - shows when meeting is soon */}
            {imminentMeeting && (
              <button
                onClick={handleOpenMeetingPrep}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-white/60">{imminentMeeting.item.title}</span>
                <span className="text-xs text-white/40 font-mono">{imminentMeeting.minsUntil}m</span>
              </button>
            )}

            {/* Waiting on me indicator */}
            {waitingOnMeCount > 0 && (
              <button
                onClick={() => setViewMode('focus')}
                className="flex items-center gap-1.5 text-amber-400/80 text-sm font-mono hover:text-amber-400 transition-colors"
                title={`${waitingOnMeCount} items waiting on you`}
              >
                <Zap size={14} />
                {waitingOnMeCount}
              </button>
            )}
            
            {/* Overdue commitments indicator */}
            {overdueCount > 0 && (
              <button
                onClick={() => setViewMode('commitments')}
                className="flex items-center gap-1.5 text-red-400/80 text-sm font-mono hover:text-red-400 transition-colors"
              >
                <AlertCircle size={14} />
                {overdueCount}
              </button>
            )}

            {/* Data mode indicator - click to toggle, Cmd+Shift+D also works */}
            <button
              onClick={() => {
                const newMode = dataMode === 'demo' ? 'live' : 'demo';
                setDataMode(newMode);
                setDataModeState(newMode);
                setShowModeToast(true);
                setTimeout(() => setShowModeToast(false), 2000);
              }}
              className={`flex items-center gap-1.5 text-sm font-mono transition-colors ${
                dataMode === 'demo' 
                  ? 'text-violet-400/80 hover:text-violet-400' 
                  : 'text-emerald-400/80 hover:text-emerald-400'
              }`}
              title={`${dataMode === 'demo' ? 'Demo mode' : 'Live mode'} - Click or ⌘⇧D to toggle`}
            >
              <Database size={14} />
              <span className="hidden sm:inline">{dataMode === 'demo' ? 'Demo' : 'Live'}</span>
              {isLoadingLiveData && (
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              )}
            </button>

            {/* Settings link */}
            <Link
              href="/settings"
              className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
              title="Settings"
            >
              <Settings size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mode change toast */}
      <AnimatePresence>
        {showModeToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-black/90 border border-white/10 rounded-lg shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <Database size={16} className={dataMode === 'demo' ? 'text-violet-400' : 'text-emerald-400'} />
              <span className="text-sm text-white/80">
                Switched to <span className="font-medium">{dataMode === 'demo' ? 'Demo' : 'Live'}</span> mode
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 w-full">
        {renderContent()}
      </div>

      {/* Expanded Item Modal */}
      <AnimatePresence>
        {expandedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={() => setExpandedItem(null)}
          >
            <motion.div
              layoutId={expandedItem.id}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111] border border-[#222] rounded-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div 
                className="p-6 border-b border-white/5"
                style={{ backgroundColor: `${sourceColors[expandedItem.source]}10` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const SourceIcon = sourceIcons[expandedItem.source];
                        const color = sourceColors[expandedItem.source];
                        return (
                          <div 
                            className="flex items-center gap-2 px-2 py-1 rounded-full"
                            style={{ backgroundColor: `${color}15` }}
                          >
                            <SourceIcon size={12} style={{ color }} />
                            <span className="text-[10px] font-medium" style={{ color }}>
                              {sourceLabels[expandedItem.source]}
                            </span>
                          </div>
                        );
                      })()}
                      <span className="text-xs text-white/30 font-mono">
                        P{expandedItem.priority}
                      </span>
                    </div>
                    {(expandedItem.source === 'omnibar' || expandedItem.source === 'web' || expandedItem.source === 'figma') ? (
                      <input
                        type="text"
                        defaultValue={expandedItem.title}
                        onBlur={(e) => {
                          if (e.target.value.trim() && e.target.value !== expandedItem.title) {
                            handleUpdateItemTitle(expandedItem.id, e.target.value.trim());
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        className="text-xl font-semibold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-white/40 focus:outline-none transition-colors w-full"
                        placeholder="Enter a title..."
                      />
                    ) : (
                      <h2 className="text-xl font-semibold text-white">
                        {expandedItem.title}
                      </h2>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedItem(null)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X size={20} className="text-white/50" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {/* Thumbnail */}
                {getItemThumbnail(expandedItem) && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white/5">
                    <Image
                      src={getItemThumbnail(expandedItem)!}
                      alt={expandedItem.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                {expandedItem.snippet && (
                  <p className="text-white/70 leading-relaxed">
                    {expandedItem.snippet}
                  </p>
                )}

                {/* Source-specific details */}
                {expandedItem.source === 'slack' && expandedItem.sourceMeta.source === 'slack' && (
                  <div className="bg-white/5 rounded-xl p-4 space-y-2">
                    <p className="text-sm text-white/50">Core Ask</p>
                    <p className="text-white">
                      {expandedItem.sourceMeta.meta.coreAsk}
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-[10px] text-white/60">
                          {expandedItem.sourceMeta.meta.collaborator.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-white/60">
                        {expandedItem.sourceMeta.meta.collaborator.name}
                      </span>
                    </div>
                  </div>
                )}

                {expandedItem.source === 'calendar' && expandedItem.sourceMeta.source === 'calendar' && (
                  <div className="bg-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">Event Type</span>
                      <span className="text-sm text-white capitalize">
                        {expandedItem.sourceMeta.meta.eventType}
                      </span>
                    </div>
                    {expandedItem.sourceMeta.meta.attendees.length > 0 && (
                      <div>
                        <span className="text-sm text-white/50 block mb-2">Attendees</span>
                        <div className="flex flex-wrap gap-2">
                          {expandedItem.sourceMeta.meta.attendees.map((a, i) => (
                            <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/70">
                              {a.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                  {getItemUrl(expandedItem) && (
                    <button
                      onClick={() => {
                        const url = getItemUrl(expandedItem);
                        if (url) window.open(url, '_blank');
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/70 hover:text-white text-sm"
                    >
                      <ExternalLink size={14} />
                      Open in {expandedItem.source.charAt(0).toUpperCase() + expandedItem.source.slice(1)}
                    </button>
                  )}
                  {(expandedItem.type === 'task' || expandedItem.type === 'note') && (
                    <button
                      onClick={() => handleItemComplete(expandedItem)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors text-green-400 text-sm"
                    >
                      <Check size={14} />
                      Mark done
                    </button>
                  )}
                </div>

                {/* Footer metadata */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-1 text-white/30">
                    <Hash size={12} />
                    <span className="text-xs font-mono">
                      {expandedItem.tag.replace('#', '')}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-white/30">
                    {new Date(expandedItem.lastTouchedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scheduling Modal */}
      <SchedulingModal
        isOpen={schedulingModalOpen}
        onClose={() => {
          setSchedulingModalOpen(false);
          setSchedulingRequest(null);
        }}
        onSchedule={handleScheduleConfirm}
        parsedRequest={schedulingRequest}
      />

      {/* Meeting Prep Panel */}
      <MeetingPrepPanel
        prep={activeMeetingPrep}
        isOpen={meetingPrepOpen}
        onClose={() => {
          setMeetingPrepOpen(false);
          setActiveMeetingPrep(null);
        }}
        onItemClick={handleItemClick}
      />

      {/* Meeting prep is now in the header toolbar */}

      {/* Alert Bar disabled - too visually loud */}
      {/* <AlertBar
        alerts={urgentAlerts.filter(a => !dismissedAlerts.has(a.id))}
        onDismiss={handleAlertDismiss}
        onNavigate={handleAlertNavigate}
      /> */}

    </main>
  );
}

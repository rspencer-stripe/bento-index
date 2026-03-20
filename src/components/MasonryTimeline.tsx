'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronLeft, ChevronRight, Layers, CalendarDays } from 'lucide-react';
import { MindItem } from '@/lib/types';
import { ItemCard } from './ItemCard';

type TimelineMode = 'stream' | 'day';

interface MasonryTimelineProps {
  items: MindItem[];
  onItemClick?: (item: MindItem) => void;
  onTimeChange?: (viewedTime: Date, isNow: boolean) => void;
  onItemDelete?: (itemId: string) => void;
  onItemComplete?: (item: MindItem) => void;
  onItemDefer?: (item: MindItem) => void;
  onItemsReorder?: (items: MindItem[]) => void;
  newlyAddedId?: string | null;
}

function getTemporalRelevance(item: MindItem): number {
  const now = Date.now();

  if (item.source === 'calendar') {
    const meta = item.sourceMeta.meta as { startsAt: string };
    if (meta?.startsAt) {
      const eventTime = new Date(meta.startsAt).getTime();
      const hoursUntil = (eventTime - now) / (1000 * 60 * 60);
      return hoursUntil;
    }
  }

  const touchedTime = new Date(item.lastTouchedAt).getTime();
  const hoursSince = (now - touchedTime) / (1000 * 60 * 60);
  return -hoursSince;
}

function getItemOpacity(item: MindItem): number {
  const now = Date.now();
  const touchedTime = new Date(item.lastTouchedAt).getTime();
  const hoursSince = (now - touchedTime) / (1000 * 60 * 60);

  if (hoursSince <= 1) return 1;
  if (hoursSince <= 4) return 0.95;
  if (hoursSince <= 24) return 0.85;
  if (hoursSince <= 48) return 0.7;
  return 0.5;
}

export function MasonryTimeline({ items, onItemClick, onTimeChange, onItemDelete, onItemComplete, onItemDefer, onItemsReorder, newlyAddedId }: MasonryTimelineProps) {
  const [columns, setColumns] = useState(4);
  const [mode, setMode] = useState<TimelineMode>('stream');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewedTime, setViewedTime] = useState(new Date());
  const [isViewingNow, setIsViewingNow] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nowMarkerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    setIsDragging(true);
    setDraggedItemId(itemId);
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a subtle drag image
    const target = e.target as HTMLElement;
    if (target) {
      const rect = target.getBoundingClientRect();
      e.dataTransfer.setDragImage(target, rect.width / 2, 20);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedItemId(null);
    setIsOverTrash(false);
  }, []);

  const handleTrashDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOverTrash(true);
  }, []);

  const handleTrashDragLeave = useCallback(() => {
    setIsOverTrash(false);
  }, []);

  const handleTrashDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId && onItemDelete) {
      onItemDelete(itemId);
    }
    setIsOverTrash(false);
    setIsDragging(false);
    setDraggedItemId(null);
  }, [onItemDelete]);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);
      else if (width < 1024) setColumns(2);
      else if (width < 1440) setColumns(3);
      else setColumns(4);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Navigate to a different day (for day mode)
  const jumpDays = useCallback((days: number) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Go to today (for day mode)
  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Scroll to now marker (for stream mode)
  const scrollToNow = useCallback((instant?: boolean) => {
    if (nowMarkerRef.current) {
      const markerRect = nowMarkerRef.current.getBoundingClientRect();
      const targetY = window.scrollY + markerRect.top - window.innerHeight / 2 + markerRect.height / 2;
      window.scrollTo({ top: targetY, behavior: instant ? 'instant' : 'smooth' });
    }
  }, []);

  // Initialize and scroll to now for stream mode
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
      if (mode === 'stream') {
        scrollToNow(true); // instant scroll on init
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [mode, scrollToNow]);

  // Track scroll position for stream mode
  useEffect(() => {
    if (mode !== 'stream') return;

    const handleScroll = () => {
      if (!nowMarkerRef.current) return;

      const markerRect = nowMarkerRef.current.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const distanceFromCenter = markerRect.top - viewportCenter;
      const hoursOffset = distanceFromCenter / 100;

      const newTime = new Date(Date.now() - hoursOffset * 60 * 60 * 1000);
      setViewedTime(newTime);

      const isNow = Math.abs(distanceFromCenter) < 100;
      setIsViewingNow(isNow);

      if (onTimeChange) {
        onTimeChange(newTime, isNow);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mode, onTimeChange]);

  // Scroll to top when a new item is added
  useEffect(() => {
    if (newlyAddedId) {
      if (mode === 'stream') {
        scrollToNow();
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [newlyAddedId, mode, scrollToNow]);

  // Check if viewing today (for day mode)
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Get the relevant date for an item
  const getItemDate = useCallback((item: MindItem): Date => {
    if (item.source === 'calendar') {
      const meta = item.sourceMeta.meta as { startsAt: string };
      if (meta?.startsAt) {
        return new Date(meta.startsAt);
      }
    }
    return new Date(item.lastTouchedAt);
  }, []);

  // Stream mode: all items sorted by temporal relevance
  const { futureItems, pastItems } = useMemo(() => {
    if (mode !== 'stream') return { futureItems: [], pastItems: [] };

    const withMeta = items.map(item => ({
      item,
      relevance: getTemporalRelevance(item),
      opacity: getItemOpacity(item),
    }));

    // Sort by temporal relevance (future first, then recent past)
    withMeta.sort((a, b) => b.relevance - a.relevance);

    // Split into future and past
    const future = withMeta.filter(i => i.relevance > 0);
    const past = withMeta.filter(i => i.relevance <= 0);

    return { futureItems: future, pastItems: past };
  }, [items, mode]);

  // Day mode: items relevant to the selected date
  // - Calendar events: scheduled for that day
  // - Slack/Drive/Other: recent activity (within 48h) OR high priority OR manually added
  const { dayItems } = useMemo(() => {
    if (mode !== 'day') return { dayItems: [] };

    const now = new Date();
    const startOfSelected = new Date(selectedDate);
    startOfSelected.setHours(0, 0, 0, 0);
    
    const endOfSelected = new Date(selectedDate);
    endOfSelected.setHours(23, 59, 59, 999);

    // Check if selected date is today
    const isSelectedToday = selectedDate.toDateString() === now.toDateString();
    const isSelectedTomorrow = selectedDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
    const isSelectedYesterday = selectedDate.toDateString() === new Date(now.getTime() - 86400000).toDateString();

    const filtered = items.filter(item => {
      // Calendar events: show if event is on the selected day
      if (item.source === 'calendar') {
        const meta = item.sourceMeta.meta as { startsAt: string };
        if (meta?.startsAt) {
          const eventDate = new Date(meta.startsAt);
          return eventDate >= startOfSelected && eventDate <= endOfSelected;
        }
        return false;
      }

      // Omnibar items (manually added): always show on today/yesterday
      if (item.source === 'omnibar') {
        if (isSelectedToday || isSelectedYesterday) return true;
        const touchedDate = new Date(item.lastTouchedAt);
        return touchedDate >= startOfSelected && touchedDate <= endOfSelected;
      }

      // Slack/Drive/Other items: show based on recency and importance
      const touchedDate = new Date(item.lastTouchedAt);
      const hoursSinceTouched = (now.getTime() - touchedDate.getTime()) / (1000 * 60 * 60);

      // For today: show recent items (last 48h) or high priority items
      if (isSelectedToday) {
        const isRecent = hoursSinceTouched <= 48;
        const isHighPriority = item.priority >= 4;
        return isRecent || isHighPriority;
      }

      // For tomorrow: show high priority items that might need prep
      if (isSelectedTomorrow) {
        return item.priority >= 4;
      }

      // For yesterday: show items touched that day
      if (isSelectedYesterday) {
        return touchedDate >= startOfSelected && touchedDate <= endOfSelected;
      }

      // For other days: strict date match
      return touchedDate >= startOfSelected && touchedDate <= endOfSelected;
    });

    const withMeta = filtered.map(item => ({
      item,
      relevance: getTemporalRelevance(item),
      opacity: getItemOpacity(item),
    }));

    // Sort: calendar events by time, then other items by priority/recency
    withMeta.sort((a, b) => {
      // Calendar events first, sorted by start time
      const aIsCalendar = a.item.source === 'calendar';
      const bIsCalendar = b.item.source === 'calendar';
      
      if (aIsCalendar && !bIsCalendar) return -1;
      if (!aIsCalendar && bIsCalendar) return 1;
      
      if (aIsCalendar && bIsCalendar) {
        const aDate = getItemDate(a.item);
        const bDate = getItemDate(b.item);
        return aDate.getTime() - bDate.getTime();
      }
      
      // Non-calendar: sort by priority first, then recency
      if (a.item.priority !== b.item.priority) {
        return b.item.priority - a.item.priority;
      }
      return Math.abs(a.relevance) - Math.abs(b.relevance);
    });

    // Interleave non-calendar items by source for variety
    const calendarItems = withMeta.filter(i => i.item.source === 'calendar');
    const otherItems = withMeta.filter(i => i.item.source !== 'calendar');
    
    const bySource: Map<string, typeof otherItems> = new Map();
    otherItems.forEach(item => {
      const source = item.item.source;
      if (!bySource.has(source)) {
        bySource.set(source, []);
      }
      bySource.get(source)!.push(item);
    });

    const interleavedOther: typeof otherItems = [];
    const sources = [...bySource.values()];
    let added = true;
    while (added) {
      added = false;
      for (const sourceItems of sources) {
        if (sourceItems.length > 0) {
          interleavedOther.push(sourceItems.shift()!);
          added = true;
        }
      }
    }

    // Calendar events first, then interleaved other items
    return { dayItems: [...calendarItems, ...interleavedOther] };
  }, [items, selectedDate, getItemDate, mode]);


  const formatDateShort = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatViewedTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);

    if (Math.abs(diffMins) < 5) return 'now';
    if (diffMins > 0) {
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return formatDateShort(date);
    } else {
      const absMins = Math.abs(diffMins);
      const absHours = Math.abs(diffHours);
      if (absMins < 60) return `in ${absMins}m`;
      if (absHours < 24) return `in ${absHours}h`;
      return formatDateShort(date);
    }
  };


  const renderMasonryGrid = (
    itemsWithMeta: Array<{ item: MindItem; opacity: number; relevance: number }>,
  ) => {
    const columnItems: Array<typeof itemsWithMeta> = Array.from({ length: columns }, () => []);
    itemsWithMeta.forEach((item, index) => {
      columnItems[index % columns].push(item);
    });

    return (
      <div 
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {columnItems.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-3">
            <>
              {column.map(({ item, opacity }) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragEnd={handleDragEnd}
                  style={{ opacity: draggedItemId === item.id ? 0.5 : 1 }}
                >
                  <ItemCard
                    item={item}
                    opacity={draggedItemId === item.id ? 0.5 : opacity}
                    onClick={onItemClick}
                    onComplete={onItemComplete}
                    onDefer={onItemDefer}
                    isDragging={draggedItemId === item.id}
                    isNew={item.id === newlyAddedId}
                  />
                </div>
              ))}
            </>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Mode toggle & navigation - bottom left */}
      <div className={`fixed bottom-6 left-6 z-40 transition-opacity duration-500 ${isInitialized ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={() => {
                setMode('stream');
                setTimeout(() => scrollToNow(false), 100);
              }}
              className={`p-1.5 rounded-md transition-colors ${mode === 'stream' ? 'bg-white/10 text-white/80' : 'text-white/40 hover:text-white/60'}`}
              title="Stream view"
            >
              <Layers size={14} />
            </button>
            <button
              onClick={() => {
                setMode('day');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`p-1.5 rounded-md transition-colors ${mode === 'day' ? 'bg-white/10 text-white/80' : 'text-white/40 hover:text-white/60'}`}
              title="Day view"
            >
              <CalendarDays size={14} />
            </button>
          </div>

          {/* Date/time navigation */}
          {mode === 'day' ? (
            <div className="flex items-center gap-0.5 bg-black/50 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => jumpDays(-1)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/70"
                title="Previous day"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={goToToday}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${isToday ? 'text-white/50' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              >
                {formatDateShort(selectedDate)}
              </button>
              <button
                onClick={() => jumpDays(1)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/70"
                title="Next day"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={scrollToNow}
              className={`px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-xs font-mono transition-colors ${isViewingNow ? 'text-white/50' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
              {isViewingNow ? 'now' : formatViewedTime(viewedTime)}
            </button>
          )}
        </div>
      </div>

      {/* Stream mode content */}
      {mode === 'stream' && (
        <div className={`transition-opacity duration-300 ${isInitialized ? 'opacity-100' : 'opacity-0'}`}>
          {/* Fixed NOW bar in center of screen */}
          <div 
            className="fixed left-0 right-0 z-30 pointer-events-none px-6"
            style={{ top: 'calc(50vh - 8px)' }}
          >
            <div className="flex items-center w-full">
              {/* Left label with pulsing/static dot */}
              <div className="flex items-center gap-2 mr-4 pointer-events-auto">
                {isViewingNow ? (
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-emerald-400"
                    animate={{ 
                      opacity: [0.4, 1, 0.4],
                      scale: [0.9, 1.1, 0.9],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-rose-400/80" />
                )}
                <button
                  onClick={scrollToNow}
                  className={`text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    isViewingNow ? 'text-white/50' : 'text-rose-400/80 hover:text-rose-400 cursor-pointer'
                  }`}
                >
                  {isViewingNow ? 'now' : formatViewedTime(viewedTime)}
                </button>
              </div>
              
              {/* The line */}
              <div className={`flex-1 h-px transition-colors ${
                isViewingNow 
                  ? 'bg-gradient-to-r from-white/20 to-transparent' 
                  : 'bg-gradient-to-r from-rose-400/30 to-transparent'
              }`} />
            </div>
          </div>

          <div className="px-6 py-6">
            {/* Extra scroll space at top for future */}
            <div className="h-[20vh]" />
            
            {/* Future section - TOP (scroll up to see more future) */}
            {futureItems.length > 0 && (
              <section className="mb-4">
                {renderMasonryGrid([...futureItems].reverse())}
              </section>
            )}

            {/* Invisible NOW marker for scroll tracking */}
            <div ref={nowMarkerRef} className="h-4" />

            {/* Past section - BOTTOM (scroll down to see more past) */}
            {pastItems.length > 0 && (
              <section className="mt-4">
                {renderMasonryGrid(pastItems)}
              </section>
            )}
            
            {/* Extra scroll space at bottom for past */}
            <div className="h-[50vh]" />
          </div>
        </div>
      )}

      {/* Day mode content */}
      {mode === 'day' && (
        <div className="px-6 py-6">
          {/* Date header */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-white/80">
              {formatDateShort(selectedDate)}
            </h2>
            <p className="text-sm text-white/40 mt-0.5">
              {dayItems.length} {dayItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Items grid */}
          {dayItems.length > 0 ? (
            <section>
              {renderMasonryGrid(dayItems)}
            </section>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-white/30 text-sm">No items for this day</div>
              <button 
                onClick={goToToday}
                className="mt-4 text-xs text-white/50 hover:text-white/70 transition-colors"
              >
                Go to Today
              </button>
            </div>
          )}
        </div>
      )}

      {/* Trash Zone - appears when dragging */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-8 right-8 z-50"
            onDragOver={handleTrashDragOver}
            onDragLeave={handleTrashDragLeave}
            onDrop={handleTrashDrop}
          >
            <motion.div
              animate={{
                scale: isOverTrash ? 1.15 : 1,
                backgroundColor: isOverTrash ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: isOverTrash ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.1)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`
                w-20 h-20 rounded-2xl border-2 border-dashed
                flex flex-col items-center justify-center gap-2
                backdrop-blur-xl shadow-2xl
              `}
            >
              <motion.div
                animate={{ 
                  scale: isOverTrash ? 1.2 : 1,
                  rotate: isOverTrash ? [0, -10, 10, -10, 0] : 0,
                }}
                transition={{ 
                  scale: { type: 'spring', stiffness: 400 },
                  rotate: { duration: 0.4 },
                }}
              >
                <Trash2 
                  size={24} 
                  className={isOverTrash ? 'text-red-400' : 'text-white/40'}
                />
              </motion.div>
              <span className={`text-[10px] font-mono ${isOverTrash ? 'text-red-400' : 'text-white/30'}`}>
                {isOverTrash ? 'Release' : 'Drop here'}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

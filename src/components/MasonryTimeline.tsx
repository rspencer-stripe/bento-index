'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { MindItem } from '@/lib/types';
import { ItemCard } from './ItemCard';

interface MasonryTimelineProps {
  items: MindItem[];
  onItemClick?: (item: MindItem) => void;
  onTimeChange?: (viewedTime: Date, isNow: boolean) => void;
  onItemDelete?: (itemId: string) => void;
  onItemComplete?: (item: MindItem) => void;
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

export function MasonryTimeline({ items, onItemClick, onTimeChange, onItemDelete, onItemComplete, onItemsReorder, newlyAddedId }: MasonryTimelineProps) {
  const [columns, setColumns] = useState(4);
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

  // Scroll to now
  const scrollToNow = useCallback((smooth = true) => {
    if (nowMarkerRef.current) {
      const viewportCenter = window.innerHeight / 2;
      const nowMarkerRect = nowMarkerRef.current.getBoundingClientRect();
      const nowMarkerCenter = nowMarkerRect.top + nowMarkerRect.height / 2;
      const scrollOffset = nowMarkerCenter - viewportCenter;
      
      window.scrollBy({
        top: scrollOffset,
        behavior: smooth ? 'smooth' : 'instant'
      });
    }
  }, []);

  // Scroll to now on initial mount
  useEffect(() => {
    // Small delay to ensure the DOM has rendered
    const timer = setTimeout(() => {
      scrollToNow(false);
      // Show the time indicator after scroll completes
      setTimeout(() => setIsInitialized(true), 50);
    }, 100);
    return () => clearTimeout(timer);
  }, [scrollToNow]);

  // Calculate viewed time based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!nowMarkerRef.current || !containerRef.current) return;

      const viewportCenter = window.innerHeight / 2;
      const nowMarkerRect = nowMarkerRef.current.getBoundingClientRect();
      const nowMarkerCenter = nowMarkerRect.top + nowMarkerRect.height / 2;
      
      // How far is the "now" marker from viewport center?
      // Positive = now marker is below center = we're viewing the future
      // Negative = now marker is above center = we're viewing the past
      const pixelOffset = nowMarkerCenter - viewportCenter;
      
      // Convert pixels to hours (roughly 100px = 1 hour)
      // Flip the sign: scrolling down (now marker goes up) = past
      const hoursOffset = -pixelOffset / 100;
      
      // Calculate viewed time
      const newViewedTime = new Date(Date.now() + hoursOffset * 60 * 60 * 1000);
      setViewedTime(newViewedTime);
      
      // Are we viewing "now"? (within 30 mins)
      const isNow = Math.abs(hoursOffset) < 0.5;
      setIsViewingNow(isNow);
      
      // Notify parent
      onTimeChange?.(newViewedTime, isNow);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onTimeChange]);

  const { allItems } = useMemo(() => {
    const sorted = [...items]
      .map(item => ({
        item,
        relevance: getTemporalRelevance(item),
        opacity: getItemOpacity(item),
      }))
      .sort((a, b) => a.relevance - b.relevance); // oldest/past first, future last

    return { allItems: sorted };
  }, [items]);

  // Find where "now" should be inserted in the sorted list
  const nowIndex = useMemo(() => {
    return allItems.findIndex(i => i.relevance >= 0);
  }, [allItems]);

  const pastItems = allItems.slice(0, nowIndex === -1 ? allItems.length : nowIndex);
  const futureItems = nowIndex === -1 ? [] : allItems.slice(nowIndex);

  const formatViewedTime = (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = diffMs / 3600000;
    const diffDays = diffMs / 86400000;

    if (Math.abs(diffMins) < 30) return 'Now';
    
    if (diffMs < 0) {
      const abs = Math.abs(diffHours);
      if (abs < 1) return `${Math.abs(diffMins)}m ago`;
      if (abs < 24) return `${Math.round(abs)}h ago`;
      return `${Math.round(Math.abs(diffDays))}d ago`;
    } else {
      if (diffHours < 1) return `in ${diffMins}m`;
      if (diffHours < 24) return `in ${Math.round(diffHours)}h`;
      return `in ${Math.round(diffDays)}d`;
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
            <AnimatePresence mode="popLayout">
              {column.map(({ item, opacity }, itemIndex) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: draggedItemId === item.id ? 0.5 : opacity, 
                    y: 0,
                    scale: draggedItemId === item.id ? 0.98 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                    delay: (colIndex * 0.02) + (itemIndex * 0.03),
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, item.id)}
                  onDragEnd={handleDragEnd}
                >
                  <ItemCard
                    item={item}
                    opacity={draggedItemId === item.id ? 0.5 : opacity}
                    onClick={onItemClick}
                    onComplete={onItemComplete}
                    isDragging={draggedItemId === item.id}
                    isNew={item.id === newlyAddedId}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Fixed center time indicator - all elements locked together */}
      <div 
        className={`fixed left-0 right-0 top-1/2 z-40 transition-opacity duration-300 ${isInitialized ? 'opacity-100' : 'opacity-0'}`} 
        style={{ transform: 'translateY(-50%)' }}
      >
        <div className="flex items-center h-8">
          {/* Time label + dot on left - clickable to return to now */}
          <button
            onClick={() => scrollToNow(true)}
            className={`
              w-24 pr-3 flex items-center justify-end gap-2 font-mono text-sm font-medium
              transition-opacity hover:opacity-100
              ${isViewingNow ? 'text-white/70 pointer-events-none' : 'text-rose-400 cursor-pointer opacity-90'}
            `}
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isViewingNow ? 'bg-white/50 animate-pulse' : 'bg-rose-400'}`} />
            <span>{formatViewedTime(viewedTime)}</span>
          </button>
          
          {/* Horizontal line */}
          <div className={`flex-1 h-px pointer-events-none ${isViewingNow ? 'bg-gradient-to-r from-white/30 via-white/20 to-transparent' : 'bg-gradient-to-r from-rose-500/50 via-rose-500/20 to-transparent'}`} />
        </div>
        
      </div>

      {/* Main content */}
      <div className="ml-24 px-4 py-6">
        {/* Extra scroll space at top for future */}
        <div className="h-[30vh]" />
        
        {/* Future section - TOP (scroll up to see more future) */}
        {futureItems.length > 0 && (
          <section className="mb-4">
            {renderMasonryGrid([...futureItems].reverse())}
          </section>
        )}

        {/* NOW marker (invisible, used for position tracking) */}
        <div 
          ref={nowMarkerRef} 
          className="relative h-24 flex items-center justify-center"
        >
          <div className="text-[10px] font-mono text-white/20 uppercase tracking-wider">
            {isViewingNow ? '● present' : ''}
          </div>
        </div>

        {/* Past section - BOTTOM (scroll down to see more past) */}
        {pastItems.length > 0 && (
          <section className="mt-4">
            {renderMasonryGrid([...pastItems].reverse())}
          </section>
        )}
        
        {/* Extra scroll space at bottom for past */}
        <div className="h-[50vh]" />
      </div>

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

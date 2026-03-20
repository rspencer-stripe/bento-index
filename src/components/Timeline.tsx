'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BentoTile as BentoTileType, MindItem } from '@/lib/types';
import { BentoTile } from './BentoTile';

interface TimelineProps {
  tiles: BentoTileType[];
  onTileExpand?: (tile: BentoTileType) => void;
}

interface TimeSlot {
  label: string;
  time: Date;
  offsetHours: number;
  tiles: BentoTileType[];
}

function formatTimeLabel(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (Math.abs(diffHours) < 0.5) return 'Now';
  
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

function getTemporalRelevance(tile: BentoTileType): number {
  const now = Date.now();
  
  // Check for upcoming events
  if (tile.nextEventAt) {
    const eventTime = new Date(tile.nextEventAt).getTime();
    const hoursUntil = (eventTime - now) / (1000 * 60 * 60);
    if (hoursUntil > 0 && hoursUntil <= 8) {
      return hoursUntil; // Position by hours until event
    }
  }

  // For items without events, use last touched time
  const mostRecentTouch = tile.items.reduce((latest, item) => {
    const touched = new Date(item.lastTouchedAt).getTime();
    return touched > latest ? touched : latest;
  }, 0);

  const hoursSinceTouch = (now - mostRecentTouch) / (1000 * 60 * 60);
  
  // Negative values = past, positive = future
  return -hoursSinceTouch;
}

export function Timeline({ tiles, onTileExpand }: TimelineProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const { futureTiles, nowTiles, pastTiles, timeMarkers } = useMemo(() => {
    const now = Date.now();
    
    const sortedTiles = [...tiles].map(tile => ({
      tile,
      relevance: getTemporalRelevance(tile),
    }));

    // Future: positive relevance (upcoming events)
    const future = sortedTiles
      .filter(t => t.relevance > 0.5)
      .sort((a, b) => a.relevance - b.relevance)
      .map(t => t.tile);

    // Now: within ±30 mins of relevance
    const present = sortedTiles
      .filter(t => Math.abs(t.relevance) <= 0.5)
      .sort((a, b) => {
        const priorityA = Math.max(...a.tile.items.map(i => i.priority));
        const priorityB = Math.max(...b.tile.items.map(i => i.priority));
        return priorityB - priorityA;
      })
      .map(t => t.tile);

    // Past: negative relevance (recently touched)
    const past = sortedTiles
      .filter(t => t.relevance < -0.5)
      .sort((a, b) => b.relevance - a.relevance) // More recent first
      .map(t => t.tile);

    // Generate time markers for the next 4 hours
    const markers: { time: Date; label: string }[] = [];
    for (let h = -2; h <= 4; h++) {
      const markerTime = new Date(now + h * 60 * 60 * 1000);
      markerTime.setMinutes(0, 0, 0);
      markers.push({
        time: markerTime,
        label: formatTimeLabel(markerTime),
      });
    }

    return {
      futureTiles: future,
      nowTiles: present,
      pastTiles: past,
      timeMarkers: markers,
    };
  }, [tiles, currentTime]);

  return (
    <div className="relative min-h-screen">
      {/* Time axis on left */}
      <div className="fixed left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-30 pointer-events-none">
        <div className="h-full flex flex-col justify-center">
          {timeMarkers.map((marker, i) => {
            const isNow = marker.label === 'Now';
            return (
              <div
                key={i}
                className={`
                  px-3 py-2 text-right font-mono text-xs
                  ${isNow ? 'text-white font-medium' : 'text-white/30'}
                `}
                style={{ 
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                {marker.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content area */}
      <div className="ml-20 relative">
        {/* Future section */}
        {futureTiles.length > 0 && (
          <section className="py-6 px-4 opacity-80">
            <div className="max-w-6xl mx-auto">
              <motion.div 
                className="bento-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AnimatePresence mode="popLayout">
                  {futureTiles.map((tile, index) => (
                    <motion.div
                      key={tile.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 0.7, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <BentoTile tile={{ ...tile, opacity: 0.7 }} onExpand={onTileExpand} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </section>
        )}

        {/* NOW LINE */}
        <div className="relative py-8">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center z-20">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-white/20" />
            <div className="flex-1 h-px bg-white/10" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute left-16 -translate-y-1/2 flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                Now
              </span>
            </motion.div>
          </div>

          {/* Now tiles - Full opacity, centered around the line */}
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <motion.div 
              className="bento-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AnimatePresence mode="popLayout">
                {nowTiles.map((tile, index) => (
                  <motion.div
                    key={tile.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                      delay: index * 0.05,
                    }}
                  >
                    <BentoTile tile={tile} onExpand={onTileExpand} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Past section */}
        {pastTiles.length > 0 && (
          <section className="py-6 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-wider">
                  Earlier
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <motion.div 
                className="bento-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AnimatePresence mode="popLayout">
                  {pastTiles.map((tile, index) => (
                    <motion.div
                      key={tile.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <BentoTile tile={tile} onExpand={onTileExpand} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

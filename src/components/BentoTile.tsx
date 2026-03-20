'use client';

import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  FileText, 
  Calendar, 
  Globe, 
  Video, 
  Sparkles,
  Clock,
  ChevronRight
} from 'lucide-react';
import { BentoTile as BentoTileType, MindItem, ItemSource } from '@/lib/types';

const sourceIcons: Record<ItemSource, React.ElementType> = {
  slack: MessageSquare,
  figma: FileText,
  drive: FileText,
  calendar: Calendar,
  web: Globe,
  zoom: Video,
  omnibar: Sparkles,
};

const sourceColors: Record<ItemSource, string> = {
  slack: '#E01E5A',
  figma: '#A259FF',
  drive: '#4285F4',
  calendar: '#34A853',
  web: '#71717A',
  zoom: '#2D8CFF',
  omnibar: '#6366F1',
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMs > 0) {
    if (diffMins < 60) return `in ${diffMins}m`;
    if (diffHours < 24) return `in ${diffHours}h`;
    return `in ${diffDays}d`;
  } else {
    const absMins = Math.abs(diffMins);
    const absHours = Math.abs(diffHours);
    const absDays = Math.abs(diffDays);
    if (absMins < 60) return `${absMins}m ago`;
    if (absHours < 24) return `${absHours}h ago`;
    return `${absDays}d ago`;
  }
}

function ItemRow({ item }: { item: MindItem }) {
  const Icon = sourceIcons[item.source];
  const color = sourceColors[item.source];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
    >
      <div 
        className="w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/90 truncate group-hover:text-white">
          {item.title}
        </p>
        {item.snippet && (
          <p className="text-xs text-white/50 truncate mt-0.5">
            {item.snippet}
          </p>
        )}
      </div>
      <span className="text-[10px] font-mono text-white/30 shrink-0">
        {formatRelativeTime(item.lastTouchedAt)}
      </span>
    </motion.div>
  );
}

interface BentoTileProps {
  tile: BentoTileType;
  onExpand?: (tile: BentoTileType) => void;
}

export function BentoTile({ tile, onExpand }: BentoTileProps) {
  const sizeClass = {
    large: 'tile-large',
    medium: 'tile-medium',
    small: 'tile-small',
  }[tile.size];

  const hasUpcomingEvent = tile.nextEventAt && new Date(tile.nextEventAt) > new Date();
  const hoursUntilEvent = tile.nextEventAt 
    ? (new Date(tile.nextEventAt).getTime() - Date.now()) / 3600000 
    : null;
  const isHotZone = hoursUntilEvent !== null && hoursUntilEvent <= 2 && hoursUntilEvent > 0;

  const sortedItems = [...tile.items].sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    return new Date(b.lastTouchedAt).getTime() - new Date(a.lastTouchedAt).getTime();
  });

  const displayItems = tile.size === 'small' ? sortedItems.slice(0, 2) : sortedItems.slice(0, 5);
  const remainingCount = tile.items.length - displayItems.length;

  return (
    <motion.div
      layout
      layoutId={tile.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: tile.opacity, 
        scale: 1,
      }}
      whileHover={{ 
        scale: 1.01,
        opacity: Math.min(tile.opacity + 0.1, 1),
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
      onClick={() => onExpand?.(tile)}
      className={`
        ${sizeClass}
        bg-[#111] border border-[#222] rounded-xl p-4
        cursor-pointer overflow-hidden
        hover:border-[#333] transition-colors
        flex flex-col
        ${isHotZone ? 'ring-2 ring-amber-500/50' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-white">
            {tile.displayName}
          </h3>
          {isHotZone && (
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-mono rounded-full flex items-center gap-1">
              <Clock size={10} />
              {formatRelativeTime(tile.nextEventAt!)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {tile.recentUpdateCount > 0 && (
            <span className="text-[10px] font-mono text-white/40">
              {tile.recentUpdateCount} recent
            </span>
          )}
          <span className="text-[10px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded">
            {tile.itemCount}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 space-y-1 overflow-hidden">
        {displayItems.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>

      {/* Footer */}
      {remainingCount > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-white/40">
            +{remainingCount} more items
          </span>
          <ChevronRight size={14} className="text-white/30" />
        </div>
      )}
    </motion.div>
  );
}

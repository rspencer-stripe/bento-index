'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  FileText,
  Calendar,
  Globe,
  Video,
  Sparkles,
  Clock,
  Hash,
  ExternalLink,
  Check,
  ArrowRight,
  MoreHorizontal,
  Reply,
  Zap,
} from 'lucide-react';
import { MindItem, ItemSource, SlackMeta, FigmaMeta, DriveMeta, WebMeta, ZoomMeta, CalendarMeta } from '@/lib/types';

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

const sourceLabels: Record<ItemSource, string> = {
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
    case 'calendar':
      return null;
    default:
      return null;
  }
}

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

function getCardHeight(item: MindItem): 'tall' | 'medium' | 'short' {
  // Calendar events and items with snippets get taller cards
  if (item.source === 'calendar') return 'tall';
  if (item.snippet && item.snippet.length > 50) return 'tall';
  if (item.snippet) return 'medium';
  return 'short';
}

interface ItemCardProps {
  item: MindItem;
  opacity?: number;
  onClick?: (item: MindItem) => void;
  onComplete?: (item: MindItem) => void;
  onDefer?: (item: MindItem) => void;
  onQuickReply?: (item: MindItem) => void;
  isDragging?: boolean;
  isNew?: boolean;
  showActions?: boolean;
  showWaitingBadge?: boolean;
}

export function ItemCard({ 
  item, 
  opacity = 1, 
  onClick, 
  onComplete,
  onDefer,
  onQuickReply,
  isDragging = false, 
  isNew = false,
  showActions = true,
  showWaitingBadge = false,
}: ItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = sourceIcons[item.source];
  const color = sourceColors[item.source];
  const label = sourceLabels[item.source];
  const height = getCardHeight(item);
  const itemUrl = getItemUrl(item);
  const isSlackItem = item.source === 'slack';
  
  // Check if this item has waiting-on-me language
  const text = `${item.title} ${item.snippet || ''}`.toLowerCase();
  const hasWaitingLanguage = showWaitingBadge || 
    /waiting on you|can you|could you|need your|your thoughts|let me know|please review/i.test(text);

  const isEvent = item.source === 'calendar';
  const eventMeta = isEvent ? (item.sourceMeta.meta as { startsAt: string; attendees?: { name: string }[] }) : null;
  const isUpcoming = eventMeta && new Date(eventMeta.startsAt) > new Date();
  const hoursUntil = eventMeta ? (new Date(eventMeta.startsAt).getTime() - Date.now()) / 3600000 : null;
  const isImminent = hoursUntil !== null && hoursUntil > 0 && hoursUntil <= 1;

  const heightClass = {
    tall: 'min-h-[220px]',
    medium: 'min-h-[160px]',
    short: 'min-h-[120px]',
  }[height];

  return (
    <motion.div
      initial={isNew ? { opacity: 0, scale: 0.95 } : false}
      animate={{ 
        opacity, 
        scale: 1,
        boxShadow: isNew ? '0 0 30px rgba(99, 102, 241, 0.4)' : '0 0 0px rgba(99, 102, 241, 0)',
      }}
      whileHover={{ 
        scale: isDragging ? 1 : 1.01,
        opacity: isDragging ? opacity : Math.min(opacity + 0.05, 1),
      }}
      transition={{
        duration: 0.15,
        ease: 'easeOut',
        boxShadow: { duration: 1.5, ease: 'easeOut' },
      }}
      onClick={() => !isDragging && onClick?.(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        ${heightClass}
        bg-[#111] border rounded-2xl p-4
        overflow-hidden
        hover:border-[#333] transition-colors
        flex flex-col
        ${isNew ? 'border-indigo-500/70 ring-2 ring-indigo-500/30' : 'border-[#222]'}
        ${isImminent && !isNew ? 'ring-2 ring-amber-500/50' : ''}
        ${isDragging 
          ? 'cursor-grabbing ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20' 
          : 'cursor-grab active:cursor-grabbing'
        }
      `}
    >
      {/* Source badge */}
      <div className="flex items-center justify-between mb-3">
        <div 
          className="flex items-center gap-2 px-2 py-1 rounded-full"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={12} style={{ color }} />
          <span className="text-[10px] font-medium" style={{ color }}>
            {label}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {isNew && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-mono rounded-full"
            >
              <Sparkles size={10} />
              NEW
            </motion.span>
          )}
          {hasWaitingLanguage && !isNew && (
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-mono rounded-full">
              <Zap size={10} />
              WAITING
            </span>
          )}
          {isImminent && !isNew && (
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-mono rounded-full">
              <Clock size={10} />
              {formatRelativeTime(eventMeta!.startsAt)}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-white leading-snug mb-2">
        {item.title}
      </h3>

      {/* Snippet */}
      {item.snippet && (
        <p className="text-xs text-white/50 leading-relaxed mb-3 line-clamp-3">
          {item.snippet}
        </p>
      )}

      {/* Calendar attendees */}
      {eventMeta?.attendees && eventMeta.attendees.length > 0 && (
        <div className="flex items-center gap-1 mb-3">
          <div className="flex -space-x-1">
            {eventMeta.attendees.slice(0, 3).map((a, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-white/10 border border-[#222] flex items-center justify-center"
              >
                <span className="text-[8px] text-white/60 font-medium">
                  {a.name.charAt(0)}
                </span>
              </div>
            ))}
          </div>
          {eventMeta.attendees.length > 3 && (
            <span className="text-[10px] text-white/30">
              +{eventMeta.attendees.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-1 text-white/30">
          <Hash size={10} />
          <span className="text-[10px] font-mono">
            {item.tag.replace('#', '')}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Action buttons - always present, opacity changes on hover */}
          {showActions && (
            <div 
              className={`flex items-center gap-1 transition-opacity duration-150 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            >
              {/* Quick reply for Slack items */}
              {isSlackItem && itemUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Open in Slack to reply
                    window.open(itemUrl, '_blank');
                    onQuickReply?.(item);
                  }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-pink-500/20 transition-colors group"
                  title="Reply in Slack"
                >
                  <Reply size={12} className="text-white/50 group-hover:text-pink-400" />
                </button>
              )}
              {itemUrl && !isSlackItem && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(itemUrl, '_blank');
                  }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  title="Open"
                >
                  <ExternalLink size={12} className="text-white/50" />
                </button>
              )}
              {onDefer && item.source !== 'calendar' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDefer(item);
                  }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 transition-colors group"
                  title="Defer to tomorrow"
                >
                  <ArrowRight size={12} className="text-white/50 group-hover:text-amber-400" />
                </button>
              )}
              {onComplete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(item);
                  }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-green-500/20 transition-colors group"
                  title="Mark done"
                >
                  <Check size={12} className="text-white/50 group-hover:text-green-400" />
                </button>
              )}
            </div>
          )}
          <span className="text-[10px] font-mono text-white/20">
            {formatRelativeTime(item.lastTouchedAt)}
          </span>
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ 
              backgroundColor: item.priority >= 4 ? '#ef4444' : item.priority >= 3 ? '#f59e0b' : '#22c55e',
              opacity: 0.6,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

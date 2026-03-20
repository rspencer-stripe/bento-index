'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare, 
  FileText, 
  ChevronRight,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Video,
} from 'lucide-react';
import { MindItem, CalendarMeta, SlackMeta, FigmaMeta, DriveMeta, WebMeta, ZoomMeta } from '@/lib/types';
import { UpcomingMeeting } from '@/lib/intelligence';

interface MeetingCompanionProps {
  meetings: UpcomingMeeting[];
  onItemClick?: (item: MindItem) => void;
}

function formatTimeUntil(mins: number): string {
  if (mins < 1) return 'Starting now';
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) return `in ${hours}h`;
  return `in ${hours}h ${remainingMins}m`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

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

function getMeetingLink(item: MindItem): string | null {
  if (item.source !== 'calendar') return null;
  const meta = item.sourceMeta.meta as CalendarMeta;
  const zoomLink = meta.tetheredArtifacts?.find(url => url.includes('zoom.us'));
  return zoomLink || null;
}

function MeetingCard({ 
  meeting, 
  isNext,
  onItemClick,
}: { 
  meeting: UpcomingMeeting; 
  isNext: boolean;
  onItemClick?: (item: MindItem) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`rounded-2xl border p-5 bg-[#111] ${isNext ? 'border-[#333]' : 'border-[#222]'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-white/40" />
            <span className="text-xs font-mono text-white/40">
              {formatTime(meeting.startsAt)} - {formatTime(meeting.endsAt)}
            </span>
          </div>
          <h3 className="text-lg font-medium text-white">
            {meeting.item.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {getMeetingLink(meeting.item) && (
            <button
              onClick={() => {
                const url = getMeetingLink(meeting.item);
                if (url) window.open(url, '_blank');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-sm bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
            >
              <Video size={12} />
              Join
            </button>
          )}
          <div className="px-3 py-1.5 rounded-full font-mono text-sm bg-white/5 text-white/50">
            <Clock size={12} className="inline mr-1" />
            {formatTimeUntil(meeting.minsUntil)}
          </div>
        </div>
      </div>

      {/* Attendees */}
      {meeting.attendees.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Users size={14} className="text-white/30" />
          <div className="flex items-center gap-1 flex-wrap">
            {meeting.attendees.slice(0, 4).map((name, i) => (
              <span key={i} className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/60">
                {name.split(' ')[0]}
              </span>
            ))}
            {meeting.attendees.length > 4 && (
              <span className="text-xs text-white/30">+{meeting.attendees.length - 4}</span>
            )}
          </div>
        </div>
      )}

      {/* Suggested Topics */}
      {meeting.suggestedTopics.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={12} className="text-white/40" />
            <span className="text-xs font-medium text-white/50">Suggested topics</span>
          </div>
          <ul className="space-y-1">
            {meeting.suggestedTopics.map((topic, i) => (
              <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                <ChevronRight size={12} className="mt-1 text-white/20 flex-shrink-0" />
                <span className="line-clamp-1">{topic}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Open Questions */}
      {meeting.openQuestions.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle size={12} className="text-white/40" />
            <span className="text-xs font-medium text-white/50">Open questions</span>
          </div>
          <ul className="space-y-1">
            {meeting.openQuestions.map((q, i) => (
              <li key={i} className="text-sm text-white/60 italic line-clamp-1">
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Context */}
      {meeting.relatedItems.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={12} className="text-white/30" />
            <span className="text-xs font-medium text-white/40">Related context</span>
          </div>
          <div className="space-y-2">
            {meeting.relatedItems.slice(0, 3).map(item => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <FileText size={12} className="text-white/30" />
                <button
                  onClick={() => onItemClick?.(item)}
                  className="text-xs text-white/60 flex-1 line-clamp-1 text-left hover:text-white/80"
                >
                  {item.title}
                </button>
                {getItemUrl(item) && (
                  <button
                    onClick={() => {
                      const url = getItemUrl(item);
                      if (url) window.open(url, '_blank');
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                    title="Open"
                  >
                    <ExternalLink size={10} className="text-white/40" />
                  </button>
                )}
                <button
                  onClick={() => onItemClick?.(item)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                  title="View details"
                >
                  <ChevronRight size={10} className="text-white/40" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function MeetingCompanion({ meetings, onItemClick }: MeetingCompanionProps) {
  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Calendar size={24} className="text-white/30" />
        </div>
        <h3 className="text-lg font-medium text-white/70 mb-2">No upcoming meetings</h3>
        <p className="text-sm text-white/40 max-w-sm">
          Your next few hours are clear. Perfect time for deep work.
        </p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.02 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring' as const, stiffness: 400, damping: 30 },
    },
  };

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-white/50" />
            <h2 className="text-lg font-medium text-white">Meeting companion</h2>
          </div>
          <p className="text-sm text-white/40 mt-0.5">
            Context and prep for your upcoming meetings
          </p>
        </div>
        <span className="text-xs font-mono text-white/40">
          {meetings.length} upcoming
        </span>
      </motion.div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {meetings.map((meeting, index) => (
            <MeetingCard 
              key={meeting.item.id} 
              meeting={meeting} 
              isNext={index === 0}
              onItemClick={onItemClick}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

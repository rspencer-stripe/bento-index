'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitCommit,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { MindItem, SlackMeta, FigmaMeta, DriveMeta, WebMeta, ZoomMeta } from '@/lib/types';
import { Commitment } from '@/lib/intelligence';

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

interface CommitmentTrackerProps {
  commitments: Commitment[];
  onItemClick?: (item: MindItem) => void;
  onMarkDone?: (commitmentId: string) => void;
  onDismiss?: (commitmentId: string) => void;
}

const statusConfig = {
  pending: { 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/20',
    icon: Clock,
    label: 'Pending',
  },
  overdue: { 
    color: 'text-red-400', 
    bg: 'bg-red-500/10', 
    border: 'border-red-500/20',
    icon: AlertCircle,
    label: 'Overdue',
  },
  done: { 
    color: 'text-green-400', 
    bg: 'bg-green-500/10', 
    border: 'border-green-500/20',
    icon: CheckCircle,
    label: 'Done',
  },
};

function CommitmentCard({ 
  commitment,
  onItemClick,
  onMarkDone,
  onDismiss,
}: { 
  commitment: Commitment;
  onItemClick?: (item: MindItem) => void;
  onMarkDone?: (commitmentId: string) => void;
  onDismiss?: (commitmentId: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const status = statusConfig[commitment.status];
  const StatusIcon = status.icon;

  const handleMarkDone = () => {
    setIsCompleting(true);
    setTimeout(() => {
      onMarkDone?.(commitment.id);
    }, 400);
  };

  const sourceItem = commitment.extractedFrom;
  const daysAgo = Math.floor(
    (Date.now() - new Date(sourceItem.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isCompleting ? 0.3 : 1, 
        y: 0,
      }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        p-4 rounded-xl border transition-colors bg-[#111]
        ${isHovered ? 'border-[#333]' : 'border-[#222]'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5">
          <StatusIcon size={16} className="text-white/40" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Commitment Text */}
          <p className="text-sm text-white leading-relaxed mb-2">
            "{commitment.text}"
          </p>

          {/* Source */}
          <button
            onClick={() => onItemClick?.(sourceItem)}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors group"
          >
            <MessageSquare size={10} />
            <span className="line-clamp-1">{sourceItem.title}</span>
            <span className="text-white/20">•</span>
            <span>{daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo}d ago`}</span>
            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100" />
          </button>

          {/* Tags */}
          {commitment.relatedTo && commitment.relatedTo.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {commitment.relatedTo.map(tag => (
                <span 
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <AnimatePresence>
          {(isHovered || commitment.status === 'overdue') && !isCompleting && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-1"
            >
              {getItemUrl(sourceItem) && (
                <button
                  onClick={() => {
                    const url = getItemUrl(sourceItem);
                    if (url) window.open(url, '_blank');
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 transition-colors"
                  title="Open"
                >
                  <ExternalLink size={14} />
                </button>
              )}
              <button
                onClick={handleMarkDone}
                className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 text-white/40 hover:text-green-400 transition-colors"
                title="Mark as done"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => onDismiss?.(commitment.id)}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function CommitmentTracker({ 
  commitments, 
  onItemClick, 
  onMarkDone,
  onDismiss,
}: CommitmentTrackerProps) {
  const overdueCount = commitments.filter(c => c.status === 'overdue').length;
  const pendingCount = commitments.filter(c => c.status === 'pending').length;

  if (commitments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <CheckCircle size={28} strokeWidth={1.5} className="text-white/50" />
        </div>
        <h3 className="text-lg font-medium text-white/70 mb-2">No open commitments</h3>
        <p className="text-sm text-white/40 max-w-sm">
          We scan your Slack messages for phrases like "I'll..." or "Let me..." to track follow-ups.
        </p>
      </div>
    );
  }

  const overdueCommitments = commitments.filter(c => c.status === 'overdue');
  const pendingCommitments = commitments.filter(c => c.status === 'pending');

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
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <GitCommit size={18} className="text-white/50" />
            <h2 className="text-lg font-medium text-white">Commitments</h2>
          </div>
          <p className="text-sm text-white/40 mt-0.5">
            Things you said you'd do
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          {overdueCount > 0 && (
            <span className="flex items-center gap-1.5 text-amber-400/70">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {overdueCount} overdue
            </span>
          )}
          {pendingCount > 0 && (
            <span className="flex items-center gap-1.5 text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {pendingCount} pending
            </span>
          )}
        </div>
      </motion.div>

      {/* How it works */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center gap-3 p-4 rounded-xl bg-[#111] border border-[#222]"
      >
        <Sparkles size={16} className="text-white/30 flex-shrink-0" />
        <p className="text-xs text-white/40">
          We detect commitments from phrases like <span className="text-white/60">"I'll..."</span>, 
          <span className="text-white/60">"Let me..."</span>, 
          <span className="text-white/60">"I can..."</span> in your messages. 
          Items over 3 days old are marked as overdue.
        </p>
      </motion.div>

      {/* Overdue Section */}
      {overdueCommitments.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Overdue</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {overdueCommitments.map(commitment => (
                <CommitmentCard 
                  key={commitment.id}
                  commitment={commitment}
                  onItemClick={onItemClick}
                  onMarkDone={onMarkDone}
                  onDismiss={onDismiss}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Pending Section */}
      {pendingCommitments.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-white/40" />
            <span className="text-sm font-medium text-white/50">Recent</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {pendingCommitments.map(commitment => (
                <CommitmentCard 
                  key={commitment.id}
                  commitment={commitment}
                  onItemClick={onItemClick}
                  onMarkDone={onMarkDone}
                  onDismiss={onDismiss}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

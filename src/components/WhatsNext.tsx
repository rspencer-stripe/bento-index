'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  MessageSquare, 
  FileText, 
  CheckCircle,
  ArrowRight,
  Timer,
  Target,
  AlertCircle,
  Send,
  Eye,
  PenTool,
  GitBranch,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { MindItem, SlackMeta, FigmaMeta, DriveMeta, WebMeta, ZoomMeta } from '@/lib/types';
import { NextAction } from '@/lib/intelligence';

interface WhatsNextProps {
  actions: NextAction[];
  onItemClick?: (item: MindItem) => void;
  onComplete?: (itemId: string) => void;
}

const actionTypeIcons: Record<NextAction['actionType'], React.ElementType> = {
  respond: Send,
  review: Eye,
  prepare: FileText,
  decide: Target,
  create: PenTool,
  follow_up: GitBranch,
};

const actionTypeLabels: Record<NextAction['actionType'], string> = {
  respond: 'Respond',
  review: 'Review',
  prepare: 'Prepare',
  decide: 'Decide',
  create: 'Create',
  follow_up: 'Follow Up',
};

const urgencyColors: Record<NextAction['urgency'], { bg: string; text: string; border: string }> = {
  now: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  soon: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  today: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  this_week: { bg: 'bg-white/5', text: 'text-white/50', border: 'border-white/10' },
};

const sourceColors: Record<string, string> = {
  slack: '#E01E5A',
  figma: '#A259FF',
  drive: '#4285F4',
  web: '#71717A',
  omnibar: '#6366F1',
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

function FocusCard({ 
  action, 
  isFocused,
  onItemClick,
  onComplete,
}: { 
  action: NextAction; 
  isFocused: boolean;
  onItemClick?: (item: MindItem) => void;
  onComplete?: (itemId: string) => void;
}) {
  const [isCompleting, setIsCompleting] = useState(false);
  const ActionIcon = actionTypeIcons[action.actionType];
  const colors = urgencyColors[action.urgency];

  const handleComplete = () => {
    setIsCompleting(true);
    setTimeout(() => {
      onComplete?.(action.item.id);
    }, 500);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isCompleting ? 0.5 : 1, 
        y: 0,
      }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`
        rounded-2xl border p-6 transition-colors
        ${isFocused 
          ? 'border-[#333] bg-[#111]' 
          : 'border-[#222] bg-[#111] hover:border-[#333]'
        }
      `}
    >
      {/* Focus Badge */}
      {isFocused && (
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 rounded-full bg-white/50"
          />
          <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Focus on this
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5">
          <ActionIcon size={24} className="text-white/50" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-white/50">
              {actionTypeLabels[action.actionType]}
            </span>
            <span className="text-xs text-white/20">•</span>
            <span className="text-xs text-white/40">{action.reason}</span>
          </div>
          <h3 className={`font-medium leading-snug ${isFocused ? 'text-lg text-white' : 'text-white/80'}`}>
            {action.item.title}
          </h3>
        </div>
      </div>

      {/* Snippet */}
      {action.item.snippet && (
        <p className={`text-sm mb-4 line-clamp-2 ${isFocused ? 'text-white/60' : 'text-white/40'}`}>
          {action.item.snippet}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Source */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5">
            <span className="text-[10px] font-medium capitalize text-white/50">
              {action.item.source}
            </span>
          </div>

          {/* Time estimate */}
          <div className="flex items-center gap-1 text-white/30">
            <Timer size={12} />
            <span className="text-xs font-mono">~{action.estimatedMins}m</span>
          </div>

          {/* Urgency */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5">
            <span className="text-[10px] font-medium uppercase text-white/40">
              {action.urgency.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {getItemUrl(action.item) && (
            <button
              onClick={() => {
                const url = getItemUrl(action.item);
                if (url) window.open(url, '_blank');
              }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Open"
            >
              <ExternalLink size={16} className="text-white/40" />
            </button>
          )}
          <button
            onClick={() => onItemClick?.(action.item)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            title="View details"
          >
            <ArrowRight size={16} className="text-white/40" />
          </button>
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 transition-colors text-white/40 hover:text-green-400"
            title="Mark done"
          >
            <CheckCircle size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function WhatsNext({ actions, onItemClick, onComplete }: WhatsNextProps) {
  if (actions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <CheckCircle size={24} className="text-white/30" />
        </div>
        <h3 className="text-lg font-medium text-white/70 mb-2">All caught up!</h3>
        <p className="text-sm text-white/40 max-w-sm">
          No urgent actions right now. Time to focus on deep work.
        </p>
      </div>
    );
  }

  const focusAction = actions[0];
  const upNextActions = actions.slice(1);

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
            <Target size={18} className="text-white/50" />
            <h2 className="text-lg font-medium text-white">What&apos;s next</h2>
          </div>
          <p className="text-sm text-white/40 mt-0.5">
            Your highest-impact actions right now
          </p>
        </div>
        <span className="text-xs font-mono text-white/40">
          ~{actions.reduce((sum, a) => sum + a.estimatedMins, 0)}m total
        </span>
      </motion.div>

      {/* Focus Action */}
      <motion.div variants={itemVariants}>
        <AnimatePresence mode="popLayout">
          <FocusCard 
            key={focusAction.item.id}
            action={focusAction} 
            isFocused={true}
            onItemClick={onItemClick}
            onComplete={onComplete}
          />
        </AnimatePresence>
      </motion.div>

      {/* Up Next */}
      {upNextActions.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-white/30 uppercase tracking-wider">
              Up next
            </span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {upNextActions.map(action => (
                <FocusCard 
                  key={action.item.id}
                  action={action} 
                  isFocused={false}
                  onItemClick={onItemClick}
                  onComplete={onComplete}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

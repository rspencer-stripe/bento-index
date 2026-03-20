'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  AlertTriangle,
  MessageSquare,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { UrgentAlert } from '@/lib/intelligence';

interface AlertBarProps {
  alerts: UrgentAlert[];
  onDismiss: (alertId: string) => void;
  onNavigate: (alert: UrgentAlert) => void;
}

const alertIcons: Record<UrgentAlert['type'], React.ElementType> = {
  meeting_soon: Calendar,
  overdue_commitment: Clock,
  waiting_response: MessageSquare,
  stale_high_priority: AlertTriangle,
  blocked: AlertTriangle,
};

const severityColors: Record<UrgentAlert['severity'], { bg: string; text: string; border: string }> = {
  critical: { 
    bg: 'bg-red-500/10', 
    text: 'text-red-400', 
    border: 'border-red-500/30' 
  },
  warning: { 
    bg: 'bg-amber-500/10', 
    text: 'text-amber-400', 
    border: 'border-amber-500/30' 
  },
  info: { 
    bg: 'bg-blue-500/10', 
    text: 'text-blue-400', 
    border: 'border-blue-500/30' 
  },
};

export function AlertBar({ alerts, onDismiss, onNavigate }: AlertBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter(a => !dismissedIds.has(a.id));
  const currentAlert = visibleAlerts[currentIndex % visibleAlerts.length];

  useEffect(() => {
    if (visibleAlerts.length <= 1) return;
    
    const interval = setInterval(() => {
      if (!isExpanded) {
        setCurrentIndex(prev => (prev + 1) % visibleAlerts.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [visibleAlerts.length, isExpanded]);

  const handleDismiss = (alertId: string) => {
    setDismissedIds(prev => new Set(prev).add(alertId));
    onDismiss(alertId);
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="collapsed"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <AlertItem
              alert={currentAlert}
              onDismiss={handleDismiss}
              onNavigate={onNavigate}
              onExpand={() => setIsExpanded(true)}
              showExpandButton={visibleAlerts.length > 1}
              totalCount={visibleAlerts.length}
              currentIndex={currentIndex % visibleAlerts.length}
            />
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs text-white/40 font-mono">
                {visibleAlerts.length} alerts
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                Collapse
              </button>
            </div>
            {visibleAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <AlertItem
                  alert={alert}
                  onDismiss={handleDismiss}
                  onNavigate={onNavigate}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AlertItemProps {
  alert: UrgentAlert;
  onDismiss: (alertId: string) => void;
  onNavigate: (alert: UrgentAlert) => void;
  onExpand?: () => void;
  showExpandButton?: boolean;
  totalCount?: number;
  currentIndex?: number;
}

function AlertItem({ 
  alert, 
  onDismiss, 
  onNavigate, 
  onExpand, 
  showExpandButton,
  totalCount,
  currentIndex,
}: AlertItemProps) {
  const Icon = alertIcons[alert.type];
  const colors = severityColors[alert.severity];

  return (
    <motion.div
      layout
      className={`
        ${colors.bg} ${colors.border}
        border rounded-xl backdrop-blur-xl
        shadow-lg shadow-black/20
      `}
    >
      <div className="flex items-center gap-3 p-3">
        <div className={`${colors.text} flex-shrink-0`}>
          <Icon size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${colors.text}`}>
              {alert.title}
            </span>
            {alert.severity === 'critical' && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-white/50 truncate">
            {alert.description}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {alert.action && (
            <button
              onClick={() => onNavigate(alert)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium
                ${colors.bg} ${colors.text} hover:bg-white/10
                transition-colors flex items-center gap-1
              `}
            >
              {alert.action.label}
              <ChevronRight size={12} />
            </button>
          )}

          {showExpandButton && totalCount && totalCount > 1 && (
            <button
              onClick={onExpand}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title={`${totalCount} alerts`}
            >
              <Bell size={14} className="text-white/40" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white/20 rounded-full text-[10px] flex items-center justify-center text-white/60">
                {totalCount}
              </span>
            </button>
          )}

          <button
            onClick={() => onDismiss(alert.id)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X size={14} className="text-white/40" />
          </button>
        </div>
      </div>

      {showExpandButton && totalCount && totalCount > 1 && (
        <div className="px-3 pb-2 flex justify-center gap-1">
          {Array.from({ length: totalCount }).map((_, i) => (
            <div
              key={i}
              className={`
                w-1.5 h-1.5 rounded-full transition-colors
                ${i === currentIndex ? 'bg-white/40' : 'bg-white/10'}
              `}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function MeetingPrepBanner({ 
  meeting, 
  minsUntil, 
  onView 
}: { 
  meeting: { title: string; attendees: string[] }; 
  minsUntil: number; 
  onView: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="fixed top-16 left-1/2 -translate-x-1/2 z-40"
    >
      <button
        onClick={onView}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#111] border border-[#333] rounded-lg hover:border-[#444] transition-colors group"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-white/60 group-hover:text-white/80">
          {meeting.title}
        </span>
        <span className="text-[10px] text-white/40 font-mono">
          {minsUntil}m
        </span>
      </button>
    </motion.div>
  );
}

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  FileText,
  MessageSquare,
  Clock,
  HelpCircle,
  User,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { MeetingPrep } from '@/lib/intelligence';
import { MindItem } from '@/lib/types';

interface MeetingPrepPanelProps {
  prep: MeetingPrep | null;
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (item: MindItem) => void;
}

export function MeetingPrepPanel({ prep, isOpen, onClose, onItemClick }: MeetingPrepPanelProps) {
  if (!prep) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-[#0a0a0a] border-l border-[#222] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#222] p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Calendar size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {prep.meeting.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-white/40" />
                      <span className="text-xs text-white/50">
                        {formatTime(prep.startsAt)} • in {prep.minsUntil}m
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white/50" />
                </button>
              </div>

              {/* AI Summary Badge */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <Sparkles size={14} className="text-violet-400" />
                <span className="text-xs text-violet-300">
                  Auto-generated meeting prep based on your recent activity
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Attendees */}
              <Section title="Attendees" icon={User}>
                <div className="flex flex-wrap gap-2">
                  {prep.attendees.map((name, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-white/5 text-sm text-white/70"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </Section>

              {/* Person Context */}
              {prep.personContext.length > 0 && (
                <Section title="People Context" icon={User}>
                  <div className="space-y-3">
                    {prep.personContext.filter(p => p.recentInteractions.length > 0).map((person, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{person.name}</span>
                          {person.lastContact && (
                            <span className="text-xs text-white/40">
                              Last: {formatRelativeDate(person.lastContact)}
                            </span>
                          )}
                        </div>
                        {person.pendingItems.length > 0 && (
                          <div className="flex items-center gap-2 text-amber-400 text-xs">
                            <Clock size={12} />
                            <span>{person.pendingItems.length} pending item{person.pendingItems.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        <div className="space-y-1">
                          {person.recentInteractions.slice(0, 2).map((item, j) => (
                            <button
                              key={j}
                              onClick={() => onItemClick(item)}
                              className="w-full text-left text-xs text-white/50 hover:text-white/70 transition-colors truncate"
                            >
                              • {item.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Open Questions */}
              {prep.openQuestions.length > 0 && (
                <Section title="Open Questions" icon={HelpCircle}>
                  <div className="space-y-2">
                    {prep.openQuestions.map((question, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
                      >
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span className="text-sm text-white/70">{question}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Suggested Topics */}
              {prep.suggestedTopics.length > 0 && (
                <Section title="Suggested Topics" icon={Sparkles}>
                  <div className="space-y-2">
                    {prep.suggestedTopics.map((topic, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <ChevronRight size={14} className="text-white/30" />
                        <span className="text-sm text-white/70">{topic}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Related Documents */}
              {prep.relatedDocs.length > 0 && (
                <Section title="Related Documents" icon={FileText}>
                  <div className="space-y-2">
                    {prep.relatedDocs.map((doc, i) => (
                      <button
                        key={i}
                        onClick={() => onItemClick(doc)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <FileText size={14} className="text-blue-400" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <span className="text-sm text-white/80 block truncate">
                            {doc.title}
                          </span>
                          <span className="text-xs text-white/40 block truncate">
                            {doc.tag}
                          </span>
                        </div>
                        <ExternalLink size={14} className="text-white/30 group-hover:text-white/50 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </Section>
              )}

              {/* Recent Conversations */}
              {prep.recentConversations.length > 0 && (
                <Section title="Recent Conversations" icon={MessageSquare}>
                  <div className="space-y-2">
                    {prep.recentConversations.map((conv, i) => (
                      <button
                        key={i}
                        onClick={() => onItemClick(conv)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                          <MessageSquare size={14} className="text-pink-400" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <span className="text-sm text-white/80 block truncate">
                            {conv.title}
                          </span>
                          <span className="text-xs text-white/40 block truncate">
                            {conv.snippet?.slice(0, 60)}...
                          </span>
                        </div>
                        <ExternalLink size={14} className="text-white/30 group-hover:text-white/50 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </Section>
              )}

              {/* Last Meeting Notes */}
              {prep.lastMeetingNotes && (
                <Section title="Previous Meeting Notes" icon={FileText}>
                  <button
                    onClick={() => onItemClick(prep.lastMeetingNotes!)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-emerald-400" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <span className="text-sm text-emerald-300 block truncate">
                        {prep.lastMeetingNotes.title}
                      </span>
                      <span className="text-xs text-emerald-400/50">
                        Last modified {formatRelativeDate(new Date(prep.lastMeetingNotes.lastTouchedAt))}
                      </span>
                    </div>
                    <ExternalLink size={14} className="text-emerald-400/50 group-hover:text-emerald-400 flex-shrink-0" />
                  </button>
                </Section>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ 
  title, 
  icon: Icon, 
  children 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="text-white/40" />
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

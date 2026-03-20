'use client';

import { motion } from 'framer-motion';
import { 
  Sun,
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
  Hash,
} from 'lucide-react';
import { MindItem } from '@/lib/types';
import { DailyDigest as DigestType } from '@/lib/intelligence';

interface DailyDigestProps {
  digest: DigestType;
  onItemClick?: (item: MindItem) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
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

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color,
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number | string;
  color: string;
}) {
  return (
    <motion.div 
      variants={itemVariants}
      className="flex items-center gap-3 p-4 rounded-xl bg-[#111] border border-[#222]"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-2xl font-semibold text-white">{value}</div>
        <div className="text-xs text-white/40">{label}</div>
      </div>
    </motion.div>
  );
}

export function DailyDigest({ digest, onItemClick }: DailyDigestProps) {
  const isToday = digest.date.toDateString() === new Date().toDateString();
  const hour = new Date().getHours();
  const isEvening = hour >= 17;

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
            <Sun size={18} className="text-white/50" />
            <h2 className="text-lg font-medium text-white">
              {isEvening ? 'Daily wrap-up' : 'Daily digest'}
            </h2>
          </div>
          <p className="text-sm text-white/40 mt-0.5">
            {isToday 
              ? digest.date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
              : `Summary for ${digest.date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}`
            }
          </p>
        </div>
        {isEvening && (
          <span className="text-xs font-mono text-white/40">
            Day complete
          </span>
        )}
      </motion.div>

      {/* Summary */}
      <motion.div
        variants={itemVariants}
        className="p-5 rounded-2xl bg-[#111] border border-[#222]"
      >
        <p className="text-white/70 leading-relaxed">
          {digest.summary}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard 
          icon={TrendingUp}
          label="Items touched"
          value={digest.completedCount + digest.newItemsCount}
          color="bg-white/5 text-white/50"
        />
        <StatCard 
          icon={FileText}
          label="New items"
          value={digest.newItemsCount}
          color="bg-white/5 text-white/50"
        />
        <StatCard 
          icon={Calendar}
          label="Meetings"
          value={digest.meetingsHad}
          color="bg-white/5 text-white/50"
        />
        <StatCard 
          icon={AlertCircle}
          label="Still open"
          value={digest.stillOpen.length}
          color={digest.stillOpen.length > 0 ? "bg-white/5 text-amber-400" : "bg-white/5 text-white/50"}
        />
      </div>

      {/* Top Moments */}
      {digest.topMoments.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-white/40" />
            <span className="text-sm font-medium text-white/60">Today's focus areas</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {digest.topMoments.map(moment => (
              <div 
                key={moment.title}
                className="p-4 rounded-xl bg-[#111] border border-[#222]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Hash size={14} className="text-white/40" />
                  <span className="font-medium text-white">{moment.title}</span>
                </div>
                <div className="space-y-1">
                  {moment.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => onItemClick?.(item)}
                      className="w-full text-left group"
                    >
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        {item.source === 'slack' ? (
                          <MessageSquare size={12} className="text-white/30" />
                        ) : (
                          <FileText size={12} className="text-white/30" />
                        )}
                        <span className="text-xs text-white/50 flex-1 line-clamp-1">
                          {item.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Still Open */}
      {digest.stillOpen.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} className="text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Carrying over</span>
            <span className="text-xs text-white/30">(high priority, still open)</span>
          </div>
          <div className="space-y-2">
            {digest.stillOpen.map(item => (
              <button
                key={item.id}
                onClick={() => onItemClick?.(item)}
                className="w-full text-left group"
              >
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111] border border-[#222] hover:border-[#333] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Clock size={14} className="text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium line-clamp-1">{item.title}</div>
                    <div className="text-xs text-white/40">{item.tag}</div>
                  </div>
                  <ArrowRight size={14} className="text-white/20 group-hover:text-white/40" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tomorrow Prep */}
      {digest.tomorrowPrep.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={14} className="text-white/40" />
            <span className="text-sm font-medium text-white/60">Tomorrow's meetings</span>
          </div>
          <div className="p-4 rounded-xl bg-[#111] border border-[#222]">
            <ul className="space-y-2">
              {digest.tomorrowPrep.map((meeting, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                  <Calendar size={12} className="text-white/30" />
                  {meeting}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* All Clear */}
      {digest.stillOpen.length === 0 && (
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-center p-6 rounded-2xl bg-[#111] border border-[#222]"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <CheckCircle size={24} className="text-green-400" />
            </div>
            <div>
              <div className="text-lg font-medium text-white">All caught up!</div>
              <div className="text-sm text-white/40">No high-priority items carrying over</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  ChevronRight,
  Hash,
  Layers,
  EyeOff,
  Eye,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { MindItem } from '@/lib/types';
import { ProjectHealth } from '@/lib/intelligence';

type FilterMode = 'active' | 'attention' | 'hidden';
type SortMode = 'activity' | 'items' | 'status';

const HIDDEN_PROJECTS_KEY = 'index-hidden-projects';

interface ProjectPulseProps {
  projects: ProjectHealth[];
  onItemClick?: (item: MindItem) => void;
  onProjectClick?: (tag: string) => void;
}

const statusConfig = {
  active: { 
    color: 'text-green-400', 
    bg: 'bg-green-500/15', 
    icon: Activity,
    label: 'Active',
  },
  stale: { 
    color: 'text-amber-400', 
    bg: 'bg-amber-500/15', 
    icon: Clock,
    label: 'Stale',
  },
  blocked: { 
    color: 'text-red-400', 
    bg: 'bg-red-500/15', 
    icon: AlertTriangle,
    label: 'Blocked',
  },
  completed: { 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/15', 
    icon: CheckCircle,
    label: 'Completed',
  },
};

const momentumConfig = {
  rising: { icon: TrendingUp, color: 'text-green-400', label: 'Rising' },
  steady: { icon: Minus, color: 'text-white/40', label: 'Steady' },
  falling: { icon: TrendingDown, color: 'text-amber-400', label: 'Falling' },
};

function ProjectCard({ 
  project, 
  onItemClick,
  onProjectClick,
  onHide,
  isArchived = false,
}: { 
  project: ProjectHealth;
  onItemClick?: (item: MindItem) => void;
  onProjectClick?: (tag: string) => void;
  onHide?: (tag: string) => void;
  isArchived?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const status = statusConfig[project.status];
  const momentum = momentumConfig[project.recentMomentum];
  const StatusIcon = status.icon;
  const MomentumIcon = momentum.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isArchived ? 0.5 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={() => onProjectClick?.(project.tag)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-2xl border border-[#222] bg-[#111] p-5 cursor-pointer transition-colors hover:border-[#333] relative"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <Hash size={18} className="text-white/40" />
          </div>
          <div>
            <h3 className="font-medium text-white">{project.displayName}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-white/40">{project.itemCount} items</span>
              {project.openItems > 0 && (
                <>
                  <span className="text-xs text-white/20">•</span>
                  <span className="text-xs text-amber-400">{project.openItems} open</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Hide/Show button - appears on hover */}
          <AnimatePresence>
            {isHovered && onHide && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onHide(project.tag);
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                title={isArchived ? "Show project" : "Hide project"}
              >
                {isArchived ? (
                  <Eye size={12} className="text-white/40" />
                ) : (
                  <EyeOff size={12} className="text-white/40" />
                )}
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* Momentum */}
          <MomentumIcon size={14} className={momentum.color} />
          
          {/* Status badge */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${status.bg}`}>
            <StatusIcon size={10} className={status.color} />
            <span className={`text-[10px] font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Last Activity */}
      <div className="flex items-center gap-2 mb-4 text-sm text-white/40">
        <Clock size={12} />
        <span>
          {project.daysSinceActivity === 0 
            ? 'Active today' 
            : project.daysSinceActivity === 1 
            ? 'Last activity yesterday'
            : `Last activity ${project.daysSinceActivity} days ago`
          }
        </span>
      </div>

      {/* Pending Decisions */}
      {project.pendingDecisions.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={12} className="text-amber-400" />
            <span className="text-xs font-medium text-amber-400">Pending Decisions</span>
          </div>
          <ul className="space-y-1">
            {project.pendingDecisions.map((decision, i) => (
              <li key={i} className="text-xs text-white/50 line-clamp-1 flex items-start gap-1">
                <span className="text-white/20">•</span>
                {decision}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Items */}
      {project.topItems.length > 0 && (
        <div className="pt-4 border-t border-white/5">
          <div className="space-y-2">
            {project.topItems.map(item => (
              <button
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick?.(item);
                }}
                className="w-full text-left group"
              >
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ 
                      backgroundColor: item.priority >= 4 ? '#ef4444' : item.priority >= 3 ? '#f59e0b' : '#22c55e' 
                    }}
                  />
                  <span className="text-xs text-white/60 flex-1 line-clamp-1">{item.title}</span>
                  <ChevronRight size={12} className="text-white/20 group-hover:text-white/40" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

const filterConfig: Record<FilterMode, { label: string; description: string }> = {
  active: { label: 'Active', description: 'Projects with recent activity' },
  attention: { label: 'Needs attention', description: 'Stale or blocked projects' },
  hidden: { label: 'Hidden', description: 'Projects you\'ve hidden' },
};

const sortConfig: Record<SortMode, { label: string }> = {
  activity: { label: 'Recent activity' },
  items: { label: 'Item count' },
  status: { label: 'Status' },
};

const statusPriority: Record<ProjectHealth['status'], number> = {
  blocked: 0,
  stale: 1,
  active: 2,
  completed: 3,
};

export function ProjectPulse({ projects, onItemClick, onProjectClick }: ProjectPulseProps) {
  const [filter, setFilter] = useState<FilterMode>('active');
  const [sortBy, setSortBy] = useState<SortMode>('activity');
  const [hiddenProjects, setHiddenProjects] = useState<Set<string>>(new Set());
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Load hidden projects from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(HIDDEN_PROJECTS_KEY);
    if (stored) {
      try {
        setHiddenProjects(new Set(JSON.parse(stored)));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save hidden projects to localStorage
  useEffect(() => {
    localStorage.setItem(HIDDEN_PROJECTS_KEY, JSON.stringify([...hiddenProjects]));
  }, [hiddenProjects]);

  const toggleHidden = (tag: string) => {
    setHiddenProjects(prev => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Apply filter
    switch (filter) {
      case 'active':
        result = result.filter(p => !hiddenProjects.has(p.tag));
        break;
      case 'attention':
        result = result.filter(p => 
          (p.status === 'stale' || p.status === 'blocked' || p.pendingDecisions.length > 0) && !hiddenProjects.has(p.tag)
        );
        break;
      case 'hidden':
        result = result.filter(p => hiddenProjects.has(p.tag));
        break;
    }

    // Apply sort
    switch (sortBy) {
      case 'activity':
        result.sort((a, b) => a.daysSinceActivity - b.daysSinceActivity);
        break;
      case 'items':
        result.sort((a, b) => b.itemCount - a.itemCount);
        break;
      case 'status':
        result.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
        break;
    }

    return result;
  }, [projects, filter, sortBy, hiddenProjects]);

  const activeCount = projects.filter(p => p.status === 'active' && !hiddenProjects.has(p.tag)).length;
  const attentionCount = projects.filter(p => 
    (p.status === 'stale' || p.status === 'blocked' || p.pendingDecisions.length > 0) && !hiddenProjects.has(p.tag)
  ).length;
  const hiddenCount = hiddenProjects.size;

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
          <Hash size={20} className="text-white/30" />
        </div>
        <h3 className="text-sm font-medium text-white/50 mb-1">No projects yet</h3>
        <p className="text-xs text-white/30">
          Items will be grouped by #hashtag as you add them.
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
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-white/50" />
            <h2 className="text-lg font-medium text-white">Project pulse</h2>
          </div>
          <p className="text-sm text-white/40 mt-0.5">
            Health and momentum across your work
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-white/40">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {activeCount} active
          </span>
          {attentionCount > 0 && (
            <span className="flex items-center gap-1.5 text-amber-400/70">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {attentionCount} need attention
            </span>
          )}
          {hiddenCount > 0 && (
            <span className="flex items-center gap-1.5 text-white/30">
              <EyeOff size={10} />
              {hiddenCount} hidden
            </span>
          )}
        </div>
      </motion.div>

      {/* Filter and Sort Controls */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5">
          {(Object.keys(filterConfig) as FilterMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${filter === mode 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }
              `}
            >
              {filterConfig[mode].label}
              {mode === 'hidden' && hiddenCount > 0 && (
                <span className="ml-1.5 text-white/30">({hiddenCount})</span>
              )}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/50"
          >
            <ArrowUpDown size={12} />
            <span>{sortConfig[sortBy].label}</span>
          </button>
          
          <AnimatePresence>
            {showSortMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-40 rounded-xl bg-[#1a1a1a] border border-[#333] shadow-xl z-20 overflow-hidden"
                >
                  {(Object.keys(sortConfig) as SortMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => {
                        setSortBy(mode);
                        setShowSortMenu(false);
                      }}
                      className={`
                        w-full px-4 py-2.5 text-left text-xs transition-colors
                        ${sortBy === mode 
                          ? 'bg-white/10 text-white' 
                          : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                        }
                      `}
                    >
                      {sortConfig[mode].label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Empty State for filtered view */}
      {filteredProjects.length === 0 && (
        <motion.div 
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
            {filter === 'hidden' ? (
              <EyeOff size={16} className="text-white/30" />
            ) : (
              <Filter size={16} className="text-white/30" />
            )}
          </div>
          <h3 className="text-sm font-medium text-white/50 mb-1">
            {filter === 'hidden' ? 'No hidden projects' : `No ${filterConfig[filter].label.toLowerCase()} projects`}
          </h3>
          <p className="text-xs text-white/30">
            {filter === 'hidden' 
              ? 'Projects you hide will appear here'
              : 'Try a different filter or add more items'
            }
          </p>
        </motion.div>
      )}

      {/* Project Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="sync">
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project.tag}
              project={project}
              onItemClick={onItemClick}
              onProjectClick={onProjectClick}
              onHide={toggleHidden}
              isArchived={hiddenProjects.has(project.tag)}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

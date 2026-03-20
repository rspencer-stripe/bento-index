'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Sparkles, Loader2, Calendar } from 'lucide-react';

export interface SchedulingRequest {
  person: string;
  duration: number;
  title?: string;
}

interface OmniBarProps {
  onSubmit: (input: string) => Promise<{ feedback: string } | void>;
  onScheduleRequest?: (request: SchedulingRequest) => void;
  isProcessing?: boolean;
}

function parseSchedulingIntent(input: string): SchedulingRequest | null {
  const lowerInput = input.toLowerCase();
  
  // Detect scheduling intent
  const schedulePatterns = [
    /schedule\s+(\d+)\s*(?:min(?:ute)?s?)?\s+(?:with|meeting\s+with)\s+(.+)/i,
    /schedule\s+(?:a\s+)?(?:call|meeting|sync)\s+with\s+(.+?)(?:\s+for\s+(\d+)\s*(?:min(?:ute)?s?)?)?/i,
    /(?:book|set\s+up)\s+(?:a\s+)?(\d+)\s*(?:min(?:ute)?s?)?\s+(?:with|meeting\s+with)\s+(.+)/i,
    /(?:book|set\s+up)\s+(?:a\s+)?(?:call|meeting|sync)\s+with\s+(.+?)(?:\s+for\s+(\d+)\s*(?:min(?:ute)?s?)?)?/i,
    /meet\s+(?:with\s+)?(.+?)\s+for\s+(\d+)\s*(?:min(?:ute)?s?)?/i,
  ];
  
  for (const pattern of schedulePatterns) {
    const match = input.match(pattern);
    if (match) {
      // Extract person and duration based on capture groups
      let person: string;
      let duration: number;
      
      if (match[1] && !isNaN(parseInt(match[1]))) {
        // Pattern: "schedule 30 min with Person"
        duration = parseInt(match[1]);
        person = match[2]?.trim() || '';
      } else if (match[2] && !isNaN(parseInt(match[2]))) {
        // Pattern: "schedule meeting with Person for 30 min"
        person = match[1]?.trim() || '';
        duration = parseInt(match[2]);
      } else {
        // Pattern: "schedule meeting with Person" (default 30 min)
        person = match[1]?.trim() || match[2]?.trim() || '';
        duration = 30;
      }
      
      if (person) {
        // Clean up person name
        person = person.replace(/[.,!?]$/, '').trim();
        // Capitalize each word
        person = person.split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        
        return { person, duration };
      }
    }
  }
  
  return null;
}

export function OmniBar({ onSubmit, onScheduleRequest, isProcessing = false }: OmniBarProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isProcessing) return;

    // Check for scheduling intent
    const schedulingRequest = parseSchedulingIntent(value);
    if (schedulingRequest && onScheduleRequest) {
      onScheduleRequest(schedulingRequest);
      setValue('');
      return;
    }

    const result = await onSubmit(value);
    if (result?.feedback) {
      setFeedback(result.feedback);
    }
    setValue('');
  };

  const detectHashtags = (text: string) => {
    const matches = text.match(/#\w+/g);
    return matches || [];
  };

  // Detect if current input looks like a scheduling request
  const schedulingPreview = parseSchedulingIntent(value);
  const hashtags = detectHashtags(value);

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {isProcessing ? (
          <Loader2 size={14} className="text-indigo-400 animate-spin shrink-0" />
        ) : (
          <Sparkles 
            size={14} 
            className={`shrink-0 transition-colors ${isFocused ? 'text-white/40' : 'text-white/15'}`} 
          />
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Add context, paste a link, or create a task..."
          disabled={isProcessing}
          className="
            w-80 bg-transparent text-white/90 text-sm
            placeholder:text-white/25 outline-none
            disabled:opacity-50
          "
        />

        {schedulingPreview && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-lg">
            <Calendar size={12} className="text-emerald-400" />
            <span className="text-[10px] font-mono text-emerald-400">
              {schedulingPreview.duration}m with {schedulingPreview.person}
            </span>
          </div>
        )}

        {!schedulingPreview && hashtags.length > 0 && (
          <div className="flex items-center gap-1">
            {hashtags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-indigo-500/15 text-indigo-400 text-[10px] font-mono rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-0.5 text-white/20 text-[10px] font-mono">
          <Command size={10} />
          <span>K</span>
        </div>
      </form>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full left-0 mt-3 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg z-50 whitespace-nowrap"
          >
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <Sparkles size={10} />
              {feedback}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

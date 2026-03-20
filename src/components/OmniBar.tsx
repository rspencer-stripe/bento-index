'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Sparkles, Loader2 } from 'lucide-react';

interface OmniBarProps {
  onSubmit: (input: string) => Promise<{ feedback: string } | void>;
  isProcessing?: boolean;
}

export function OmniBar({ onSubmit, isProcessing = false }: OmniBarProps) {
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

        {hashtags.length > 0 && (
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

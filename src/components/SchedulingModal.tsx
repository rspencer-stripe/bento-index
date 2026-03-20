'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, Check, Loader2 } from 'lucide-react';

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  dateLabel: string;
  timeLabel: string;
  score: number;
}

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (slot: TimeSlot, title: string) => void;
  parsedRequest: {
    person: string;
    duration: number;
    title?: string;
  } | null;
}

function generateMockSlots(duration: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  
  // Generate slots for the next 5 business days
  for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    // Generate 2-3 slots per day at common meeting times
    const times = [
      { hour: 10, min: 0, score: 95 },
      { hour: 11, min: 0, score: 90 },
      { hour: 14, min: 0, score: 85 },
      { hour: 15, min: 30, score: 80 },
    ];
    
    // Randomly pick 2-3 available times per day
    const availableTimes = times
      .filter(() => Math.random() > 0.3)
      .slice(0, 3);
    
    availableTimes.forEach(({ hour, min, score }) => {
      const startDate = new Date(date);
      startDate.setHours(hour, min, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + duration);
      
      const startTime = startDate.toTimeString().slice(0, 5);
      const endTime = endDate.toTimeString().slice(0, 5);
      
      const formatTime = (h: number, m: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
      };
      
      slots.push({
        id: `${dateStr}-${startTime}`,
        date: dateStr,
        startTime,
        endTime,
        dateLabel,
        timeLabel: `${formatTime(hour, min)} - ${formatTime(endDate.getHours(), endDate.getMinutes())}`,
        score: score - (dayOffset * 2), // Prefer sooner slots
      });
    });
  }
  
  // Sort by score (best first)
  return slots.sort((a, b) => b.score - a.score).slice(0, 6);
}

export function SchedulingModal({ isOpen, onClose, onSchedule, parsedRequest }: SchedulingModalProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    if (isOpen && parsedRequest) {
      setIsLoading(true);
      setSelectedSlot(null);
      setTitle(`Sync with ${parsedRequest.person}`);
      
      // Simulate API call to find available slots
      const timer = setTimeout(() => {
        setSlots(generateMockSlots(parsedRequest.duration));
        setIsLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, parsedRequest]);

  const handleSchedule = async () => {
    const slot = slots.find(s => s.id === selectedSlot);
    if (!slot) return;
    
    setIsScheduling(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    onSchedule(slot, title);
    setIsScheduling(false);
    onClose();
  };

  if (!parsedRequest) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-[#111] border border-[#333] rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#222]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Calendar size={16} className="text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-white">Schedule Meeting</h2>
                    <p className="text-xs text-white/40">Finding the best time</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={16} className="text-white/40" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Meeting details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-white/40" />
                    <span className="text-white/70">with</span>
                    <span className="text-white font-medium">{parsedRequest.person}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-white/40" />
                    <span className="text-white/70">{parsedRequest.duration} minutes</span>
                  </div>
                </div>

                {/* Title input */}
                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                    Meeting title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-black/30 border border-[#333] rounded-lg text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50 transition-colors"
                    placeholder="Meeting title..."
                  />
                </div>

                {/* Time slots */}
                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                    Suggested times
                  </label>
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={20} className="text-indigo-400 animate-spin" />
                      <span className="ml-2 text-sm text-white/40">Finding availability...</span>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2 max-h-[240px] overflow-y-auto">
                      {slots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot.id)}
                          className={`
                            w-full flex items-center justify-between p-3 rounded-lg border transition-all
                            ${selectedSlot === slot.id 
                              ? 'bg-indigo-500/10 border-indigo-500/50' 
                              : 'bg-black/20 border-[#333] hover:border-[#444]'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                              ${selectedSlot === slot.id ? 'border-indigo-500 bg-indigo-500' : 'border-[#444]'}
                            `}>
                              {selectedSlot === slot.id && <Check size={12} className="text-white" />}
                            </div>
                            <div className="text-left">
                              <div className="text-sm text-white">{slot.dateLabel}</div>
                              <div className="text-xs text-white/50">{slot.timeLabel}</div>
                            </div>
                          </div>
                          {slot.score >= 90 && (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded">
                              Best
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#222] flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-white/50 hover:text-white/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={!selectedSlot || isScheduling}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isScheduling ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar size={14} />
                      Schedule
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


import React, { useState, useEffect } from 'react';
import { ArrowRight, Scale, Clock, Calendar, X } from 'lucide-react';
import { CheckIn } from '../types';

interface Props {
  isOpen: boolean;
  onComplete: (mood: string, weight: number) => void;
  onClose?: () => void;
  initialData?: { mood: string; weight: number }; // New prop for pre-filling
  history?: CheckIn[]; // To help with history logic if needed
}

const MOODS = [
  { emoji: '🔥', label: 'Beast' },
  { emoji: '⚡', label: 'Hyper' },
  { emoji: '🧘', label: 'Focus' },
  { emoji: '💀', label: 'Dead' },
  { emoji: '🤬', label: 'Angry' },
];

const CheckInModal: React.FC<Props> = ({ isOpen, onComplete, onClose, initialData, history }) => {
  const [mood, setMood] = useState<string | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Initialize with existing data if available (Edit Mode)
  useEffect(() => {
    if (isOpen && initialData) {
        setMood(initialData.mood);
        setWeight(initialData.weight.toString());
    } else if (isOpen && !initialData) {
        // Reset if opening fresh
        setMood(null);
        setWeight('');
    }
  }, [isOpen, initialData]);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  if (!isOpen) return null;

  const handleSubmit = () => {
    if (mood && weight) {
      onComplete(mood, parseFloat(weight));
    }
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-[#0f0728] border border-slate-200 dark:border-white/20 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl dark:shadow-[0_0_80px_rgba(99,102,241,0.3)] animate-scaleIn relative overflow-hidden">
        
        {/* Close Button */}
        {onClose && (
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white z-20"
            >
                <X size={20} />
            </button>
        )}

        {/* Neon Accents */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-electric-cyan via-electric-purple to-electric-pink shadow-[0_0_20px_rgba(236,72,153,0.5)]"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-electric-purple/10 dark:bg-electric-purple/30 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-electric-cyan/10 dark:bg-electric-cyan/20 rounded-full blur-[60px] pointer-events-none"></div>

        {/* Date/Time Display */}
        <div className="text-center mb-8 relative z-10">
            <div className="inline-flex flex-col items-center justify-center mb-4">
                <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {formattedTime}
                </div>
                <div className="flex items-center gap-2 text-indigo-600 dark:text-electric-cyan font-bold uppercase tracking-widest text-xs">
                    <Calendar size={12} /> {formattedDate}
                </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {initialData ? 'Updating Daily Log...' : 'Initiating Training Protocol...'}
            </p>
        </div>

        <div className="space-y-8 relative z-10">
            
            {/* Question 1: Mood */}
            <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 dark:text-slate-500 mb-4 text-center tracking-[0.3em]">ENERGY LEVEL</label>
                <div className="flex justify-between gap-2">
                    {MOODS.map((m) => (
                        <button
                            key={m.label}
                            onClick={() => setMood(m.emoji)}
                            className={`
                                flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 w-14 h-14 relative group
                                ${mood === m.emoji 
                                    ? 'bg-indigo-50 dark:bg-electric-purple/20 border-indigo-500 dark:border-electric-purple ring-1 ring-indigo-500 dark:ring-electric-purple shadow-[0_0_20px_rgba(139,92,246,0.3)] scale-110' 
                                    : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 hover:scale-105'}
                            `}
                        >
                            <span className="text-2xl drop-shadow-md group-hover:scale-110 transition-transform">{m.emoji}</span>
                        </button>
                    ))}
                </div>
                <div className="text-center h-5 mt-2">
                    {mood && (
                        <span className="text-xs font-bold text-indigo-600 dark:text-electric-purple uppercase tracking-widest animate-fadeIn">
                             {MOODS.find(m => m.emoji === mood)?.label} MODE
                        </span>
                    )}
                </div>
            </div>

            {/* Question 2: Weight */}
            <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 dark:text-slate-500 mb-4 text-center tracking-[0.3em]">WEIGH-IN</label>
                <div className="relative max-w-[160px] mx-auto group">
                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-electric-cyan transition-colors" size={20} />
                    <input 
                        type="number"
                        inputMode="decimal"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="0.0"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/40 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-center font-mono text-2xl font-bold focus:outline-none focus:border-indigo-500 dark:focus:border-electric-cyan focus:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 dark:text-slate-500">KG</span>
                </div>
            </div>

            <button
                disabled={!mood || !weight}
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-electric-blue via-electric-purple to-electric-pink hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(236,72,153,0.4)]"
            >
                {initialData ? 'Update Record' : 'Start Session'} <ArrowRight size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInModal;

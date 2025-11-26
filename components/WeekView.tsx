
import React from 'react';
import { WORKOUT_PLAN } from '../constants';
import { WorkoutDay, DayStatus } from '../types';
import { Calendar, Check, Play, ChevronRight, ShieldCheck } from 'lucide-react';

interface Props {
  onSelectDay: (day: WorkoutDay) => void;
  weekStatus: Record<string, DayStatus>;
}

// Map logical color names to Tailwind specific classes
const THEME_COLORS: Record<string, { bg: string, border: string, text: string, glow: string, gradient: string }> = {
  red: {
    bg: 'hover:bg-red-500/5',
    border: 'hover:border-red-500/50',
    text: 'text-red-600 dark:text-red-500',
    glow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]',
    gradient: 'from-red-500 to-orange-500'
  },
  blue: {
    bg: 'hover:bg-blue-500/5',
    border: 'hover:border-blue-500/50',
    text: 'text-blue-600 dark:text-blue-500',
    glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
    gradient: 'from-blue-500 to-cyan-500'
  },
  green: {
    bg: 'hover:bg-emerald-500/5',
    border: 'hover:border-emerald-500/50',
    text: 'text-emerald-600 dark:text-emerald-500',
    glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    gradient: 'from-emerald-500 to-teal-500'
  },
  purple: {
    bg: 'hover:bg-purple-500/5',
    border: 'hover:border-purple-500/50',
    text: 'text-purple-600 dark:text-purple-500',
    glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]',
    gradient: 'from-purple-500 to-pink-500'
  },
  yellow: {
    bg: 'hover:bg-yellow-500/5',
    border: 'hover:border-yellow-500/50',
    text: 'text-yellow-600 dark:text-yellow-500',
    glow: 'group-hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]',
    gradient: 'from-yellow-500 to-orange-500'
  }
};

const WeekView: React.FC<Props> = ({ onSelectDay, weekStatus }) => {
  
  const completedCount = Object.values(weekStatus).filter(s => s === 'completed').length;
  const progressPercentage = Math.round((completedCount / 5) * 100);

  return (
    <div className="animate-fadeIn w-full">
      
      {/* Weekly Progress Bar */}
      <div className="mb-8 p-1">
        <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-[0.2em]">Synchronization</span>
            <span className="font-mono text-sm font-bold text-electric-cyan">{progressPercentage}%</span>
        </div>
        <div className="h-3 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden border border-white/10 p-[2px]">
            <div 
                className="h-full bg-gradient-to-r from-electric-blue via-electric-purple to-electric-pink transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)] relative" 
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            >
                <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {WORKOUT_PLAN.map((day, index) => {
          const status = weekStatus[day.id] || 'pending';
          const isCompleted = status === 'completed';
          const isSkipped = status === 'skipped';
          
          // Get theme colors based on day.color (default to purple if missing)
          const theme = THEME_COLORS[day.color] || THEME_COLORS['purple'];

          return (
            <div
              key={day.id}
              onClick={() => onSelectDay(day)}
              className={`
                relative p-6 rounded-3xl cursor-pointer transition-all duration-500
                group overflow-hidden border backdrop-blur-xl
                ${isCompleted 
                    ? 'bg-emerald-950/10 border-emerald-500/20 grayscale-[0.3] opacity-80' 
                    : `bg-white/70 dark:bg-[#0f0728]/60 border-slate-200 dark:border-white/10 ${theme.bg} ${theme.border} ${theme.glow} hover:-translate-y-1`
                }
              `}
            >
                {/* Decorative gradient blob on hover based on color */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${theme.gradient} rounded-full blur-[50px] opacity-0 group-hover:opacity-20 transition-all duration-500 pointer-events-none`}></div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className={`
                        font-mono text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg border
                        ${isCompleted 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-transparent'}
                    `}>
                        {day.day}
                    </span>
                    {isCompleted ? (
                        <div className="bg-emerald-500 text-white p-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"><Check size={14} strokeWidth={3} /></div>
                    ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/50 dark:bg-white/5 text-slate-400 group-hover:bg-white/80 dark:group-hover:bg-white/10 group-hover:${theme.text} transition-all duration-300`}>
                             <ChevronRight size={16} />
                        </div>
                    )}
                </div>

                <h3 className={`text-xl font-black mb-1 relative z-10 tracking-tight uppercase italic ${isCompleted ? 'text-slate-500' : `text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${theme.gradient} transition-all`}`}>
                    {day.title}
                </h3>
                
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-1 relative z-10 font-bold uppercase tracking-wider">{day.focus}</p>

                {/* Exercises List (Visible on Main Screen now) */}
                <div className="space-y-1.5 mb-4 relative z-10 bg-white/40 dark:bg-black/20 p-3 rounded-xl border border-white/20 dark:border-white/5">
                    {day.exercises.slice(0, 4).map((ex, i) => (
                        <div key={ex.id} className="flex items-center gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-400">
                             <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-slate-400' : `bg-slate-300 dark:bg-slate-600 group-hover:${theme.text}`}`}></div>
                             <span className="truncate">{ex.name}</span>
                        </div>
                    ))}
                    {day.exercises.length > 4 && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-500 italic pl-3">+ {day.exercises.length - 4} more</div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5 relative z-10">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold uppercase">{day.exercises.length} Exercises</span>
                    
                    {!isCompleted && !isSkipped && (
                        <div className={`${theme.text} opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest`}>
                            Initialize <Play size={8} fill="currentColor" />
                        </div>
                    )}
                </div>
            </div>
          );
        })}

        {/* Rest Card - Spartan Edition */}
        <div className="p-6 rounded-3xl border-2 border-slate-200 dark:border-white/5 border-dashed flex flex-col justify-center items-center text-center opacity-70 hover:opacity-100 transition-all group bg-slate-50/50 dark:bg-transparent">
           <div className="p-4 bg-slate-200 dark:bg-white/5 rounded-full mb-3 group-hover:scale-110 transition-transform group-hover:bg-indigo-100 dark:group-hover:bg-white/10">
                <ShieldCheck className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-white" size={24} />
           </div>
           <h3 className="text-base font-black text-slate-700 dark:text-white uppercase tracking-tight">Tactical Recovery</h3>
           <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-[0.2em] font-bold text-indigo-500/80 dark:text-electric-purple/80">Sharpen The Blade</p>
        </div>
      </div>
    </div>
  );
};

export default WeekView;


import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { Youtube, Search, TrendingUp, Brain, X, Sparkles, CheckCircle2, RefreshCw, Check, ArrowDown } from 'lucide-react';
import { generateExerciseTip } from '../services/geminiService';

interface Props {
  exercise: Exercise;
  lastWeight?: number;
  onSaveWeight: (weight: number) => void;
  onSwap?: () => void;
  onComplete?: () => void; // New prop to trigger scroll to next
  isActive?: boolean;
  isCompleted?: boolean;
  dayColor?: string;
}

const ExerciseCard: React.FC<Props> = ({ 
    exercise, 
    lastWeight, 
    onSaveWeight, 
    onSwap, 
    onComplete,
    isActive = false, 
    isCompleted = false, 
    dayColor = 'indigo' 
}) => {
  const [weight, setWeight] = useState<string>('');
  const [showTip, setShowTip] = useState(false);
  const [tipContent, setTipContent] = useState<string>('');
  const [loadingTip, setLoadingTip] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load last weight into input if it exists AND input is empty (first load)
  useEffect(() => {
    // We don't auto-fill the input with last weight to force user to type it (confirming today's lift)
    // But we strictly display it in the UI
  }, [lastWeight]);

  const handleWeightChange = (val: string) => {
    setWeight(val);
    setSaveStatus('saving');
    
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onSaveWeight(num);
      setTimeout(() => setSaveStatus('saved'), 600);
    } else {
      setSaveStatus('idle');
    }
  };

  const handleDonePress = () => {
    if (!weight && lastWeight) {
        // If user presses done without typing, but has a previous weight, assume they matched it
        handleWeightChange(lastWeight.toString());
    }
    if (onComplete) onComplete();
  };

  const handleGetTip = async () => {
    setShowTip(true);
    if (tipContent) return;

    setLoadingTip(true);
    try {
      const tip = await generateExerciseTip(exercise.name);
      setTipContent(tip);
    } catch (error) {
      setTipContent("Unable to load tip at this time. Please try again.");
    } finally {
      setLoadingTip(false);
    }
  };

  // Dynamic Border Color based on Day Theme for Active State
  const activeBorderColors: Record<string, string> = {
      red: 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] bg-red-500/5',
      blue: 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] bg-blue-500/5',
      green: 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] bg-emerald-500/5',
      purple: 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)] bg-purple-500/5',
      yellow: 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] bg-yellow-500/5',
      indigo: 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] bg-indigo-500/5',
  };

  const activeThemeClass = isActive ? (activeBorderColors[dayColor] || activeBorderColors['indigo']) : '';

  return (
    <>
    <div className={`
      relative p-6 rounded-3xl transition-all duration-500
      glass-panel
      ${isActive 
        ? `${activeThemeClass} scale-[1.02] z-10 ring-1 ring-white/20` 
        : isCompleted 
          ? 'border-emerald-500/30 bg-emerald-900/5 opacity-70 grayscale-[0.5] hover:grayscale-0 hover:opacity-100' 
          : 'border-white/10 opacity-80 hover:opacity-100'
      }
    `}>
      
      {/* Visual Badge for Status */}
      {isCompleted && (
          <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-500/20 z-20">
              <Check size={12} strokeWidth={3} /> COMPLETE
          </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4 max-w-[80%]">
          <div className={`w-14 h-14 flex-shrink-0 flex flex-col items-center justify-center rounded-2xl border shadow-inner transition-colors ${isActive ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>
            <span className="text-[9px] font-black uppercase leading-none mb-1 opacity-60">Sets</span>
            <span className="font-mono font-bold text-2xl leading-none">{exercise.sets}</span>
          </div>
          <div>
            <h3 className={`font-black leading-tight text-slate-900 dark:text-white transition-all ${isActive ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
                {exercise.name}
            </h3>
            {exercise.notes && <p className="text-xs font-bold text-electric-cyan mt-1 uppercase tracking-wide">{exercise.notes}</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
            {onSwap && !isCompleted && (
                <button 
                  onClick={onSwap}
                  className="text-slate-400 hover:text-electric-pink transition-colors p-2.5 bg-transparent hover:bg-white/5 rounded-xl"
                  title="Replace Exercise"
                >
                  <RefreshCw size={18} />
                </button>
            )}
            <button 
              onClick={handleGetTip}
              className="text-slate-400 hover:text-electric-purple transition-colors p-2.5 bg-transparent hover:bg-white/5 rounded-xl relative group"
              title="AI Form Coach"
            >
              <Brain size={20} />
            </button>
        </div>
      </div>

      {/* Main Inputs & Data */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        
        {/* Target Info */}
        <div className="flex flex-col justify-center gap-2">
            {/* Reps */}
            <div className="flex flex-col justify-center items-center p-3 bg-white/5 rounded-2xl border border-white/5 h-full">
                <span className="text-[9px] uppercase text-slate-500 dark:text-slate-500 font-black tracking-[0.2em] mb-1">Reps</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200 text-xl">{exercise.reps}</span>
            </div>
            
            {/* Previous Weight - ALWAYS VISIBLE if exists */}
            {lastWeight ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <TrendingUp size={14} className="text-indigo-400" />
                <div className="flex flex-col leading-none">
                    <span className="text-[8px] font-black uppercase text-indigo-400">LAST</span>
                    <span className="font-mono font-bold text-indigo-300">{lastWeight}kg</span>
                </div>
              </div>
            ) : (
                <div className="flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/5 opacity-50">
                    <span className="text-[10px] font-mono text-slate-500">First Time</span>
                </div>
            )}
        </div>

        {/* Weight Input Area */}
        <div className={`
          flex flex-col justify-center items-center p-4 rounded-2xl border transition-all duration-300 group relative min-h-[120px]
          ${weight || isCompleted
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-black/5 dark:bg-black/20 border-slate-200 dark:border-white/10 focus-within:border-electric-cyan focus-within:bg-white dark:focus-within:bg-black/40 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.2)]'
          }
        `}>
           <div className="flex items-center gap-2 mb-2">
               <span className={`text-[10px] uppercase font-black tracking-[0.2em] transition-colors ${weight ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-500 group-focus-within:text-electric-cyan'}`}>Load (KG)</span>
               {/* Visual Save Indicator */}
               {saveStatus === 'saving' && <span className="text-[9px] text-electric-cyan animate-pulse">Syncing...</span>}
               {saveStatus === 'saved' && <span className="text-[9px] text-emerald-500 font-bold animate-fadeIn">Saved</span>}
           </div>
           
           <input 
              type="number" 
              inputMode="decimal"
              placeholder={lastWeight ? `${lastWeight}` : "-"}
              value={weight}
              onChange={(e) => handleWeightChange(e.target.value)}
              className="w-full bg-transparent text-center text-4xl font-mono font-bold text-slate-900 dark:text-white focus:outline-none placeholder-slate-300 dark:placeholder-white/10"
           />
        </div>
      </div>

      {/* Buttons Row */}
      <div className="flex gap-3">
          {/* External Links Group */}
          <div className="flex gap-2 flex-1">
             <button 
                onClick={() => window.open(`https://www.youtube.com/results?search_query=how+to+do+${exercise.name}`, '_blank')} 
                className="flex-1 flex items-center justify-center py-3 rounded-xl bg-white/5 hover:bg-red-600/20 hover:text-red-500 text-slate-500 transition-all border border-white/10 hover:border-red-500/50"
            >
                <Youtube size={20} />
            </button>
            <button 
                onClick={() => window.open(`https://www.google.com/search?q=${exercise.name}+form`, '_blank')} 
                className="flex-1 flex items-center justify-center py-3 rounded-xl bg-white/5 hover:bg-blue-600/20 hover:text-blue-500 text-slate-500 transition-all border border-white/10 hover:border-blue-500/50"
            >
                <Search size={18} />
            </button>
          </div>

          {/* DONE BUTTON */}
          <button 
            onClick={handleDonePress}
            className={`
                flex-[2] flex items-center justify-center gap-2 rounded-xl font-black uppercase tracking-wider text-sm transition-all shadow-lg
                ${isCompleted 
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50' 
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 hover:shadow-indigo-500/25 border border-transparent'}
            `}
          >
              {isCompleted ? (
                  <>Re-Do Set</>
              ) : (
                  <><CheckCircle2 size={18} /> Done</>
              )}
          </button>
      </div>

    </div>

    {/* AI Tip Modal */}
    {showTip && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
         <div className="bg-[#0f0728] border border-electric-purple/30 rounded-3xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(139,92,246,0.2)] relative animate-scaleIn overflow-hidden">
            
            <button 
              onClick={() => setShowTip(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-center gap-2 mb-6 text-electric-purple">
               <div className="p-2 bg-electric-purple/10 rounded-lg border border-electric-purple/20">
                 <Sparkles size={20} />
               </div>
               <h3 className="font-bold text-lg text-white">Neural Coach</h3>
            </div>

            {loadingTip ? (
              <div className="flex flex-col items-center py-10">
                <div className="w-12 h-12 border-4 border-electric-purple border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(139,92,246,0.4)]"></div>
                <p className="text-electric-cyan text-xs font-mono animate-pulse uppercase tracking-widest">Analyzing Biomechanics...</p>
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                <div className="whitespace-pre-line leading-relaxed text-sm font-medium">
                   {tipContent}
                </div>
              </div>
            )}
         </div>
      </div>
    )}
    </>
  );
};

export default ExerciseCard;

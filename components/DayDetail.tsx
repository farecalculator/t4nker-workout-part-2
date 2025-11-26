
import React, { useState, useRef } from 'react';
import { WorkoutDay, DayStatus, Exercise } from '../types';
import { ArrowLeft, Check, X } from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import SwapExerciseModal from './SwapExerciseModal';

interface Props {
  day: WorkoutDay;
  onBack: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onWeightUpdate: (exerciseId: string, weight: number) => void;
  onSwapExercise: (dayId: string, oldExerciseId: string, newExercise: Partial<Exercise>) => void;
  weights: Record<string, number>;
  status: DayStatus;
}

const DayDetail: React.FC<Props> = ({ 
  day, 
  onBack, 
  onComplete, 
  onSkip, 
  onWeightUpdate, 
  onSwapExercise,
  weights,
  status 
}) => {
  const [swappingExercise, setSwappingExercise] = useState<Exercise | null>(null);
  // Track manually completed exercises (visual only, data is in weights)
  const [manuallyCompleted, setManuallyCompleted] = useState<Record<string, boolean>>({});

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleOpenSwap = (exercise: Exercise) => {
    setSwappingExercise(exercise);
  };

  const handleSelectSwap = (newEx: Partial<Exercise>) => {
    if (swappingExercise) {
        onSwapExercise(day.id, swappingExercise.id, newEx);
        setSwappingExercise(null);
    }
  };

  const scrollToExercise = (index: number) => {
      const nextEx = day.exercises[index];
      if (nextEx && cardRefs.current[nextEx.id]) {
          cardRefs.current[nextEx.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  };

  const handleCardComplete = (exId: string, index: number) => {
      setManuallyCompleted(prev => ({ ...prev, [exId]: true }));
      // Wait a tiny bit for the visual update then scroll
      setTimeout(() => {
          scrollToExercise(index + 1);
      }, 400);
  };

  // Focus Logic: 
  // An exercise is "Active" if it's the first one that is NOT completed (either by weight or manual check)
  const activeExerciseIndex = day.exercises.findIndex(ex => !weights[ex.id] && !manuallyCompleted[ex.id]);
  // If all done (index -1), focus nothing
  const activeExerciseId = activeExerciseIndex !== -1 ? day.exercises[activeExerciseIndex].id : null;

  return (
    <div className="animate-slideUp pb-32">
      <SwapExerciseModal 
        isOpen={!!swappingExercise}
        onClose={() => setSwappingExercise(null)}
        category={swappingExercise?.category || 'push'}
        onSelect={handleSelectSwap}
      />

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <button 
            onClick={onBack}
            className="flex items-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors text-sm font-bold group bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        <span className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider ${status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'}`}>
            {status}
        </span>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{day.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">{day.focus}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 mb-12">
        {day.exercises.map((exercise, index) => {
           // It is completed if we have weight OR manual check
           const isDone = !!weights[exercise.id] || !!manuallyCompleted[exercise.id];
           
           // If we have an active ID, use it. If everything is done, nothing is active.
           // If it's done, it can't be active.
           const isActive = !isDone && (exercise.id === activeExerciseId);

           return (
            <div key={exercise.id} ref={el => cardRefs.current[exercise.id] = el}>
                <ExerciseCard 
                    exercise={exercise}
                    lastWeight={weights[exercise.id]} // This comes from App.tsx persistence
                    onSaveWeight={(w) => onWeightUpdate(exercise.id, w)}
                    onSwap={() => handleOpenSwap(exercise)}
                    onComplete={() => handleCardComplete(exercise.id, index)}
                    isActive={isActive}
                    isCompleted={isDone}
                    dayColor={day.color}
                />
            </div>
           );
        })}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-[#020617] dark:via-[#020617]/95 z-40">
        <div className="max-w-4xl mx-auto flex gap-4">
            <button 
                onClick={onSkip}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold transition-colors border border-slate-200 dark:border-slate-700 backdrop-blur-md"
            >
                <X size={20} />
                Skip
            </button>
            <button 
                onClick={onComplete}
                className="flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                <Check size={20} strokeWidth={3} />
                Finish Workout
            </button>
        </div>
      </div>
    </div>
  );
};

export default DayDetail;

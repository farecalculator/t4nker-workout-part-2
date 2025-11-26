
import React, { useMemo, useState } from 'react';
import { HistoryEntry, CheckIn, WorkoutDay } from '../types';
import { ArrowLeft, Calendar, Dumbbell, Trash2, Activity, Flame, PlusSquare, Save } from 'lucide-react';
import { WORKOUT_PLAN } from '../constants';

interface Props {
  history: HistoryEntry[];
  checkIns?: CheckIn[];
  onBack: () => void;
  onClear: () => void;
  onRetroactiveWorkout?: (date: string, workoutId: string) => void;
  onDeleteWorkout?: (id: string) => void;
  customPlan?: WorkoutDay[];
}

const HistoryView: React.FC<Props> = ({ history, checkIns = [], onBack, onClear, onRetroactiveWorkout, onDeleteWorkout, customPlan }) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDate, setLogDate] = useState('');
  const [logWorkoutId, setLogWorkoutId] = useState('');

  const activePlan = customPlan || WORKOUT_PLAN;
  
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return isoString;
    }
  };

  // ROBUST HELPER: Converts any date input to Local YYYY-MM-DD
  const toLocalYMD = (dateInput: string | Date) => {
    try {
      if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
          return dateInput;
      }
      const d = new Date(dateInput);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      if (isNaN(year)) return null; 
      return `${year}-${month}-${day}`;
    } catch (e) {
      return null;
    }
  };

  const getLogDate = (entry: HistoryEntry | CheckIn) => {
     return entry.localDate || toLocalYMD(entry.date) || 'Invalid';
  };

  // --- HEATMAP & STREAK LOGIC ---
  const { heatmapData, currentStreak } = useMemo(() => {
    const today = new Date();
    const todayStr = toLocalYMD(today);
    
    // 1. Collect all "Active Dates" (Workouts OR Check-ins)
    const activeDates = new Set<string>();

    history.forEach(h => {
        const ymd = getLogDate(h);
        if (ymd !== 'Invalid') activeDates.add(ymd);
    });
    checkIns.forEach(c => {
        const ymd = getLogDate(c);
        if (ymd !== 'Invalid') activeDates.add(ymd);
    });

    // 2. Generate last 28 days for Heatmap
    const days = [];
    for (let i = 27; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        days.push(toLocalYMD(d) || "Invalid");
    }

    // 3. Calculate Streak
    let streak = 0;
    let checkDate = new Date(); // Start Today
    let lookingBack = true;
    
    // Check if we have activity today, if so, count it. If not, don't reset yet (allow streak to start yesterday)
    const todayYMD = toLocalYMD(checkDate)!;
    if (activeDates.has(todayYMD)) {
        streak++;
    }
    
    checkDate.setDate(checkDate.getDate() - 1); // Move to yesterday
    
    while (lookingBack) {
        const dateStr = toLocalYMD(checkDate);
        if (dateStr && activeDates.has(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            lookingBack = false;
        }
    }

    // 4. Build Heatmap Data for Render
    const mapData = days.map(date => {
        const hasWorkout = history.some(h => getLogDate(h) === date);
        const hasCheckIn = checkIns.some(c => getLogDate(c) === date);
        
        let intensity = 0; 
        if (hasWorkout) intensity = 2;      
        else if (hasCheckIn) intensity = 1; 
        
        return { date, intensity };
    });

    return { heatmapData: mapData, currentStreak: streak };
  }, [history, checkIns]);

  // Robustly Sorted Check-ins for Graph
  const sortedCheckIns = useMemo(() => {
     return [...checkIns].sort((a,b) => {
        const da = getLogDate(a);
        const db = getLogDate(b);
        if (da !== db) return da.localeCompare(db);
        const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tA - tB;
     });
  }, [checkIns]);

  const handleRetroSubmit = () => {
      if (logDate && logWorkoutId && onRetroactiveWorkout) {
          onRetroactiveWorkout(logDate, logWorkoutId);
          setShowLogModal(false);
          setLogDate('');
          setLogWorkoutId('');
      }
  };

  return (
    <div className="animate-fadeIn min-h-[60vh] pb-10">
       <div className="flex justify-between items-center mb-6">
        <button 
            onClick={onBack}
            className="flex items-center text-slate-500 dark:text-slate-400 hover:text-electric-cyan transition-colors text-sm font-bold group bg-white/50 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/5 hover:border-electric-cyan/30"
        >
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> DASHBOARD
        </button>
        
        <div className="flex gap-2">
            {onRetroactiveWorkout && (
                <button 
                    onClick={() => setShowLogModal(true)}
                    className="flex items-center gap-2 text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:text-electric-cyan dark:hover:text-white px-3 py-1 rounded hover:bg-white/10 transition-colors uppercase tracking-wider border border-transparent hover:border-indigo-500/30"
                >
                    <PlusSquare size={14} /> Log Missing
                </button>
            )}
            {history.length > 0 && (
                <button 
                    onClick={onClear}
                    className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 px-3 py-1 rounded hover:bg-red-900/20 transition-colors uppercase tracking-wider"
                >
                    <Trash2 size={14} /> Reset
                </button>
            )}
        </div>
      </div>

      {showLogModal && (
        <div className="mb-8 p-6 glass-panel rounded-3xl border border-electric-cyan/30 bg-electric-cyan/5 animate-scaleIn">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Log Past Workout</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <input 
                    type="date" 
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold"
                />
                <select 
                    value={logWorkoutId}
                    onChange={(e) => setLogWorkoutId(e.target.value)}
                    className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold"
                >
                    <option value="">Select Workout...</option>
                    {activePlan.map(day => (
                        <option key={day.id} value={day.id}>{day.title}</option>
                    ))}
                </select>
                <button 
                    disabled={!logDate || !logWorkoutId}
                    onClick={handleRetroSubmit}
                    className="p-3 rounded-xl bg-electric-cyan text-black font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                >
                    <Save size={18} /> Confirm
                </button>
            </div>
            <button onClick={() => setShowLogModal(false)} className="text-xs text-slate-500 hover:text-white underline">Cancel</button>
        </div>
      )}

      <div className="flex items-end gap-3 mb-8 pb-4 border-b border-white/10">
        <div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 uppercase tracking-tighter">Stats & Logs</h2>
            <p className="text-electric-purple font-mono text-xs uppercase tracking-widest mt-1">Performance Data</p>
        </div>
      </div>
      
      {/* --- CONSISTENCY GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Streak Card */}
          <div className="md:col-span-1 glass-panel p-6 rounded-3xl flex flex-col justify-center items-center relative overflow-hidden group border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#0f0728]/60">
             <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/5 opacity-50"></div>
             <Flame className={`mb-3 ${currentStreak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-400 dark:text-slate-600'}`} size={40} />
             <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{currentStreak}</div>
             <div className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-widest">Day Streak</div>
          </div>

          {/* Heatmap */}
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl relative border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#0f0728]/60">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} className="text-electric-blue"/> Monthly Consistency
                 </h3>
             </div>
             
             <div className="grid grid-cols-7 gap-2">
                {heatmapData.map((d, i) => (
                    <div key={i} className="flex flex-col gap-1 items-center group relative">
                        <div 
                            className={`
                                w-full pt-[100%] rounded-md transition-all duration-300 relative
                                ${d.intensity === 2 ? 'bg-electric-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 
                                  d.intensity === 1 ? 'bg-electric-purple/50' : 
                                  'bg-slate-200 dark:bg-white/5 border border-transparent dark:border-white/5'}
                            `}
                        ></div>
                        {/* Tooltip for Date */}
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-black text-white text-[9px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10 transition-opacity">
                            {d.date}
                        </div>
                    </div>
                ))}
             </div>
             <div className="flex justify-end gap-4 mt-4 text-[10px] text-slate-600 dark:text-slate-500 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/5 border border-transparent dark:border-white/10"></span> Missed</span>
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-electric-purple/50"></span> Check-in</span>
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-electric-cyan shadow-[0_0_5px_rgba(6,182,212,0.5)]"></span> Workout</span>
             </div>
          </div>
      </div>


      {/* Vibe Graph Section */}
      {checkIns.length > 0 && (
          <div className="mb-10">
              <h3 className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={14} className="text-electric-pink"/> Mood & Energy History
              </h3>
              <div className="glass-panel p-6 rounded-2xl overflow-x-auto custom-scrollbar border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#0f0728]/60">
                  <div className="flex items-end justify-between min-w-[300px] h-[150px] gap-2">
                      {sortedCheckIns.slice(-7).map((log, i) => {
                          // Construct date properly without UTC shift issues
                          const dateStr = getLogDate(log);
                          let dayName = "";
                          let dayNum = "";
                          
                          if (dateStr !== 'Invalid') {
                              const [y, m, d] = dateStr.split('-').map(Number);
                              const localDate = new Date(y, m - 1, d); // Construct local midnight
                              dayName = localDate.toLocaleDateString('en-US', { weekday: 'short' });
                              dayNum = String(d);
                          }
                          
                          return (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                <div className="text-2xl animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>{log.mood}</div>
                                <div className="w-1.5 h-10 bg-slate-200 dark:bg-white/10 rounded-full relative">
                                    <div className="absolute bottom-0 w-full bg-electric-pink rounded-full" style={{ height: `${(log.bodyWeight / 100) * 80}%`, opacity: 0.5 }}></div>
                                </div>
                                <div className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-500 text-center leading-tight">
                                    <span className="block text-slate-900 dark:text-white">{dayNum}</span>
                                    {dayName}
                                </div>
                            </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* Detailed Log */}
      <div>
         <h3 className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
             <Dumbbell size={14} className="text-electric-purple"/> Past Workouts
         </h3>
         <div className="space-y-3">
            {history.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-500 text-sm italic">No workouts logged yet.</p>
            ) : (
                history.map((entry) => (
                    <div key={entry.id} className="glass-panel p-4 rounded-2xl flex justify-between items-center group hover:bg-white/80 dark:hover:bg-white/5 transition-colors border border-slate-200 dark:border-white/5 hover:border-indigo-400 dark:hover:border-electric-purple/30">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-electric-cyan px-2 py-0.5 rounded bg-electric-cyan/10 border border-electric-cyan/20">
                                    {getLogDate(entry)}
                                </span>
                                {entry.weekNumber && <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase">Week {entry.weekNumber}</span>}
                            </div>
                            <h4 className="font-black text-slate-900 dark:text-white text-lg">{entry.workoutTitle}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {entry.exercises.length} Exercises Completed
                            </p>
                        </div>
                        {onDeleteWorkout && (
                            <button 
                                onClick={() => onDeleteWorkout(entry.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete Record"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))
            )}
         </div>
      </div>
    </div>
  );
};

export default HistoryView;

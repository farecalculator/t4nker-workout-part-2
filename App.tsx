
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, WorkoutDay, UserData, DayStatus, HistoryEntry, Exercise, CheckIn } from './types';
import { PRINCIPLES, WORKOUT_PLAN } from './constants';
import WeekView from './components/WeekView';
import DayDetail from './components/DayDetail';
import SettingsModal from './components/SettingsModal';
import HistoryView from './components/HistoryView';
import CheckInModal from './components/CheckInModal';
import WeightHistoryModal from './components/WeightHistoryModal';
import MonthlyReportModal from './components/MonthlyReportModal';
import { Zap, Settings, History, X, Sun, Moon, Dumbbell, Calendar, Scale, Activity, TrendingUp, BarChart3, Shield, Play } from 'lucide-react';

// A reliable Cyberpunk Gym background
const DEFAULT_BG = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop";

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.WEEK_VIEW);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPrinciples, setShowPrinciples] = useState(false);
  const [showWeightHistory, setShowWeightHistory] = useState(false);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);
  
  // -- PERSISTENCE LOGIC START --
  
  // 1. Initial Load
  const loadData = (): UserData => {
    try {
      const saved = localStorage.getItem('t4nker_data_v2'); 
      if (!saved) return { currentWeek: 1, weights: {}, weekStatus: {}, history: [], checkIns: [], customPlan: undefined };
      const parsed = JSON.parse(saved);
      if (!parsed.customPlan) parsed.customPlan = WORKOUT_PLAN;
      return parsed;
    } catch (e) {
      console.error("Failed to load data", e);
      return { currentWeek: 1, weights: {}, weekStatus: {}, history: [], checkIns: [], customPlan: WORKOUT_PLAN };
    }
  };

  const [userData, setUserData] = useState<UserData>(loadData);
  const [isInitialized, setIsInitialized] = useState(false);

  // 2. Auto-Save Effect (Debounced/Immediate)
  useEffect(() => {
    if (!isInitialized) {
        setIsInitialized(true);
        return; 
    }
    
    try {
      localStorage.setItem('t4nker_data_v2', JSON.stringify(userData));
      // console.log("Data Auto-synced");
    } catch (e) {
      console.error("Auto-save failed", e);
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
         showToast("Storage Full! Clear some history or remove custom background.");
      }
    }
  }, [userData, isInitialized]);
  
  // -- PERSISTENCE LOGIC END --

  // Helper to get consistent local YYYY-MM-DD based on device settings
  const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getUserTimezone = () => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
        return "Unknown Location";
    }
  };

  useEffect(() => {
    const today = getLocalToday();
    // Check if we already have an entry for this local calendar day
    const hasCheckedInToday = userData.checkIns.some(entry => entry.localDate === today || entry.date === today);
    
    // Only auto-show if we haven't checked in AND we are on the main dashboard
    if (!hasCheckedInToday && view === ViewState.WEEK_VIEW) {
        const timer = setTimeout(() => setShowCheckIn(true), 800);
        return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => setToastMessage(msg);

  // --- DATA MUTATION HANDLERS (Just update state, useEffect handles saving) ---

  const handleUpdateWeight = (exerciseId: string, weight: number) => {
    setUserData(prev => ({
      ...prev,
      weights: { ...prev.weights, [exerciseId]: weight }
    }));
  };

  const handleDayStatus = (status: DayStatus) => {
    if (selectedDay) {
      setUserData(prev => {
          let newHistory = [...prev.history];
          if (status === 'completed') {
            const entry: HistoryEntry = {
              id: Date.now().toString(),
              date: new Date().toISOString(),
              localDate: getLocalToday(), // LOCK THE DATE to local calendar
              workoutTitle: selectedDay.title,
              weekNumber: prev.currentWeek,
              exercises: selectedDay.exercises.map(ex => ({
                name: ex.name,
                weight: prev.weights[ex.id] || 0,
                sets: ex.sets,
                reps: ex.reps
              }))
            };
            newHistory = [entry, ...newHistory];
          }
          return {
            ...prev,
            weekStatus: { ...prev.weekStatus, [selectedDay.id]: status },
            history: newHistory
          };
      });
      showToast(status === 'completed' ? "Protocol Completed. Great work." : "Workout Skipped.");
      goBack();
    }
  };

  const handleCheckInComplete = (mood: string, bodyWeight: number) => {
    const now = new Date();
    const today = getLocalToday(); // Use local date string for the KEY
    const timestamp = now.toISOString(); // Keep precise timestamp for ordering

    setUserData(prev => {
        // Remove any existing entry for this specific calendar day to prevent duplicates/confusion
        const filteredCheckIns = prev.checkIns.filter(c => c.localDate !== today && c.date !== today);
        return {
            ...prev,
            checkIns: [
                { 
                    date: today, 
                    localDate: today, 
                    timestamp, 
                    mood, 
                    bodyWeight 
                },
                ...filteredCheckIns
            ]
        };
    });
    setShowCheckIn(false);
    showToast("Daily Stats Updated.");
  };

  const handleManualCheckInTrigger = () => {
    setShowWeightHistory(false);
    setShowCheckIn(true);
  };

  const handleRetroactiveCheckIn = (date: string, mood: string, weight: number) => {
    const syntheticTimestamp = new Date(date + 'T12:00:00').toISOString();
    const newEntry: CheckIn = {
        date: date,
        localDate: date,
        timestamp: syntheticTimestamp,
        mood,
        bodyWeight: weight
    };

    setUserData(prev => {
         const filtered = prev.checkIns.filter(c => c.localDate !== date && c.date !== date);
         return { ...prev, checkIns: [newEntry, ...filtered] };
    });
    showToast(`Saved record for ${date}`);
  };

  const handleRetroactiveWorkout = (date: string, workoutId: string) => {
      const plan = userData.customPlan || WORKOUT_PLAN;
      const day = plan.find(d => d.id === workoutId);
      
      if (!day) {
          showToast("Invalid workout ID");
          return;
      }

      const entry: HistoryEntry = {
          id: `retro_${Date.now()}`,
          date: new Date().toISOString(),
          localDate: date, // Explicitly set the past date
          workoutTitle: day.title,
          weekNumber: userData.currentWeek,
          exercises: day.exercises.map(ex => ({
              name: ex.name,
              weight: userData.weights[ex.id] || 0,
              sets: ex.sets,
              reps: ex.reps
          }))
      };

      setUserData(prev => ({
          ...prev,
          history: [entry, ...prev.history]
      }));
      showToast(`Logged ${day.title} for ${date}`);
  };

  // --- DELETE HANDLERS ---
  const handleDeleteWorkout = (id: string) => {
      if (window.confirm("Delete this workout record? Stats will update.")) {
          setUserData(prev => ({
              ...prev,
              history: prev.history.filter(h => h.id !== id)
          }));
          showToast("Record Deleted");
      }
  };

  const handleDeleteCheckIn = (timestamp?: string, date?: string) => {
      if (window.confirm("Remove this log entry?")) {
          setUserData(prev => ({
              ...prev,
              checkIns: prev.checkIns.filter(c => {
                  if (timestamp && c.timestamp) return c.timestamp !== timestamp;
                  return c.date !== date;
              })
          }));
          showToast("Log Removed");
      }
  };

  // Transition Logic
  const handleStartNewWeek = (skipConfirmation = false) => {
    // If we finished a multiple of 4 weeks (4, 8, 12), show report FIRST
    if (!skipConfirmation && userData.currentWeek > 0 && userData.currentWeek % 4 === 0) {
       setShowMonthlyReport(true);
       return; 
    }

    if (skipConfirmation || window.confirm(`Finish Week ${userData.currentWeek} and start Week ${userData.currentWeek + 1}?`)) {
      setUserData(prev => ({
        ...prev,
        currentWeek: prev.currentWeek + 1,
        weekStatus: {} // Clear the checklist for the new week (Infinite Progression)
      }));
      setShowSettings(false);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (!skipConfirmation) showToast(`Welcome to Week ${userData.currentWeek + 1}`);
      goBack(); 
    }
  };

  const handleCloseReportAndAdvance = () => {
      setShowMonthlyReport(false);
      handleStartNewWeek(true); 
  };

  const handleResetWeights = () => {
    if (window.confirm("Delete all weight history?")) {
      setUserData(prev => ({ ...prev, weights: {} }));
      setShowSettings(false);
      showToast("Weights reset");
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear all workout history logs? This action cannot be undone.")) {
      setUserData(prev => ({ ...prev, history: [] }));
      showToast("History cleared.");
    }
  };

  const handleHardReset = () => {
    if (window.confirm("Permanently delete ALL data? This cannot be undone.")) {
      const emptyData = { currentWeek: 1, weights: {}, weekStatus: {}, history: [], checkIns: [], customPlan: WORKOUT_PLAN };
      setUserData(emptyData); // This triggers useEffect to save emptyData
      setShowSettings(false);
      showToast("System reset complete");
      goBack();
      setTimeout(() => window.location.reload(), 500);
    }
  };

  const handleSetBackground = (url: string | undefined) => {
    setUserData(prev => ({ ...prev, backgroundImage: url }));
    if (url) showToast("Background Updated");
    else showToast("Restored Default Theme");
  };

  const handleSwapExercise = (dayId: string, oldExerciseId: string, newExercise: Partial<Exercise>) => {
    const currentPlan = userData.customPlan || WORKOUT_PLAN;
    const updatedPlan = currentPlan.map(day => {
      if (day.id !== dayId) return day;
      const updatedExercises = day.exercises.map(ex => {
        if (ex.id !== oldExerciseId) return ex;
        const newId = `${dayId}_custom_${Date.now()}`;
        return {
          ...ex, 
          ...newExercise,
          id: newId,
          notes: 'Swapped: ' + (newExercise.name) 
        } as Exercise;
      });
      return { ...day, exercises: updatedExercises };
    });
    
    setUserData(prev => ({ ...prev, customPlan: updatedPlan }));
    
    if (selectedDay && selectedDay.id === dayId) {
        const updatedDay = updatedPlan.find(d => d.id === dayId);
        if (updatedDay) setSelectedDay(updatedDay);
    }
    showToast("Exercise Swapped!");
  };

  const selectDay = (day: WorkoutDay) => {
    setSelectedDay(day);
    setView(ViewState.DAY_VIEW);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setSelectedDay(null);
    setView(ViewState.WEEK_VIEW);
  };

  const totalWorkouts = userData.history.length;
  const completedThisWeek = Object.values(userData.weekStatus).filter(s => s === 'completed').length;
  const isWeekComplete = completedThisWeek >= 5;

  // Use getLocalToday for consistent comparison
  const todayStr = getLocalToday();
  const todaysCheckIn = userData.checkIns.find(entry => entry.localDate === todayStr || entry.date === todayStr);
  const initialCheckInData = todaysCheckIn ? { mood: todaysCheckIn.mood, weight: todaysCheckIn.bodyWeight } : undefined;

  const latestCheckIn = userData.checkIns[0]; // Assuming sorted descending in View but here we might need simpler access
  // Actually, userData.checkIns might not be sorted. Let's find latest.
  // Simple hack: take the one with the latest timestamp/localDate
  // For dashboard display we can just take the first one if we assume unshift, but let's be safe later. 
  // For now, index 0 is acceptable if we always prepend.
  
  const currentWeight = latestCheckIn ? latestCheckIn.bodyWeight : '--';
  const currentMood = latestCheckIn ? latestCheckIn.mood : '🚀';

  const backgroundUrl = (userData.backgroundImage && userData.backgroundImage.length > 5) 
    ? userData.backgroundImage 
    : DEFAULT_BG;

  return (
    <div className={`min-h-screen font-sans selection:bg-electric-pink selection:text-white relative`}>
      
      {/* Dynamic Background Rendering */}
      <div className="fixed inset-0 z-[-1] bg-slate-100 dark:bg-[#030014] transition-colors duration-500">
           {/* The Image - Fixed for Parallax on mobile */}
           <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed transition-all duration-1000"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
           />
           
           {/* THEME OVERLAY - Gradient fade for better text readability at bottom */}
           <div className={`
              absolute inset-0 transition-all duration-500
              ${isDarkMode 
                ? 'bg-gradient-to-b from-transparent via-black/20 to-black/80' 
                : 'bg-gradient-to-b from-white/10 via-white/60 to-white/95'
              }
           `}></div>

           {/* Scanline Effect */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-10"></div>
      </div>

      <CheckInModal 
        isOpen={showCheckIn} 
        onComplete={handleCheckInComplete} 
        onClose={() => setShowCheckIn(false)}
        initialData={initialCheckInData}
        history={userData.checkIns} 
      />

      <WeightHistoryModal
        isOpen={showWeightHistory}
        onClose={() => setShowWeightHistory(false)}
        checkIns={userData.checkIns}
        onTriggerCheckIn={handleManualCheckInTrigger}
        onRetroactiveCheckIn={handleRetroactiveCheckIn}
        onDeleteCheckIn={handleDeleteCheckIn}
      />
      
      <MonthlyReportModal 
         isOpen={showMonthlyReport}
         onClose={handleCloseReportAndAdvance}
         history={userData.history}
         weekCount={userData.currentWeek}
      />

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onResetWeek={() => handleStartNewWeek(false)}
        onResetWeights={handleResetWeights}
        onHardReset={handleHardReset}
        onSetBackground={handleSetBackground}
        currentWeek={userData.currentWeek}
        currentBackground={userData.backgroundImage}
        detectedTimezone={getUserTimezone()}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#0f0728] border border-slate-200 dark:border-electric-purple/50 text-slate-900 dark:text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.3)] z-[100] animate-slideUp font-bold text-sm flex items-center gap-2 text-center w-max max-w-[90vw]">
           <div className="w-2 h-2 rounded-full bg-electric-pink animate-pulse shrink-0"></div>
           {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b-0 shadow-lg transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={goBack}>
            <div className="w-10 h-10 bg-gradient-to-br from-electric-blue to-electric-purple rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform duration-300">
              <Zap className="text-white fill-white" size={20} />
            </div>
            <div className="flex flex-col">
                 <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-electric-blue dark:from-white dark:to-electric-cyan italic leading-none">
                  T4nker
                </h1>
                <span className="text-[10px] font-black text-electric-pink uppercase tracking-[0.2em] leading-none mt-1">Spartan</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-electric-cyan hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="w-px h-6 bg-slate-300 dark:bg-white/10 mx-1"></div>

             <button 
              onClick={() => setView(ViewState.HISTORY_VIEW)}
              className={`p-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 ${view === ViewState.HISTORY_VIEW ? 'bg-electric-purple/10 dark:bg-electric-purple/20 text-electric-purple' : 'text-slate-600 dark:text-slate-400 hover:text-electric-purple hover:bg-black/5 dark:hover:bg-white/10'}`}
            >
              <BarChart3 size={20} />
              <span className="text-xs font-bold hidden sm:inline">Stats</span>
            </button>

            <button 
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-electric-pink hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 relative">
        
        {view === ViewState.WEEK_VIEW && (
          <div className="animate-fadeIn space-y-8">
            
            {/* Hero */}
            <div className="text-center sm:text-left py-6">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-4">
                     <span className="inline-block px-4 py-1.5 rounded-full bg-electric-cyan/10 border border-electric-cyan/30 text-electric-cyan text-xs font-black uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                      Week {userData.currentWeek} // Active Protocol
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-black uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                        <Shield size={10} fill="currentColor" /> Spartan
                    </span>
                </div>
               
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
                    PUSH YOUR <br className="hidden md:block"/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple via-electric-pink to-electric-cyan animate-gradient-x">LIMITS.</span>
                </h2>
            </div>

            {/* Stats Grid - Now Interactive */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Weight Card - Opens History Modal */}
                <button 
                    onClick={() => setShowWeightHistory(true)}
                    className="glass-panel p-5 rounded-3xl relative overflow-hidden group hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300 text-left hover:scale-[1.02] active:scale-[0.98] border border-white/50 dark:border-white/10 hover:border-electric-cyan/30"
                >
                     <div className="absolute -right-4 -top-4 text-electric-cyan/10 group-hover:text-electric-cyan/20 transition-colors">
                        <Scale size={80} />
                     </div>
                     <div className="flex items-center gap-2 mb-2 text-slate-800 dark:text-electric-cyan font-bold">
                        <Scale size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Mass</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{currentWeight}</p>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">KG</span>
                    </div>
                    <div className="absolute bottom-3 right-4 text-[10px] uppercase font-bold text-electric-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                        View Log &rarr;
                    </div>
                </button>

                {/* Vibe Card - Opens History */}
                 <button 
                    onClick={() => setView(ViewState.HISTORY_VIEW)}
                    className="glass-panel p-5 rounded-3xl relative overflow-hidden group hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] transition-all duration-300 text-left hover:scale-[1.02] active:scale-[0.98] border border-white/50 dark:border-white/10 hover:border-electric-pink/30"
                >
                    <div className="absolute -right-4 -top-4 text-electric-pink/10 group-hover:text-electric-pink/20 transition-colors">
                        <Activity size={80} />
                     </div>
                     <div className="flex items-center gap-2 mb-2 text-slate-800 dark:text-electric-pink font-bold">
                        <Activity size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Energy</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{currentMood}</span>
                    </div>
                     <div className="absolute bottom-3 right-4 text-[10px] uppercase font-bold text-electric-pink opacity-0 group-hover:opacity-100 transition-opacity">
                        Trends &rarr;
                    </div>
                </button>

                {/* Session Card - Opens History */}
                <button 
                    onClick={() => setView(ViewState.HISTORY_VIEW)}
                    className="glass-panel p-5 rounded-3xl relative overflow-hidden group hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-all duration-300 text-left hover:scale-[1.02] active:scale-[0.98] border border-white/50 dark:border-white/10 hover:border-electric-purple/30"
                >
                    <div className="absolute -right-4 -top-4 text-electric-purple/10 group-hover:text-electric-purple/20 transition-colors">
                        <Dumbbell size={80} />
                     </div>
                    <div className="flex items-center gap-2 mb-2 text-slate-800 dark:text-electric-purple font-bold">
                        <Dumbbell size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total XP</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalWorkouts}</p>
                     <div className="absolute bottom-3 right-4 text-[10px] uppercase font-bold text-electric-purple opacity-0 group-hover:opacity-100 transition-opacity">
                        History &rarr;
                    </div>
                </button>

                {/* Progress Card - Opens History (or stays) */}
                 <div className="glass-panel p-5 rounded-3xl relative overflow-hidden group hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 border border-white/50 dark:border-white/10">
                    <div className="absolute -right-4 -top-4 text-electric-blue/10 group-hover:text-electric-blue/20 transition-colors">
                        <TrendingUp size={80} />
                     </div>
                     <div className="flex items-center gap-2 mb-2 text-slate-800 dark:text-electric-blue font-bold">
                        <TrendingUp size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Weekly</span>
                    </div>
                    <div className="flex items-end gap-1">
                      <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{completedThisWeek}</p>
                      <span className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-1 opacity-60">/ 5</span>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 py-4 opacity-60">
                 <div className="h-px bg-gradient-to-r from-transparent via-electric-purple to-transparent flex-1"></div>
                 <span className="text-[10px] font-black text-electric-purple uppercase tracking-[0.3em] glow-text">Spartan Protocol</span>
                 <div className="h-px bg-gradient-to-r from-transparent via-electric-purple to-transparent flex-1"></div>
            </div>

            <WeekView onSelectDay={selectDay} weekStatus={userData.weekStatus} />

            {/* Quick Advance Button - appears when all 5 workouts done */}
            {isWeekComplete && (
                <div className="flex justify-center pt-8 pb-4 animate-slideUp">
                     <button 
                        onClick={() => handleStartNewWeek(false)}
                        className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-electric-blue to-electric-purple hover:scale-105 active:scale-95 transition-all text-white font-bold shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                     >
                        <Play fill="currentColor" /> Initialize Week {userData.currentWeek + 1}
                     </button>
                </div>
            )}
          </div>
        )}

        {/* DAY VIEW */}
        {view === ViewState.DAY_VIEW && selectedDay && (
          <DayDetail 
            day={selectedDay}
            onBack={goBack}
            onComplete={() => handleDayStatus('completed')}
            onSkip={() => handleDayStatus('skipped')}
            onWeightUpdate={handleUpdateWeight}
            onSwapExercise={handleSwapExercise}
            weights={userData.weights} // Pass persistence weights correctly
            status={userData.weekStatus[selectedDay.id] || 'pending'}
          />
        )}

        {/* HISTORY VIEW */}
        {view === ViewState.HISTORY_VIEW && (
          <HistoryView 
            history={userData.history} 
            checkIns={userData.checkIns} 
            onBack={goBack}
            onClear={handleClearHistory}
            onRetroactiveWorkout={handleRetroactiveWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            customPlan={userData.customPlan}
          />
        )}

      </main>

      {/* Principles Modal */}
      {showPrinciples && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="glass-panel border border-white/10 rounded-3xl p-6 max-w-lg w-full relative shadow-2xl">
                <button onClick={() => setShowPrinciples(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X /></button>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Core Principles</h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {PRINCIPLES.map(p => (
                        <div key={p.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <h4 className="font-bold text-electric-cyan mb-1">{p.title}</h4>
                            <p className="text-sm text-slate-300 leading-relaxed">{p.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default App;

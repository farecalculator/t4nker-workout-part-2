
import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Calendar, Image as ImageIcon, Upload, Check, RefreshCw, MapPin } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onResetWeek: () => void;
  onResetWeights: () => void;
  onHardReset: () => void;
  onSetBackground: (url: string | undefined) => void;
  currentWeek: number;
  currentBackground?: string;
  detectedTimezone?: string;
}

const SettingsModal: React.FC<Props> = ({ 
    isOpen, onClose, onResetWeek, onResetWeights, onHardReset, onSetBackground, currentWeek, currentBackground, detectedTimezone 
}) => {
  const [bgUrl, setBgUrl] = useState(currentBackground || '');
  const [error, setError] = useState('');
  const [compressing, setCompressing] = useState(false);

  if (!isOpen) return null;

  const handleUrlSubmit = () => {
    onSetBackground(bgUrl);
    onClose();
  };

  // Improved resizing: MUCH smaller dimensions and quality to fit LocalStorage limits safely
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Aggressive resize: Max 600px is enough for background blur usage
                const MAX_WIDTH = 600; 
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Compress to JPEG 0.4 quality to save space (target <100kb)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.4);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setCompressing(true);
        setError('');
        try {
            const resizedImage = await resizeImage(file);
            // Check size estimate (approx) - Limit to 300KB string length approx
            if (resizedImage.length > 500000) {
                 setError("Image still too large. Try a simpler photo.");
            } else {
                 onSetBackground(resizedImage);
                 setBgUrl(resizedImage);
                 onClose();
            }
        } catch (e) {
            console.error(e);
            setError("Could not process image.");
        } finally {
            setCompressing(false);
        }
    }
  };

  const handleClearBg = () => {
      onSetBackground(undefined); // Pass undefined to reset to default
      setBgUrl('');
      onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-[#0f0728] border border-slate-200 dark:border-electric-purple/30 rounded-3xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(139,92,246,0.2)] animate-scaleIn relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-electric-cyan dark:to-electric-purple mb-1">
                System Settings
            </h2>
            {detectedTimezone && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-slate-400">
                    <MapPin size={10} /> Location Detected: {detectedTimezone}
                </div>
            )}
        </div>

        <div className="space-y-6">
          
          {/* Custom Background Section */}
          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-electric-cyan/50 transition-colors">
             <div className="flex items-center gap-3 mb-3 text-indigo-600 dark:text-electric-cyan">
              <ImageIcon size={22} />
              <h3 className="font-bold text-lg">Custom Background</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Upload a motivational photo. We'll auto-compress it to fit.
            </p>
            
            <div className="space-y-3">
                <input 
                    type="text" 
                    value={bgUrl.length > 50 ? 'Image Data Loaded' : bgUrl} 
                    onChange={(e) => setBgUrl(e.target.value)}
                    placeholder="...or paste Image URL"
                    className="w-full bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:border-electric-cyan outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
                
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={handleUrlSubmit}
                        className="py-3 px-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-electric-purple dark:hover:bg-electric-purple/80 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 dark:shadow-electric-purple/20 transition-all"
                    >
                        Save URL
                    </button>
                    <label className={`py-3 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-xl text-sm font-bold cursor-pointer text-center flex items-center justify-center gap-2 border border-transparent dark:border-white/5 transition-all ${compressing ? 'opacity-50 cursor-wait' : ''}`}>
                        {compressing ? (
                            <span className="animate-pulse">Processing...</span>
                        ) : (
                            <><Upload size={16} /> Upload Photo</>
                        )}
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={compressing} />
                    </label>
                </div>
                {error && <p className="text-red-500 dark:text-red-400 text-xs font-bold flex items-center gap-1"><AlertTriangle size={12}/> {error}</p>}
                
                {/* Always show Reset button to fix broken images */}
                <button 
                    onClick={handleClearBg} 
                    className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all"
                >
                    <RefreshCw size={12} /> Reset to Default Cyberpunk
                </button>
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-white/10"></div>

          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 transition-colors">
            <div className="flex items-center gap-3 mb-2 text-indigo-500 dark:text-indigo-400">
              <Calendar size={22} />
              <h3 className="font-bold text-lg">Weekly Progression</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Finish <strong>Week {currentWeek}</strong>. All stats are saved to history.
            </p>
            <button 
              onClick={onResetWeek}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-indigo-600/20"
            >
              Start Week {currentWeek + 1}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-yellow-500/50 transition-colors">
             <div className="flex items-center gap-3 mb-2 text-yellow-500 dark:text-yellow-400">
              <Trash2 size={22} />
              <h3 className="font-bold text-lg">Reset Weights</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Keep history, but clear current exercise weights.</p>
            <button 
              onClick={onResetWeights}
              className="w-full py-3 px-4 bg-white dark:bg-white/5 hover:bg-yellow-50 dark:hover:bg-yellow-500/20 text-slate-600 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-xl transition-all text-sm font-bold border border-slate-200 dark:border-transparent hover:border-yellow-500/50"
            >
              Reset Weights Only
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
            <div className="flex items-center gap-3 mb-2 text-red-500 dark:text-red-400">
              <AlertTriangle size={22} />
              <h3 className="font-bold text-lg">Danger Zone</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Completely wipe all data. Irreversible.</p>
            <button 
              onClick={onHardReset}
              className="w-full py-3 px-4 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-white rounded-xl transition-all text-sm font-bold border border-red-200 dark:border-red-500/30"
            >
              Factory Reset App
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

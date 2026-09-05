import React from 'react';
import { AlertTriangle, CheckCircle, LifeBuoy, Sparkles } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';

export const DemoToolbar: React.FC = () => {
  const { appMode, setAppMode } = useWeather();

  return (
    <div className="bg-slate-950/90 border-b border-slate-800 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-slate-300 backdrop-blur-md z-50">
      <div className="flex items-center gap-2 font-medium">
        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span className="text-cyan-300 font-semibold uppercase tracking-wider">Demo Control:</span>
        <span className="hidden sm:inline text-slate-400">Simulate product narrative state:</span>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setAppMode('NORMAL')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all font-semibold magnetic-btn ${
            appMode === 'NORMAL'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          <span>NORMAL</span>
          <span className="text-[10px] opacity-70 hidden md:inline">(INFORM)</span>
        </button>

        <button
          onClick={() => setAppMode('RISK')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all font-semibold magnetic-btn ${
            appMode === 'RISK'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20 animate-pulse'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>RISK</span>
          <span className="text-[10px] opacity-70 hidden md:inline">(PREPARE)</span>
        </button>

        <button
          onClick={() => setAppMode('DISASTER')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all font-bold magnetic-btn ${
            appMode === 'DISASTER'
              ? 'bg-red-600 text-white border border-red-400 shadow-md shadow-red-600/40 animate-pulse'
              : 'text-red-400 hover:text-red-200 hover:bg-red-950/40'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>RESCUE</span>
          <span className="text-[10px] opacity-90 hidden md:inline">(RESPOND)</span>
        </button>
      </div>
    </div>
  );
};

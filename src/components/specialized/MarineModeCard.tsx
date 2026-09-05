import React from 'react';
import { Anchor, Compass, Navigation, Waves, Wind } from 'lucide-react';
import { SpecializedService } from '../../services/specializedService';

export const MarineModeCard: React.FC = () => {
  const marine = SpecializedService.getMarineData();

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-slate-900 border border-cyan-500/30 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Anchor className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide font-mono">
              MARINE WEATHER BRIEFING (MACHILIPATNAM / BAY OF BENGAL)
            </h2>
            <p className="text-xs text-cyan-300/80 font-medium">
              Swell height, wave direction, wind velocity, sea condition & coastal cyclone watch
            </p>
          </div>
        </div>

        <span className="text-xs font-black bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/40 font-mono">
          SEA STATE: {marine.seaCondition.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Wave Height
          </span>
          <span className="text-xl font-extrabold text-cyan-400 font-mono">{marine.waveHeightMeters} m</span>
          <span className="text-[10px] text-slate-500 block">Swell {marine.waveDirection}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Wind Velocity
          </span>
          <span className="text-xl font-extrabold text-blue-400 font-mono">{marine.windSpeedKts} kts</span>
          <span className="text-[10px] text-slate-500 block">Gusts 22 kts</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Tide Times
          </span>
          <span className="text-xs font-bold text-slate-200 font-mono block">High: {marine.tideHigh}</span>
          <span className="text-[10px] text-slate-500 block">Low: {marine.tideLow}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Cyclone Watch
          </span>
          <span className="text-xs font-bold text-emerald-400 font-mono leading-snug">
            {marine.cycloneWatch}
          </span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 text-xs text-slate-200 space-y-1">
        <span className="font-bold text-cyan-400 uppercase tracking-widest block text-[10px]">
          COASTAL FISHERMAN ADVISORY:
        </span>
        <p className="leading-relaxed">{marine.advisoryBriefing}</p>
      </div>
    </div>
  );
};

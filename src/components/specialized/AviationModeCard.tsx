import React from 'react';
import { Eye, Gauge, Navigation, Plane, ShieldCheck, Wind } from 'lucide-react';
import { SpecializedService } from '../../services/specializedService';

export const AviationModeCard: React.FC = () => {
  const av = SpecializedService.getAviationData();

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-950/40 via-slate-900/80 to-slate-900 border border-blue-500/30 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide font-mono">
              AVIATION WEATHER BRIEFING (VOBM / VIJAYAWADA AIRPORT)
            </h2>
            <p className="text-xs text-blue-300/80 font-medium">
              Flight category, wind vector, METAR raw observation, ceiling height
            </p>
          </div>
        </div>

        <span className="text-xs font-black bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40 font-mono">
          FLIGHT CATEGORY: {av.flightCategory}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Visibility
          </span>
          <span className="text-xl font-extrabold text-white font-mono">{av.visibilityKm} km</span>
          <span className="text-[10px] text-slate-500 block">Clear runway visual range</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Wind Vector
          </span>
          <span className="text-xl font-extrabold text-cyan-400 font-mono">
            {av.windDirectionText} {av.windSpeedKmh} km/h
          </span>
          <span className="text-[10px] text-slate-500 block">Heading {av.windDirectionDegrees}°</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Cloud Ceiling
          </span>
          <span className="text-xl font-extrabold text-slate-200 font-mono">{av.cloudBaseFeet} ft</span>
          <span className="text-[10px] text-slate-500 block">{av.cloudCondition}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Thunderstorm Risk
          </span>
          <span className="text-xl font-extrabold text-amber-400 font-mono">{av.thunderstormRisk}</span>
          <span className="text-[10px] text-slate-500 block">After 15:00 IST</span>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
        <span className="text-slate-500 block text-[10px] mb-1 uppercase tracking-wider">
          RAW METAR REPORT:
        </span>
        <code>{av.metarRaw}</code>
      </div>
    </div>
  );
};

import React from 'react';
import { AlertTriangle, Building2, Car, Compass, Flame, ShieldAlert } from 'lucide-react';
import { SpecializedService } from '../../services/specializedService';

export const SmartCityModeCard: React.FC = () => {
  const city = SpecializedService.getSmartCityData();

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-900 border border-indigo-500/30 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide font-mono">
              SMART CITY MODE: MUNICIPAL WEATHER DISRUPTION MONITOR
            </h2>
            <p className="text-xs text-indigo-300/80 font-medium">
              Urban heat zones, flood prone road inundation, municipal response status
            </p>
          </div>
        </div>

        <span className="text-xs font-black bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/40 font-mono">
          ALERT LEVEL: {city.cityAlertLevel}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Urban Heat Zones
          </span>
          <span className="text-xl font-extrabold text-emerald-400 font-mono">{city.heatZoneStatus}</span>
          <span className="text-[10px] text-slate-500 block">No thermal anomaly</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Flood-Prone Roads
          </span>
          <span className="text-xl font-extrabold text-amber-400 font-mono">
            {city.floodProneRoadsCount} Roads
          </span>
          <span className="text-[10px] text-slate-500 block">MG Road & Benz Circle</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Relief Centers Open
          </span>
          <span className="text-xl font-extrabold text-cyan-400 font-mono">
            {city.activeFacilitiesOpen} Hubs
          </span>
          <span className="text-[10px] text-slate-500 block">Staffed and ready</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Vulnerable Population
          </span>
          <span className="text-xl font-extrabold text-slate-200 font-mono">
            {city.vulnerablePopulationCount.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block">Evacuation plan ready</span>
        </div>
      </div>
    </div>
  );
};

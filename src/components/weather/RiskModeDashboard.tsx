import React, { useState } from 'react';
import {
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  CloudRain,
  Compass,
  MapPin,
  ShieldAlert,
  Umbrella,
  Users,
  Wind
} from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import { DailyForecast } from './DailyForecast';
import { DaySummaryCard } from './DaySummaryCard';
import { HourlyForecast } from './HourlyForecast';
import { WeatherHero } from './WeatherHero';
import { WeatherIntelligenceCard } from './WeatherIntelligenceCard';

export const RiskModeDashboard: React.FC = () => {
  const { selectedLocation } = useWeather();

  // Interactive state for Prepare Now checklist
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    gear: true,
    roads: false,
    phone: true,
    family: false
  });

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Main Weather Centerpiece Hero (Dynamic Climate Wallpaper) */}
      <WeatherHero />

      {/* 2. Compact Risk Summary & Preparedness Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-lg space-y-4 backdrop-blur-md">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  WEATHER RISK SUMMARY
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                  RISK LEVEL: HIGH
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Heavy rainfall expected in the next 2–4 hours
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium self-start sm:self-auto">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{selectedLocation.city}, {selectedLocation.state || selectedLocation.country}</span>
          </div>
        </div>

        {/* Compact Risk Type Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Rain Risk */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <CloudRain className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white">Rain Risk</span>
                <span className="text-[10px] font-black text-amber-400 uppercase">HIGH</span>
              </div>
              <p className="text-slate-400 text-[11px]">85% peak probability in ~2h. ~75mm rain.</p>
            </div>
          </div>

          {/* Flood Risk */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white">Flood Risk</span>
                <span className="text-[10px] font-bold text-amber-300 uppercase">MODERATE</span>
              </div>
              <p className="text-slate-400 text-[11px]">Waterlogging in low-lying roadways.</p>
            </div>
          </div>

          {/* Wind Risk */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Wind className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white">Wind Risk</span>
                <span className="text-[10px] font-bold text-amber-300 uppercase">MODERATE</span>
              </div>
              <p className="text-slate-400 text-[11px]">Wind gusts up to 48 km/h expected.</p>
            </div>
          </div>
        </div>

        {/* Compact "Prepare Now" Action Checklist */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>PREPARE NOW</span>
              <span className="text-[10px] font-normal text-slate-400">(Precautionary Checklist)</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Action 1 */}
            <div
              onClick={() => toggleCheck('gear')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 text-xs ${
                checkedItems.gear
                  ? 'bg-amber-950/30 border-amber-500/40 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${checkedItems.gear ? 'text-amber-400' : 'text-slate-600'}`} />
              <div className="flex items-center gap-1.5 truncate">
                <Umbrella className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-medium truncate">Keep umbrella/rain gear ready</span>
              </div>
            </div>

            {/* Action 2 */}
            <div
              onClick={() => toggleCheck('roads')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 text-xs ${
                checkedItems.roads
                  ? 'bg-amber-950/30 border-amber-500/40 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${checkedItems.roads ? 'text-amber-400' : 'text-slate-600'}`} />
              <div className="flex items-center gap-1.5 truncate">
                <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-medium truncate">Avoid low-lying roads</span>
              </div>
            </div>

            {/* Action 3 */}
            <div
              onClick={() => toggleCheck('phone')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 text-xs ${
                checkedItems.phone
                  ? 'bg-amber-950/30 border-amber-500/40 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${checkedItems.phone ? 'text-amber-400' : 'text-slate-600'}`} />
              <div className="flex items-center gap-1.5 truncate">
                <BatteryCharging className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-medium truncate">Keep your phone charged</span>
              </div>
            </div>

            {/* Action 4 */}
            <div
              onClick={() => toggleCheck('family')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 text-xs ${
                checkedItems.family
                  ? 'bg-amber-950/30 border-amber-500/40 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${checkedItems.family ? 'text-amber-400' : 'text-slate-600'}`} />
              <div className="flex items-center gap-1.5 truncate">
                <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-medium truncate">Check family contacts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Today's Timeline (Hourly Forecast) */}
      <HourlyForecast />

      {/* 4. Weather Guidance & Forecast Grid */}
      <WeatherIntelligenceCard />

      {/* 5. Day Summary Section (Full Width, No Right-Side Column Gap) */}
      <DaySummaryCard />

      {/* 6. 7-Day Forecast Section (Bottom Full-Width Horizontal Grid/Scroll) */}
      <DailyForecast />
    </div>
  );
};

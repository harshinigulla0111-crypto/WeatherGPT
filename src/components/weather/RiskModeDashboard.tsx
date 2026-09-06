import React, { useState } from 'react';
import {
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  CloudRain,
  Compass,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Sun,
  ToggleLeft,
  ToggleRight,
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

  // Demo manual toggle switch for presentation purposes (independent of automatic hazard detection)
  const [isRiskActive, setIsRiskActive] = useState<boolean>(false);
  const [isRippleActive, setIsRippleActive] = useState<boolean>(false);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);

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

  // Demo toggle switch handler with ripple & header flash animations
  const handleToggleRiskMode = () => {
    setIsRippleActive(true);
    setIsFlashActive(true);
    setIsRiskActive((prev) => !prev);
    setTimeout(() => setIsRippleActive(false), 600);
    setTimeout(() => setIsFlashActive(false), 500);
  };

  return (
    <div className="space-y-6 transition-all duration-500 ease-in-out">
      {/* =========================================================================
          IN-PAGE DEMO TOGGLE BAR (PRESENTATION & INDEPENDENT SWITCHING)
          // Demo manual toggle switch for presentation purposes (independent of automatic hazard detection)
         ========================================================================= */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-all ${isRiskActive ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-300'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                RISK MODE INTERFACE SWITCH
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isRiskActive ? 'bg-amber-500 text-slate-950 font-black' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {isRiskActive ? 'RISK SIMULATION ACTIVE' : 'CALM STATE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Demonstrate Risk Mode in active vs. inactive state independently.
            </p>
          </div>
        </div>

        {/* Interactive In-Page Toggle Control */}
        <button
          onClick={handleToggleRiskMode}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider transition-all flex items-center gap-2.5 shadow-md magnetic-btn relative overflow-hidden ${
            isRippleActive ? 'toggle-ripple-active' : ''
          } ${
            isRiskActive
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/30 ring-2 ring-amber-400/50'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
          }`}
          title="Toggle Risk Mode Active State"
        >
          {isRiskActive ? (
            <>
              <ToggleRight className="w-5 h-5 text-slate-950" />
              <span>RISK ACTIVE</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-slate-400" />
              <span>SIMULATE RISK</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Main Weather Centerpiece Hero (Dynamic Climate Wallpaper) */}
      <WeatherHero />

      {/* =========================================================================
          MAIN CONTENT AREA (CALM STATE vs ACTIVE RISK STATE WITH SWEEP & STAGGER)
         ========================================================================= */}
      {isRiskActive ? (
        /* ACTIVE RISK MODE UI (Yellow Theme with Radial Gradient Sweep & Cascade) */
        <div
          className={`p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-xl space-y-4 backdrop-blur-md mode-sweep-amber transition-all duration-500 ${
            isFlashActive ? 'header-flash-trigger' : ''
          }`}
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    WEATHER RISK SUMMARY
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse">
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

          {/* Compact Risk Type Cards Grid (Staggered Animation Cascade) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Rain Risk */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 stagger-card-1">
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
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 stagger-card-2">
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
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 stagger-card-3">
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
          <div className="pt-2 border-t border-slate-800/80 space-y-2.5 stagger-card-4">
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
      ) : (
        /* CALM INACTIVE STATE (Normal Theme with Breathing Shield & Reassuring Guidance) */
        <div
          className={`p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-cyan-500/30 shadow-lg text-center space-y-4 backdrop-blur-md mode-sweep-neutral transition-all duration-500 ${
            isFlashActive ? 'header-flash-trigger' : ''
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto calm-breathe-icon">
            <ShieldCheck className="w-8 h-8 text-cyan-300" />
          </div>

          <div className="space-y-1.5 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>CONDITIONS NORMAL</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              No risk detected in your region — conditions are normal
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Live meteorological sensors report clear atmospheric stability across {selectedLocation.city}. Use the switch above to simulate live risk warnings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">RADAR STATUS</span>
              <span className="text-white font-bold block mt-0.5">All Clear</span>
              <span className="text-[11px] text-slate-400">No severe precipitation clusters nearby.</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">WIND STABILITY</span>
              <span className="text-white font-bold block mt-0.5">14 km/h Gentle Breeze</span>
              <span className="text-[11px] text-slate-400">Normal directional velocity.</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">ADVISORY LEVEL</span>
              <span className="text-emerald-400 font-bold block mt-0.5">Green / Peaceful</span>
              <span className="text-[11px] text-slate-400">Standard daily routine recommended.</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Today's Timeline (Hourly Forecast) */}
      <HourlyForecast />

      {/* 4. Weather Guidance & Forecast Grid */}
      <WeatherIntelligenceCard />

      {/* 5. Day Summary Section */}
      <DaySummaryCard />

      {/* 6. 7-Day Forecast Section */}
      <DailyForecast />
    </div>
  );
};


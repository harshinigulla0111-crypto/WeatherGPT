import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  HeartHandshake,
  Home,
  LifeBuoy,
  MapPin,
  PhoneCall,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sun,
  ToggleLeft,
  ToggleRight,
  Users
} from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import { FamilySafetyCircle } from './FamilySafetyCircle';
import { SafeSheltersCard } from './SafeSheltersCard';

interface RescueModeProps {
  onTriggerDangerWizard: () => void;
}

export const RescueMode: React.FC<RescueModeProps> = ({ onTriggerDangerWizard }) => {
  const { setAppMode, selectedLocation } = useWeather();

  // Demo manual toggle switch for presentation purposes (independent of automatic hazard detection)
  const [isRescueActive, setIsRescueActive] = useState<boolean>(false);
  const [isRippleActive, setIsRippleActive] = useState<boolean>(false);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [locationShared, setLocationShared] = useState(false);

  const handleShareLocation = () => {
    setLocationShared(true);
    setTimeout(() => {
      setLocationShared(false);
    }, 4000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Demo toggle switch handler with ripple & header flash animations
  const handleToggleRescueMode = () => {
    setIsRippleActive(true);
    setIsFlashActive(true);
    setIsRescueActive((prev) => !prev);
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
          <div className={`p-2 rounded-xl transition-all ${isRescueActive ? 'bg-red-600/20 text-red-400' : 'bg-cyan-500/20 text-cyan-300'}`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                RESCUE MODE INTERFACE SWITCH
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isRescueActive ? 'bg-red-600 text-white font-black animate-pulse' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {isRescueActive ? 'EMERGENCY SIMULATION ACTIVE' : 'SAFE STATE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Demonstrate Rescue Mode in active emergency vs. safe state independently.
            </p>
          </div>
        </div>

        {/* Interactive In-Page Toggle Control */}
        <button
          onClick={handleToggleRescueMode}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider transition-all flex items-center gap-2.5 shadow-md magnetic-btn relative overflow-hidden ${
            isRippleActive ? 'toggle-ripple-active' : ''
          } ${
            isRescueActive
              ? 'bg-red-600 text-white hover:bg-red-500 shadow-red-600/40 ring-2 ring-red-400/50'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
          }`}
          title="Toggle Rescue Mode Active State"
        >
          {isRescueActive ? (
            <>
              <ToggleRight className="w-5 h-5 text-white" />
              <span>RESCUE ACTIVE</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-slate-400" />
              <span>SIMULATE EMERGENCY</span>
            </>
          )}
        </button>
      </div>

      {/* =========================================================================
          MAIN RESCUE CONTENT AREA (ACTIVE EMERGENCY VS CALM SAFE STATE)
         ========================================================================= */}
      {isRescueActive ? (
        /* ACTIVE RESCUE MODE UI (Red Theme with Radial Sweep & Staggered Actions) */
        <div
          className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950 via-slate-950 to-red-950 border-2 border-red-600 shadow-2xl shadow-red-600/40 relative overflow-hidden space-y-6 mode-sweep-red transition-all duration-500 ${
            isFlashActive ? 'header-flash-trigger' : ''
          }`}
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-800/80 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 rounded-2xl bg-red-600 text-white animate-bounce shadow-lg shadow-red-600/60">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-red-600 text-white text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    🚨 RESCUE MODE ACTIVE
                  </span>
                  <span className="text-xs text-red-300 font-mono flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {selectedLocation.city}, {selectedLocation.state || selectedLocation.country}
                  </span>
                  <span className="text-xs bg-red-950 text-red-200 border border-red-700/60 px-2 py-0.5 rounded-md font-mono">
                    DEMO MODE SIMULATION
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1 font-mono">
                  🚨 WEATHER EMERGENCY
                </h1>
                <p className="text-sm text-red-200 font-medium">
                  Immediate action may be required. Severe weather conditions detected in your sector.
                </p>
              </div>
            </div>

            <button
              onClick={() => setAppMode('NORMAL')}
              className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-colors self-start md:self-auto flex items-center gap-2 shrink-0 shadow-md"
            >
              <LifeBuoy className="w-4 h-4 text-cyan-400" />
              <span>Return to Normal Mode</span>
            </button>
          </div>

          {/* Emergency Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs stagger-card-1">
            <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800/80">
              <span className="text-red-300/80 block text-[10px] font-bold uppercase tracking-widest font-mono">
                Risk Level
              </span>
              <span className="text-xl font-black text-white font-mono">HIGH / EXTREME</span>
            </div>

            <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800/80">
              <span className="text-red-300/80 block text-[10px] font-bold uppercase tracking-widest font-mono">
                Location
              </span>
              <span className="text-sm font-black text-red-200 truncate block">
                {selectedLocation.city}, {selectedLocation.state || selectedLocation.country}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800/80">
              <span className="text-red-300/80 block text-[10px] font-bold uppercase tracking-widest font-mono">
                Status
              </span>
              <span className="text-sm font-black text-red-400 font-mono">Emergency Response</span>
            </div>

            <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800/80">
              <span className="text-red-300/80 block text-[10px] font-bold uppercase tracking-widest font-mono">
                Rainfall Volume
              </span>
              <span className="text-xl font-black text-white font-mono">96 mm</span>
            </div>
          </div>

          {/* Primary Large Action Buttons (Staggered Animation Cascade) */}
          <div className="space-y-3 pt-2 stagger-card-2">
            <span className="text-xs font-black text-red-300 uppercase tracking-widest font-mono block">
              IMMEDIATE EMERGENCY ACTIONS:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Action 1: I'M IN DANGER */}
              <button
                onClick={onTriggerDangerWizard}
                className="p-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-red-600/60 border-2 border-red-400 animate-pulse transition-transform active:scale-95"
              >
                <AlertOctagon className="w-6 h-6 shrink-0" />
                <span>🆘 I'M IN DANGER</span>
              </button>

              {/* Action 2: FIND SAFE SHELTER */}
              <button
                onClick={() => scrollToSection('safe-shelters')}
                className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg border-2 border-red-700/80 hover:border-red-500 transition-all active:scale-95"
              >
                <Home className="w-6 h-6 text-amber-400 shrink-0" />
                <span>🏠 FIND SAFE SHELTER</span>
              </button>

              {/* Action 3: FAMILY SAFETY */}
              <button
                onClick={() => scrollToSection('family-safety')}
                className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg border-2 border-red-700/80 hover:border-red-500 transition-all active:scale-95"
              >
                <Users className="w-6 h-6 text-cyan-400 shrink-0" />
                <span>👨‍👩‍👧 FAMILY SAFETY</span>
              </button>

              {/* Action 4: SHARE MY LOCATION */}
              <button
                onClick={handleShareLocation}
                className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg border-2 border-red-700/80 hover:border-red-500 transition-all active:scale-95"
              >
                <Radio className="w-6 h-6 text-emerald-400 shrink-0 animate-pulse" />
                <span>📍 {locationShared ? 'GPS BROADCASTED!' : 'SHARE MY LOCATION'}</span>
              </button>

              {/* Action 5: EMERGENCY CALL */}
              <a
                href="tel:112"
                className="p-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-amber-600/50 border-2 border-amber-400 transition-transform active:scale-95 sm:col-span-2 lg:col-span-2"
              >
                <PhoneCall className="w-6 h-6 shrink-0" />
                <span>☎ CALL EMERGENCY HELPLINE (112)</span>
              </a>
            </div>

            {locationShared && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Location shared! GPS coordinates (16.5062° N, 80.6480° E) sent to Rescue Control & Family Safety Circle.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CALM SAFE STATE (Normal Theme with Breathing Icon & Reassuring Messages) */
        <div
          className={`p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-emerald-500/30 shadow-lg text-center space-y-4 backdrop-blur-md mode-sweep-neutral transition-all duration-500 ${
            isFlashActive ? 'header-flash-trigger' : ''
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto calm-breathe-icon">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="space-y-1.5 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
              <span>SAFETY CONFIRMED</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              No danger or emergency detected — you're safe
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              National Disaster Response Framework reports clear conditions in {selectedLocation.city}. Emergency services are on standby. Use the switch above to simulate emergency alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">SECTOR THREAT LEVEL</span>
              <span className="text-white font-bold block mt-0.5">Level 0 / Normal</span>
              <span className="text-[11px] text-slate-400">No active evacuation orders.</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">CIVIL DEFENSE</span>
              <span className="text-white font-bold block mt-0.5">Standby Active</span>
              <span className="text-[11px] text-slate-400">Regional response teams ready if needed.</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">FAMILY CIRCLE</span>
              <span className="text-cyan-400 font-bold block mt-0.5">Monitoring Enabled</span>
              <span className="text-[11px] text-slate-400">Check family status below.</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Safe Shelters & Relief Centers Section */}
      <div id="safe-shelters">
        <SafeSheltersCard />
      </div>

      {/* 3. Family Safety Circle Section (Always accessible) */}
      <div id="family-safety">
        <FamilySafetyCircle />
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Home,
  LifeBuoy,
  MapPin,
  PhoneCall,
  Radio,
  ShieldAlert,
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Rescue Mode Header Status Banner & Immediate Actions Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950 via-slate-950 to-red-950 border-2 border-red-600 shadow-2xl shadow-red-600/40 relative overflow-hidden space-y-6">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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

        {/* 2. Primary Large Action Buttons */}
        <div className="space-y-3 pt-2">
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

      {/* 2. Safe Shelters & Relief Centers Section */}
      <div id="safe-shelters">
        <SafeSheltersCard />
      </div>

      {/* 3. Family Safety Circle Section */}
      <div id="family-safety">
        <FamilySafetyCircle />
      </div>
    </div>
  );
};

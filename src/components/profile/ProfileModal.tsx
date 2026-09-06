import React, { useState } from 'react';
import { Bell, Globe, HeartHandshake, LogOut, MapPin, Mic, Phone, Shield, Sparkles, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWeather } from '../../contexts/WeatherContext';
import { LANGUAGES } from '../../services/i18nService';
import { areToastsEnabled, setToastsEnabled } from '../../services/weatherNotificationService';

export const ProfileModal: React.FC = () => {
  const { user, logout, language, setLanguage } = useAuth();
  const { tempUnit, setTempUnit, speedUnit, setSpeedUnit } = useWeather();

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const [emergencyAlertsEnabled, setEmergencyAlertsEnabled] = useState(true);
  const [wittyToastsEnabled, setWittyToastsEnabled] = useState(areToastsEnabled());

  const handleToggleWittyToasts = () => {
    const nextVal = !wittyToastsEnabled;
    setWittyToastsEnabled(nextVal);
    setToastsEnabled(nextVal);
  };

  if (!user) {
    return (
      <div className="text-center py-16 space-y-4">
        <User className="w-16 h-16 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sign In to WeatherGPT</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Sign in to sync your personalized Weather DNA, emergency contact circle, and custom location advisories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-mono tracking-tight">
          PROFILE & RISK INTELLIGENCE PREFERENCES
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Manage your location alerts, emergency contacts, language, and AI assistant settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4 text-center">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-20 h-20 rounded-full mx-auto border-2 border-cyan-400 shadow-xl object-cover"
            />
            <div>
              <h2 className="text-lg font-black text-white font-mono">{user.name}</h2>
              <p className="text-xs text-slate-400">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-[11px] font-bold text-cyan-300">
                <MapPin className="w-3 h-3" />
                <span>{user.primaryCity}, AP, India</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-red-400 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Preferences & Settings */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 md:col-span-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-3">
            WEATHER & SYSTEM SETTINGS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Temp Unit */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">Temperature Scale</span>
                <span className="text-[10px] text-slate-500">Celsius / Fahrenheit</span>
              </div>
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 font-mono">
                <button
                  onClick={() => setTempUnit('C')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${tempUnit === 'C' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
                >
                  °C
                </button>
                <button
                  onClick={() => setTempUnit('F')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${tempUnit === 'F' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
                >
                  °F
                </button>
              </div>
            </div>

            {/* Speed Unit */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">Wind Velocity Unit</span>
                <span className="text-[10px] text-slate-500">km/h or mph</span>
              </div>
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 font-mono">
                <button
                  onClick={() => setSpeedUnit('kmh')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${speedUnit === 'kmh' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
                >
                  km/h
                </button>
                <button
                  onClick={() => setSpeedUnit('mph')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${speedUnit === 'mph' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
                >
                  mph
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between sm:col-span-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="font-bold text-slate-200 block">System Language</span>
                  <span className="text-[10px] text-slate-500">Multilingual support (8 languages)</span>
                </div>
              </div>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-xl font-medium focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Assistant Toggle */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-200">N.O.V.A Voice Feedback</span>
              </div>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${voiceEnabled ? 'bg-cyan-500' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${voiceEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            {/* Emergency Alerts Toggle */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-400" />
                <span className="font-bold text-slate-200">Disaster Push Alerts</span>
              </div>
              <button
                onClick={() => setEmergencyAlertsEnabled(!emergencyAlertsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${emergencyAlertsEnabled ? 'bg-red-600' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${emergencyAlertsEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            {/* Creative Weather Pop-ups Toggle */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between sm:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-200 block">Creative Weather Pop-ups</span>
                  <span className="text-[10px] text-slate-500">
                    Playful, real-time weather toasts & witty commentary based on live conditions
                  </span>
                </div>
              </div>
              <button
                onClick={handleToggleWittyToasts}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${wittyToastsEnabled ? 'bg-amber-500' : 'bg-slate-800'}`}
                aria-label="Toggle Creative Weather Pop-ups"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${wittyToastsEnabled ? 'right-1' : 'left-1'}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

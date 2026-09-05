import React, { useState } from 'react';
import { AlertTriangle, Bell, ChevronDown, Globe, MapPin, Moon, ShieldAlert, Sparkles, Sun, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWeather } from '../../contexts/WeatherContext';
import { LocationPicker } from './LocationPicker';
import { LANGUAGES } from '../../services/i18nService';
import type { SupportedLanguage } from '../../services/i18nService';
import type { SpecializedMode } from '../../types/specialized';

interface HeaderProps {
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const {
    appMode,
    specializedMode,
    setSpecializedMode,
    tempUnit,
    setTempUnit,
    themeMode,
    setThemeMode,
    currentLanguage,
    setLanguage
  } = useWeather();
  const { user, setIsAuthModalOpen } = useAuth();

  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

  const isDisaster = appMode === 'DISASTER';
  const isRisk = appMode === 'RISK';

  const specializedModesList: { mode: SpecializedMode; label: string; icon: string }[] = [
    { mode: 'STANDARD', label: 'Standard View', icon: '☁️' },
    { mode: 'FARMER', label: 'Farmer Mode', icon: '🌾' },
    { mode: 'AVIATION', label: 'Aviation Mode', icon: '✈️' },
    { mode: 'MARINE', label: 'Marine Mode', icon: '⚓' },
    { mode: 'SMART_CITY', label: 'Smart City Mode', icon: '🏙️' }
  ];

  const getHeaderBgClass = () => {
    if (isDisaster) return 'bg-red-950/90 border-b border-red-800/80 shadow-lg shadow-red-950/40';
    if (isRisk) return 'bg-slate-950/90 border-b border-amber-500/50 shadow-lg shadow-amber-950/30';
    return 'bg-slate-900/60 border-b border-slate-800/80';
  };

  const getLogoAccentClass = () => {
    if (isDisaster) return 'text-red-400';
    if (isRisk) return 'text-amber-400';
    return 'text-cyan-400';
  };

  return (
    <header className={`w-full transition-all duration-300 ${getHeaderBgClass()} backdrop-blur-xl sticky top-0 z-40`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl flex items-center justify-center transition-all ${
            isDisaster
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/50 animate-pulse'
              : isRisk
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40 animate-pulse'
              : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
          }`}>
            {isDisaster ? (
              <ShieldAlert className="w-5 h-5" />
            ) : isRisk ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-mono">
                WEATHER<span className={getLogoAccentClass()}>GPT</span>
              </span>
              {isDisaster && (
                <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  RESCUE MODE ACTIVE
                </span>
              )}
              {isRisk && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  RISK ACTIVE
                </span>
              )}
              {appMode === 'NORMAL' && (
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  NORMAL MODE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Intelligence that protects.
            </p>
          </div>
        </div>

        {/* Center: Location & Specialized Mode Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LocationPicker />

          <div className="relative hidden md:block">
            <button
              onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-xs sm:text-sm text-slate-200 transition-all font-medium magnetic-btn"
            >
              <span>{specializedModesList.find((m) => m.mode === specializedMode)?.icon}</span>
              <span>{specializedModesList.find((m) => m.mode === specializedMode)?.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isModeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 text-xs">
                {specializedModesList.map((m) => (
                  <button
                    key={m.mode}
                    onClick={() => {
                      setSpecializedMode(m.mode);
                      setIsModeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-800/80 transition-colors ${
                      specializedMode === m.mode
                        ? 'text-cyan-400 font-semibold bg-cyan-950/30'
                        : 'text-slate-300'
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Theme Toggle, °C, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Segmented Light / Dark Mode Switch */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setThemeMode('light')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all magnetic-btn ${
                themeMode === 'light'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Light</span>
            </button>

            <button
              onClick={() => setThemeMode('dark')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all magnetic-btn ${
                themeMode === 'dark'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dark</span>
            </button>
          </div>

          {/* °C / °F Toggle */}
          <button
            onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-bold text-slate-300 hover:text-white transition-all magnetic-btn"
          >
            °{tempUnit}
          </button>

          {/* Multilingual Selector Dropdown */}
          <div className="relative">
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-slate-200 py-1.5 pl-2.5 pr-7 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
              title="Change Application Language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.nativeName} ({lang.code.toUpperCase()})
                </option>
              ))}
            </select>
            <Globe className="w-3.5 h-3.5 text-cyan-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all relative magnetic-btn"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
              isDisaster ? 'bg-red-500 animate-ping' : 'bg-cyan-400'
            }`} />
          </button>

          {/* User Profile */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1 rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 border border-cyan-500/30 text-xs font-semibold text-cyan-200 transition-all magnetic-btn"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-5 h-5 rounded-full object-cover border border-cyan-400/50"
              />
            ) : (
              <User className="w-4 h-4 text-cyan-400" />
            )}
            <span className="hidden sm:inline max-w-[120px] truncate">{user ? user.name : 'Sign In'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

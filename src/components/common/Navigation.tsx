import React from 'react';
import { BarChart3, Bot, Compass, Home, Map, Shield, ShieldAlert, User, Users } from 'lucide-react';
import { useNova } from '../../contexts/NovaContext';
import { useWeather } from '../../contexts/WeatherContext';

export type NavTab = 'HOME' | 'MAP' | 'INSIGHTS' | 'SAFETY' | 'PROFILE' | 'SHELTERS' | 'FAMILY';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { appMode } = useWeather();
  const { setIsOpen: setIsNovaOpen, orbState } = useNova();
  const isDisaster = appMode === 'DISASTER';

  const desktopTabs: { id: NavTab; label: string; icon: React.ReactNode }[] = isDisaster
    ? [
        { id: 'HOME', label: 'EMERGENCY', icon: <ShieldAlert className="w-4 h-4 text-red-400" /> },
        { id: 'SAFETY', label: 'SAFETY INSTRUCTIONS', icon: <Shield className="w-4 h-4" /> },
        { id: 'MAP', label: 'HAZARD MAP', icon: <Map className="w-4 h-4" /> },
        { id: 'SHELTERS', label: 'SAFE SHELTERS', icon: <Compass className="w-4 h-4" /> },
        { id: 'FAMILY', label: 'FAMILY CIRCLE', icon: <Users className="w-4 h-4" /> },
        { id: 'PROFILE', label: 'PROFILE', icon: <User className="w-4 h-4" /> }
      ]
    : [
        { id: 'HOME', label: 'HOME', icon: <Home className="w-4 h-4" /> },
        { id: 'MAP', label: 'MAP', icon: <Map className="w-4 h-4" /> },
        { id: 'INSIGHTS', label: 'INSIGHTS', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'SAFETY', label: 'SAFETY', icon: <Shield className="w-4 h-4" /> },
        { id: 'PROFILE', label: 'PROFILE', icon: <User className="w-4 h-4" /> }
      ];

  const mobileTabs: { id: NavTab; label: string; icon: React.ReactNode }[] = isDisaster
    ? [
        { id: 'HOME', label: 'Emergency', icon: <ShieldAlert className="w-5 h-5 text-red-400" /> },
        { id: 'MAP', label: 'Map', icon: <Map className="w-5 h-5" /> },
        { id: 'SAFETY', label: 'Safety', icon: <Shield className="w-5 h-5" /> },
        { id: 'PROFILE', label: 'Profile', icon: <User className="w-5 h-5" /> }
      ]
    : [
        { id: 'HOME', label: 'Home', icon: <Home className="w-5 h-5" /> },
        { id: 'MAP', label: 'Map', icon: <Map className="w-5 h-5" /> },
        { id: 'SAFETY', label: 'Safety', icon: <Shield className="w-5 h-5" /> },
        { id: 'PROFILE', label: 'Profile', icon: <User className="w-5 h-5" /> }
      ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`hidden md:block w-full border-b transition-colors duration-300 ${isDisaster ? 'bg-red-950/40 border-red-900/40' : 'bg-slate-900/40 border-slate-800/60'} backdrop-blur-md`}>
        <div className="w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {desktopTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold tracking-wider transition-all border-b-2 ${
                  activeTab === tab.id
                    ? isDisaster
                      ? 'border-red-500 text-red-300 bg-red-900/30 font-bold'
                      : 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Signature N.O.V.A Navigation Highlight */}
          <button
            onClick={() => setIsNovaOpen(true)}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isDisaster
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-red-600/40 animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-cyan-500/30 hover:brightness-110'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${orbState === 'ALERT' ? 'bg-red-400 animate-ping' : 'bg-cyan-200 animate-pulse'}`} />
            <Bot className="w-4 h-4" />
            <span>N.O.V.A. AI ASSISTANT</span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t ${isDisaster ? 'bg-red-950/95 border-red-800' : 'bg-slate-950/95 border-slate-800'} backdrop-blur-xl px-4 py-2 flex items-center justify-around`}>
        {mobileTabs.slice(0, 2).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-all ${
              activeTab === tab.id ? (isDisaster ? 'text-red-400 font-bold' : 'text-cyan-400 font-bold') : 'text-slate-400'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}

        {/* Center Floating N.O.V.A Mobile Trigger */}
        <button
          onClick={() => setIsNovaOpen(true)}
          className={`-mt-6 p-3 rounded-full shadow-xl flex items-center justify-center transition-all ${
            isDisaster
              ? 'bg-gradient-to-tr from-red-600 to-amber-500 text-white ring-4 ring-red-950 shadow-red-600/60 animate-bounce'
              : 'bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 text-white ring-4 ring-slate-950 shadow-cyan-500/50'
          }`}
          aria-label="Ask N.O.V.A."
        >
          <Bot className="w-6 h-6" />
        </button>

        {mobileTabs.slice(2).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-all ${
              activeTab === tab.id ? (isDisaster ? 'text-red-400 font-bold' : 'text-cyan-400 font-bold') : 'text-slate-400'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

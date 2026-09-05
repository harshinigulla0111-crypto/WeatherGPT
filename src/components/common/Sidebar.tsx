import React from 'react';
import { BarChart3, Bot, Compass, Home, Map, Settings, Shield, ShieldAlert, User, Users } from 'lucide-react';
import { useNova } from '../../contexts/NovaContext';
import { useWeather } from '../../contexts/WeatherContext';
import type { NavTab } from './Navigation';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { appMode, t } = useWeather();
  const { setIsOpen: setIsNovaOpen, orbState } = useNova();
  const isDisaster = appMode === 'DISASTER';

  const sidebarItems: { id: NavTab; label: string; icon: React.ReactNode }[] = isDisaster
    ? [
        { id: 'HOME', label: t('emergency'), icon: <ShieldAlert className="w-5 h-5 text-red-500" /> },
        { id: 'SAFETY', label: t('safetyProtocols'), icon: <Shield className="w-5 h-5" /> },
        { id: 'MAP', label: t('hazardMap'), icon: <Map className="w-5 h-5" /> },
        { id: 'SHELTERS', label: t('safeShelters'), icon: <Compass className="w-5 h-5" /> },
        { id: 'FAMILY', label: t('familyCircle'), icon: <Users className="w-5 h-5" /> },
        { id: 'PROFILE', label: t('settings'), icon: <Settings className="w-5 h-5" /> }
      ]
    : [
        { id: 'HOME', label: t('home'), icon: <Home className="w-5 h-5" /> },
        { id: 'MAP', label: t('map'), icon: <Map className="w-5 h-5" /> },
        { id: 'INSIGHTS', label: t('insights'), icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'SAFETY', label: t('safety'), icon: <Shield className="w-5 h-5" /> },
        { id: 'FAMILY', label: t('familyCircle'), icon: <Users className="w-5 h-5" /> },
        { id: 'PROFILE', label: t('profile'), icon: <User className="w-5 h-5" /> }
      ];

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 sidebar-nav border-r border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-4 justify-between h-[calc(100vh-61px)] sticky top-[61px] z-30 transition-colors">
      <div className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-2 font-mono">
            Navigation
          </span>
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all proximity-card ${
                  isActive
                    ? isDisaster
                      ? 'bg-red-500/10 text-red-600 border border-red-500/30 font-bold'
                      : 'bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className={isActive ? (isDisaster ? 'text-red-500' : 'text-blue-600 dark:text-cyan-400') : 'text-slate-400'}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* N.O.V.A Sidebar Quick Trigger */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-500/30 shadow-lg space-y-2 text-xs proximity-card">
        <div className="flex items-center gap-2 font-bold text-cyan-300">
          <div className={`w-2 h-2 rounded-full ${orbState === 'ALERT' ? 'bg-red-400 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
          <Bot className="w-4 h-4" />
          <span>N.O.V.A. Assistant</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-snug">
          Ask questions about rain timings or travel windows.
        </p>
        <button
          onClick={() => setIsNovaOpen(true)}
          className="w-full py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] transition-colors magnetic-btn"
        >
          Ask N.O.V.A.
        </button>
      </div>
    </aside>
  );
};

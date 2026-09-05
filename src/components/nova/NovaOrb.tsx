import React from 'react';
import { Bot } from 'lucide-react';
import { useNova } from '../../contexts/NovaContext';
import { useWeather } from '../../contexts/WeatherContext';

export const NovaOrb: React.FC = () => {
  const { orbState, setIsOpen, isOpen } = useNova();
  const { appMode } = useWeather();
  const isDisaster = appMode === 'DISASTER';
  const isRisk = appMode === 'RISK';

  if (isOpen) return null; // Modal replaces orb when opened

  const getOrbClass = () => {
    if (isDisaster || orbState === 'ALERT') return 'nova-orb-alert';
    if (isRisk) return 'nova-orb-thinking';
    if (orbState === 'LISTENING') return 'nova-orb-listening';
    if (orbState === 'THINKING') return 'nova-orb-thinking';
    return 'nova-orb-normal';
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      {/* Floating Circular Assistant Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 ${getOrbClass()}`}
        aria-label="Activate N.O.V.A AI Assistant"
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-950/40 backdrop-blur-md flex items-center justify-center border border-white/20">
          <Bot className={`w-7 h-7 sm:w-8 sm:h-8 ${isDisaster ? 'text-red-200 animate-bounce' : isRisk ? 'text-amber-300' : 'text-white'}`} />
        </div>
      </button>
    </div>
  );
};

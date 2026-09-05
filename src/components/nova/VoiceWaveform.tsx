import React from 'react';

export const VoiceWaveform: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div className="flex items-center justify-center gap-1 h-8 px-4">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full bg-cyan-400 transition-all duration-300 ${
            isActive ? 'animate-pulse' : 'h-2 bg-slate-600'
          }`}
          style={{
            height: isActive ? `${Math.sin(i * 0.8 + Date.now() / 100) * 14 + 16}px` : '6px',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

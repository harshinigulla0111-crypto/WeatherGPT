import React, { useEffect, useState } from 'react';
import type { AppStateMode } from '../../types/disaster';

interface DynamicWeatherBackgroundProps {
  condition: string;
  appMode?: AppStateMode;
  themeMode?: 'dark' | 'light';
  sunrise?: string;
  sunset?: string;
}

function parseTimeStringToHours(timeStr?: string): number {
  if (!timeStr) return 6;
  const cleaned = timeStr.trim().toUpperCase();
  const isPM = cleaned.includes('PM');
  const isAM = cleaned.includes('AM');

  const match = cleaned.match(/(\d+):(\d+)/);
  if (!match) return isPM ? 18.5 : 6.0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours + minutes / 60;
}

function computeTimePhase(sunriseStr?: string, sunsetStr?: string): 'DAY' | 'EVENING' | 'NIGHT' {
  const now = new Date();
  const currentHours = now.getHours() + now.getMinutes() / 60;

  const sunriseHours = sunriseStr ? parseTimeStringToHours(sunriseStr) : 6.0;
  const sunsetHours = sunsetStr ? parseTimeStringToHours(sunsetStr) : 18.5;

  const eveningStart = sunsetHours - 1.0;
  const eveningEnd = sunsetHours + 0.5;

  if (currentHours >= eveningStart && currentHours <= eveningEnd) {
    return 'EVENING';
  }

  if (currentHours > eveningEnd || currentHours < sunriseHours) {
    return 'NIGHT';
  }

  return 'DAY';
}

export const DynamicWeatherBackground: React.FC<DynamicWeatherBackgroundProps> = ({
  condition,
  appMode = 'NORMAL',
  themeMode = 'dark',
  sunrise,
  sunset
}) => {
  const isDisaster = appMode === 'DISASTER';
  const isRisk = appMode === 'RISK';

  // Periodic refresh tick (every 60 seconds)
  const [, setTick] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timePhase = computeTimePhase(sunrise, sunset);
  const condLower = (condition || '').toLowerCase();

  let weatherCategory: 'CLEAR' | 'CLOUDS' | 'RAIN' | 'THUNDERSTORM' | 'FOG' = 'CLOUDS';

  if (condLower.includes('thunder') || condLower.includes('storm')) {
    weatherCategory = 'THUNDERSTORM';
  } else if (condLower.includes('rain') || condLower.includes('drizzle') || condLower.includes('shower')) {
    weatherCategory = 'RAIN';
  } else if (condLower.includes('fog') || condLower.includes('mist') || condLower.includes('haze')) {
    weatherCategory = 'FOG';
  } else if (condLower.includes('sunny') || condLower.includes('clear')) {
    weatherCategory = 'CLEAR';
  } else {
    weatherCategory = 'CLOUDS';
  }

  if (isDisaster && weatherCategory !== 'THUNDERSTORM') {
    weatherCategory = 'THUNDERSTORM';
  } else if (isRisk && weatherCategory === 'CLEAR') {
    weatherCategory = 'RAIN';
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 rounded-3xl">
      {/* 1. EVENING / SUNSET PHASE */}
      {timePhase === 'EVENING' && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/40 via-rose-950/80 to-slate-950 transition-all duration-1000">
          {/* Low Horizon Sunset Disc */}
          <div className="absolute bottom-4 right-16 w-36 h-36 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 shadow-[0_0_90px_rgba(244,63,94,0.8)] opacity-90 animate-sun-glow" />
          <div className="absolute bottom-0 right-0 w-full h-40 bg-gradient-to-t from-rose-950/60 to-transparent" />
          {/* Soft Evening Clouds */}
          <div className="absolute top-4 left-4 w-96 opacity-40 animate-float-cloud">
            <svg viewBox="0 0 200 100" fill="currentColor" className="text-amber-200/40 w-full">
              <path d="M 20 60 a 25 25 0 0 1 45 -10 a 35 35 0 0 1 60 0 a 25 25 0 0 1 45 10 a 20 20 0 0 1 -10 35 h -140 a 20 20 0 0 1 0 -35 Z" />
            </svg>
          </div>
          {weatherCategory === 'RAIN' && (
            <div className="absolute inset-0 overflow-hidden opacity-60">
              {[15, 35, 55, 75, 90].map((pos, idx) => (
                <div
                  key={idx}
                  className="absolute w-[1.5px] h-16 bg-gradient-to-b from-transparent via-amber-200/60 to-transparent animate-drop-rain"
                  style={{
                    left: `${pos}%`,
                    animationDuration: `${1 + (idx % 3) * 0.3}s`,
                    animationDelay: `${(idx % 4) * 0.25}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. NIGHT PHASE */}
      {timePhase === 'NIGHT' && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/80 to-slate-950 transition-all duration-1000">
          {/* Moon for Clear or Light Clouds */}
          {weatherCategory !== 'THUNDERSTORM' && (
            <div className="absolute top-6 right-12 w-20 h-20 rounded-full bg-slate-100 shadow-[0_0_60px_rgba(255,255,255,0.7)] opacity-90">
              <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-slate-950/80" />
            </div>
          )}

          {/* Twinkling Stars for Clear Night */}
          {weatherCategory === 'CLEAR' && (
            <div className="absolute inset-0">
              {[
                { top: '15%', left: '10%' },
                { top: '25%', left: '35%' },
                { top: '10%', left: '60%' },
                { top: '30%', left: '80%' },
                { top: '45%', left: '20%' },
                { top: '50%', left: '70%' },
                { top: '18%', left: '85%' }
              ].map((star, idx) => (
                <div
                  key={idx}
                  className="absolute w-1.5 h-1.5 rounded-full bg-white animate-star-twinkle shadow-[0_0_8px_white]"
                  style={{
                    top: star.top,
                    left: star.left,
                    animationDelay: `${idx * 0.4}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Night Clouds */}
          {(weatherCategory === 'CLOUDS' || weatherCategory === 'RAIN' || weatherCategory === 'THUNDERSTORM') && (
            <div className="absolute top-2 -left-10 w-full opacity-50 animate-float-cloud">
              <svg viewBox="0 0 400 120" fill="currentColor" className="text-slate-900/90 w-full">
                <path d="M 0 80 Q 60 20 140 50 Q 220 10 300 40 Q 360 10 400 60 L 400 120 L 0 120 Z" />
              </svg>
            </div>
          )}

          {/* Night Rain */}
          {(weatherCategory === 'RAIN' || weatherCategory === 'THUNDERSTORM') && (
            <div className="absolute inset-0 overflow-hidden opacity-70">
              {[10, 25, 40, 55, 70, 85, 95].map((pos, idx) => (
                <div
                  key={idx}
                  className="absolute w-[1.5px] h-18 bg-gradient-to-b from-transparent via-cyan-300/70 to-transparent animate-drop-rain"
                  style={{
                    left: `${pos}%`,
                    animationDuration: `${0.8 + (idx % 3) * 0.2}s`,
                    animationDelay: `${(idx % 4) * 0.2}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Night Lightning Flash */}
          {weatherCategory === 'THUNDERSTORM' && (
            <>
              <div className="absolute inset-0 bg-cyan-100/20 animate-lightning-flash mix-blend-screen" />
              <div className="absolute inset-0 bg-indigo-200/15 animate-lightning-flash mix-blend-screen" style={{ animationDelay: '2.8s' }} />
            </>
          )}
        </div>
      )}

      {/* 3. DAY PHASE */}
      {timePhase === 'DAY' && (
        <>
          {weatherCategory === 'CLEAR' && (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 via-sky-800/80 to-slate-950 transition-all duration-1000">
              <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-amber-400/30 blur-3xl animate-sun-glow" />
              <div className="absolute top-4 right-12 w-28 h-28 rounded-full bg-gradient-to-tr from-amber-300 to-amber-100 shadow-[0_0_80px_rgba(251,191,36,0.8)] opacity-90 animate-sun-glow" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 via-transparent to-transparent rotate-12 blur-md" />
            </div>
          )}

          {weatherCategory === 'CLOUDS' && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-sky-900/80 to-blue-950 transition-all duration-1000">
              <div className="absolute -top-12 right-1/4 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl animate-sun-glow" />
              <div className="absolute top-2 -left-10 w-96 opacity-40 animate-float-cloud">
                <svg viewBox="0 0 200 100" fill="currentColor" className="text-sky-200/50 w-full">
                  <path d="M 20 60 a 25 25 0 0 1 45 -10 a 35 35 0 0 1 60 0 a 25 25 0 0 1 45 10 a 20 20 0 0 1 -10 35 h -140 a 20 20 0 0 1 0 -35 Z" />
                </svg>
              </div>
            </div>
          )}

          {weatherCategory === 'RAIN' && (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/90 to-cyan-950/90 transition-all duration-1000">
              <div className="absolute -top-10 left-0 right-0 h-40 bg-slate-800/40 blur-xl" />
              <div className="absolute inset-0 overflow-hidden opacity-60">
                {[10, 25, 40, 55, 70, 85].map((pos, idx) => (
                  <div
                    key={idx}
                    className="absolute w-[1.5px] h-16 bg-gradient-to-b from-transparent via-cyan-300/60 to-transparent animate-drop-rain"
                    style={{
                      left: `${pos}%`,
                      animationDuration: `${1 + (idx % 3) * 0.3}s`,
                      animationDelay: `${(idx % 4) * 0.25}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {weatherCategory === 'THUNDERSTORM' && (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/90 transition-all duration-1000">
              <div className="absolute inset-0 bg-cyan-100/20 animate-lightning-flash mix-blend-screen" />
              <div className="absolute inset-0 opacity-80 overflow-hidden">
                {[12, 24, 36, 48, 60, 72, 84].map((pos, idx) => (
                  <div
                    key={idx}
                    className="absolute w-[2px] h-24 bg-gradient-to-b from-transparent via-blue-200 to-transparent animate-drop-rain"
                    style={{
                      left: `${pos}%`,
                      animationDuration: `${0.6 + (idx % 3) * 0.15}s`,
                      animationDelay: `${(idx % 4) * 0.2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {weatherCategory === 'FOG' && (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950 transition-all duration-1000">
              <div className="absolute inset-0 bg-slate-400/15 backdrop-blur-md animate-fog-drift" />
            </div>
          )}
        </>
      )}

      {/* 4. Global Mode Overlay Wash */}
      {isRisk && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-transparent mix-blend-color-dodge pointer-events-none" />
      )}
      {isDisaster && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/50 via-red-900/30 to-transparent mix-blend-color-dodge pointer-events-none" />
      )}

      {/* 5. Dark Vignette Layer for 100% Crisp Text Readability */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${
        themeMode === 'light'
          ? 'bg-gradient-to-t from-slate-950/90 via-slate-950/65 to-slate-950/40 backdrop-blur-[2px]'
          : 'bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-950/45 backdrop-blur-[1px]'
      }`} />
    </div>
  );
};

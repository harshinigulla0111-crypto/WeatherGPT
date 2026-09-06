import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { AppStateMode } from '../../types/disaster';
import { useWeather } from '../../contexts/WeatherContext';

interface DynamicWeatherBackgroundProps {
  condition: string;
  temperature?: number;
  appMode?: AppStateMode;
  themeMode?: 'dark' | 'light';
  sunrise?: string;
  sunset?: string;
}

export type TimeOfDayPhase = 'MORNING' | 'MIDDAY' | 'EVENING' | 'NIGHT';
export type WeatherSceneType = 'CLEAR' | 'CLOUDY' | 'RAIN' | 'STORM' | 'FOG';

/**
 * Parses "6:02 AM", "06:21 PM", "18:30", etc. into decimal hours (0.0 to 24.0)
 */
function parseTimeToDecimalHours(timeStr?: string, defaultHours: number = 6.0): number {
  if (!timeStr) return defaultHours;
  const cleaned = timeStr.trim().toUpperCase();
  const isPM = cleaned.includes('PM');
  const isAM = cleaned.includes('AM');

  const match = cleaned.match(/(\d+):(\d+)/);
  if (!match) return defaultHours;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours + minutes / 60;
}

/**
 * Determines exact time phase based on user's location's real sunrise & sunset
 */
export function calculateTimePhase(sunriseStr?: string, sunsetStr?: string): TimeOfDayPhase {
  const now = new Date();
  const currentHours = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

  const sunriseHours = parseTimeToDecimalHours(sunriseStr, 6.0);
  const sunsetHours = parseTimeToDecimalHours(sunsetStr, 18.5);

  // Morning: from 30 mins before sunrise until 2.5 hours after sunrise
  const morningStart = sunriseHours - 0.5;
  const morningEnd = sunriseHours + 2.5;

  // Evening: from 1.75 hours before sunset until 45 mins after sunset
  const eveningStart = sunsetHours - 1.75;
  const eveningEnd = sunsetHours + 0.75;

  if (currentHours >= morningStart && currentHours < morningEnd) {
    return 'MORNING';
  }
  if (currentHours >= eveningStart && currentHours < eveningEnd) {
    return 'EVENING';
  }
  if (currentHours >= morningEnd && currentHours < eveningStart) {
    return 'MIDDAY';
  }
  return 'NIGHT';
}

/**
 * Maps live weather condition string to standardized scene category
 */
export function categorizeCondition(condition: string, appMode: AppStateMode): WeatherSceneType {
  if (appMode === 'DISASTER') return 'STORM';
  if (appMode === 'RISK') return 'STORM';

  const cond = (condition || '').toLowerCase();
  if (cond.includes('thunder') || cond.includes('storm') || cond.includes('tornado') || cond.includes('squall')) {
    return 'STORM';
  }
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower') || cond.includes('precip')) {
    return 'RAIN';
  }
  if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze') || cond.includes('smoke') || cond.includes('dust')) {
    return 'FOG';
  }
  if (cond.includes('cloud') || cond.includes('overcast')) {
    return 'CLOUDY';
  }
  return 'CLEAR';
}

export const DynamicWeatherBackground: React.FC<DynamicWeatherBackgroundProps> = ({
  condition,
  appMode = 'NORMAL',
  sunrise,
  sunset
}) => {
  const { refetchWeather } = useWeather();
  const [timePhase, setTimePhase] = useState<TimeOfDayPhase>(() => calculateTimePhase(sunrise, sunset));

  // 1. Live minute-by-minute clock tick to advance time-of-day naturally
  useEffect(() => {
    const updatePhase = () => {
      setTimePhase(calculateTimePhase(sunrise, sunset));
    };

    updatePhase();
    const interval = setInterval(updatePhase, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [sunrise, sunset]);

  // 2. Periodic background weather re-fetch (every 5 minutes) for live transitions
  useEffect(() => {
    const autoRefreshTimer = setInterval(() => {
      refetchWeather().catch((err) => console.warn('[DynamicWeatherBackground] Periodic sync:', err));
    }, 5 * 60 * 1000);

    return () => clearInterval(autoRefreshTimer);
  }, [refetchWeather]);

  const weatherCategory = useMemo(() => categorizeCondition(condition, appMode), [condition, appMode]);

  // Generate unique scene key for smooth cross-fading
  const sceneKey = `${timePhase}_${weatherCategory}_${appMode}`;

  // Cross-fading buffer state
  const [currentSceneKey, setCurrentSceneKey] = useState<string>(sceneKey);
  const [prevSceneKey, setPrevSceneKey] = useState<string | null>(null);
  const [isCrossFading, setIsCrossFading] = useState<boolean>(false);

  useEffect(() => {
    if (sceneKey !== currentSceneKey) {
      setPrevSceneKey(currentSceneKey);
      setCurrentSceneKey(sceneKey);
      setIsCrossFading(true);

      const timer = setTimeout(() => {
        setIsCrossFading(false);
        setPrevSceneKey(null);
      }, 600); // 600ms smooth cross-fade transition

      return () => clearTimeout(timer);
    }
  }, [sceneKey, currentSceneKey]);

  // Stable procedural stars array for Night sky
  const stars = useMemo(() => {
    const arr = [];
    const count = 42;
    for (let i = 0; i < count; i++) {
      const top = (Math.random() * 80 + 2).toFixed(1);
      const left = (Math.random() * 96 + 2).toFixed(1);
      const size = Math.random() > 0.8 ? 2.5 : Math.random() > 0.4 ? 1.8 : 1.2;
      const delay = (Math.random() * 3.5).toFixed(2);
      const duration = (2.0 + Math.random() * 2.5).toFixed(2);
      arr.push({ top: `${top}%`, left: `${left}%`, size, delay: `${delay}s`, duration: `${duration}s` });
    }
    return arr;
  }, []);

  // Stable procedural rain drops array
  const raindrops = useMemo(() => {
    const arr = [];
    const count = weatherCategory === 'STORM' ? 48 : 32;
    for (let i = 0; i < count; i++) {
      const left = (Math.random() * 100).toFixed(1);
      const duration = (0.55 + Math.random() * 0.4).toFixed(2);
      const delay = (Math.random() * 1.5).toFixed(2);
      const height = Math.floor(Math.random() * 28 + 20);
      const opacity = (Math.random() * 0.4 + 0.45).toFixed(2);
      arr.push({ left: `${left}%`, duration: `${duration}s`, delay: `${delay}s`, height: `${height}px`, opacity });
    }
    return arr;
  }, [weatherCategory]);

  /**
   * Renders the complete atmospheric scene (Sky gradient base + layered weather effects)
   */
  const renderScene = (phase: TimeOfDayPhase, category: WeatherSceneType, mode: AppStateMode) => {
    // 1. Time-of-Day Base Sky Gradients
    let skyGradientClass = '';
    switch (phase) {
      case 'MORNING':
        // Soft pastel morning sky: gentle rose, peach, lavender, and warm golden low horizon
        skyGradientClass =
          'bg-gradient-to-b from-[#2a375e] via-[#6e4b6d] via-[#b86161] via-[#e58356] to-[#f6b26b]';
        break;
      case 'MIDDAY':
        // Vivid, bright azure midday sky
        skyGradientClass =
          'bg-gradient-to-b from-[#093e79] via-[#125ba3] via-[#247fd7] via-[#4fa1f7] to-[#7ec0fb]';
        break;
      case 'EVENING':
        // Warm sunset: deep violet into crimson, rich tangerine orange, and burning golden horizon
        skyGradientClass =
          'bg-gradient-to-b from-[#18113c] via-[#431475] via-[#8c1d58] via-[#d64a27] to-[#f59e0b]';
        break;
      case 'NIGHT':
      default:
        // Deep cosmic night: obsidian navy, midnight indigo, deep sapphire
        skyGradientClass =
          'bg-gradient-to-b from-[#030712] via-[#081329] via-[#0c1e40] to-[#122854]';
        break;
    }

    // Overcast / Storm adjustments to sky tone
    if (category === 'STORM' || mode === 'DISASTER') {
      skyGradientClass =
        'bg-gradient-to-b from-[#050811] via-[#111624] via-[#1c2235] to-[#252733]';
    } else if (category === 'CLOUDY' || category === 'RAIN') {
      if (phase === 'NIGHT') {
        skyGradientClass =
          'bg-gradient-to-b from-[#02050c] via-[#07101f] via-[#0f1b2e] to-[#1a283c]';
      } else {
        skyGradientClass =
          'bg-gradient-to-b from-[#1e293b] via-[#334155] via-[#475569] to-[#64748b]';
      }
    }

    return (
      <div className={`absolute inset-0 w-full h-full ${skyGradientClass}`}>
        {/* ==============================================================
            A. CELESTIAL BODIES (SUN / MOON / STARS)
           ============================================================== */}

        {/* 1. MORNING SUN (Warm low light on right horizon) */}
        {phase === 'MORNING' && category !== 'STORM' && (
          <div className="absolute -bottom-10 right-10 sm:right-24 w-72 h-72 pointer-events-none">
            {/* Diffuse warm horizon glow */}
            <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-3xl animate-pulse" />
            <div className="absolute inset-10 rounded-full bg-orange-300/35 blur-2xl" />
            {/* Rising Sun Disc */}
            <div
              className="absolute top-16 left-16 w-36 h-36 rounded-full bg-gradient-to-tr from-amber-200 via-amber-100 to-white shadow-[0_0_80px_rgba(251,191,36,0.9)]"
              style={{ animation: 'sunCorePulse 6s ease-in-out infinite' }}
            />
          </div>
        )}

        {/* 2. MIDDAY SUN (Brilliant high glowing sun with rotating corona) */}
        {phase === 'MIDDAY' && category !== 'STORM' && (
          <div className="absolute -top-12 -right-12 sm:right-10 w-80 h-80 pointer-events-none">
            {/* Ambient solar lens flare */}
            <div className="absolute -inset-10 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="absolute inset-0 rounded-full bg-amber-300/30 blur-2xl" />

            {/* Rotating SVG Corona Rays */}
            <div
              className="absolute inset-4 opacity-75"
              style={{ animation: 'sunCoronaSpin 45s linear infinite' }}
            >
              <svg viewBox="0 0 200 200" className="w-full h-full text-amber-100/60">
                <g stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.8">
                  <line x1="100" y1="100" x2="100" y2="10" />
                  <line x1="100" y1="100" x2="100" y2="190" />
                  <line x1="100" y1="100" x2="10" y2="100" />
                  <line x1="100" y1="100" x2="190" y2="100" />
                  <line x1="100" y1="100" x2="36" y2="36" />
                  <line x1="100" y1="100" x2="164" y2="164" />
                  <line x1="100" y1="100" x2="164" y2="36" />
                  <line x1="100" y1="100" x2="36" y2="164" />
                </g>
              </svg>
            </div>

            {/* Glowing Sun Core */}
            <div
              className="absolute inset-16 rounded-full bg-gradient-to-tr from-amber-200 via-amber-50 to-white shadow-[0_0_100px_rgba(255,255,255,1)]"
              style={{ animation: 'sunCorePulse 5s ease-in-out infinite' }}
            />
          </div>
        )}

        {/* 3. EVENING SUN (Rich golden-orange low sun near horizon) */}
        {phase === 'EVENING' && category !== 'STORM' && (
          <div className="absolute -bottom-8 right-6 sm:right-20 w-80 h-80 pointer-events-none">
            {/* Warm sunset horizon glow band */}
            <div className="absolute inset-0 rounded-full bg-orange-500/35 blur-3xl" />
            <div className="absolute inset-12 rounded-full bg-amber-400/40 blur-2xl" />

            {/* Sinking Sun Disc */}
            <div
              className="absolute top-14 left-14 w-40 h-40 rounded-full bg-gradient-to-tr from-orange-400 via-amber-300 to-amber-100 shadow-[0_0_90px_rgba(249,115,22,0.9)]"
              style={{ animation: 'sunCorePulse 7s ease-in-out infinite' }}
            />
          </div>
        )}

        {/* 4. NIGHT MOON & TWINKLING STARS */}
        {phase === 'NIGHT' && category !== 'STORM' && (
          <>
            {/* Twinkling Star Field */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {stars.map((star, idx) => (
                <div
                  key={idx}
                  className="absolute rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.9)]"
                  style={{
                    top: star.top,
                    left: star.left,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    animation: `starTwinkleGlow ${star.duration} ease-in-out infinite`,
                    animationDelay: star.delay
                  }}
                />
              ))}

              {/* Occasional Meteor / Shooting Star Streak */}
              <div
                className="absolute top-8 left-16 w-36 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-200 to-white -rotate-25 pointer-events-none"
                style={{ animation: 'shootingStarGlide 9s ease-in-out infinite', animationDelay: '3.5s' }}
              />
            </div>

            {/* Glowing Moon on Top Right */}
            <div className="absolute top-5 right-6 sm:right-16 w-32 h-32 pointer-events-none">
              {/* Moon Aura Glow */}
              <div className="absolute inset-0 rounded-full bg-sky-200/20 blur-2xl" />

              {/* SVG Glowing Waxing Moon */}
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 m-auto relative"
                style={{ animation: 'moonGlowBreathe 4s ease-in-out infinite' }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_16px_rgba(224,242,254,0.85)]">
                  {/* Outer Lunar Disc */}
                  <circle cx="50" cy="50" r="40" fill="url(#moonGrad)" />
                  {/* Subtle Craters */}
                  <circle cx="42" cy="40" r="6" fill="#cbd5e1" opacity="0.35" />
                  <circle cx="58" cy="48" r="8" fill="#94a3b8" opacity="0.3" />
                  <circle cx="46" cy="62" r="5" fill="#94a3b8" opacity="0.3" />
                  {/* Shadow Crescent Mask */}
                  <path
                    d="M 50 10 A 40 40 0 0 0 50 90 A 30 40 0 0 1 50 10 Z"
                    fill="#0a1224"
                    opacity="0.35"
                  />
                  <defs>
                    <radialGradient id="moonGrad" cx="40%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="60%" stopColor="#f1f5f9" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </>
        )}

        {/* ==============================================================
            B. DRIFTING CLOUDS (CLOUDY, RAIN, STORM)
           ============================================================== */}
        {(category === 'CLOUDY' || category === 'RAIN' || category === 'STORM') && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Layer 1: Background slow dense cloud mass */}
            <div
              className="absolute top-2 w-[140%] h-48 opacity-35"
              style={{ animation: 'cloudDriftLayer1 52s linear infinite' }}
            >
              <svg viewBox="0 0 800 200" className="w-full h-full fill-slate-300">
                <path d="M 0 140 Q 80 80 170 120 Q 230 40 330 90 Q 420 20 520 80 Q 610 50 710 110 Q 770 70 800 130 L 800 200 L 0 200 Z" />
              </svg>
            </div>

            {/* Layer 2: Midground volumetric drifting clouds */}
            <div
              className="absolute top-10 w-[130%] h-44 opacity-45"
              style={{ animation: 'cloudDriftLayer2 36s linear infinite' }}
            >
              <svg viewBox="0 0 700 180" className="w-full h-full fill-slate-200">
                <path d="M 0 130 Q 70 60 160 100 Q 240 30 350 80 Q 440 20 540 75 Q 630 40 700 120 L 700 180 L 0 180 Z" />
              </svg>
            </div>

            {/* Layer 3: Foreground faster airy cloud wisps */}
            <div
              className="absolute top-16 w-[120%] h-36 opacity-30"
              style={{ animation: 'cloudDriftLayer3 24s linear infinite' }}
            >
              <svg viewBox="0 0 600 140" className="w-full h-full fill-white">
                <path d="M 0 100 Q 60 40 140 80 Q 220 20 310 70 Q 400 30 490 65 Q 560 30 600 90 L 600 140 L 0 140 Z" />
              </svg>
            </div>
          </div>
        )}

        {/* ==============================================================
            C. FALLING RAIN DROPS (RAIN & STORM)
           ============================================================== */}
        {(category === 'RAIN' || category === 'STORM') && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {raindrops.map((drop, idx) => (
              <div
                key={idx}
                className="absolute bg-gradient-to-b from-transparent via-cyan-200 to-white/90 rounded-full"
                style={{
                  left: drop.left,
                  width: category === 'STORM' ? '2px' : '1.5px',
                  height: drop.height,
                  opacity: drop.opacity,
                  animation: `liveRainDropFall ${drop.duration} linear infinite`,
                  animationDelay: drop.delay
                }}
              />
            ))}

            {/* Ground Splash Mist at base */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-cyan-400/10 to-transparent pointer-events-none" />
          </div>
        )}

        {/* ==============================================================
            D. MULTI-STAGE LIGHTNING STROBE (STORM / DISASTER / RISK)
           ============================================================== */}
        {category === 'STORM' && (
          <>
            {/* Primary Lightning Sky Strobe */}
            <div
              className="absolute inset-0 bg-cyan-100/40 mix-blend-screen pointer-events-none"
              style={{ animation: 'lightningSkyFlash 6s infinite' }}
            />
            {/* Secondary Violet Strobe with phase delay */}
            <div
              className="absolute inset-0 bg-indigo-200/30 mix-blend-screen pointer-events-none"
              style={{ animation: 'lightningSkyFlash 8s infinite', animationDelay: '3.2s' }}
            />
          </>
        )}

        {/* ==============================================================
            E. DRIFTING FOG & MIST HAZE
           ============================================================== */}
        {category === 'FOG' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute inset-x-0 top-1/4 h-48 bg-gradient-to-r from-slate-200/10 via-slate-100/25 to-slate-200/10 blur-xl"
              style={{ animation: 'fogDriftHaze 16s ease-in-out infinite' }}
            />
            <div
              className="absolute inset-x-0 bottom-6 h-40 bg-gradient-to-r from-slate-300/15 via-white/20 to-slate-300/15 blur-lg"
              style={{ animation: 'fogDriftHaze 12s ease-in-out infinite', animationDelay: '2s' }}
            />
          </div>
        )}

        {/* ==============================================================
            F. MODE OVERLAYS (AMBER RISK / CRIMSON RESCUE)
           ============================================================== */}
        {mode === 'RISK' && (
          <div className="absolute inset-0 bg-gradient-to-t from-amber-950/70 via-slate-950/40 to-amber-950/30 mix-blend-multiply pointer-events-none" />
        )}
        {mode === 'DISASTER' && (
          <div className="absolute inset-0 bg-gradient-to-t from-red-950/85 via-red-950/40 to-slate-950/50 mix-blend-multiply pointer-events-none animate-pulse" />
        )}

        {/* ==============================================================
            G. CONTRAST READABILITY SCRIMS
           ============================================================== */}
        {/* Bottom-to-Top dark gradient ensuring bottom metrics & labels are 100% crisp */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15 pointer-events-none" />
        {/* Left-to-Right feather behind main temperature & condition headings */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
      </div>
    );
  };

  // Decode previous and current scene parameters for smooth cross-fading
  const [prevPhase, prevCategory, prevMode] = (prevSceneKey || '').split('_') as [
    TimeOfDayPhase,
    WeatherSceneType,
    AppStateMode
  ];
  const [currPhase, currCategory, currMode] = currentSceneKey.split('_') as [
    TimeOfDayPhase,
    WeatherSceneType,
    AppStateMode
  ];

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 rounded-3xl select-none">
      {/* 1. Outgoing Previous Scene during cross-fade (fading out smoothly over 600ms) */}
      {prevSceneKey && (
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-600 ease-in-out"
          style={{ opacity: isCrossFading ? 0 : 1 }}
        >
          {renderScene(prevPhase, prevCategory, prevMode)}
        </div>
      )}

      {/* 2. Incoming / Active Scene (fading in smoothly over 600ms) */}
      <div
        className="absolute inset-0 w-full h-full transition-opacity duration-600 ease-in-out"
        style={{ opacity: 1 }}
      >
        {renderScene(currPhase, currCategory, currMode)}
      </div>
    </div>
  );
};

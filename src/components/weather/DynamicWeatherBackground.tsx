import React, { useEffect, useState } from 'react';
import type { AppStateMode } from '../../types/disaster';

// Direct asset imports via Vite for guaranteed resolution & zero path bugs
import clearDayImg from '../../assets/weather-scenes/clear_day.jpg';
import sunsetGoldenImg from '../../assets/weather-scenes/sunset_golden.jpg';
import dawnSunriseImg from '../../assets/weather-scenes/dawn_sunrise.jpg';
import cloudyDayImg from '../../assets/weather-scenes/cloudy_day.jpg';
import rainyDayImg from '../../assets/weather-scenes/rainy_day.jpg';
import thunderstormImg from '../../assets/weather-scenes/thunderstorm.jpg';
import starryNightImg from '../../assets/weather-scenes/starry_night.jpg';
import foggyMistImg from '../../assets/weather-scenes/foggy_mist.jpg';
import riskStormImg from '../../assets/weather-scenes/risk_storm.jpg';
import rescueEmergencyImg from '../../assets/weather-scenes/rescue_emergency.jpg';

interface DynamicWeatherBackgroundProps {
  condition: string;
  temperature?: number;
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

type TimePhase = 'DAWN' | 'DAY' | 'SUNSET' | 'NIGHT';

function computeDetailedTimePhase(sunriseStr?: string, sunsetStr?: string): TimePhase {
  const now = new Date();
  const currentHours = now.getHours() + now.getMinutes() / 60;

  const sunriseHours = sunriseStr ? parseTimeStringToHours(sunriseStr) : 6.0;
  const sunsetHours = sunsetStr ? parseTimeStringToHours(sunsetStr) : 18.5;

  const dawnStart = sunriseHours - 0.75;
  const dawnEnd = sunriseHours + 0.75;
  const sunsetStart = sunsetHours - 1.0;
  const sunsetEnd = sunsetHours + 0.75;

  if (currentHours >= dawnStart && currentHours < dawnEnd) {
    return 'DAWN';
  }
  if (currentHours >= sunsetStart && currentHours < sunsetEnd) {
    return 'SUNSET';
  }
  if (currentHours >= dawnEnd && currentHours < sunsetStart) {
    return 'DAY';
  }
  return 'NIGHT';
}

function getPhotographicScene(
  timePhase: TimePhase,
  weatherCategory: 'CLEAR' | 'CLOUDS' | 'RAIN' | 'THUNDERSTORM' | 'FOG',
  appMode: AppStateMode
): string {
  // 1. Disaster / Rescue Mode takes highest priority
  if (appMode === 'DISASTER') {
    return rescueEmergencyImg;
  }

  // 2. Risk Mode takes high priority
  if (appMode === 'RISK') {
    return riskStormImg;
  }

  // 3. Severe Weather Conditions
  if (weatherCategory === 'THUNDERSTORM') {
    return thunderstormImg;
  }
  if (weatherCategory === 'RAIN') {
    return rainyDayImg;
  }
  if (weatherCategory === 'FOG') {
    return foggyMistImg;
  }

  // 4. Astronomical Time-of-Day Conditions
  if (timePhase === 'SUNSET') {
    return sunsetGoldenImg;
  }
  if (timePhase === 'DAWN') {
    return dawnSunriseImg;
  }
  if (timePhase === 'NIGHT') {
    return starryNightImg;
  }

  // 5. Daylight Conditions
  if (weatherCategory === 'CLOUDS') {
    return cloudyDayImg;
  }

  // Default: Clear Sunny Day
  return clearDayImg;
}

export const DynamicWeatherBackground: React.FC<DynamicWeatherBackgroundProps> = ({
  condition,
  appMode = 'NORMAL',
  sunrise,
  sunset
}) => {
  const isDisaster = appMode === 'DISASTER';
  const isRisk = appMode === 'RISK';

  // Live timer tick to re-evaluate time phase smoothly every 60s
  const [, setTick] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timePhase = computeDetailedTimePhase(sunrise, sunset);
  const condLower = (condition || '').toLowerCase();

  // Weather Condition Classification
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

  // Resolve target scene
  const targetScene = getPhotographicScene(timePhase, weatherCategory, appMode);

  // Dual-layer smooth cross-fading buffer
  const [currentScene, setCurrentScene] = useState<string>(targetScene);
  const [prevScene, setPrevScene] = useState<string | null>(null);
  const [isCrossFading, setIsCrossFading] = useState<boolean>(false);

  useEffect(() => {
    if (targetScene !== currentScene) {
      setPrevScene(currentScene);
      setCurrentScene(targetScene);
      setIsCrossFading(true);

      const fadeTimer = setTimeout(() => {
        setIsCrossFading(false);
        setPrevScene(null);
      }, 750);

      return () => clearTimeout(fadeTimer);
    }
  }, [targetScene, currentScene]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 rounded-3xl select-none">
      {/* =========================================================================
          1. PREVIOUS PHOTOGRAPHIC SCENE LAYER (DURING CROSS-FADE)
         ========================================================================= */}
      {prevScene && (
        <img
          src={prevScene}
          alt="Weather Landscape"
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out"
          style={{ opacity: isCrossFading ? 0 : 1 }}
        />
      )}

      {/* =========================================================================
          2. CURRENT ACTIVE PHOTOGRAPHIC SCENE LAYER (RICH, CLEAR, VIBRANT)
         ========================================================================= */}
      <img
        src={currentScene}
        alt="Weather Landscape Scene"
        className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out"
        style={{ opacity: isCrossFading ? 1 : 1 }}
      />

      {/* =========================================================================
          3. MODE-AWARE COLOR GRADING (SUBTLE, DOES NOT OBSCURE THE PHOTO)
         ========================================================================= */}
      {/* Risk Mode: Darkened, Stormy Mood with Amber Alert Tint */}
      {isRisk && (
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-amber-950/40 to-slate-950/50 mix-blend-multiply pointer-events-none" />
      )}

      {/* Rescue Mode: Dramatic Crimson Emergency Tint */}
      {isDisaster && (
        <div className="absolute inset-0 bg-gradient-to-t from-red-950/85 via-slate-950/60 to-red-950/60 mix-blend-multiply pointer-events-none" />
      )}

      {/* =========================================================================
          4. DYNAMIC ATMOSPHERIC LIVE OVERLAYS (RAIN, LIGHTNING, STARS, SUN)
         ========================================================================= */}

      {/* Rotating Solar Corona (Day + Clear) */}
      {(timePhase === 'DAY' || timePhase === 'DAWN') && weatherCategory === 'CLEAR' && !isRisk && !isDisaster && (
        <div className="absolute -top-16 -right-16 w-80 h-80 pointer-events-none opacity-40">
          <div className="absolute inset-0 animate-sun-rays">
            <svg viewBox="0 0 400 400" className="w-full h-full text-amber-200">
              <g stroke="currentColor" strokeWidth="2" strokeDasharray="8 12" opacity="0.5">
                <line x1="200" y1="200" x2="200" y2="10" />
                <line x1="200" y1="200" x2="200" y2="390" />
                <line x1="200" y1="200" x2="10" y2="200" />
                <line x1="200" y1="200" x2="390" y2="200" />
                <line x1="200" y1="200" x2="65" y2="65" />
                <line x1="200" y1="200" x2="335" y2="335" />
              </g>
            </svg>
          </div>
          <div className="absolute inset-10 rounded-full bg-amber-300/30 blur-2xl animate-sun-glow" />
        </div>
      )}

      {/* Twinkling Stars (Night Sky) */}
      {timePhase === 'NIGHT' && !isRisk && !isDisaster && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
          {[
            { top: '10%', left: '15%', size: 'w-1 h-1', delay: '0s' },
            { top: '20%', left: '35%', size: 'w-1.5 h-1.5', delay: '0.5s' },
            { top: '15%', left: '60%', size: 'w-1 h-1', delay: '1s' },
            { top: '25%', left: '80%', size: 'w-1.5 h-1.5', delay: '1.5s' },
            { top: '35%', left: '20%', size: 'w-1 h-1', delay: '0.8s' },
            { top: '40%', left: '75%', size: 'w-1 h-1', delay: '1.2s' }
          ].map((star, idx) => (
            <div
              key={idx}
              className={`absolute ${star.size} rounded-full bg-white animate-star-twinkle shadow-[0_0_6px_white]`}
              style={{ top: star.top, left: star.left, animationDelay: star.delay }}
            />
          ))}
        </div>
      )}

      {/* Live Falling Rain Drops */}
      {(weatherCategory === 'RAIN' || weatherCategory === 'THUNDERSTORM' || isRisk || isDisaster) && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-75">
          {[8, 18, 28, 38, 48, 58, 68, 78, 88, 96].map((pos, idx) => (
            <div
              key={idx}
              className={`absolute bg-gradient-to-b from-transparent via-cyan-200 to-transparent animate-drop-rain ${
                weatherCategory === 'THUNDERSTORM' || isDisaster
                  ? 'w-[2px] h-20 opacity-90'
                  : 'w-[1.5px] h-16 opacity-60'
              }`}
              style={{
                left: `${pos}%`,
                animationDuration: `${0.7 + (idx % 3) * 0.25}s`,
                animationDelay: `${(idx % 5) * 0.18}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Lightning Flash (Thunderstorm & Emergency Modes) */}
      {(weatherCategory === 'THUNDERSTORM' || isDisaster) && (
        <>
          <div className="absolute inset-0 bg-cyan-100/25 animate-lightning-flash mix-blend-screen pointer-events-none" />
          <div
            className="absolute inset-0 bg-indigo-200/20 animate-lightning-flash mix-blend-screen pointer-events-none"
            style={{ animationDelay: '2.5s' }}
          />
        </>
      )}

      {/* =========================================================================
          5. SUBTLE CONTRAST SCRIM (KEEPS PHOTO 100% VISIBLE WHILE ENSURING READABILITY)
         ========================================================================= */}
      {/* Bottom to Top Scrim: Only dark at the very bottom where metrics sit */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15 pointer-events-none" />

      {/* Left to Right Scrim: Soft feather behind the large degree display */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
    </div>
  );
};

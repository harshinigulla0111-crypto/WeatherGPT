import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import {
  generateWeatherNotification,
  hasWeatherMeaningfullyChanged,
  type WeatherNotification,
  type WeatherSnapshot
} from '../../services/weatherNotificationService';

export const WeatherPushToast: React.FC = () => {
  const { currentWeather, metrics, selectedLocation, weatherAlerts } = useWeather();

  const [notification, setNotification] = useState<WeatherNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const prevSnapshotRef = useRef<WeatherSnapshot | null>(null);
  const hasTriggeredInitialRef = useRef(false);
  const lastTriggeredTimeRef = useRef<number>(0);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startDismissTimer = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setNotification(null), 400);
    }, 7500);
  };

  const handleMouseEnter = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
  };

  const handleMouseLeave = () => {
    startDismissTimer();
  };

  const triggerNotification = (notif: WeatherNotification) => {
    setNotification(notif);
    setIsVisible(true);
    lastTriggeredTimeRef.current = Date.now();
    startDismissTimer();
  };

  const handleDismiss = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setIsVisible(false);
    setTimeout(() => setNotification(null), 400);
  };

  // 1. Initial Greeting Trigger shortly after location/weather is loaded
  useEffect(() => {
    if (!currentWeather || !selectedLocation.city) return;

    if (!hasTriggeredInitialRef.current) {
      hasTriggeredInitialRef.current = true;
      const initialTimer = setTimeout(() => {
        const notif = generateWeatherNotification(currentWeather, metrics, selectedLocation, weatherAlerts);
        triggerNotification(notif);

        prevSnapshotRef.current = {
          temperature: currentWeather.temperature,
          rainProbability: metrics.rainProbability,
          condition: currentWeather.condition,
          uvIndex: metrics.uvIndex
        };
      }, 2200);

      return () => clearTimeout(initialTimer);
    }
  }, [currentWeather?.temperature, selectedLocation?.city]);

  // 2. Periodic Meaningful Weather Change Trigger
  useEffect(() => {
    if (!currentWeather || !hasTriggeredInitialRef.current) return;

    const currentSnapshot: WeatherSnapshot = {
      temperature: currentWeather.temperature,
      rainProbability: metrics.rainProbability,
      condition: currentWeather.condition,
      uvIndex: metrics.uvIndex
    };

    const timeSinceLast = Date.now() - lastTriggeredTimeRef.current;
    const cooldownPeriod = 3 * 60 * 1000; // 3 minutes cooldown to avoid spamming

    if (
      timeSinceLast >= cooldownPeriod &&
      hasWeatherMeaningfullyChanged(prevSnapshotRef.current, currentSnapshot)
    ) {
      const notif = generateWeatherNotification(currentWeather, metrics, selectedLocation, weatherAlerts);
      triggerNotification(notif);
      prevSnapshotRef.current = currentSnapshot;
    }
  }, [
    currentWeather.temperature,
    currentWeather.condition,
    metrics.rainProbability,
    metrics.uvIndex,
    weatherAlerts
  ]);

  if (!notification || !isVisible) return null;

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'storm':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'hot':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'rain':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'cold':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'uv':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'night':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div
      className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto animate-in slide-in-from-top-4 fade-in duration-400 pointer-events-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-4 rounded-3xl bg-slate-900/95 border border-cyan-500/30 shadow-2xl backdrop-blur-2xl text-slate-100 flex items-start gap-3.5 relative overflow-hidden group">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Big Personality Emoji / Icon */}
        <div className="w-11 h-11 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-2xl shrink-0 shadow-md">
          <span>{notification.emoji}</span>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-1 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getCategoryBadgeClass(
                notification.category
              )}`}
            >
              {notification.title}
            </span>
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
              <span>Just now</span>
            </span>
          </div>

          <p className="text-xs text-slate-200 font-medium leading-relaxed drop-shadow-sm">
            {notification.message}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
          aria-label="Dismiss notification"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

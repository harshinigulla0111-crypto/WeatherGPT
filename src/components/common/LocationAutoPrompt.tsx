import React, { useEffect, useState } from 'react';
import { Compass, MapPin, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWeather } from '../../contexts/WeatherContext';
import { WeatherService } from '../../services/weatherService';

export const LocationAutoPrompt: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { setSelectedLocation } = useWeather();

  const [showFallbackToast, setShowFallbackToast] = useState(false);
  const [successCity, setSuccessCity] = useState<string | null>(null);

  useEffect(() => {
    // Only prompt authenticated users when landing on dashboard
    if (!isAuthenticated) return;

    const sessionKey = 'weathergpt_location_auto_prompted_session';
    const localKey = `weathergpt_location_auto_prompted_${user?.id || 'default'}`;

    const alreadyPromptedSession = sessionStorage.getItem(sessionKey);
    const alreadyPromptedEver = localStorage.getItem(localKey);

    if (alreadyPromptedSession || alreadyPromptedEver) {
      return;
    }

    // Mark as prompted immediately so it never re-asks on reload or tab switch
    sessionStorage.setItem(sessionKey, 'true');
    localStorage.setItem(localKey, 'true');

    if (!navigator.geolocation) {
      setShowFallbackToast(true);
      return;
    }

    // Trigger browser geolocation permission prompt automatically
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const locData = await WeatherService.reverseGeocode(lat, lon);

          if (locData && locData.city) {
            setSelectedLocation(locData);
            setSuccessCity(locData.city);
            setTimeout(() => setSuccessCity(null), 4000);
          }
        } catch (err) {
          console.warn('[LocationAutoPrompt] Reverse geocode error:', err);
          setShowFallbackToast(true);
        }
      },
      (err) => {
        // Permission was denied, dismissed, or timed out
        console.log('[LocationAutoPrompt] Geolocation dismissed or denied:', err.message);
        setShowFallbackToast(true);
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  }, [isAuthenticated, user?.id, setSelectedLocation]);

  // Auto-dismiss fallback toast after 9 seconds
  useEffect(() => {
    if (showFallbackToast) {
      const timer = setTimeout(() => setShowFallbackToast(false), 9000);
      return () => clearTimeout(timer);
    }
  }, [showFallbackToast]);

  const handleOpenSearch = () => {
    setShowFallbackToast(false);
    window.dispatchEvent(new CustomEvent('open-location-picker'));
  };

  return (
    <>
      {/* 1. Success Notification */}
      {successCity && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
          <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl flex items-center gap-3 text-xs text-white max-w-sm">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white font-display">Location Detected</p>
              <p className="text-[11px] text-slate-300">Updated weather for {successCity}.</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Non-blocking Fallback Hint Toast */}
      {showFallbackToast && (
        <div className="fixed bottom-6 left-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
          <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-amber-500/30 shadow-2xl backdrop-blur-xl flex items-center gap-3 text-xs text-white max-w-md">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
              <Compass className="w-4 h-4" />
            </div>

            <button
              onClick={handleOpenSearch}
              className="text-left flex-1 group focus:outline-none"
              title="Tap to search your city"
            >
              <p className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                Enable location for personalized weather
              </p>
              <p className="text-[11px] text-cyan-400 font-medium underline underline-offset-2">
                Tap here to search your city instead →
              </p>
            </button>

            <button
              onClick={() => setShowFallbackToast(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors shrink-0"
              aria-label="Dismiss location hint"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

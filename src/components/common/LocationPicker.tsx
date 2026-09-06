import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ChevronDown, Compass, Loader2, MapPin, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWeather } from '../../contexts/WeatherContext';
import { ProfileService } from '../../services/profileService';
import { WeatherService } from '../../services/weatherService';
import type { LocationData } from '../../types/weather';

export const LocationPicker: React.FC = () => {
  const { selectedLocation, setSelectedLocation } = useWeather();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or listen for open event
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleOpenPicker = () => {
      setIsOpen(true);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('open-location-picker', handleOpenPicker);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('open-location-picker', handleOpenPicker);
    };
  }, []);

  // Handle city search autocomplete
  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    setLocationError(null);

    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await WeatherService.searchLocations(query);
      setSearchResults(results);
    } catch (err) {
      console.warn('[LocationPicker] Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = async (loc: LocationData) => {
    setSelectedLocation(loc);
    setIsOpen(false);
    setSearchQuery('');
    setSearchResults([]);

    // If user is authenticated, save to Supabase user locations table
    if (user?.id) {
      ProfileService.saveUserLocation({
        user_id: user.id,
        name: `${loc.city}, ${loc.state || loc.country}`,
        latitude: loc.latitude,
        longitude: loc.longitude,
        is_default: true
      }).catch((err) => console.warn('[LocationPicker] Supabase save error:', err));
    }
  };

  // Trigger browser Geolocation API
  const handleUseCurrentLocation = () => {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please search for your city.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const locData = await WeatherService.reverseGeocode(lat, lon);
          handleSelectLocation(locData);
        } catch (err) {
          console.warn('[LocationPicker] Geolocation reverse geocode error:', err);
          setLocationError('Failed to resolve current location. Please search for your city.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location access denied. Please search for your city instead.');
        } else {
          setLocationError('Unable to retrieve location. Please search for your city.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Location Picker Header Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-xs sm:text-sm text-slate-200 transition-all font-medium magnetic-btn"
      >
        <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="max-w-[120px] sm:max-w-[160px] truncate">
          {selectedLocation.city}, {selectedLocation.state || selectedLocation.country}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-2xl p-3 z-50 space-y-3 text-xs animate-in fade-in duration-200">
          {/* Header Label */}
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
            <span>Location Selector</span>
          </div>

          {/* Option 1: Use My Current Location */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold flex items-center justify-between transition-all group disabled:opacity-50"
          >
            <div className="flex items-center gap-2 truncate">
              <Compass className={`w-4 h-4 text-cyan-400 shrink-0 ${isLocating ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
              <span className="truncate">{isLocating ? 'Locating device...' : 'Use my current location'}</span>
            </div>
            {isLocating && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0" />}
          </button>

          {/* Geolocation Error Alert */}
          {locationError && (
            <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 text-[11px] flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span className="leading-snug">{locationError}</span>
            </div>
          )}

          {/* Option 2: Search Input Field */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search any global city..."
              autoFocus
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors text-xs"
            />
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400 absolute right-3 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {/* Live Autocomplete Results List */}
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-700/50 pt-1 border-t border-slate-800/80">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-1 mb-1">
                Matching Cities
              </div>
              {searchResults.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center justify-between text-slate-200 group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-medium truncate">
                      {loc.city}{loc.state ? `, ${loc.state}` : ''}, {loc.country}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Search Results Notice */}
          {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
            <div className="text-center py-3 text-slate-500 text-xs">
              No matching city found for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

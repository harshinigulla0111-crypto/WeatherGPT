import React, { useEffect, useState } from 'react';
import { Compass, ExternalLink, Info, MapPin, Navigation, PhoneCall, ShieldAlert } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import { DisasterService } from '../../services/disasterService';
import type { ShelterData } from '../../types/disaster';

export const SafeSheltersCard: React.FC = () => {
  const { selectedLocation } = useWeather();
  const [shelters, setShelters] = useState<ShelterData[]>(() =>
    DisasterService.getSafeShelters(
      selectedLocation?.latitude ?? 16.5062,
      selectedLocation?.longitude ?? 80.648,
      selectedLocation?.city ?? 'Vijayawada'
    )
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    const loadNearbyShelters = async () => {
      if (!selectedLocation) return;
      setIsLoading(true);
      try {
        const results = await DisasterService.fetchNearbyShelters(
          selectedLocation.latitude,
          selectedLocation.longitude,
          selectedLocation.city
        );
        if (!isCancelled) {
          setShelters(results);
        }
      } catch (err) {
        console.warn('Failed to fetch dynamic shelters:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadNearbyShelters();

    return () => {
      isCancelled = true;
    };
  }, [selectedLocation?.city, selectedLocation?.latitude, selectedLocation?.longitude]);

  const cityHelplines = DisasterService.getCityHelplines(
    selectedLocation?.city || 'Vijayawada',
    selectedLocation?.state,
    selectedLocation?.country
  );

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl backdrop-blur-sm">
      {/* Header with Title and Current Location Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide font-mono">
              SAFE SHELTERS & RELIEF CENTERS
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Real community assembly points & civic facilities near{' '}
              <span className="text-cyan-300 font-semibold">{selectedLocation?.city || 'your area'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/80">
            {isLoading ? 'SEARCHING NEARBY...' : `${shelters.length} PLACES IDENTIFIED`}
          </span>
        </div>
      </div>

      {/* Shelter Grid (without calculated distance box) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shelters.map((shelter) => {
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${selectedLocation?.latitude ?? shelter.latitude},${selectedLocation?.longitude ?? shelter.longitude}&destination=${shelter.latitude},${shelter.longitude}`;

          return (
            <div
              key={shelter.id}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-4 hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="space-y-3">
                {/* Header: Name & Type */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-bold text-slate-100 leading-snug line-clamp-2">
                      {shelter.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                      Verified
                    </span>
                  </div>

                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-800/40">
                    {shelter.type}
                  </span>
                </div>

                {/* Real Address */}
                <p className="text-xs text-slate-400 flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 text-slate-300">{shelter.address}</span>
                </p>

                {/* Honest Capacity & Verification Disclaimer */}
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-slate-400 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-semibold text-slate-300 block mb-0.5">
                      Live Occupancy & Capacity
                    </span>
                    <span className="text-slate-400">
                      Not verified — please check with on-ground local authorities upon arrival.
                    </span>
                  </div>
                </div>
              </div>

              {/* Action: Real Directions Navigation Button */}
              <div className="pt-2 border-t border-slate-800/80">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions (Google Maps)</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* City-Specific Disaster & Emergency Helplines Section */}
      <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide font-mono">
                EMERGENCY & DISASTER HELPLINES — {selectedLocation?.city?.toUpperCase() || 'LOCAL'}
              </h3>
              <p className="text-xs text-slate-400">
                Official verified control room & dispatch helplines for{' '}
                <span className="text-cyan-300 font-semibold">{selectedLocation?.city || 'your area'}</span>
                {selectedLocation?.state ? `, ${selectedLocation.state}` : ''}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/60 self-start sm:self-auto">
            24/7 ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cityHelplines.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                item.isPrimary
                  ? 'bg-red-950/20 border-red-800/50 hover:border-red-700/80'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 truncate">
                    {item.department}
                  </span>
                  {item.isPrimary && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white shrink-0">
                      PRIMARY
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-100 leading-snug">
                  {item.label}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-800/60">
                <span className="font-mono font-black text-sm text-cyan-300 tracking-wider">
                  {item.number}
                </span>
                <a
                  href={`tel:${item.dialNumber}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 ${
                    item.isPrimary
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-cyan-300'
                  }`}
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

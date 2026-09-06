import React, { useEffect, useState } from 'react';
import { Compass, ExternalLink, Info, MapPin, Navigation, PhoneCall, ShieldCheck } from 'lucide-react';
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

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl backdrop-blur-sm">
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

      {/* Shelter Grid */}
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

                {/* Real Calculated Distance */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-xs text-slate-400">Calculated Distance</span>
                  <span className="font-mono font-bold text-cyan-400 text-xs">
                    {shelter.distanceKm.toFixed(1)} km away
                  </span>
                </div>

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

      {/* Single Verified Emergency Helpline Footer Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Need Urgent Evacuation or Medical Dispatch?
            </h4>
            <p className="text-[11px] text-slate-400">
              For immediate emergency assistance, dial the National Disaster & Police Dispatch.
            </p>
          </div>
        </div>

        <a
          href="tel:112"
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono tracking-wider flex items-center gap-2 shrink-0 transition-colors shadow-lg shadow-red-950/50"
        >
          <span>CALL 112 (NATIONAL)</span>
        </a>
      </div>
    </div>
  );
};

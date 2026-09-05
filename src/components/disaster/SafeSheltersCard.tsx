import React from 'react';
import { Accessibility, Compass, MapPin, Navigation, Phone, ShieldCheck } from 'lucide-react';
import { DisasterService } from '../../services/disasterService';

export const SafeSheltersCard: React.FC = () => {
  const shelters = DisasterService.getSafeShelters();

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide font-mono">
              SAFE SHELTERS & RELIEF CENTERS
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Verified emergency evacuation shelters nearby
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/80 self-start sm:self-auto">
          3 CENTERS OPEN NEARBY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shelters.map((shelter) => (
          <div
            key={shelter.id}
            className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-4 hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-100 leading-snug">{shelter.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                  {shelter.status}
                </span>
              </div>

              <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{shelter.address}</span>
              </p>

              {/* Metrics: Distance, Capacity %, Accessibility */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Distance</span>
                  <span className="font-mono font-bold text-cyan-400">{shelter.distanceKm} km away</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Occupancy Capacity</span>
                    <span className="font-mono font-bold text-slate-200">{shelter.capacityPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        shelter.capacityPercentage > 85
                          ? 'bg-red-500'
                          : shelter.capacityPercentage > 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${shelter.capacityPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Wheelchair Accessibility</span>
                  {shelter.accessible ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Accessibility className="w-3 h-3" /> Yes
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Limited</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons: Directions & Call */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${shelter.latitude},${shelter.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Directions</span>
              </a>

              <a
                href={`tel:${shelter.contactNumber}`}
                className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Helpline</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { AlertCircle, CloudRain, Droplets, Sprout, Thermometer, Wind } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import { SpecializedService } from '../../services/specializedService';
import type { CropType } from '../../types/specialized';

export const FarmerModeCard: React.FC = () => {
  const { selectedCrop, setSelectedCrop } = useWeather();
  const farmerData = SpecializedService.getFarmerData(selectedCrop);

  const cropList: CropType[] = ['Rice', 'Cotton', 'Chilli', 'Groundnut', 'Maize'];

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-900 border border-emerald-500/30 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide font-mono">
              FARMER MODE: AGRICULTURAL WEATHER INTELLIGENCE
            </h2>
            <p className="text-xs text-emerald-300/80 font-medium">
              Crop-specific advisory derived from soil moisture & precipitation forecast
            </p>
          </div>
        </div>

        {/* Crop Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {cropList.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border magnetic-btn proximity-card ${
                selectedCrop === crop
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-md shadow-emerald-500/30'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 proximity-card">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Soil Moisture
          </span>
          <span className="text-xl font-extrabold text-emerald-400 font-mono">
            {farmerData.soilMoisturePercent}%
          </span>
          <span className="text-[10px] text-slate-500 block">Optimal root level</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 proximity-card">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Rainfall (24h)
          </span>
          <span className="text-xl font-extrabold text-cyan-400 font-mono">
            {farmerData.rainfall24hMm} mm
          </span>
          <span className="text-[10px] text-slate-500 block">Expected after 3 PM</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 proximity-card">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Rainfall Deficit
          </span>
          <span className="text-xl font-extrabold text-slate-200 font-mono">
            {farmerData.rainfallDeficitPercent}%
          </span>
          <span className="text-[10px] text-emerald-400 block">Slight surplus</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 proximity-card">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
            Crop Stress
          </span>
          <span className="text-xl font-extrabold text-emerald-400 font-mono">
            {farmerData.cropStressLevel}
          </span>
          <span className="text-[10px] text-slate-500 block">Favorable condition</span>
        </div>
      </div>

      {/* Primary Irrigation Advice Banner */}
      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block font-mono">
            IRRIGATIONAL RECOMMENDATION ({selectedCrop.toUpperCase()}):
          </span>
          <p className="text-sm font-extrabold text-white">
            “{farmerData.irrigationRecommendation}”
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            {farmerData.adviceDetails}
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { WeatherMap } from '../components/map/WeatherMap';

export const MapPage: React.FC = () => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-white font-mono tracking-tight">
          INTERACTIVE GIS WEATHER MAP
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Professional Doppler radar, precipitation vector layers, heat maps, cyclone path tracking
        </p>
      </div>

      <WeatherMap />
    </div>
  );
};

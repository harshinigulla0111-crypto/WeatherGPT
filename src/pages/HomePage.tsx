import React from 'react';
import { DailyForecast } from '../components/weather/DailyForecast';
import { HourlyForecast } from '../components/weather/HourlyForecast';
import { WeatherHero } from '../components/weather/WeatherHero';
import { WeatherIntelligenceCard } from '../components/weather/WeatherIntelligenceCard';

import { RescueMode } from '../components/disaster/RescueMode';
import { RiskModeDashboard } from '../components/weather/RiskModeDashboard';
import { AviationModeCard } from '../components/specialized/AviationModeCard';
import { FarmerModeCard } from '../components/specialized/FarmerModeCard';
import { MarineModeCard } from '../components/specialized/MarineModeCard';
import { SmartCityModeCard } from '../components/specialized/SmartCityModeCard';
import { useWeather } from '../contexts/WeatherContext';

interface HomePageProps {
  onTriggerDangerWizard: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onTriggerDangerWizard }) => {
  const { appMode, specializedMode } = useWeather();

  if (appMode === 'DISASTER') {
    return <RescueMode onTriggerDangerWizard={onTriggerDangerWizard} />;
  }

  if (appMode === 'RISK') {
    return <RiskModeDashboard />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Main Weather Centerpiece Hero */}
      <WeatherHero />

      {/* Specialized Mode Highlight if selected */}
      {specializedMode === 'FARMER' && <FarmerModeCard />}
      {specializedMode === 'AVIATION' && <AviationModeCard />}
      {specializedMode === 'MARINE' && <MarineModeCard />}
      {specializedMode === 'SMART_CITY' && <SmartCityModeCard />}

      {/* 2. Today's Timeline (Hourly Forecast) */}
      <HourlyForecast />

      {/* 3. Your Weather Today (Personalized Guidance) */}
      <WeatherIntelligenceCard />

      {/* 4. 7-Day Horizontal Forecast (Bottom) */}
      <DailyForecast />
    </div>
  );
};



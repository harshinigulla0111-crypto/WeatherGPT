export type SpecializedMode = 'STANDARD' | 'FARMER' | 'AVIATION' | 'MARINE' | 'SMART_CITY';

export type CropType = 'Rice' | 'Cotton' | 'Chilli' | 'Groundnut' | 'Maize';

export interface FarmerData {
  crop: CropType;
  soilMoisturePercent: number;
  temperatureCelsius: number;
  rainfall24hMm: number;
  rainfallDeficitPercent: number;
  cropStressLevel: 'Low' | 'Moderate' | 'High';
  irrigationRecommendation: string;
  adviceDetails: string;
}

export interface AviationData {
  visibilityKm: number;
  windSpeedKmh: number;
  windDirectionDegrees: number;
  windDirectionText: string;
  cloudBaseFeet: number;
  cloudCondition: string;
  thunderstormRisk: 'None' | 'Low' | 'Moderate' | 'Severe';
  precipitationMm: number;
  pressureHpa: number;
  tempCelsius: number;
  metarRaw: string;
  flightCategory: 'VFR' | 'MVFR' | 'IFR';
}

export interface MarineData {
  windSpeedKts: number;
  waveHeightMeters: number;
  waveDirection: string;
  visibilityNauticalMiles: number;
  rainIntensity: string;
  thunderstormRisk: string;
  cycloneWatch: string;
  seaCondition: 'Calm' | 'Slight' | 'Moderate' | 'Rough' | 'Very Rough';
  tideHigh: string;
  tideLow: string;
  advisoryBriefing: string;
}

export interface SmartCityData {
  heatZoneStatus: 'Normal' | 'Elevated' | 'Critical';
  floodProneRoadsCount: number;
  roadDisruptionRisk: 'Low' | 'Moderate' | 'Severe';
  rainfallIntensityMm: number;
  activeFacilitiesOpen: number;
  vulnerablePopulationCount: number;
  cityAlertLevel: string;
}

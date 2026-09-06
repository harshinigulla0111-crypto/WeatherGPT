export type AppStateMode = 'NORMAL' | 'RISK' | 'DISASTER';

export interface DisasterAlert {
  id: string;
  title: string;
  type: 'FLOOD WARNING' | 'CYCLONE WATCH' | 'HEATWAVE ALERT' | 'THUNDERSTORM';
  severity: 'HIGH' | 'EXTREME' | 'MODERATE';
  description: string;
  rainfallMm: number;
  floodRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  next3HoursForecast: string;
  issuedAt: string;
}

export interface ShelterData {
  id: string;
  name: string;
  type: string;
  distanceKm: number;
  status: 'Open / Verified Facility';
  address: string;
  latitude: number;
  longitude: number;
}

export interface CityHelpline {
  label: string;
  department: string;
  number: string;
  dialNumber: string;
  description: string;
  isPrimary?: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  status: 'SAFE' | 'AT RISK' | 'UNKNOWN';
  lastSeen: string;
  locationName: string;
  phone: string;
}

export interface EmergencyActionItem {
  id: string;
  instruction: string;
  icon: string;
  priority: number;
  isCompleted?: boolean;
}

export interface DangerTriageResponse {
  environment: 'INDOORS' | 'OUTDOORS';
  situation: 'SAFE' | 'AT RISK' | 'IMMEDIATE DANGER';
  isAlone: 'YES' | 'NO';
}

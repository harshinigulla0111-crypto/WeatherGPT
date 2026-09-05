export interface ProfileSchema {
  id: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
}

export interface LocationSchema {
  id: string;
  user_id: string;
  city: string;
  latitude: number;
  longitude: number;
  is_primary: boolean;
}

export interface PreferencesSchema {
  user_id: string;
  language: string;
  temperature_unit: 'C' | 'F';
  speed_unit: 'kmh' | 'mph';
  voice_enabled: boolean;
  notifications_enabled: boolean;
}

export interface EmergencyContactSchema {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface FamilyCircleSchema {
  id: string;
  owner_id: string;
  member_id: string;
  status: 'SAFE' | 'AT RISK' | 'UNKNOWN';
}

export interface WeatherObservationSchema {
  id: string;
  location_id: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  pressure: number;
  aqi: number;
  observed_at: string;
}

export interface WeatherForecastSchema {
  id: string;
  location_id: string;
  forecast_date: string;
  temperature_high: number;
  temperature_low: number;
  rain_probability: number;
  condition: string;
}

export interface WeatherAlertSchema {
  id: string;
  location_id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  issued_at: string;
  expires_at: string;
}

export interface DisasterEventSchema {
  id: string;
  location_id: string;
  event_type: string;
  severity: string;
  status: string;
  started_at: string;
  ended_at?: string;
}

export interface RiskAssessmentSchema {
  id: string;
  location_id: string;
  flood_risk: string;
  heat_risk: string;
  wind_risk: string;
  landslide_risk: string;
  overall_risk: string;
  created_at: string;
}

export interface ShelterSchema {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  availability: number;
  accessibility: boolean;
}

export interface WeatherQuerySchema {
  id: string;
  user_id: string;
  query: string;
  intent: string;
  response: string;
  created_at: string;
}

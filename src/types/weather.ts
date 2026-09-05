export type WeatherCondition = 
  | 'Sunny' 
  | 'Clear' 
  | 'Partly Cloudy' 
  | 'Cloudy' 
  | 'Light Rain' 
  | 'Rain' 
  | 'Heavy Rain' 
  | 'Thunderstorm' 
  | 'Haze';

export interface LocationData {
  id: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  isPrimary?: boolean;
}

export interface CurrentWeather {
  temperature: number; // Celsius
  feelsLike: number;
  highTemp: number;
  lowTemp: number;
  condition: WeatherCondition;
  icon: string;
  updatedAt: string;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  condition: WeatherCondition;
  precipitationProb: number; // percentage 0-100
  windSpeed: number; // km/h
}

export interface DailyForecastItem {
  day: string; // e.g. "TODAY", "MON", "TUE"
  date: string;
  highTemp: number;
  lowTemp: number;
  condition: WeatherCondition;
  precipitationProb: number;
  humidity: number;
  uvIndex: number;
  windSpeed: number;
  summary: string;
}

export interface WeatherMetricsData {
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: string; // "NW", "E", etc.
  uvIndex: number; // 0-12
  uvDescription: string; // "Moderate", "High", etc.
  visibility: number; // km
  pressure: number; // hPa
  aqi: number; // 0-500
  aqiDescription: string; // "Good", "Moderate", etc.
  rainProbability: number; // %
  sunrise: string; // "6:02 AM"
  sunset: string; // "6:21 PM"
}

export interface WeatherIntelligenceDecision {
  id: string;
  category: 'umbrella' | 'travel' | 'clothing' | 'activity';
  title: string;
  description: string;
  icon: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface WeatherDNAData {
  floodExposure: 'LOW' | 'MEDIUM' | 'HIGH';
  heatExposure: 'LOW' | 'MEDIUM' | 'HIGH';
  rainSensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
  windExposure: 'LOW' | 'MEDIUM' | 'HIGH';
  landslideExposure: 'LOW' | 'MEDIUM' | 'HIGH';
  insightSummary: string;
}

export interface WeatherInsightCard {
  id: string;
  title: string;
  subtitle: string;
  category: 'Rain Pattern' | 'Heat' | 'Air Quality' | 'Travel';
  detail: string;
}

export interface WeatherAlert {
  id: string;
  sender: string;
  event: string;
  severity: 'warning' | 'watch' | 'advisory' | 'info';
  start: string;
  end: string;
  description: string;
}

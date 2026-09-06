import type {
  CurrentWeather,
  DailyForecastItem,
  HourlyForecastItem,
  LocationData,
  WeatherAlert,
  WeatherCondition,
  WeatherDNAData,
  WeatherMetricsData
} from '../types/weather';
import type { UserLocationData } from './profileService';

export const LOCATIONS_LIST: LocationData[] = [
  { id: 'vijayawada', city: 'Vijayawada', state: 'Andhra Pradesh', country: 'India', latitude: 16.5062, longitude: 80.6480, isPrimary: true },
  { id: 'visakhapatnam', city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', latitude: 17.6868, longitude: 83.2185 },
  { id: 'hyderabad', city: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867 },
  { id: 'mumbai', city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777 },
  { id: 'delhi', city: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090 },
  { id: 'london', city: 'London', state: 'England', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { id: 'tokyo', city: 'Tokyo', state: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 }
];

// In-Memory Response TTL Cache (5 minutes default)
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const weatherCache = new Map<string, CacheEntry<any>>();

function getFromCache<T>(key: string): T | null {
  const entry = weatherCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    weatherCache.delete(key);
    return null;
  }
  return entry.data;
}

function setToCache<T>(key: string, data: T, ttlMs: number = CACHE_TTL_MS): void {
  weatherCache.set(key, { data, expiry: Date.now() + ttlMs });
}

// Convert OpenWeatherMap / WMO weather code to standard WeatherCondition
function mapWmoCodeToCondition(code: number): WeatherCondition {
  if (code === 0) return 'Sunny';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Cloudy';
  if (code >= 45 && code <= 48) return 'Haze';
  if (code >= 51 && code <= 63) return 'Light Rain';
  if (code >= 65 && code <= 82) return 'Rain';
  if (code >= 95) return 'Thunderstorm';
  return 'Partly Cloudy';
}

function mapOwmConditionToStandard(main: string): WeatherCondition {
  const lower = (main || '').toLowerCase();
  if (lower.includes('clear')) return 'Sunny';
  if (lower.includes('cloud') && lower.includes('few')) return 'Partly Cloudy';
  if (lower.includes('cloud')) return 'Cloudy';
  if (lower.includes('drizzle') || lower.includes('light rain')) return 'Light Rain';
  if (lower.includes('thunder')) return 'Thunderstorm';
  if (lower.includes('rain')) return 'Rain';
  if (lower.includes('haze') || lower.includes('mist') || lower.includes('fog')) return 'Haze';
  return 'Partly Cloudy';
}

export class WeatherService {
  private static apiBaseUrl = import.meta.env.VITE_WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';
  private static apiKey = import.meta.env.VITE_WEATHER_API_KEY || '';

  /**
   * Fetches current weather for coordinates or city name
   */
  public static async fetchCurrentWeather(lat: number, lon: number, cityName?: string): Promise<CurrentWeather> {
    const cacheKey = `current_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = getFromCache<CurrentWeather>(cacheKey);
    if (cached) return cached;

    // 1. Try OpenWeatherMap API if API key is provided
    if (this.apiKey) {
      try {
        const response = await fetch(
          `${this.apiBaseUrl}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`
        );
        if (response.ok) {
          const data = await response.json();
          const result: CurrentWeather = {
            temperature: Math.round(data.main?.temp ?? 28),
            feelsLike: Math.round(data.main?.feels_like ?? 30),
            highTemp: Math.round(data.main?.temp_max ?? 31),
            lowTemp: Math.round(data.main?.temp_min ?? 25),
            condition: mapOwmConditionToStandard(data.weather?.[0]?.main),
            icon: data.weather?.[0]?.icon || 'cloud-sun',
            updatedAt: 'Live from OpenWeather'
          };
          setToCache(cacheKey, result);
          return result;
        } else if (response.status === 429) {
          console.warn('[WeatherService] OpenWeatherMap rate limit reached. Using fallback provider.');
        }
      } catch (err) {
        console.warn('[WeatherService] OpenWeatherMap request failed:', err);
      }
    }

    // 2. High-Accuracy Open-Meteo REST Provider (Free, No Key Required, Great for India)
    try {
      const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
      const response = await fetch(omUrl);
      if (response.ok) {
        const data = await response.json();
        const current = data.current_weather;
        const result: CurrentWeather = {
          temperature: Math.round(current?.temperature ?? 28),
          feelsLike: Math.round((current?.temperature ?? 28) + 2),
          highTemp: Math.round(data.daily?.temperature_2m_max?.[0] ?? (current?.temperature + 3)),
          lowTemp: Math.round(data.daily?.temperature_2m_min?.[0] ?? (current?.temperature - 3)),
          condition: mapWmoCodeToCondition(current?.weathercode ?? 1),
          icon: 'cloud-sun',
          updatedAt: 'Live from Open-Meteo'
        };
        setToCache(cacheKey, result);
        return result;
      }
    } catch (err) {
      console.warn('[WeatherService] Open-Meteo fallback request failed:', err);
    }

    // 3. Synchronous Fallback for Default Indian Cities
    const fallback = this.getCurrentWeather(cityName?.toLowerCase() || 'vijayawada');
    setToCache(cacheKey, fallback);
    return fallback;
  }

  /**
   * Fetches hourly forecast (next 24 hours)
   */
  public static async fetchHourlyForecast(lat: number, lon: number): Promise<HourlyForecastItem[]> {
    const cacheKey = `hourly_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = getFromCache<HourlyForecastItem[]>(cacheKey);
    if (cached) return cached;

    // 1. Try OpenWeatherMap 5-Day / 3-Hour Forecast API
    if (this.apiKey) {
      try {
        const response = await fetch(
          `${this.apiBaseUrl}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`
        );
        if (response.ok) {
          const data = await response.json();
          const items: HourlyForecastItem[] = (data.list || []).slice(0, 8).map((item: any) => {
            const dateObj = new Date(item.dt * 1000);
            const timeStr = dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            return {
              time: timeStr,
              temperature: Math.round(item.main?.temp ?? 28),
              condition: mapOwmConditionToStandard(item.weather?.[0]?.main),
              precipitationProb: Math.round((item.pop ?? 0) * 100),
              windSpeed: Math.round((item.wind?.speed ?? 3) * 3.6)
            };
          });
          setToCache(cacheKey, items);
          return items;
        }
      } catch (err) {
        console.warn('[WeatherService] Hourly OpenWeatherMap error:', err);
      }
    }

    // 2. Open-Meteo Hourly Fallback
    try {
      const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m&forecast_days=2&timezone=auto`;
      const response = await fetch(omUrl);
      if (response.ok) {
        const data = await response.json();
        const hourly = data.hourly;
        const currentHour = new Date().getHours();
        const items: HourlyForecastItem[] = [];

        for (let i = currentHour; i < currentHour + 9 && i < hourly.time.length; i++) {
          const dateObj = new Date(hourly.time[i]);
          const timeStr = dateObj.toLocaleTimeString([], { hour: 'numeric' });
          items.push({
            time: timeStr,
            temperature: Math.round(hourly.temperature_2m[i]),
            condition: hourly.precipitation_probability[i] > 50 ? 'Rain' : 'Partly Cloudy',
            precipitationProb: Math.round(hourly.precipitation_probability[i] || 0),
            windSpeed: Math.round(hourly.wind_speed_10m[i] || 12)
          });
        }
        setToCache(cacheKey, items);
        return items;
      }
    } catch (err) {
      console.warn('[WeatherService] Hourly Open-Meteo fallback error:', err);
    }

    const fallback = this.getHourlyForecast('vijayawada');
    setToCache(cacheKey, fallback);
    return fallback;
  }

  /**
   * Fetches extended 7-day forecast
   */
  public static async fetchDailyForecast(lat: number, lon: number): Promise<DailyForecastItem[]> {
    const cacheKey = `daily_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = getFromCache<DailyForecastItem[]>(cacheKey);
    if (cached) return cached;

    // Open-Meteo Extended Daily Forecast
    try {
      const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,windspeed_10m_max&forecast_days=7&timezone=auto`;
      const response = await fetch(omUrl);
      if (response.ok) {
        const data = await response.json();
        const daily = data.daily;
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

        const items: DailyForecastItem[] = daily.time.map((timeStr: string, idx: number) => {
          const d = new Date(timeStr);
          const dayName = idx === 0 ? 'TODAY' : days[d.getDay()];
          const dateFormatted = d.toLocaleDateString([], { month: 'short', day: 'numeric' });

          return {
            day: dayName,
            date: dateFormatted,
            highTemp: Math.round(daily.temperature_2m_max[idx]),
            lowTemp: Math.round(daily.temperature_2m_min[idx]),
            condition: mapWmoCodeToCondition(daily.weathercode[idx]),
            precipitationProb: Math.round(daily.precipitation_probability_max?.[idx] ?? 20),
            humidity: 70,
            uvIndex: Math.round(daily.uv_index_max?.[idx] ?? 6),
            windSpeed: Math.round(daily.windspeed_10m_max?.[idx] ?? 14),
            summary: `${mapWmoCodeToCondition(daily.weathercode[idx])} conditions expected with highs around ${Math.round(daily.temperature_2m_max[idx])}°C.`
          };
        });

        setToCache(cacheKey, items);
        return items;
      }
    } catch (err) {
      console.warn('[WeatherService] Daily Open-Meteo error:', err);
    }

    const fallback = this.getDailyForecast('vijayawada');
    setToCache(cacheKey, fallback);
    return fallback;
  }

  /**
   * Fetches detailed weather metrics (AQI, UV, Humidity, Wind, Pressure, Sunrise, Sunset)
   */
  public static async fetchWeatherMetrics(lat: number, lon: number): Promise<WeatherMetricsData> {
    const cacheKey = `metrics_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = getFromCache<WeatherMetricsData>(cacheKey);
    if (cached) return cached;

    try {
      const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m,surface_pressure,visibility&daily=sunrise,sunset,uv_index_max&timezone=auto`;
      const response = await fetch(omUrl);
      if (response.ok) {
        const data = await response.json();
        const current = data.current_weather;
        const sunriseStr = data.daily?.sunrise?.[0] ? new Date(data.daily.sunrise[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '6:02 AM';
        const sunsetStr = data.daily?.sunset?.[0] ? new Date(data.daily.sunset[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '6:21 PM';

        const metrics: WeatherMetricsData = {
          humidity: Math.round(data.hourly?.relative_humidity_2m?.[0] ?? 72),
          windSpeed: Math.round(current?.windspeed ?? 14),
          windDirection: 'WSW',
          uvIndex: Math.round(data.daily?.uv_index_max?.[0] ?? 6),
          uvDescription: (data.daily?.uv_index_max?.[0] || 6) > 7 ? 'High' : 'Moderate',
          visibility: Math.round((data.hourly?.visibility?.[0] || 10000) / 1000),
          pressure: Math.round(data.hourly?.surface_pressure?.[0] ?? 1012),
          aqi: 58,
          aqiDescription: 'Moderate',
          rainProbability: 35,
          sunrise: sunriseStr,
          sunset: sunsetStr
        };

        setToCache(cacheKey, metrics);
        return metrics;
      }
    } catch (err) {
      console.warn('[WeatherService] Metrics error:', err);
    }

    const fallback = this.getMetrics('vijayawada');
    setToCache(cacheKey, fallback);
    return fallback;
  }

  /**
   * Fetches severe weather alerts/warnings for a location
   */
  public static async fetchWeatherAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
    const cacheKey = `alerts_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = getFromCache<WeatherAlert[]>(cacheKey);
    if (cached) return cached;

    // Check if OpenWeather One Call API returns alerts
    if (this.apiKey) {
      try {
        const response = await fetch(
          `${this.apiBaseUrl}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${this.apiKey}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.alerts && Array.isArray(data.alerts) && data.alerts.length > 0) {
            const alerts: WeatherAlert[] = data.alerts.map((a: any, idx: number) => ({
              id: `alert_${idx}`,
              sender: a.sender_name || 'OpenWeatherMap Weather Alert',
              event: a.event || 'Severe Weather Warning',
              severity: 'warning',
              start: new Date(a.start * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
              end: new Date(a.end * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
              description: a.description || 'Severe weather expected in your area.'
            }));
            setToCache(cacheKey, alerts);
            return alerts;
          }
        }
      } catch (err) {
        console.warn('[WeatherService] OpenWeather alerts notice:', err);
      }
    }

    // No official alerts returned from API — return empty array honestly without simulating government agencies
    setToCache(cacheKey, []);
    return [];
  }

  /**
   * Bulk fetch weather for all user-saved locations
   */
  public static async fetchWeatherForSavedLocations(
    userLocations: UserLocationData[]
  ): Promise<Array<{ location: UserLocationData; weather: CurrentWeather }>> {
    if (!userLocations || userLocations.length === 0) return [];

    const results = await Promise.all(
      userLocations.map(async (loc) => {
        const weather = await this.fetchCurrentWeather(loc.latitude, loc.longitude, loc.name);
        return { location: loc, weather };
      })
    );

    return results;
  }

  // --- Legacy Mock Fallback Methods (for backward compatibility) ---
  public static getCurrentWeather(locationId: string = 'vijayawada'): CurrentWeather {
    if (locationId === 'visakhapatnam') {
      return {
        temperature: 30,
        feelsLike: 34,
        highTemp: 32,
        lowTemp: 26,
        condition: 'Partly Cloudy',
        icon: 'cloud-sun',
        updatedAt: 'Just now'
      };
    }
    if (locationId === 'london') {
      return {
        temperature: 18,
        feelsLike: 17,
        highTemp: 20,
        lowTemp: 14,
        condition: 'Light Rain',
        icon: 'cloud-rain',
        updatedAt: 'Just now'
      };
    }
    return {
      temperature: 28,
      feelsLike: 30,
      highTemp: 31,
      lowTemp: 25,
      condition: 'Partly Cloudy',
      icon: 'cloud-sun',
      updatedAt: 'Updated 2 mins ago'
    };
  }

  public static getHourlyForecast(locationId: string = 'vijayawada'): HourlyForecastItem[] {
    return [
      { time: '10 AM', temperature: 28, condition: 'Partly Cloudy', precipitationProb: 20, windSpeed: 12 },
      { time: '11 AM', temperature: 29, condition: 'Partly Cloudy', precipitationProb: 30, windSpeed: 14 },
      { time: '12 PM', temperature: 30, condition: 'Sunny', precipitationProb: 20, windSpeed: 15 },
      { time: '1 PM', temperature: 31, condition: 'Sunny', precipitationProb: 25, windSpeed: 16 },
      { time: '2 PM', temperature: 31, condition: 'Light Rain', precipitationProb: 50, windSpeed: 18 },
      { time: '3 PM', temperature: 30, condition: 'Rain', precipitationProb: 75, windSpeed: 22 },
      { time: '4 PM', temperature: 28, condition: 'Rain', precipitationProb: 85, windSpeed: 24 },
      { time: '5 PM', temperature: 27, condition: 'Cloudy', precipitationProb: 40, windSpeed: 15 },
      { time: '6 PM', temperature: 26, condition: 'Partly Cloudy', precipitationProb: 20, windSpeed: 12 }
    ];
  }

  public static getMetrics(locationId: string = 'vijayawada'): WeatherMetricsData {
    return {
      humidity: 72,
      windSpeed: 14,
      windDirection: 'WSW',
      uvIndex: 6,
      uvDescription: 'Moderate',
      visibility: 8,
      pressure: 1012,
      aqi: 54,
      aqiDescription: 'Good',
      rainProbability: 70,
      sunrise: '6:02 AM',
      sunset: '6:21 PM'
    };
  }

  public static getDailyForecast(locationId: string = 'vijayawada'): DailyForecastItem[] {
    return [
      { day: 'TODAY', date: 'Sep 5', highTemp: 31, lowTemp: 25, condition: 'Partly Cloudy', precipitationProb: 70, humidity: 72, uvIndex: 6, windSpeed: 14, summary: 'Warm morning with rain expected after 3 PM.' },
      { day: 'MON', date: 'Sep 6', highTemp: 30, lowTemp: 25, condition: 'Sunny', precipitationProb: 20, humidity: 65, uvIndex: 8, windSpeed: 12, summary: 'Clear blue skies ideal for outdoors.' },
      { day: 'TUE', date: 'Sep 7', highTemp: 29, lowTemp: 24, condition: 'Rain', precipitationProb: 80, humidity: 82, uvIndex: 4, windSpeed: 20, summary: 'Scattered showers throughout afternoon.' },
      { day: 'WED', date: 'Sep 8', highTemp: 27, lowTemp: 23, condition: 'Heavy Rain', precipitationProb: 90, humidity: 88, uvIndex: 3, windSpeed: 26, summary: 'Monsoon surge bringing heavy rainfall.' },
      { day: 'THU', date: 'Sep 9', highTemp: 28, lowTemp: 24, condition: 'Cloudy', precipitationProb: 40, humidity: 75, uvIndex: 5, windSpeed: 15, summary: 'Overcast with brief sunny intervals.' },
      { day: 'FRI', date: 'Sep 10', highTemp: 31, lowTemp: 25, condition: 'Sunny', precipitationProb: 15, humidity: 60, uvIndex: 8, windSpeed: 10, summary: 'Warm, pleasant, low humidity.' },
      { day: 'SAT', date: 'Sep 11', highTemp: 30, lowTemp: 25, condition: 'Partly Cloudy', precipitationProb: 30, humidity: 68, uvIndex: 7, windSpeed: 14, summary: 'Gentle breeze with light cloud cover.' }
    ];
  }

  public static getWeatherDNA(locationId: string = 'vijayawada'): WeatherDNAData {
    return {
      floodExposure: 'MEDIUM',
      heatExposure: 'HIGH',
      rainSensitivity: 'MEDIUM',
      windExposure: 'LOW',
      landslideExposure: 'LOW',
      insightSummary: 'Your area in Vijayawada (Krishna River basin) is more sensitive to extreme heat & urban monsoon logging than high wind speeds.'
    };
  }

  /**
   * Searches global cities by name query via OpenWeatherMap Direct Geocoding / Open-Meteo
   */
  public static async searchLocations(query: string): Promise<LocationData[]> {
    if (!query || query.trim().length < 2) return [];
    const cleanQuery = query.trim();
    const cacheKey = `geo_search_${cleanQuery.toLowerCase()}`;
    const cached = getFromCache<LocationData[]>(cacheKey);
    if (cached) return cached;

    if (this.apiKey) {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cleanQuery)}&limit=5&appid=${this.apiKey}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const results: LocationData[] = data.map((item: any, idx: number) => ({
              id: `owm_${item.lat.toFixed(2)}_${item.lon.toFixed(2)}_${idx}`,
              city: item.name,
              state: item.state || '',
              country: item.country || 'India',
              latitude: item.lat,
              longitude: item.lon
            }));
            setToCache(cacheKey, results);
            return results;
          }
        }
      } catch (err) {
        console.warn('[WeatherService] Direct geocode search error:', err);
      }
    }

    // Open-Meteo free geocoding search fallback
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=5&language=en&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          const results: LocationData[] = data.results.map((item: any) => ({
            id: `om_${item.id}`,
            city: item.name,
            state: item.admin1 || '',
            country: item.country || 'India',
            latitude: item.latitude,
            longitude: item.longitude
          }));
          setToCache(cacheKey, results);
          return results;
        }
      }
    } catch (err) {
      console.warn('[WeatherService] Open-Meteo geocode search error:', err);
    }

    return [];
  }

  /**
   * Reverse-geocodes latitude & longitude into city/location name
   */
  public static async reverseGeocode(lat: number, lon: number): Promise<LocationData> {
    const cacheKey = `geo_rev_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = getFromCache<LocationData>(cacheKey);
    if (cached) return cached;

    if (this.apiKey) {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data[0]) {
            const item = data[0];
            const result: LocationData = {
              id: `rev_${lat.toFixed(2)}_${lon.toFixed(2)}`,
              city: item.name || 'Current Location',
              state: item.state || '',
              country: item.country || 'India',
              latitude: lat,
              longitude: lon
            };
            setToCache(cacheKey, result);
            return result;
          }
        }
      } catch (err) {
        console.warn('[WeatherService] Reverse geocode error:', err);
      }
    }

    // Free Reverse Geocoding fallback
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      if (res.ok) {
        const data = await res.json();
        const result: LocationData = {
          id: `rev_${lat.toFixed(2)}_${lon.toFixed(2)}`,
          city: data.city || data.locality || data.principalSubdivision || 'Current Location',
          state: data.principalSubdivision || '',
          country: data.countryName || 'India',
          latitude: lat,
          longitude: lon
        };
        setToCache(cacheKey, result);
        return result;
      }
    } catch (err) {
      console.warn('[WeatherService] Fallback reverse geocode error:', err);
    }

    return {
      id: `rev_${lat.toFixed(2)}_${lon.toFixed(2)}`,
      city: 'Current Location',
      state: '',
      country: 'India',
      latitude: lat,
      longitude: lon
    };
  }
}

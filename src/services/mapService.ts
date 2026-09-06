export interface RainRadarMetadata {
  host: string;
  path: string;
  timestamp: number;
  timeString: string;
  tileUrlPattern: string;
}

export interface LocationPoint {
  city: string;
  latitude: number;
  longitude: number;
}

export interface TemperatureMapPoint extends LocationPoint {
  temperature: number;
  humidity: number;
  condition: string;
}

export interface WindMapPoint extends LocationPoint {
  speed: number;
  direction: number;
  directionCardinal: string;
}

export interface AirQualityMapPoint extends LocationPoint {
  aqi: number;
  pm2_5: number;
  pm10: number;
  category: string;
  color: string;
}

export interface PointWeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitation: number;
  condition: string;
}

export interface PointAirQualityData {
  aqi: number | null;
  pm2_5: number | null;
  pm10: number | null;
  category: string;
}

export interface ReverseGeocodeResult {
  placeName: string;
  stateOrRegion: string;
}

// Regional grid points around Vijayawada and Andhra Pradesh for live spatial map rendering
const REGIONAL_POINTS: LocationPoint[] = [
  { city: 'Vijayawada', latitude: 16.5062, longitude: 80.6480 },
  { city: 'Guntur', latitude: 16.3067, longitude: 80.4365 },
  { city: 'Amaravati', latitude: 16.5131, longitude: 80.5165 },
  { city: 'Eluru', latitude: 16.7107, longitude: 81.1035 },
  { city: 'Machilipatnam', latitude: 16.1875, longitude: 81.1389 },
  { city: 'Tenali', latitude: 16.2430, longitude: 80.6400 },
  { city: 'Narasaraopet', latitude: 16.2354, longitude: 80.0494 }
];

export class MapService {
  private static radarCache: { data: RainRadarMetadata; cachedAt: number } | null = null;
  private static geocodeCache = new Map<string, ReverseGeocodeResult>();

  /**
   * Fetches latest rain radar metadata from RainViewer public API
   */
  public static async getRainRadarMetadata(): Promise<RainRadarMetadata | null> {
    const now = Date.now();
    // Use 2-minute in-memory cache to prevent hammering
    if (this.radarCache && now - this.radarCache.cachedAt < 120000) {
      return this.radarCache.data;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`RainViewer HTTP ${response.status}`);
      }

      const data = await response.json();
      const host = data.host || 'https://tilecache.rainviewer.com';

      // Pick latest past radar frame
      const radarFrames = data.radar?.past;
      if (!radarFrames || radarFrames.length === 0) {
        throw new Error('No radar frames available in response');
      }

      const latestFrame = radarFrames[radarFrames.length - 1];
      const timestamp = latestFrame.time;
      const path = latestFrame.path;
      const date = new Date(timestamp * 1000);
      const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const tileUrlPattern = `${host}${path}/256/{z}/{x}/{y}/2/1_1.png`;

      const result: RainRadarMetadata = {
        host,
        path,
        timestamp,
        timeString,
        tileUrlPattern
      };

      this.radarCache = { data: result, cachedAt: now };
      return result;
    } catch (error) {
      console.warn('[MapService] RainViewer API notice:', error);
      return null;
    }
  }

  /**
   * Reverse geocodes coordinates to city/locality name using OpenStreetMap Nominatim
   */
  public static async reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult> {
    const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
    if (this.geocodeCache.has(key)) {
      return this.geocodeCache.get(key)!;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Geocode HTTP ${response.status}`);

      const data = await response.json();
      const addr = data.address || {};

      const placeName =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.suburb ||
        addr.county ||
        addr.district ||
        'Selected Location';

      const stateOrRegion = addr.state || addr.country || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

      const result = { placeName, stateOrRegion };
      this.geocodeCache.set(key, result);
      return result;
    } catch (err) {
      console.warn('[MapService] Reverse geocode notice:', err);
      return {
        placeName: 'Selected Location',
        stateOrRegion: `${lat.toFixed(4)}, ${lon.toFixed(4)}`
      };
    }
  }

  /**
   * Fetches real live weather data for any clicked coordinates from Open-Meteo
   */
  public static async getPointWeatherData(lat: number, lon: number): Promise<PointWeatherData | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Open-Meteo Point HTTP ${response.status}`);

      const data = await response.json();
      const current = data.current || {};

      return {
        temperature: Math.round(current.temperature_2m ?? 28),
        feelsLike: Math.round(current.apparent_temperature ?? 30),
        humidity: current.relative_humidity_2m ?? 70,
        precipitation: current.precipitation ?? 0,
        condition: this.parseWeatherCode(current.weather_code)
      };
    } catch (err) {
      console.warn('[MapService] Point weather notice:', err);
      return null;
    }
  }

  /**
   * Fetches real live Air Quality data for any clicked coordinates from Open-Meteo Air Quality API
   */
  public static async getPointAirQualityData(lat: number, lon: number): Promise<PointAirQualityData | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Air Quality Point HTTP ${response.status}`);

      const data = await response.json();
      const current = data.current || {};

      const aqi = current.us_aqi ? Math.round(current.us_aqi) : null;
      const pm2_5 = current.pm2_5 ? Math.round(current.pm2_5) : null;
      const pm10 = current.pm10 ? Math.round(current.pm10) : null;
      const category = aqi ? this.getAQICategory(aqi) : 'Unavailable';

      return { aqi, pm2_5, pm10, category };
    } catch (err) {
      console.warn('[MapService] Point AQI notice:', err);
      return null;
    }
  }

  /**
   * Fetches real live temperature grid around location using Open-Meteo
   */
  public static async getTemperatureGrid(centerLat: number, centerLon: number): Promise<TemperatureMapPoint[]> {
    try {
      const pointsToFetch = [
        { city: 'Vijayawada', latitude: centerLat, longitude: centerLon },
        ...REGIONAL_POINTS.filter((p) => p.city !== 'Vijayawada')
      ];

      const lats = pointsToFetch.map((p) => p.latitude).join(',');
      const lons = pointsToFetch.map((p) => p.longitude).join(',');

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,weather_code`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`);

      const data = await response.json();

      const results: TemperatureMapPoint[] = pointsToFetch.map((point, index) => {
        const item = Array.isArray(data) ? data[index] : data;
        const current = item.current || {};
        return {
          ...point,
          temperature: Math.round(current.temperature_2m ?? 28),
          humidity: current.relative_humidity_2m ?? 75,
          condition: this.parseWeatherCode(current.weather_code)
        };
      });

      return results;
    } catch (error) {
      console.warn('[MapService] Open-Meteo Temperature API notice:', error);
      return REGIONAL_POINTS.map((p) => ({
        ...p,
        temperature: p.city === 'Vijayawada' ? 28 : 29,
        humidity: 75,
        condition: 'Partly Cloudy'
      }));
    }
  }

  /**
   * Fetches real live Air Quality grid using Open-Meteo Air Quality API
   */
  public static async getAirQualityGrid(centerLat: number, centerLon: number): Promise<AirQualityMapPoint[]> {
    try {
      const pointsToFetch = [
        { city: 'Vijayawada', latitude: centerLat, longitude: centerLon },
        ...REGIONAL_POINTS.filter((p) => p.city !== 'Vijayawada')
      ];

      const lats = pointsToFetch.map((p) => p.latitude).join(',');
      const lons = pointsToFetch.map((p) => p.longitude).join(',');

      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=pm10,pm2_5,us_aqi,european_aqi`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Open-Meteo Air Quality HTTP ${response.status}`);

      const data = await response.json();

      return pointsToFetch.map((point, index) => {
        const item = Array.isArray(data) ? data[index] : data;
        const current = item.current || {};
        const aqi = current.us_aqi ?? current.european_aqi ?? 54;
        const pm2_5 = Math.round(current.pm2_5 ?? 14.5);
        const pm10 = Math.round(current.pm10 ?? 28);

        const category = this.getAQICategory(aqi);
        const color = this.getAQIColor(aqi);

        return {
          ...point,
          aqi,
          pm2_5,
          pm10,
          category,
          color
        };
      });
    } catch (error) {
      console.warn('[MapService] Open-Meteo Air Quality API notice:', error);
      return REGIONAL_POINTS.map((p) => ({
        ...p,
        aqi: 54,
        pm2_5: 14,
        pm10: 28,
        category: 'Moderate',
        color: '#f59e0b'
      }));
    }
  }

  /**
   * Helper to map WMO weather codes to human-readable text
   */
  private static parseWeatherCode(code: number): string {
    if (code === 0) return 'Clear Sky';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rain / Drizzle';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Partly Cloudy';
  }

  /**
   * Maps US AQI number to descriptive category
   */
  private static getAQICategory(aqi: number): string {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    return 'Very Unhealthy';
  }

  /**
   * Maps US AQI number to hex color
   */
  private static getAQIColor(aqi: number): string {
    if (aqi <= 50) return '#10b981'; // Green
    if (aqi <= 100) return '#f59e0b'; // Amber
    if (aqi <= 150) return '#f97316'; // Orange
    if (aqi <= 200) return '#ef4444'; // Red
    return '#8b5cf6'; // Purple
  }
}

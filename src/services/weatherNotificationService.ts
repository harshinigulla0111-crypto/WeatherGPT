import type { CurrentWeather, LocationData, WeatherAlert, WeatherMetricsData } from '../types/weather';

export type NotificationCategory =
  | 'uv'
  | 'rain'
  | 'cold'
  | 'windy'
  | 'night'
  | 'storm'
  | 'humid'
  | 'hot'
  | 'pleasant';

export interface WeatherNotification {
  id: string;
  title: string;
  message: string;
  emoji: string;
  category: NotificationCategory;
  timestamp: number;
}

export interface WeatherSnapshot {
  temperature: number;
  rainProbability: number;
  condition: string;
  uvIndex: number;
  windSpeed: number;
  humidity: number;
  alertCount: number;
}

// Local storage key for notification preference
export const WITTY_TOASTS_STORAGE_KEY = 'weathergpt_witty_toasts_enabled';
export const WITTY_TOASTS_CHANGED_EVENT = 'weather-toasts-setting-changed';

export function areToastsEnabled(): boolean {
  try {
    const val = localStorage.getItem(WITTY_TOASTS_STORAGE_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setToastsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(WITTY_TOASTS_STORAGE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent(WITTY_TOASTS_CHANGED_EVENT, { detail: { enabled } }));
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

// Creative, varied witty template pools (at least 5 unique variations per category)
// Strictly tied to real fetched weather data fields
const NOTIFICATION_POOLS = {
  uv: [
    (uv: number, desc: string, city: string) => ({
      title: 'Solar Radiance Check',
      message: `☀️ Sun's serving serious looks today at UV ${uv} (${desc}) in ${city} — sunglasses are non-negotiable.`,
      emoji: '☀️'
    }),
    (uv: number, _desc: string, city: string) => ({
      title: 'SPF Armor Recommended',
      message: `🧴 UV index is clocking ${uv} in ${city}! Your future self called and kindly requested SPF 50 right now.`,
      emoji: '🧴'
    }),
    (uv: number, _desc: string, city: string) => ({
      title: 'Sunshade Advisory',
      message: `🕶️ High UV alert (${uv}) in ${city}. The sun woke up feeling extra bright — shade is your VIP lounge today.`,
      emoji: '🕶️'
    }),
    (uv: number, desc: string, city: string) => ({
      title: 'Peak Rays Active',
      message: `👒 ${desc} UV (${uv}) recorded over ${city}. Looking mysterious in dark shades is now a verified health measure.`,
      emoji: '👒'
    }),
    (uv: number, _desc: string, city: string) => ({
      title: 'Direct Ray Protocol',
      message: `☀️ Solar rating is sitting at ${uv} in ${city}. Don't challenge the sky to a staring match today!`,
      emoji: '☀️'
    })
  ],

  rain: [
    (p: number, _cond: string, city: string) => ({
      title: 'Precipitation Duty',
      message: `🌧️ Umbrella o'clock in ${city} — rain probability is holding steady at ${p}%. Don't leave it behind!`,
      emoji: '🌧️'
    }),
    (p: number, _cond: string, city: string) => ({
      title: 'Sky Shower Scheduled',
      message: `☔ Mother Nature has ${p}% rain scheduled for ${city}. Don't be that hero sprinting between awnings.`,
      emoji: '☔'
    }),
    (p: number, _cond: string, city: string) => ({
      title: 'Cloud Leaks Detected',
      message: `💧 ${p}% chance of rain in ${city}. Outstanding excuse for hot snacks and staying near a dry spot.`,
      emoji: '💧'
    }),
    (p: number, _cond: string, city: string) => ({
      title: 'Puddle Patrol Active',
      message: `🌧️ Rain probability hit ${p}% in ${city}. Keep your gadgets zipped up and your shoes clear of splashes!`,
      emoji: '🌧️'
    }),
    (p: number, _cond: string, city: string) => ({
      title: 'Wet Weather Heads-Up',
      message: `🌦️ Rain odds stand at ${p}% for ${city}. Your umbrella has been waiting patiently by the door for this exact moment.`,
      emoji: '🌦️'
    })
  ],

  cold: [
    (t: number, city: string) => ({
      title: 'Chilly Air Advisory',
      message: `🥶 Today said 'bring a jacket' and meant it — it's down to ${t}°C in ${city}.`,
      emoji: '🥶'
    }),
    (t: number, city: string) => ({
      title: 'Blanket Protocol',
      message: `🧣 Thermometer reads ${t}°C in ${city}. Blanket burrito mode is officially authorized by weather control.`,
      emoji: '🧣'
    }),
    (t: number, city: string) => ({
      title: 'Crisp Draft Warning',
      message: `❄️ Chilly ${t}°C air settling over ${city}. That warm sweater in the back of your wardrobe is ready for duty.`,
      emoji: '❄️'
    }),
    (t: number, city: string) => ({
      title: 'Hot Beverage Order',
      message: `☕ It's ${t}°C outside in ${city}. Medical authorities strongly suggest at least two hot drinks immediately.`,
      emoji: '☕'
    }),
    (t: number, city: string) => ({
      title: 'Pocket Warmer Weather',
      message: `🧤 Crisp ${t}°C temperatures in ${city}. Definitely a hands-in-pockets, quick-walk kind of day.`,
      emoji: '🧤'
    })
  ],

  windy: [
    (w: number, city: string) => ({
      title: 'High Velocity Notice',
      message: `💨 Hold onto your hats in ${city} — wind gusts are cruising at ${w} km/h out there!`,
      emoji: '💨'
    }),
    (w: number, city: string) => ({
      title: 'Hairstyle Advisory',
      message: `🍃 The breeze is hitting ${w} km/h in ${city}. The weather is officially redesigning your hairstyle today.`,
      emoji: '🍃'
    }),
    (w: number, city: string) => ({
      title: 'Aero Turbulence',
      message: `🌬️ Wind speeds clocked at ${w} km/h in ${city}. If you feel like a kite taking off, now you know why!`,
      emoji: '🌬️'
    }),
    (w: number, city: string) => ({
      title: 'Balcony Security Check',
      message: `💨 Gusts of ${w} km/h blowing through ${city}. Secure any rogue laundry or lightweight balcony chairs ASAP!`,
      emoji: '💨'
    }),
    (w: number, city: string) => ({
      title: 'Brisk Draft Velocity',
      message: `🍃 Rapid air circulation alert: ${w} km/h winds sweeping across ${city}. Keep a firm grip on open doors!`,
      emoji: '🍃'
    })
  ],

  humid: [
    (h: number, city: string) => ({
      title: 'Moisture Index Alert',
      message: `💦 It's a frizzy-hair kind of humid today in ${city} — humidity is sitting at a hefty ${h}%.`,
      emoji: '💦'
    }),
    (h: number, city: string) => ({
      title: 'Complimentary Steam Room',
      message: `🧖 ${h}% humidity recorded in ${city}. Welcome to Mother Nature's complimentary outdoor sauna.`,
      emoji: '🧖'
    }),
    (h: number, city: string) => ({
      title: 'Sticky Air Factor',
      message: `💧 Moisture is at ${h}% in ${city}. Lightweight breathable clothes and cold beverages are your best friends.`,
      emoji: '💧'
    }),
    (h: number, city: string) => ({
      title: 'Atmospheric Glow',
      message: `🌊 Air humidity reached ${h}% across ${city}. If you're feeling shiny, blame the dense moisture levels!`,
      emoji: '🌊'
    }),
    (h: number, city: string) => ({
      title: 'Tropical Vapor Rating',
      message: `💦 Dense humidity alert (${h}%) in ${city}. Keep the hydration flowing and stick to breezy indoor spots.`,
      emoji: '💦'
    })
  ],

  storm: [
    (w: number, city: string, alertText?: string) => ({
      title: 'Storm Alert Active',
      message: alertText
        ? `⚡ ${alertText} in ${city} (winds at ${w} km/h) — maybe skip the outdoor plans today.`
        : `⚡ Storm brewing near ${city} with ${w} km/h winds — maybe skip the evening walk and head indoors.`,
      emoji: '⚡'
    }),
    (w: number, city: string) => ({
      title: 'Thunder Ahead',
      message: `🌩️ Active storm system in ${city} with ${w} km/h gusts. Time to unplug sensitive gear and stay cozy inside.`,
      emoji: '🌩️'
    }),
    (w: number, city: string) => ({
      title: 'Turbulent Front',
      message: `🌪️ Heavy storm conditions recorded in ${city} (${w} km/h). Mother Nature is having a moment — safety first!`,
      emoji: '🌪️'
    }),
    (w: number, city: string) => ({
      title: 'Electric Atmosphere',
      message: `⚡ High storm potential around ${city}. Postpone non-essential travel until the front clears up.`,
      emoji: '⚡'
    }),
    (w: number, city: string) => ({
      title: 'Severe Horizon Notice',
      message: `🚨 Storm radar flashing for ${city} with ${w} km/h drafts. Keep your phone charged and stay off the road.`,
      emoji: '🚨'
    })
  ],

  night: [
    (t: number, city: string) => ({
      title: 'Stargazing Window',
      message: `🌌 Clear skies tonight at ${t}°C in ${city} — perfect for stargazing and late-night contemplation.`,
      emoji: '🌌'
    }),
    (t: number, city: string) => ({
      title: 'Moonlit Evening',
      message: `🌙 Crisp, peaceful night skies over ${city} (${t}°C). A stellar evening to catch some fresh air.`,
      emoji: '🌙'
    }),
    (t: number, city: string) => ({
      title: 'Constellation Check',
      message: `✨ Zero clouds blocking the view tonight in ${city} (${t}°C). Unplug your screen and look up for a bit!`,
      emoji: '✨'
    }),
    (t: number, city: string) => ({
      title: 'Quiet Skies',
      message: `🌃 Beautiful clear atmosphere over ${city} at ${t}°C. Unwind mode is officially authorized.`,
      emoji: '🌃'
    }),
    (t: number, city: string) => ({
      title: 'Night Sky Serenity',
      message: `🌠 Starry, unobstructed conditions tonight in ${city} (${t}°C). Great moment for a calm terrace pause.`,
      emoji: '🌠'
    })
  ],

  hot: [
    (t: number, city: string) => ({
      title: 'Thermal Overdrive',
      message: `🔥 It's blazing at ${t}°C in ${city} — ice cream is officially classified as essential emergency fuel today.`,
      emoji: '🔥'
    }),
    (t: number, city: string) => ({
      title: 'Heat Wave Protocol',
      message: `☀️ High heat alert: ${t}°C recorded in ${city}. Please don't challenge the sun to an endurance match today.`,
      emoji: '☀️'
    }),
    (t: number, city: string) => ({
      title: 'Sizzling Index',
      message: `🍦 It's ${t}°C in ${city}. Hydrate like you're preparing for a desert trek and seek out the strongest AC.`,
      emoji: '🍦'
    }),
    (t: number, city: string) => ({
      title: 'Solar Power Surge',
      message: `🌞 Thermometer hitting ${t}°C across ${city}. Find shade, grab cold water, and avoid peak noon sun.`,
      emoji: '🌞'
    }),
    (t: number, city: string) => ({
      title: 'Intense Summer Mode',
      message: `🕶️ Scorching ${t}°C in ${city} today. Stay cool, dress light, and keep that water bottle glued to your hand!`,
      emoji: '🕶️'
    })
  ],

  pleasant: [
    (t: number, city: string) => ({
      title: 'Golden Weather Window',
      message: `🌿 10/10 weather day in ${city}! Mild ${t}°C with comfortable breezes — go touch some grass.`,
      emoji: '🌿'
    }),
    (t: number, city: string) => ({
      title: 'Atmospheric Perfection',
      message: `🌤️ Crisp ${t}°C conditions in ${city}. The weather algorithm officially approves all outdoor plans.`,
      emoji: '🌤️'
    }),
    (t: number, city: string) => ({
      title: 'Ideal Air Quality & Temp',
      message: `✨ It honestly doesn't get much nicer than this in ${city} (${t}°C). Make the absolute most of it!`,
      emoji: '✨'
    }),
    (t: number, city: string) => ({
      title: 'Fresh Air Approved',
      message: `🚴 Pleasant ${t}°C air sweeping ${city}. Outstanding excuse for a stroll, bicycle ride, or outdoor coffee.`,
      emoji: '🚴'
    }),
    (t: number, city: string) => ({
      title: 'Optimal Conditions',
      message: `🌸 Comfortable ${t}°C and serene skies in ${city}. Soak up the good weather while it's in town!`,
      emoji: '🌸'
    })
  ]
};

function getRandomVariant<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates 1 to 2 relevant witty weather notifications based on actual API data.
 * Multiple conditions (e.g. rain + windy, or UV + hot) can generate stacked notifications.
 */
export function generateWeatherNotifications(
  weather: CurrentWeather,
  metrics: WeatherMetricsData,
  location: LocationData,
  alerts?: WeatherAlert[]
): WeatherNotification[] {
  const city = location.city || 'your area';
  const temp = Math.round(weather.temperature);
  const condLower = (weather.condition || '').toLowerCase();
  const rainProb = Math.round(metrics.rainProbability || 0);
  const uv = Math.round(metrics.uvIndex || 0);
  const wind = Math.round(metrics.windSpeed || 0);
  const humidity = Math.round(metrics.humidity || 0);

  const now = new Date();
  const currentHours = now.getHours();
  const isNightTime = currentHours >= 19 || currentHours < 6;

  const results: WeatherNotification[] = [];

  // 1. Storm / Alerts (Priority 1)
  if (alerts && alerts.length > 0) {
    const alertHead = alerts[0].event || alerts[0].description;
    const variant = getRandomVariant(NOTIFICATION_POOLS.storm);
    const item = variant(wind, city, alertHead);
    results.push({
      id: `storm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'storm',
      timestamp: Date.now()
    });
  } else if (condLower.includes('thunder') || condLower.includes('storm')) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.storm);
    const item = variant(wind, city);
    results.push({
      id: `storm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'storm',
      timestamp: Date.now()
    });
  }

  // 2. Rain expected / Active precipitation
  if (rainProb >= 40 || condLower.includes('rain') || condLower.includes('drizzle')) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.rain);
    const item = variant(rainProb, weather.condition, city);
    results.push({
      id: `rain_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'rain',
      timestamp: Date.now()
    });
  }

  // 3. High UV index (Daytime)
  if (uv >= 6 && !isNightTime) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.uv);
    const item = variant(uv, metrics.uvDescription || 'High', city);
    results.push({
      id: `uv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'uv',
      timestamp: Date.now()
    });
  }

  // 4. Windy condition
  if (wind >= 25) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.windy);
    const item = variant(wind, city);
    results.push({
      id: `windy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'windy',
      timestamp: Date.now()
    });
  }

  // 5. Extreme Heat or Cold
  if (temp >= 33) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.hot);
    const item = variant(temp, city);
    results.push({
      id: `hot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'hot',
      timestamp: Date.now()
    });
  } else if (temp <= 16) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.cold);
    const item = variant(temp, city);
    results.push({
      id: `cold_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'cold',
      timestamp: Date.now()
    });
  }

  // 6. High Humidity (only if not already raining to keep diverse)
  if (humidity >= 72 && rainProb < 50 && !condLower.includes('rain')) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.humid);
    const item = variant(humidity, city);
    results.push({
      id: `humid_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'humid',
      timestamp: Date.now()
    });
  }

  // 7. Clear Night Sky
  if (isNightTime && (condLower.includes('clear') || condLower.includes('sunny')) && results.length === 0) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.night);
    const item = variant(temp, city);
    results.push({
      id: `night_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'night',
      timestamp: Date.now()
    });
  }

  // 8. Pleasant Default if no condition triggered
  if (results.length === 0) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.pleasant);
    const item = variant(temp, city);
    results.push({
      id: `pleasant_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'pleasant',
      timestamp: Date.now()
    });
  }

  // Cap stacked notifications to at most 2 to maintain elegant UI presentation
  return results.slice(0, 2);
}

// Determines if weather conditions have meaningfully changed to justify a new alert
export function hasWeatherMeaningfullyChanged(
  prev: WeatherSnapshot | null,
  next: WeatherSnapshot
): boolean {
  if (!prev) return false;

  // 1. New alert added
  if (next.alertCount > prev.alertCount) {
    return true;
  }

  // 2. Temperature swing >= 3.5°C
  if (Math.abs(prev.temperature - next.temperature) >= 3.5) {
    return true;
  }

  // 3. Rain probability crosses 50% threshold or swings >= 25%
  const crossedFiftyRain =
    (prev.rainProbability < 50 && next.rainProbability >= 50) ||
    (prev.rainProbability >= 50 && next.rainProbability < 50);
  if (crossedFiftyRain || Math.abs(prev.rainProbability - next.rainProbability) >= 25) {
    return true;
  }

  // 4. UV index becomes high (crosses 6)
  const crossedHighUv = (prev.uvIndex < 6 && next.uvIndex >= 6) || (prev.uvIndex >= 6 && next.uvIndex < 6);
  if (crossedHighUv) {
    return true;
  }

  // 5. Wind velocity shifts significantly (>= 15 km/h change or crosses 28 km/h)
  const crossedWindy = (prev.windSpeed < 28 && next.windSpeed >= 28) || (prev.windSpeed >= 28 && next.windSpeed < 28);
  if (crossedWindy || Math.abs(prev.windSpeed - next.windSpeed) >= 15) {
    return true;
  }

  // 6. Humidity swings >= 20%
  if (Math.abs(prev.humidity - next.humidity) >= 20) {
    return true;
  }

  // 7. Condition changes into or out of storm / rain
  const prevCond = (prev.condition || '').toLowerCase();
  const nextCond = (next.condition || '').toLowerCase();

  const isPrevSevere = prevCond.includes('rain') || prevCond.includes('storm') || prevCond.includes('thunder');
  const isNextSevere = nextCond.includes('rain') || nextCond.includes('storm') || nextCond.includes('thunder');

  if (!isPrevSevere && isNextSevere) {
    return true;
  }

  return false;
}

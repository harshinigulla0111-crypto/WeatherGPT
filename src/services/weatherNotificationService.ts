import type { CurrentWeather, LocationData, WeatherAlert, WeatherMetricsData } from '../types/weather';

export interface WeatherNotification {
  id: string;
  title: string;
  message: string;
  emoji: string;
  category: 'hot' | 'rain' | 'cold' | 'uv' | 'night' | 'storm' | 'pleasant';
  timestamp: number;
}

export interface WeatherSnapshot {
  temperature: number;
  rainProbability: number;
  condition: string;
  uvIndex: number;
}

// Template pool generator with at least 5 variants per category
const NOTIFICATION_POOLS = {
  hot: [
    (t: number, c: string) => ({
      title: 'Solar Powerhouse Alert',
      message: `☀️ It's blazing out there at ${t}°C in ${c} — sunglasses, don't leave home without them.`,
      emoji: '☀️'
    }),
    (t: number, c: string) => ({
      title: 'Heat Wave Protocol',
      message: `🔥 Hitting ${t}°C in ${c} today! Stay hydrated and don't challenge the sun to a staring contest.`,
      emoji: '🔥'
    }),
    (t: number, c: string) => ({
      title: 'Official Sun Advisory',
      message: `🍦 It's ${t}°C in ${c}. Ice cream is officially classified as an emergency medical supply today.`,
      emoji: '🍦'
    }),
    (t: number, c: string) => ({
      title: 'Thermal Check',
      message: `🌞 The sun woke up and chose violence in ${c} (${t}°C). Seek shade and keep water handy, friend.`,
      emoji: '🌞'
    }),
    (t: number, c: string) => ({
      title: 'High Temp Alert',
      message: `🕶️ Temperature's clocking in at ${t}°C in ${c}. Your shades aren't an accessory today, they're essential armor.`,
      emoji: '🕶️'
    })
  ],

  rain: [
    (p: number, c: string) => ({
      title: 'Precipitation Warning',
      message: `🌧️ Rain's rolling in with ${p}% probability in ${c} — grab that umbrella before you regret it.`,
      emoji: '🌧️'
    }),
    (p: number, c: string) => ({
      title: 'Sky Shower Incoming',
      message: `☔ Mother Nature has ${p}% rain scheduled for ${c}. Don't be that person sprinting between awnings!`,
      emoji: '☔'
    }),
    (p: number, c: string) => ({
      title: 'Cloud Leaks Detected',
      message: `💧 ${p}% chance of rain in ${c}. Keep your gear dry and your hot beverage close.`,
      emoji: '💧'
    }),
    (p: number, c: string) => ({
      title: 'Umbrella Duty',
      message: `🌧️ Wet weather alert for ${c} (${p}% prob)! Your umbrella has been waiting in the closet for this moment.`,
      emoji: '🌧️'
    }),
    (p: number, c: string) => ({
      title: 'Puddle Patrol',
      message: `🌧️ Rain chances at ${p}% in ${c}. Great day for staying dry and planning indoor victories.`,
      emoji: '🌧️'
    })
  ],

  cold: [
    (t: number, c: string) => ({
      title: 'Chilly Vibes',
      message: `🥶 Chilly one today at ${t}°C in ${c} — that jacket isn't optional.`,
      emoji: '🥶'
    }),
    (t: number, c: string) => ({
      title: 'Layer Up',
      message: `🧣 Sitting at ${t}°C in ${c}! Time to see if that warm hoodie actually earns its keep.`,
      emoji: '🧣'
    }),
    (t: number, c: string) => ({
      title: 'Crisp Air Advisory',
      message: `❄️ Cold snap in ${c} (${t}°C). Blanket burrito mode is officially authorized.`,
      emoji: '❄️'
    }),
    (t: number, c: string) => ({
      title: 'Hot Drink Weather',
      message: `☕ It's ${t}°C in ${c}. We prescribe at least two cups of hot coffee or tea immediately.`,
      emoji: '☕'
    }),
    (t: number, c: string) => ({
      title: 'Winter Shiver Alert',
      message: `🧤 Brrr! Temperature is down to ${t}°C in ${c}. Bundle up before heading out into the draft.`,
      emoji: '🧤'
    })
  ],

  uv: [
    (uv: number, desc: string, c: string) => ({
      title: 'Sunscreen Check',
      message: `🕶️ UV's high right now at index ${uv} (${desc}) in ${c} — a little sunscreen goes a long way.`,
      emoji: '🕶️'
    }),
    (uv: number, _desc: string, c: string) => ({
      title: 'UV Shield Recommended',
      message: `🧴 UV is hitting ${uv} in ${c}! Your skin called; it requested SPF 50 right now.`,
      emoji: '🧴'
    }),
    (uv: number, _desc: string, c: string) => ({
      title: 'Solar Radiance Alert',
      message: `☀️ UV level ${uv} recorded in ${c}. The sun means business today — sunglasses on standby!`,
      emoji: '☀️'
    }),
    (uv: number, desc: string, c: string) => ({
      title: 'Shade Seeker',
      message: `🕶️ ${desc} UV (${uv}) outside in ${c}! Shade is officially your best friend for the next couple hours.`,
      emoji: '🕶️'
    }),
    (uv: number, _desc: string, c: string) => ({
      title: 'Sun Protection Active',
      message: `🧴 Solar index sitting at ${uv} in ${c}. Protect those shoulders and grab a hat if heading out.`,
      emoji: '🧴'
    })
  ],

  night: [
    (t: number, c: string) => ({
      title: 'Night Sky Walk',
      message: `🌌 Clear skies tonight at ${t}°C — perfect for a peaceful walk under the stars in ${c}.`,
      emoji: '🌌'
    }),
    (t: number, c: string) => ({
      title: 'Stargazing Window',
      message: `✨ Crisp, clear night skies over ${c} (${t}°C). A stellar evening to look up and unwind.`,
      emoji: '✨'
    }),
    (t: number, c: string) => ({
      title: 'Moonlit Evening',
      message: `🌙 Beautiful clear conditions tonight in ${c} (${t}°C). Great excuse for some evening fresh air.`,
      emoji: '🌙'
    }),
    (t: number, c: string) => ({
      title: 'Starry Atmosphere',
      message: `🌠 Zero clouds blocking the view tonight in ${c}. Take a second to step outside and catch the moon!`,
      emoji: '🌠'
    }),
    (t: number, c: string) => ({
      title: 'Quiet Skies',
      message: `🌃 Peaceful clear night in ${c} at ${t}°C. Unwind mode fully activated.`,
      emoji: '🌃'
    })
  ],

  storm: [
    (w: number, c: string) => ({
      title: 'Storm Alert',
      message: `⚡ Storm brewing nearby with winds at ${w} km/h in ${c} — might want to postpone that evening jog.`,
      emoji: '⚡'
    }),
    (w: number, c: string) => ({
      title: 'Severe Weather Warning',
      message: `🌩️ Thunderstorm activity in the sector (${c}). Secure loose balcony items and stay cozy indoors.`,
      emoji: '🌩️'
    }),
    (w: number, c: string) => ({
      title: 'Wind & Lightning Advisory',
      message: `🌪️ Gusty winds (${w} km/h) and thunder clouds rolling into ${c}. Safety first today!`,
      emoji: '🌪️'
    }),
    (w: number, c: string) => ({
      title: 'Rumble Radar',
      message: `⚡ Electrical storm detected near ${c}. Unplug non-essential electronics and enjoy the indoor view.`,
      emoji: '⚡'
    }),
    (w: number, _c: string) => ({
      title: 'Active Storm Protocol',
      message: `🚨 Storm conditions active in your region. Check live radar updates before driving!`,
      emoji: '🚨'
    })
  ],

  pleasant: [
    (t: number, c: string) => ({
      title: 'Prime Outdoor Weather',
      message: `🌿 10/10 weather day in ${c}! ${t}°C with gentle breezes — go touch some grass.`,
      emoji: '🌿'
    }),
    (t: number, c: string) => ({
      title: 'Weather Perfection',
      message: `🌤️ Crisp ${t}°C conditions in ${c}. The weather algorithm officially approves your outdoor plans.`,
      emoji: '🌤️'
    }),
    (t: number, c: string) => ({
      title: 'Fresh Air Window',
      message: `🚴 Pleasant ${t}°C air across ${c}. Outstanding day for a bike ride or casual walk outside.`,
      emoji: '🚴'
    }),
    (t: number, c: string) => ({
      title: 'Ideal Atmosphere',
      message: `✨ It honestly doesn't get much nicer than this in ${c} (${t}°C). Enjoy every bit of it!`,
      emoji: '✨'
    }),
    (t: number, c: string) => ({
      title: 'Golden Weather Opportunity',
      message: `🌤️ Mild ${t}°C and calm conditions in ${c}. Make the most of this comfortable atmospheric window.`,
      emoji: '🌤️'
    })
  ]
};

function getRandomVariant<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateWeatherNotification(
  weather: CurrentWeather,
  metrics: WeatherMetricsData,
  location: LocationData,
  alerts?: WeatherAlert[]
): WeatherNotification {
  const city = location.city || 'your area';
  const temp = Math.round(weather.temperature);
  const condLower = (weather.condition || '').toLowerCase();
  const rainProb = metrics.rainProbability || 0;
  const uv = metrics.uvIndex || 0;
  const wind = Math.round(metrics.windSpeed || 0);

  const now = new Date();
  const currentHours = now.getHours();
  const isNightTime = currentHours >= 19 || currentHours < 6;

  // 1. Storm / Severe alert (Highest priority)
  if (alerts && alerts.length > 0) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.storm);
    const item = variant(wind, city);
    return {
      id: 'notif_' + Date.now(),
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'storm',
      timestamp: Date.now()
    };
  }

  if (condLower.includes('thunder') || condLower.includes('storm')) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.storm);
    const item = variant(wind, city);
    return {
      id: 'notif_' + Date.now(),
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'storm',
      timestamp: Date.now()
    };
  }

  // 2. Rain expected / Active rain
  if (rainProb >= 40 || condLower.includes('rain') || condLower.includes('drizzle')) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.rain);
    const item = variant(rainProb, city);
    return {
      id: 'notif_' + Date.now(),
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'rain',
      timestamp: Date.now()
    };
  }

  // 3. Extreme Heat
  if (temp >= 32) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.hot);
    const item = variant(temp, city);
    return {
      id: 'notif_' + Date.now(),
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'hot',
      timestamp: Date.now()
    };
  }

  // 4. High UV
  if (uv >= 6 && !isNightTime) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.uv);
    const item = variant(uv, metrics.uvDescription || 'High', city);
    return {
      id: 'notif_' + Date.now(),
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'uv',
      timestamp: Date.now()
    };
  }

  // 5. Cold
  if (temp <= 16) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.cold);
    const item = variant(temp, city);
    return {
      id: 'notif_' + Date.now(),
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'cold',
      timestamp: Date.now()
    };
  }

  // 6. Clear Night
  if (isNightTime && (condLower.includes('clear') || condLower.includes('sunny'))) {
    const variant = getRandomVariant(NOTIFICATION_POOLS.night);
    const item = variant(temp, city);
    return {
      id: 'notif_' + Date.now(),
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      category: 'night',
      timestamp: Date.now()
    };
  }

  // 7. Pleasant default
  const variant = getRandomVariant(NOTIFICATION_POOLS.pleasant);
  const item = variant(temp, city);
  return {
    id: 'notif_' + Date.now(),
    title: item.title,
    message: item.message,
    emoji: item.emoji,
    category: 'pleasant',
    timestamp: Date.now()
  };
}

// Determines if condition change warrants an in-app push notification
export function hasWeatherMeaningfullyChanged(
  prev: WeatherSnapshot | null,
  next: WeatherSnapshot
): boolean {
  if (!prev) return false;

  // 1. Temperature change >= 4°C
  if (Math.abs(prev.temperature - next.temperature) >= 4) {
    return true;
  }

  // 2. Rain probability swing >= 25% or crosses 50% threshold
  if (Math.abs(prev.rainProbability - next.rainProbability) >= 25) {
    return true;
  }
  if ((prev.rainProbability < 50 && next.rainProbability >= 50) || (prev.rainProbability >= 50 && next.rainProbability < 50)) {
    return true;
  }

  // 3. Condition changes into rain or thunderstorm
  const prevCond = (prev.condition || '').toLowerCase();
  const nextCond = (next.condition || '').toLowerCase();

  const isPrevWet = prevCond.includes('rain') || prevCond.includes('storm');
  const isNextWet = nextCond.includes('rain') || nextCond.includes('storm');

  if (!isPrevWet && isNextWet) {
    return true;
  }

  return false;
}

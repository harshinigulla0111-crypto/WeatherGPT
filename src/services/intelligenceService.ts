import type { WeatherInsightCard, WeatherIntelligenceDecision } from '../types/weather';

export class IntelligenceService {
  public static getPersonalizedDecisions(): WeatherIntelligenceDecision[] {
    return [
      {
        id: 'umbrella',
        category: 'umbrella',
        title: 'Carry an umbrella',
        description: 'Rain is likely later today (after 3 PM).',
        icon: 'umbrella',
        urgency: 'high'
      },
      {
        id: 'activity',
        category: 'activity',
        title: 'Best time to go outside',
        description: 'Conditions are comfortable until the afternoon (7 AM – 10 AM window).',
        icon: 'sun',
        urgency: 'low'
      },
      {
        id: 'travel',
        category: 'travel',
        title: 'Smart travel window',
        description: 'Lower rain probability is expected during this period (leave before 3 PM).',
        icon: 'car',
        urgency: 'medium'
      },
      {
        id: 'clothing',
        category: 'clothing',
        title: 'What to wear',
        description: 'Light breathable cotton clothing is recommended today.',
        icon: 'shirt',
        urgency: 'low'
      }
    ];
  }

  public static getWeatherInsights(): WeatherInsightCard[] {
    return [
      {
        id: 'rain-pattern',
        title: 'Rain Intensity Pattern',
        subtitle: '3 PM – 6 PM Surge',
        category: 'Rain Pattern',
        detail: 'Rain is likely to intensify between 3 PM and 6 PM with estimated accumulation of 18mm.'
      },
      {
        id: 'heat-index',
        title: 'Perceived Thermal Comfort',
        subtitle: 'Feels like 30°C',
        category: 'Heat',
        detail: 'Afternoon temperatures may feel warmer due to 72% relative humidity level.'
      },
      {
        id: 'air-quality',
        title: 'Atmospheric Health',
        subtitle: 'AQI 54 Good',
        category: 'Air Quality',
        detail: 'Air quality is currently clean and suitable for all outdoor activity.'
      },
      {
        id: 'travel-visibility',
        title: 'Roadway Conditions',
        subtitle: '8 km Visibility',
        category: 'Travel',
        detail: 'Visibility remains clear through the morning, dropping slightly during afternoon rain.'
      }
    ];
  }
}

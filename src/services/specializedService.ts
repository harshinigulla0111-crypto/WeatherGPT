import type { AviationData, CropType, FarmerData, MarineData, SmartCityData } from '../types/specialized';

export class SpecializedService {
  public static getFarmerData(crop: CropType = 'Rice'): FarmerData {
    const cropAdvices: Record<CropType, string> = {
      Rice: 'Rain is likely within 24 hours (70% prob). Consider delaying planned nitrogen fertilizer & irrigation application.',
      Cotton: 'High humidity (72%) and afternoon rain pose boll rot risk. Ensure field drainage channels are clear.',
      Chilli: 'Precipitation expected after 3 PM. Protect harvested pods and avoid pesticide spraying after 1 PM.',
      Groundnut: 'Soil moisture is optimal at 48%. Delay artificial irrigation as 18mm rainfall is expected.',
      Maize: 'Breezy conditions (14 km/h) with rain. No lodging risk reported; hold irrigation for 48 hours.'
    };

    return {
      crop,
      soilMoisturePercent: 48,
      temperatureCelsius: 28,
      rainfall24hMm: 18,
      rainfallDeficitPercent: -5, // slight excess
      cropStressLevel: 'Low',
      irrigationRecommendation: 'Delay irrigation for 24-48 hours.',
      adviceDetails: cropAdvices[crop]
    };
  }

  public static getAviationData(): AviationData {
    return {
      visibilityKm: 8,
      windSpeedKmh: 14,
      windDirectionDegrees: 240,
      windDirectionText: 'WSW',
      cloudBaseFeet: 2500,
      cloudCondition: 'FEW025 SCT080',
      thunderstormRisk: 'Moderate',
      precipitationMm: 12,
      pressureHpa: 1012,
      tempCelsius: 28,
      metarRaw: 'VOBM 050530Z 24008KT 8000 TS FEW025 SCT080 28/23 Q1012 NOSIG',
      flightCategory: 'VFR'
    };
  }

  public static getMarineData(): MarineData {
    return {
      windSpeedKts: 12,
      waveHeightMeters: 1.4,
      waveDirection: 'SSW',
      visibilityNauticalMiles: 6,
      rainIntensity: 'Moderate Showers expected after 15:00 IST',
      thunderstormRisk: 'Moderate over Bay of Bengal coast',
      cycloneWatch: 'No active cyclonic depression detected',
      seaCondition: 'Slight',
      tideHigh: '1:45 PM (1.8m)',
      tideLow: '7:20 PM (0.4m)',
      advisoryBriefing: 'Small fishing vessels advised to exercise caution near Machilipatnam & Nizampatnam coast after 3 PM due to squally wind gusts up to 22 knots.'
    };
  }

  public static getSmartCityData(): SmartCityData {
    return {
      heatZoneStatus: 'Normal',
      floodProneRoadsCount: 3,
      roadDisruptionRisk: 'Moderate',
      rainfallIntensityMm: 18,
      activeFacilitiesOpen: 12,
      vulnerablePopulationCount: 14200,
      cityAlertLevel: 'YELLOW (WATCH)'
    };
  }
}

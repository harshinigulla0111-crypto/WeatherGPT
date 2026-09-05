import type { DisasterAlert, FamilyMember, ShelterData } from '../types/disaster';

export class DisasterService {
  public static getActiveFloodAlert(): DisasterAlert {
    return {
      id: 'alert-flood-01',
      title: 'FLOOD WARNING',
      type: 'FLOOD WARNING',
      severity: 'HIGH',
      description: 'Severe rainfall is affecting your area in Vijayawada (Krishna River Basin).',
      rainfallMm: 96,
      floodRisk: 'HIGH',
      next3HoursForecast: 'Heavy rainfall (35-45 mm/hr) expected continuously.',
      issuedAt: 'Updated 10 mins ago'
    };
  }

  public static getSafeShelters(): ShelterData[] {
    return [
      {
        id: 'shelter-1',
        name: 'Government Relief Center (Indira Gandhi Stadium)',
        distanceKm: 1.2,
        status: 'Open',
        capacityPercentage: 72,
        accessible: true,
        address: 'MG Road, Labbipet, Vijayawada',
        contactNumber: '+91 866 247 1234',
        latitude: 16.5020,
        longitude: 80.6400
      },
      {
        id: 'shelter-2',
        name: 'District High School Emergency Center',
        distanceKm: 2.4,
        status: 'Open',
        capacityPercentage: 45,
        accessible: true,
        address: 'Governorpet, Vijayawada',
        contactNumber: '+91 866 255 4321',
        latitude: 16.5150,
        longitude: 80.6300
      },
      {
        id: 'shelter-3',
        name: 'Community Hall Flood Evacuation Hub',
        distanceKm: 3.8,
        status: 'Open',
        capacityPercentage: 88,
        accessible: false,
        address: 'Satyanarayanapuram, Vijayawada',
        contactNumber: '+91 866 288 9900',
        latitude: 16.5250,
        longitude: 80.6550
      }
    ];
  }

  public static getFamilySafetyCircle(): FamilyMember[] {
    return [
      { id: 'm1', name: 'Mom', relationship: 'Mother', status: 'SAFE', lastSeen: '5 mins ago', locationName: 'Vijayawada Home', phone: '+91 98765 43210' },
      { id: 'm2', name: 'Dad', relationship: 'Father', status: 'SAFE', lastSeen: '12 mins ago', locationName: 'Office, MG Road', phone: '+91 98765 43211' },
      { id: 'm3', name: 'Brother (Ravi)', relationship: 'Brother', status: 'AT RISK', lastSeen: '35 mins ago', locationName: 'Near Prakasam Barrage', phone: '+91 98765 43212' },
      { id: 'm4', name: 'You', relationship: 'Self', status: 'SAFE', lastSeen: 'Now', locationName: 'Vijayawada', phone: '+91 98765 00000' }
    ];
  }
}

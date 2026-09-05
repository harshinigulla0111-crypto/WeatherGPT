export interface NovaChatMessage {
  id: string;
  sender: 'user' | 'nova';
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  actionItems?: string[];
}

export interface SuggestedPrompt {
  id: string;
  label: string;
  category?: 'normal' | 'disaster';
}

export class NovaService {
  public static getSuggestedPrompts(isDisaster: boolean = false): SuggestedPrompt[] {
    if (isDisaster) {
      return [
        { id: 'danger', label: "I'M IN DANGER", category: 'disaster' },
        { id: 'shelter', label: 'FIND SAFE SHELTER', category: 'disaster' },
        { id: 'action', label: 'WHAT SHOULD I DO?', category: 'disaster' },
        { id: 'location', label: 'SHARE MY LOCATION', category: 'disaster' },
        { id: 'family', label: 'CHECK FAMILY', category: 'disaster' },
        { id: 'emergency', label: 'CALL EMERGENCY (112)', category: 'disaster' }
      ];
    }

    return [
      { id: 'rain', label: 'Will it rain today?' },
      { id: 'travel-4pm', label: 'Should I travel at 4 PM?' },
      { id: 'safe-outside', label: 'Is it safe to go outside?' },
      { id: 'carry', label: 'What should I carry today?' },
      { id: 'tomorrow', label: "Explain tomorrow's weather." },
      { id: 'risk', label: 'Is my area at risk?' }
    ];
  }

  public static processQuery(
    query: string,
    history: NovaChatMessage[],
    isDisaster: boolean = false
  ): NovaChatMessage {
    const qLower = query.toLowerCase().trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isDisaster) {
      if (qLower.includes('danger') || qLower.includes('help') || qLower.includes('stuck')) {
        return {
          id: Date.now().toString(),
          sender: 'nova',
          text: "Stay calm. I am broadcasting your exact GPS coordinates to regional emergency dispatch.",
          timestamp: timeStr,
          isEmergency: true,
          actionItems: [
            "Move to higher ground or upper floors immediately.",
            "Avoid touch with electrical sockets or fallen power cables.",
            "Keep emergency contact numbers handy on speed dial."
          ]
        };
      }

      if (qLower.includes('shelter') || qLower.includes('safe place')) {
        return {
          id: Date.now().toString(),
          sender: 'nova',
          text: "The nearest relief shelter is Government Relief Center (1.2 km away, 72% capacity). Route navigation is ready on your map.",
          timestamp: timeStr,
          isEmergency: true,
          actionItems: [
            "Government Relief Center (1.2 km - Open)",
            "District High School Shelter (2.4 km - Open)",
            "Pack medicines, ID proof, and water bottle before moving."
          ]
        };
      }

      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: "Emergency Flood Warning is active in Vijayawada. Heavy rainfall (96 mm) is expected over the next 3 hours.",
        timestamp: timeStr,
        isEmergency: true,
        actionItems: [
          "Move away from low-lying areas if safe to do so.",
          "Keep your phone and power bank charged.",
          "Carry essential medicines and documents.",
          "Do NOT walk or drive through moving floodwater."
        ]
      };
    }

    // Contextual evaluation from history
    const lastUserMsg = [...history].reverse().find((m) => m.sender === 'user')?.text.toLowerCase() || '';

    if (qLower.includes('rain')) {
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: "Yes. Rain is most likely between 3:00 PM and 6:00 PM today in Vijayawada, with an 85% probability around 4 PM.",
        timestamp: timeStr
      };
    }

    if (qLower.includes('college') || qLower.includes('travel') || qLower.includes('4 pm') || qLower.includes('leave')) {
      if (lastUserMsg.includes('rain') || qLower.includes('4')) {
        return {
          id: Date.now().toString(),
          sender: 'nova',
          text: "I'd recommend leaving earlier if possible. Rain probability reaches peak intensity around 4:00 PM (24 km/h wind gusts & 18mm rain).",
          timestamp: timeStr
        };
      }
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: "Traveling before 3:00 PM is recommended. Heavy rain after 3:30 PM may slow down road traffic near MG Road and Bandar Road.",
        timestamp: timeStr
      };
    }

    if (qLower.includes('tomorrow')) {
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: "Tomorrow looks much more stable! Sunny with a high of 30°C and only a 20% rain chance during your usual travel hours.",
        timestamp: timeStr
      };
    }

    if (qLower.includes('carry') || qLower.includes('wear') || qLower.includes('bring')) {
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: "You should carry an umbrella and wear water-resistant footwear today. Light breathable clothing is ideal until the 3 PM temperature drop.",
        timestamp: timeStr
      };
    }

    if (qLower.includes('safe') || qLower.includes('outside') || qLower.includes('outdoors')) {
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: "Morning hours (7 AM – 10 AM) are completely safe and clear (28°C, AQI 54). However, avoid open fields during late afternoon thunderstorms.",
        timestamp: timeStr
      };
    }

    if (qLower.includes('risk') || qLower.includes('danger')) {
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: "Vijayawada is currently at LOW flood risk. However, prolonged rain past 4 PM could cause minor waterlogging near low-lying drains.",
        timestamp: timeStr
      };
    }

    // Default intelligent response
    return {
      id: Date.now().toString(),
      sender: 'nova',
      text: `Based on atmospheric data for Vijayawada, current temperature is 28°C with Partly Cloudy skies. Rain risk rises significantly after 3 PM. How else can I assist your schedule?`,
      timestamp: timeStr
    };
  }
}

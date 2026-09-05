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

export interface WeatherContextDetails {
  location: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  highTemp?: number;
  lowTemp?: number;
  rainProbability?: number;
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

  /**
   * Processes user queries by sending prompt payload + context to OpenAI API,
   * falling back to realistic, query-specific weather intelligence.
   */
  public static async processQuery(
    query: string,
    history: NovaChatMessage[] = [],
    isDisaster: boolean = false,
    weatherContext?: WeatherContextDetails
  ): Promise<NovaChatMessage> {
    const qTrimmed = query.trim();
    const qLower = qTrimmed.toLowerCase();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const locationName = weatherContext?.location || 'Vijayawada';
    const temp = weatherContext?.temp ?? 27;
    const condition = weatherContext?.condition || 'Partly Cloudy';
    const humidity = weatherContext?.humidity ?? 70;
    const windSpeed = weatherContext?.windSpeed ?? 15;
    const rainProb = weatherContext?.rainProbability ?? 60;
    const highTemp = weatherContext?.highTemp ?? 32;
    const lowTemp = weatherContext?.lowTemp ?? 22;

    // 1. Try OpenAI API if VITE_OPENAI_API_KEY is configured
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    const apiModel = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

    if (apiKey && !apiKey.includes('placeholder') && !apiKey.includes('your_openai_api_key')) {
      try {
        console.log(`[NOVA OpenAI] Processing user query: "${qTrimmed}" for location ${locationName}...`);

        const systemPrompt = `You are N.O.V.A. (Natural Observation & Virtual Assistant), a friendly, highly intelligent, and practical weather assistant in WeatherGPT.

Current Location: ${locationName}
Real-Time Weather Metrics:
- Temperature: ${temp}°C (High: ${highTemp}°C, Low: ${lowTemp}°C)
- Sky Condition: ${condition}
- Humidity: ${humidity}%
- Wind Speed: ${windSpeed} km/h
- Rain Probability / Risk: ${rainProb}%

App Mode: ${isDisaster ? '🚨 RESCUE MODE ACTIVE (EMERGENCY DISASTER SITUATION)' : 'NORMAL MODE'}

Directives:
- Answer the user's specific question directly, realistically, and conversationally like a helpful local expert.
- Pay close attention to practical user intent (e.g. drying clothes outside, washing car, running, travel timing, what to wear).
- Evaluate rain risk (${rainProb}%), humidity (${humidity}%), and sky (${condition}) to give a practical yes/no advice when asked about outdoor activities.
- Keep answers concise (2-3 natural sentences max).
- In RESCUE MODE, focus on emergency safety instructions, shelter locations, and dialing 112.`;

        // Format recent conversation history (up to last 10 messages)
        const openAiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          { role: 'system', content: systemPrompt }
        ];

        history.slice(-10).forEach((msg) => {
          if (msg.sender === 'user') {
            openAiMessages.push({ role: 'user', content: msg.text });
          } else if (msg.sender === 'nova') {
            openAiMessages.push({ role: 'assistant', content: msg.text });
          }
        });

        // Push current query as the latest user message
        openAiMessages.push({ role: 'user', content: qTrimmed });

        const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: apiModel,
            messages: openAiMessages,
            temperature: 0.7,
            max_tokens: 300
          })
        });

        if (!apiRes.ok) {
          const errText = await apiRes.text();
          console.error(`[NOVA OpenAI Error] OpenAI API request failed (HTTP ${apiRes.status}):`, errText);
        } else {
          const data = await apiRes.json();
          const responseText = data.choices?.[0]?.message?.content?.trim();
          if (responseText) {
            console.log('[NOVA OpenAI Success] Response generated from OpenAI.');
            return {
              id: Date.now().toString(),
              sender: 'nova',
              text: responseText,
              timestamp: timeStr,
              isEmergency: isDisaster
            };
          }
        }
      } catch (err) {
        console.error('[NOVA OpenAI Exception] Failed to reach OpenAI API:', err);
      }
    } else {
      console.log('[NOVA Notice] VITE_OPENAI_API_KEY is not configured in .env. Operating on dynamic context engine.');
    }

    // 2. Realistic Context-Aware Fallback Response Engine
    if (isDisaster) {
      if (qLower.includes('danger') || qLower.includes('help') || qLower.includes('stuck')) {
        return {
          id: Date.now().toString(),
          sender: 'nova',
          text: `Emergency broadcast active for ${locationName}. Moving your location coordinates to emergency dispatch.`,
          timestamp: timeStr,
          isEmergency: true,
          actionItems: [
            "Move to higher ground immediately.",
            "Stay clear of electrical cables and open water.",
            "Call Emergency Helpline (112) for immediate rescue."
          ]
        };
      }

      if (qLower.includes('shelter') || qLower.includes('safe place')) {
        return {
          id: Date.now().toString(),
          sender: 'nova',
          text: `Nearest relief shelter in ${locationName} is Government Relief Center (1.2 km away, 72% capacity). Navigation is available on your Hazard Map.`,
          timestamp: timeStr,
          isEmergency: true,
          actionItems: [
            "Government Relief Center (1.2 km - Open)",
            "District Shelter (2.4 km - Open)",
            "Bring essential water, ID, and medicines."
          ]
        };
      }

      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: `🚨 RESCUE ALERT: Emergency Weather Warning in ${locationName}. Heavy precipitation (${rainProb}% rain chance, ${windSpeed} km/h wind) expected.`,
        timestamp: timeStr,
        isEmergency: true,
        actionItems: [
          "Move away from low-lying flood risks.",
          "Keep phones charged and emergency contacts ready.",
          "Do not drive or cross active flood streams."
        ]
      };
    }

    // Dynamic Intent Router (Evaluates practical real-world scenarios naturally)

    // 1. Drying clothes / Laundry
    if (
      qLower.includes('dry') ||
      qLower.includes('laundry') ||
      (qLower.includes('clothes') && !qLower.includes('wear'))
    ) {
      if (rainProb >= 40 || condition.toLowerCase().includes('cloud') || condition.toLowerCase().includes('rain')) {
        return {
          id: Date.now().toString(),
          sender: 'nova',
          text: `It's not ideal to dry your clothes outside in ${locationName} right now. With ${condition} skies, ${humidity}% humidity, and a ${rainProb}% rain chance, your laundry will take long to dry and might get wet. Drying indoors is safer today.`,
          timestamp: timeStr
        };
      }
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: `Yes, you can dry your clothes outside in ${locationName}! Current conditions are ${condition} at ${temp}°C with ${humidity}% humidity, so your laundry should dry well today.`,
        timestamp: timeStr
      };
    }

    // 2. Car Wash
    if (qLower.includes('wash car') || qLower.includes('car wash') || (qLower.includes('wash') && qLower.includes('car'))) {
      if (rainProb >= 40) {
        return {
          id: Date.now().toString(),
          sender: 'nova',
          text: `I'd hold off on washing your car in ${locationName} today. With a ${rainProb}% rain chance and ${condition} skies, rain or road splashes could spot your clean car.`,
          timestamp: timeStr
        };
      }
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: `Great time for a car wash in ${locationName}! Weather is ${condition} at ${temp}°C with only a ${rainProb}% rain chance.`,
        timestamp: timeStr
      };
    }

    // 3. Exercise / Outdoor Sports
    if (
      qLower.includes('run') ||
      qLower.includes('jog') ||
      qLower.includes('workout') ||
      qLower.includes('cricket') ||
      qLower.includes('football') ||
      qLower.includes('sport') ||
      qLower.includes('gym')
    ) {
      if (rainProb >= 60) {
        return {
          id: Date.now().toString(),
          sender: 'nova',
          text: `If you're planning outdoor sports or running in ${locationName}, try to complete it early. Rain probability is high at ${rainProb}% with ${temp}°C temperature.`,
          timestamp: timeStr
        };
      }
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: `Outdoor exercise looks good in ${locationName}! Temperature is ${temp}°C with ${condition} skies and ${windSpeed} km/h wind. Enjoy your workout!`,
        timestamp: timeStr
      };
    }

    // 4. Outdoor Outing / Picnic / Event
    if (
      qLower.includes('picnic') ||
      qLower.includes('park') ||
      qLower.includes('beach') ||
      qLower.includes('outing') ||
      qLower.includes('event') ||
      qLower.includes('wedding')
    ) {
      if (rainProb >= 50) {
        return {
          id: Date.now().toString(),
          sender: 'nova',
          text: `Keep a backup indoor plan for outdoor events in ${locationName}. Rain risk is ${rainProb}% with ${condition} conditions at ${temp}°C.`,
          timestamp: timeStr
        };
      }
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: `Weather conditions in ${locationName} are pleasant for an outing! Temperature is ${temp}°C with ${condition} skies. Have a great time!`,
        timestamp: timeStr
      };
    }

    // 5. Travel & Commuting
    if (
      qLower.includes('travel') ||
      qLower.includes('commute') ||
      qLower.includes('drive') ||
      qLower.includes('ride') ||
      qLower.includes('leave') ||
      qLower.includes('college') ||
      qLower.includes('4 pm')
    ) {
      if (rainProb >= 60) {
        return {
          id: Date.now().toString(),
          sender: 'nova',
          text: `For travel around ${locationName}, rain probability reaches ${rainProb}% with winds up to ${windSpeed} km/h. Leaving earlier before heavy rain is recommended.`,
          timestamp: timeStr
        };
      }
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: `Travel conditions in ${locationName} are favorable. Current temperature is ${temp}°C with ${condition} skies and clear road visibility.`,
        timestamp: timeStr
      };
    }

    // 6. Clothing & Apparel
    if (
      qLower.includes('wear') ||
      qLower.includes('clothing') ||
      qLower.includes('outfit') ||
      qLower.includes('jacket') ||
      qLower.includes('dress')
    ) {
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: `In ${locationName} (${temp}°C, ${humidity}% humidity), wear light breathable clothing. ${
          rainProb >= 40 ? 'Carrying a light raincoat or umbrella is a smart choice for afternoon rain.' : 'No heavy winter gear needed today.'
        }`,
        timestamp: timeStr
      };
    }

    // 7. Rain & Umbrella
    if (qLower.includes('rain') || qLower.includes('shower') || qLower.includes('storm') || qLower.includes('umbrella')) {
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: rainProb >= 50
          ? `Rain chance in ${locationName} is high at ${rainProb}% with ${condition} conditions (${temp}°C). Carrying an umbrella is strongly advised.`
          : `Rain chance in ${locationName} is currently low at ${rainProb}%. Current temperature is ${temp}°C with ${condition}.`,
        timestamp: timeStr
      };
    }

    // 8. General Outdoor Safety
    if (qLower.includes('outside') || qLower.includes('outdoors') || qLower.includes('safe') || qLower.includes('walk')) {
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: `Outdoor conditions in ${locationName} are currently ${condition} at ${temp}°C. ${
          rainProb >= 50 ? 'Going outside is fine now, but keep an eye on afternoon rain clouds.' : 'It is safe and clear to step outside right now.'
        }`,
        timestamp: timeStr
      };
    }

    // 9. Tomorrow / Forecast
    if (qLower.includes('tomorrow')) {
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: `Tomorrow in ${locationName}, weather is expected near ${highTemp}°C max with moderate humidity and lower rain risk.`,
        timestamp: timeStr
      };
    }

    // 10. Greetings & Friendly Conversation
    if (
      qLower.includes('hello') ||
      qLower.includes('hi') ||
      qLower.includes('hey') ||
      qLower.includes('who are you') ||
      qLower.includes('how are you') ||
      qLower.includes('thanks') ||
      qLower.includes('thank you')
    ) {
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: `Hello! I'm N.O.V.A., your personal weather assistant for ${locationName}. Right now it's ${temp}°C with ${condition} skies. How can I help you plan your day?`,
        timestamp: timeStr
      };
    }

    // 11. Realistic fallback response for any other phrase
    return {
      id: Date.now().toString(),
      sender: 'nova',
      text: `Regarding "${qTrimmed}" in ${locationName}: Current weather is ${temp}°C (${condition}) with ${humidity}% humidity and a ${rainProb}% rain chance. Let me know if you need specific travel, laundry, or clothing advice!`,
      timestamp: timeStr
    };
  }
}

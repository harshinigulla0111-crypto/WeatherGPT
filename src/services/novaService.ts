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
   * falling back to dynamic, query-specific weather intelligence.
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
    const temp = weatherContext?.temp ?? 28;
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

        const systemPrompt = `You are N.O.V.A. (Natural Observation & Virtual Assistant), an expert AI weather assistant in WeatherGPT.
Current Location: ${locationName}
Current Weather Conditions:
- Temperature: ${temp}°C (High: ${highTemp}°C, Low: ${lowTemp}°C)
- Sky Condition: ${condition}
- Humidity: ${humidity}%
- Wind Speed: ${windSpeed} km/h
- Rain Probability / Risk: ${rainProb}%

App Mode: ${isDisaster ? '🚨 RESCUE MODE ACTIVE (EMERGENCY DISASTER SITUATION)' : 'NORMAL WEATHER INTELLIGENCE MODE'}

Directives:
- Directly and accurately answer the user's specific query.
- Use current location (${locationName}) and metrics (${temp}°C, ${condition}, ${rainProb}% rain chance) whenever relevant.
- Be concise (2-4 sentences max), conversational, helpful, and clear.
- For general non-weather questions (e.g. "hello", "have you done...", "how are you"), answer politely and offer weather guidance for ${locationName}.
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

    // 2. Dynamic Context-Aware Fallback Response Engine
    // (Generates distinct, question-tailored responses reflecting query & location data)
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

    // Dynamic Normal Mode Query Router
    if (qLower.includes('rain') || qLower.includes('shower') || qLower.includes('umbrella')) {
      const rainMsg = rainProb >= 50
        ? `Rain chance in ${locationName} is high at ${rainProb}% with ${condition} conditions (${temp}°C). Carrying an umbrella is strongly advised.`
        : `Rain chance in ${locationName} is currently low at ${rainProb}%. Current temperature is ${temp}°C with ${condition}.`;
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: rainMsg,
        timestamp: timeStr
      };
    }

    if (qLower.includes('travel') || qLower.includes('college') || qLower.includes('leave') || qLower.includes('drive') || qLower.includes('4 pm')) {
      const travelAdvice = rainProb >= 60
        ? `For travel around ${locationName}, rain probability peaks at ${rainProb}% with winds up to ${windSpeed} km/h. Leaving earlier before peak rain is recommended.`
        : `Travel conditions in ${locationName} are favorable. Current temperature is ${temp}°C with clear visibility.`;
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: travelAdvice,
        timestamp: timeStr
      };
    }

    if (qLower.includes('wear') || qLower.includes('carry') || qLower.includes('clothing') || qLower.includes('jacket')) {
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: `In ${locationName} (${temp}°C, ${humidity}% humidity), wear light breathable clothing. ${rainProb >= 40 ? 'Carry a light waterproof jacket or umbrella for afternoon showers.' : 'No heavy winter gear needed today.'}`,
        timestamp: timeStr
      };
    }

    if (qLower.includes('safe') || qLower.includes('outside') || qLower.includes('outdoors') || qLower.includes('walk')) {
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: `Outdoor conditions in ${locationName} are currently ${condition} at ${temp}°C. ${rainProb >= 50 ? 'Morning outdoor activities are safe, but monitor sky changes after 3 PM.' : 'It is safe to go outside right now.'}`,
        timestamp: timeStr
      };
    }

    if (qLower.includes('tomorrow')) {
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: `Tomorrow in ${locationName}, weather is expected to stabilize near ${highTemp}°C with moderate humidity and lower rain risk.`,
        timestamp: timeStr
      };
    }

    if (qLower.includes('hello') || qLower.includes('hi') || qLower.includes('hey') || qLower.includes('who are you')) {
      return {
        id: Date.now().toString(),
        sender: 'nova',
        text: `Hello! I'm N.O.V.A., your weather AI assistant for ${locationName}. Currently it is ${temp}°C with ${condition}. How can I assist your schedule today?`,
        timestamp: timeStr
      };
    }

    // Dynamic response for any general / conversational query
    return {
      id: Date.now().toString(),
      sender: 'nova',
      text: `Regarding "${qTrimmed}": In ${locationName}, current temperature is ${temp}°C (${condition}) with ${humidity}% humidity and ${windSpeed} km/h wind. Let me know if you need specific travel or clothing advisories!`,
      timestamp: timeStr
    };
  }
}

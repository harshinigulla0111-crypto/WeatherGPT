export type SupportedLanguage = 
  | 'en' // English
  | 'te' // Telugu
  | 'hi' // Hindi
  | 'ta' // Tamil
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'bn' // Bengali
  | 'mr'; // Marathi

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
];

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    tagline: "Understand the weather. Know what to do.",
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    yourWeatherToday: "YOUR WEATHER TODAY",
    hourlyForecast: "HOURLY FORECAST",
    sevenDayForecast: "7-DAY FORECAST",
    weatherMetrics: "WEATHER METRICS",
    weatherInsights: "WEATHER INSIGHTS",
    weatherDNA: "YOUR WEATHER DNA",
    rescueModeActive: "RESCUE MODE ACTIVE",
    safetyIsPriority: "Your safety is the priority.",
    imInDanger: "I'M IN DANGER",
    findShelter: "FIND SAFE SHELTER",
    checkFamily: "CHECK FAMILY",
    callEmergency: "CALL EMERGENCY",
    farmerMode: "FARMER MODE",
    aviationMode: "AVIATION MODE",
    marineMode: "MARINE MODE",
    smartCityMode: "SMART CITY MODE"
  },
  te: {
    tagline: "వాతావరణాన్ని అర్థం చేసుకోండి. ఏం చేయాలో తెలుసుకోండి.",
    goodMorning: "శుభోదయం",
    goodAfternoon: "శుభ మధ్యాహ్నం",
    goodEvening: "శుభ సాయంత్రం",
    yourWeatherToday: "ఈరోజు మీ వాతావరణం",
    hourlyForecast: "గంటవారీ అంచనా",
    sevenDayForecast: "7 రోజుల అంచనా",
    weatherMetrics: "వాతావరణ గణాంకాలు",
    weatherInsights: "వాతావరణ పరిజ్ఞానం",
    weatherDNA: "మీ వాతావరణ DNA",
    rescueModeActive: "రక్షణ మోడ్ క్రియాశీలంగా ఉంది",
    safetyIsPriority: "మీ భద్రత మా మొదటి ప్రాధాన్యత.",
    imInDanger: "నేను ప్రమాదంలో ఉన్నాను",
    findShelter: "సురక్షిత ఆశ్రయం కనుగొనండి",
    checkFamily: "కుటుంబ భద్రతను తనిఖీ చేయండి",
    callEmergency: "అత్యవసర పిలుపు (112)",
    farmerMode: "రైతు మోడ్",
    aviationMode: "విమానయాన మోడ్",
    marineMode: "సముద్ర మోడ్",
    smartCityMode: "స్మార్ట్ సిటీ మోడ్"
  },
  hi: {
    tagline: "मौसम को समझें। जानें कि क्या करना है।",
    goodMorning: "सुप्रभात",
    goodAfternoon: "नमस्कार",
    goodEvening: "शुभ संध्या",
    yourWeatherToday: "आज आपका मौसम",
    hourlyForecast: "प्रति घंटे का पूर्वानुमान",
    sevenDayForecast: "7 दिनों का पूर्वानुमान",
    weatherMetrics: "मौसम के आंकड़े",
    weatherInsights: "मौसम अंतर्दृष्टि",
    weatherDNA: "आपका मौसम DNA",
    rescueModeActive: "रेस्क्यू मोड सक्रिय",
    safetyIsPriority: "आपकी सुरक्षा हमारी प्राथमिकता है।",
    imInDanger: "मैं खतरे में हूं",
    findShelter: "सुरक्षित आश्रय खोजें",
    checkFamily: "परिवार की जांच करें",
    callEmergency: "आपातकालीन कॉल (112)",
    farmerMode: "किसान मोड",
    aviationMode: "विमानन मोड",
    marineMode: "समुद्री मोड",
    smartCityMode: "स्मार्ट सिटी मोड"
  },
  ta: { tagline: "வானிலையைப் புரிந்து கொள்ளுங்கள். என்ன செய்ய வேண்டும் என்பதைத் தெரிந்து கொள்ளுங்கள்.", goodMorning: "காலை வணக்கம்", yourWeatherToday: "இன்றைய உங்கள் வானிலை", imInDanger: "நான் ஆபத்தில் உள்ளேன்" },
  kn: { tagline: "ಹವಾಮಾನವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ. ಏನು ಮಾಡಬೇಕೆಂದು ತಿಳಿಯಿರಿ.", goodMorning: "ಶುಭೋದಯ", yourWeatherToday: "ಇಂದಿನ ನಿಮ್ಮ ಹವಾಮಾನ", imInDanger: "ನಾನು ಅಪಾಯದಲ್ಲಿದ್ದೇನೆ" },
  ml: { tagline: "കാലാവസ്ഥ മനസ്സിലാക്കുക. എന്ത് ചെയ്യണമെന്ന് അറിയുക.", goodMorning: "സുപ്രഭാതം", yourWeatherToday: "ഇന്നത്തെ നിങ്ങളുടെ കാലാവസ്ഥ", imInDanger: "ഞാൻ അപകടത്തിലാണ്" },
  bn: { tagline: "আবহাওয়া বুঝুন। কি করতে হবে তা জানুন।", goodMorning: "সুপ্রভাত", yourWeatherToday: "আজ আপনার আবহাওয়া", imInDanger: "আমি বিপদে আছি" },
  mr: { tagline: "हवामान समजून घ्या. काय करायचे ते जाणून घ्या.", goodMorning: "शुभ प्रभात", yourWeatherToday: "आज तुमचे हवामान", imInDanger: "मी संकटात आहे" }
};

export class I18nService {
  public static translate(key: string, lang: SupportedLanguage = 'en'): string {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || key;
  }
}

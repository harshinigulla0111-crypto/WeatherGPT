import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Flame, Shield, ShieldAlert, Snowflake, Zap } from 'lucide-react';

export type DisasterCategory = 
  | 'Flood' 
  | 'Cyclone' 
  | 'Heatwave' 
  | 'Thunderstorm' 
  | 'Lightning' 
  | 'Landslide' 
  | 'Wildfire' 
  | 'Extreme Cold';

export const SafetyHub: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<DisasterCategory>('Flood');

  const categories: { id: DisasterCategory; icon: string; title: string }[] = [
    { id: 'Flood', icon: '🌊', title: 'Flood' },
    { id: 'Cyclone', icon: '🌀', title: 'Cyclone' },
    { id: 'Heatwave', icon: '🔥', title: 'Heatwave' },
    { id: 'Thunderstorm', icon: '🌩️', title: 'Thunderstorm' },
    { id: 'Lightning', icon: '⚡', title: 'Lightning' },
    { id: 'Landslide', icon: '⛰️', title: 'Landslide' },
    { id: 'Wildfire', icon: '🌲', title: 'Wildfire' },
    { id: 'Extreme Cold', icon: '❄️', title: 'Extreme Cold' }
  ];

  const safetyData: Record<DisasterCategory, { happening: string; doList: string[]; dontList: string[]; prepList: string[] }> = {
    Flood: {
      happening: "Heavy continuous rainfall exceeds soil absorption & drainage capacity, causing water level rise in streets, low-lying homes, and river basins.",
      doList: [
        "Move to higher ground or upper floors immediately.",
        "Keep emergency contacts and power bank charged.",
        "Turn off main electrical breaker switch before water enters home."
      ],
      dontList: [
        "Do NOT walk, swim, or drive through moving floodwater.",
        "Do NOT touch electric poles, fallen wires, or submerged sockets.",
        "Do NOT consume unboiled tap water during flood warnings."
      ],
      prepList: [
        "Pack waterproof emergency kit (medicines, torch, dry food, documents).",
        "Save 112 & local relief helpline numbers on speed dial.",
        "Pre-identify nearest designated government safe shelter."
      ]
    },
    Cyclone: {
      happening: "Tropical low-pressure cyclone system bringing extreme destructive wind speeds exceeding 120 km/h, storm surges, and torrential downpours.",
      doList: [
        "Remain indoors in a windowless interior room.",
        "Secure loose outdoor objects, tin sheets, and board signs.",
        "Keep radio or WeatherGPT app active for official updates."
      ],
      dontList: [
        "Do NOT venture outside during the 'eye of the cyclone' pause.",
        "Do NOT stand under tall trees or near glass windows.",
        "Do NOT ignore evacuation orders from local authorities."
      ],
      prepList: [
        "Board up or tape large glass windows.",
        "Stock up 3 days of non-perishable food & drinking water.",
        "Keep emergency battery lanterns ready."
      ]
    },
    Heatwave: {
      happening: "Abnormally high atmospheric thermal radiation where temperatures exceed 42°C with dangerous heat index levels.",
      doList: [
        "Drink plenty of water and oral rehydration solution (ORS).",
        "Wear loose, light-colored breathable cotton clothing.",
        "Stay indoors in shaded or ventilated areas between 11 AM – 4 PM."
      ],
      dontList: [
        "Do NOT drink alcohol, caffeinated drinks, or heavy sugary sodas.",
        "Do NOT leave children or pets inside locked vehicles.",
        "Do NOT undertake heavy physical exertion during peak afternoon hours."
      ],
      prepList: [
        "Store cool water in earthen pots or insulated flasks.",
        "Keep damp cloth towels handy to lower body temp.",
        "Know symptoms of heat stroke (high fever, dizziness, nausea)."
      ]
    },
    Thunderstorm: {
      happening: "Convective atmospheric storm producing intense lightning strikes, hail, and squally wind gusts.",
      doList: [
        "Seek immediate shelter inside a sturdy building or hard-top vehicle.",
        "Unplug sensitive electronic devices & appliances.",
        "Stay away from plumbing fixtures and metal pipes."
      ],
      dontList: [
        "Do NOT take shelter under isolated tall trees in open fields.",
        "Do NOT use corded phones during severe lightning.",
        "Do NOT stay on open terraces or balconies."
      ],
      prepList: [
        "Install surge protectors for home electricals.",
        "Secure outdoor furniture before storm arrival.",
        "Monitor live lightning radar in WeatherGPT."
      ]
    },
    Lightning: {
      happening: "High-voltage electrical discharge between cloud and ground capable of causing instant fatal cardiac arrest and fires.",
      doList: [
        "Follow 30/30 rule: go indoors if thunder occurs within 30s of flash.",
        "Crouch low on balls of feet if trapped in open ground (Lightning Crouch).",
        "Stay indoors until 30 mins after last thunder sound."
      ],
      dontList: [
        "Do NOT lie flat on the ground.",
        "Do NOT stand near metal fences, antennas, or water bodies.",
        "Do NOT hold umbrellas with metal shafts in open fields."
      ],
      prepList: [
        "Install lightning arrestors on rooftop structures.",
        "Learn CPR and basic first aid for electrical shocks."
      ]
    },
    Landslide: {
      happening: "Downslope movement of rock, soil, and debris triggered by heavy rainfall saturating steep hill slopes.",
      doList: [
        "Evacuate slope-adjacent homes immediately if cracking sounds are heard.",
        "Curl into a tight ball and protect your head if escape is impossible.",
        "Listen for unusual sounds like trees snapping or boulders knocking."
      ],
      dontList: [
        "Do NOT stay near river valleys or natural drainage hill paths.",
        "Do NOT return to landslide area until certified safe by geologists."
      ],
      prepList: [
        "Pre-determine hill evacuation routes.",
        "Avoid building near steep un-retained embankments."
      ]
    },
    Wildfire: {
      happening: "Uncontrolled rapid spread of fire through forest vegetation fueled by high winds and dry atmospheric humidity.",
      doList: [
        "Evacuate immediately along designated fire escape routes.",
        "Wear N95 mask or damp cloth over face to filter smoke particles.",
        "Close all home windows and doors before leaving."
      ],
      dontList: [
        "Do NOT drive into heavy smoke plumes with zero visibility.",
        "Do NOT discard lit cigarettes or dry leaves outdoor fires."
      ],
      prepList: [
        "Maintain 30-foot defensible clear space around property.",
        "Prepare emergency grab-and-go document bag."
      ]
    },
    'Extreme Cold': {
      happening: "Severe cold wave drop in ambient temperature causing hypothermia, frostbite, and dense fog disruptions.",
      doList: [
        "Dress in multiple warm insulated layers.",
        "Cover head, ears, hands, and feet to prevent thermal loss.",
        "Drink warm liquids and stay in heated indoor spaces."
      ],
      dontList: [
        "Do NOT wear tight wet clothing in freezing winds.",
        "Do NOT use open charcoal heaters inside closed unventilated rooms (carbon monoxide hazard)."
      ],
      prepList: [
        "Stock up extra warm woolens and blankets.",
        "Inspect home insulation and draft seals."
      ]
    }
  };

  const currentInfo = safetyData[activeCategory];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-mono tracking-tight">
          NATIONAL SAFETY & EMERGENCY PREPAREDNESS HUB
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Official disaster protocol guidelines & actionable survival checklists
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
              activeCategory === cat.id
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.title}</span>
          </button>
        ))}
      </div>

      {/* Active Category Safety Guide Details */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider font-mono">
            DISASTER PROTOCOL: {activeCategory.toUpperCase()}
          </span>
          <h2 className="text-lg font-extrabold text-white mt-1">What is happening?</h2>
          <p className="text-xs text-slate-300 leading-relaxed mt-1">{currentInfo.happening}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* WHAT TO DO */}
          <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-mono">
              <CheckCircle className="w-5 h-5" />
              <span>WHAT TO DO</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              {currentInfo.doList.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* WHAT NOT TO DO */}
          <div className="p-5 rounded-2xl bg-red-950/30 border border-red-800/60 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm font-mono">
              <AlertTriangle className="w-5 h-5" />
              <span>WHAT NOT TO DO</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              {currentInfo.dontList.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* EMERGENCY PREPARATION */}
          <div className="p-5 rounded-2xl bg-blue-950/30 border border-blue-800/60 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm font-mono">
              <Shield className="w-5 h-5" />
              <span>EMERGENCY PREPARATION</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              {currentInfo.prepList.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

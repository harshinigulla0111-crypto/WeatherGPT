import React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const InsightsCharts: React.FC = () => {
  const tempData = [
    { time: '6 AM', temp: 25, feels: 26, humidity: 85 },
    { time: '9 AM', temp: 27, feels: 28, humidity: 78 },
    { time: '12 PM', temp: 31, feels: 34, humidity: 68 },
    { time: '3 PM', temp: 30, feels: 33, humidity: 75 },
    { time: '6 PM', temp: 27, feels: 28, humidity: 82 },
    { time: '9 PM', temp: 26, feels: 27, humidity: 88 }
  ];

  const rainData = [
    { day: 'Mon', prob: 20, mm: 2 },
    { day: 'Tue', prob: 80, mm: 24 },
    { day: 'Wed (Today)', prob: 90, mm: 96 },
    { day: 'Thu', prob: 40, mm: 12 },
    { day: 'Fri', prob: 15, mm: 0 },
    { day: 'Sat', prob: 30, mm: 5 },
    { day: 'Sun', prob: 20, mm: 1 }
  ];

  const aqiData = [
    { time: 'Mon', aqi: 42 },
    { time: 'Tue', aqi: 48 },
    { time: 'Wed', aqi: 54 },
    { time: 'Thu', aqi: 38 },
    { time: 'Fri', aqi: 35 },
    { time: 'Sat', aqi: 45 },
    { time: 'Sun', aqi: 50 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          Weather Analytics & Climate Trends
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Multi-parameter atmospheric modeling & historical trend analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Diurnal Temperature Curve */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Diurnal Temperature & Humidity
              </h2>
              <span className="text-[10px] text-cyan-500 font-medium">24-Hour Model</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tempData}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="temp" stroke="#0284c7" fillOpacity={1} fill="url(#colorTemp)" name="Temp (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Precipitation Accumulation */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Precipitation Accumulation (mm)
              </h2>
              <span className="text-[10px] text-cyan-500 font-medium">Monsoon Surge Index</span>
            </div>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-bold border border-cyan-500/30">
              96mm Peak
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rainData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="mm" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Rainfall (mm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Air Quality Index Trend */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 lg:col-span-2 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Air Quality Index (AQI) Weekly Trend
              </h2>
              <span className="text-[10px] text-emerald-500 font-medium font-mono">AQI 54 Good Target</span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aqiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="aqi" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="AQI Level" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  Compass,
  MapPin,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';

export interface WeatherData {
  city: string;
  country: string;
  tempF: number;
  tempC: number;
  condition: string;
  conditionType: 'sunny' | 'partly-cloudy' | 'rainy' | 'cloudy' | 'windy';
  highF: number;
  highC: number;
  lowF: number;
  lowC: number;
  humidity: number;
  windSpeedMph: number;
  windSpeedKmh: number;
  uvIndex: string;
  airQuality: string;
  lifestyleTip: string;
  forecast: {
    day: string;
    condition: 'sunny' | 'partly-cloudy' | 'rainy' | 'cloudy';
    tempF: number;
    tempC: number;
  }[];
}

const CITY_WEATHER_PRESETS: Record<string, WeatherData> = {
  'San Francisco': {
    city: 'San Francisco',
    country: 'CA, USA',
    tempF: 68,
    tempC: 20,
    condition: 'Partly Cloudy & Mild',
    conditionType: 'partly-cloudy',
    highF: 71,
    highC: 22,
    lowF: 54,
    lowC: 12,
    humidity: 62,
    windSpeedMph: 11,
    windSpeedKmh: 18,
    uvIndex: '4 (Moderate)',
    airQuality: 'Good (AQI 32)',
    lifestyleTip: 'Mild afternoon fog clearing up — ideal for high-cognitive focus blocks and a late afternoon walk.',
    forecast: [
      { day: 'Today', condition: 'partly-cloudy', tempF: 68, tempC: 20 },
      { day: 'Tomorrow', condition: 'sunny', tempF: 72, tempC: 22 },
      { day: 'Friday', condition: 'cloudy', tempF: 65, tempC: 18 },
    ],
  },
  'New York': {
    city: 'New York',
    country: 'NY, USA',
    tempF: 74,
    tempC: 23,
    condition: 'Clear & Sunny',
    conditionType: 'sunny',
    highF: 78,
    highC: 26,
    lowF: 61,
    lowC: 16,
    humidity: 48,
    windSpeedMph: 7,
    windSpeedKmh: 11,
    uvIndex: '6 (High)',
    airQuality: 'Moderate (AQI 48)',
    lifestyleTip: 'Bright sunlight boosts serotonin. Schedule deep work inside during midday; take breaks outdoors.',
    forecast: [
      { day: 'Today', condition: 'sunny', tempF: 74, tempC: 23 },
      { day: 'Tomorrow', condition: 'rainy', tempF: 69, tempC: 21 },
      { day: 'Friday', condition: 'sunny', tempF: 76, tempC: 24 },
    ],
  },
  'London': {
    city: 'London',
    country: 'UK',
    tempF: 61,
    tempC: 16,
    condition: 'Passing Showers',
    conditionType: 'rainy',
    highF: 64,
    highC: 18,
    lowF: 50,
    lowC: 10,
    humidity: 78,
    windSpeedMph: 14,
    windSpeedKmh: 23,
    uvIndex: '2 (Low)',
    airQuality: 'Good (AQI 25)',
    lifestyleTip: 'Cozy rain outside creates prime atmospheric conditions for deep writing, code review, and reading.',
    forecast: [
      { day: 'Today', condition: 'rainy', tempF: 61, tempC: 16 },
      { day: 'Tomorrow', condition: 'cloudy', tempF: 63, tempC: 17 },
      { day: 'Friday', condition: 'partly-cloudy', tempF: 66, tempC: 19 },
    ],
  },
  'Tokyo': {
    city: 'Tokyo',
    country: 'Japan',
    tempF: 72,
    tempC: 22,
    condition: 'Gentle Breeze & Fair',
    conditionType: 'partly-cloudy',
    highF: 75,
    highC: 24,
    lowF: 59,
    lowC: 15,
    humidity: 55,
    windSpeedMph: 8,
    windSpeedKmh: 13,
    uvIndex: '5 (Moderate)',
    airQuality: 'Good (AQI 29)',
    lifestyleTip: 'Balanced temperature and crisp air. Excellent day to crush priority tasks and plan milestones.',
    forecast: [
      { day: 'Today', condition: 'partly-cloudy', tempF: 72, tempC: 22 },
      { day: 'Tomorrow', condition: 'sunny', tempF: 75, tempC: 24 },
      { day: 'Friday', condition: 'sunny', tempF: 77, tempC: 25 },
    ],
  },
  'Paris': {
    city: 'Paris',
    country: 'France',
    tempF: 66,
    tempC: 19,
    condition: 'Crisp & Overcast',
    conditionType: 'cloudy',
    highF: 69,
    highC: 21,
    lowF: 52,
    lowC: 11,
    humidity: 65,
    windSpeedMph: 10,
    windSpeedKmh: 16,
    uvIndex: '3 (Moderate)',
    airQuality: 'Good (AQI 34)',
    lifestyleTip: 'Cool overcast skies reduce screen glare. Perfect setup for long sprints and planning sessions.',
    forecast: [
      { day: 'Today', condition: 'cloudy', tempF: 66, tempC: 19 },
      { day: 'Tomorrow', condition: 'partly-cloudy', tempF: 70, tempC: 21 },
      { day: 'Friday', condition: 'rainy', tempF: 64, tempC: 18 },
    ],
  },
};

interface WeatherWidgetProps {
  compact?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ compact = false }) => {
  const [selectedCity, setSelectedCity] = useState<string>('San Francisco');
  const [isFahrenheit, setIsFahrenheit] = useState(true);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const weather = CITY_WEATHER_PRESETS[selectedCity] || CITY_WEATHER_PRESETS['San Francisco'];

  const renderWeatherIcon = (type: string, className = 'h-5 w-5') => {
    switch (type) {
      case 'sunny':
        return <Sun className={`${className} text-amber-400`} />;
      case 'rainy':
        return <CloudRain className={`${className} text-sky-400`} />;
      case 'cloudy':
        return <Cloud className={`${className} text-slate-300`} />;
      case 'windy':
        return <Wind className={`${className} text-teal-400`} />;
      case 'partly-cloudy':
      default:
        return <CloudSun className={`${className} text-amber-300`} />;
    }
  };

  // Compact Header Badge Version
  if (compact) {
    return (
      <div className="relative inline-flex items-center">
        <button
          onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-200 transition-all cursor-pointer group"
          title="Click to change city or inspect weather"
        >
          {renderWeatherIcon(weather.conditionType, 'h-4 w-4')}
          <span className="font-mono font-bold text-white">
            {isFahrenheit ? `${weather.tempF}°F` : `${weather.tempC}°C`}
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">· {weather.city}</span>
          <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-white transition-colors" />
        </button>

        {isCityDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/[0.12] bg-slate-900/98 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-fade-in">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
              <span>Select Location</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFahrenheit(!isFahrenheit);
                }}
                className="text-[10px] text-emerald-400 hover:underline font-mono"
              >
                Switch to {isFahrenheit ? '°C' : '°F'}
              </button>
            </div>
            <div className="space-y-1 mt-1">
              {Object.keys(CITY_WEATHER_PRESETS).map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setSelectedCity(city);
                    setIsCityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCity === city
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{city}</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {isFahrenheit
                      ? `${CITY_WEATHER_PRESETS[city].tempF}°`
                      : `${CITY_WEATHER_PRESETS[city].tempC}°`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full Executive Card Version
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-slate-900/70 p-5 sm:p-6 space-y-4">
      {/* Header with City Selector and Temp Unit Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            {renderWeatherIcon(weather.conditionType, 'h-4 w-4')}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Daily Weather & Outlook</h3>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
              <MapPin className="h-3 w-3 text-emerald-400" />
              <span>{weather.city}, {weather.country}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Unit Toggle */}
          <button
            type="button"
            onClick={() => setIsFahrenheit(!isFahrenheit)}
            className="px-2 py-0.5 rounded-lg border border-white/[0.08] bg-slate-950/60 text-[10px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Fahrenheit / Celsius"
          >
            {isFahrenheit ? '°F' : '°C'}
          </button>

          {/* City Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-white/[0.08] bg-slate-950/60 hover:bg-slate-800 text-xs text-slate-300 transition-colors cursor-pointer"
            >
              <span>{weather.city}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-white/[0.12] bg-slate-900/98 p-2 shadow-2xl backdrop-blur-2xl z-50">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Location
                </div>
                <div className="space-y-1 mt-1">
                  {Object.keys(CITY_WEATHER_PRESETS).map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setSelectedCity(city);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selectedCity === city
                          ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{city}</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {isFahrenheit
                          ? `${CITY_WEATHER_PRESETS[city].tempF}°`
                          : `${CITY_WEATHER_PRESETS[city].tempC}°`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Temperature & Condition Display */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-900 border border-white/[0.06]">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            {renderWeatherIcon(weather.conditionType, 'h-8 w-8')}
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {isFahrenheit ? `${weather.tempF}°F` : `${weather.tempC}°C`}
            </div>
            <div className="text-xs text-slate-300 font-medium">
              {weather.condition}
            </div>
          </div>
        </div>

        <div className="text-right font-mono text-[11px] space-y-0.5 text-slate-400">
          <div>
            H: <span className="text-white font-bold">{isFahrenheit ? `${weather.highF}°` : `${weather.highC}°`}</span>
            {' · '}
            L: <span className="text-slate-400">{isFahrenheit ? `${weather.lowF}°` : `${weather.lowC}°`}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Humidity: {weather.humidity}%
          </div>
        </div>
      </div>

      {/* Environmental Metrics (Wind, UV, Air Quality) */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.04]">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1">
            <Wind className="h-3 w-3 text-teal-400" />
            <span>Wind</span>
          </div>
          <div className="text-xs font-mono font-bold text-white">
            {isFahrenheit ? `${weather.windSpeedMph} mph` : `${weather.windSpeedKmh} km/h`}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.04]">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1">
            <Sun className="h-3 w-3 text-amber-400" />
            <span>UV Index</span>
          </div>
          <div className="text-xs font-mono font-bold text-white truncate">
            {weather.uvIndex}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.04]">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1">
            <Droplets className="h-3 w-3 text-sky-400" />
            <span>Air Quality</span>
          </div>
          <div className="text-xs font-mono font-bold text-emerald-400 truncate">
            {weather.airQuality}
          </div>
        </div>
      </div>

      {/* Weather Relation to Daily Productivity & Living Advice */}
      <div className="p-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 text-xs space-y-1">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Life & Energy Recommendation</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          {weather.lifestyleTip}
        </p>
      </div>

      {/* 3-Day Forecast Strip */}
      <div className="pt-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          3-Day Outlook
        </div>
        <div className="grid grid-cols-3 gap-2">
          {weather.forecast.map((fc, idx) => (
            <div
              key={idx}
              className="p-2 rounded-xl bg-slate-950/40 border border-white/[0.04] text-center space-y-1"
            >
              <span className="text-[10px] text-slate-400 block font-medium">
                {fc.day}
              </span>
              <div className="flex justify-center">
                {renderWeatherIcon(fc.condition, 'h-4 w-4')}
              </div>
              <span className="text-xs font-mono font-bold text-white block">
                {isFahrenheit ? `${fc.tempF}°` : `${fc.tempC}°`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

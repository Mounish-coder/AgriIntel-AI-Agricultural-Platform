export interface GeoLocation {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  admin1?: string; // State / Province
  admin2?: string; // District
  timezone?: string;
  population?: number;
}

export interface GeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    elevation?: number;
    feature_code?: string;
    country_code?: string;
    country?: string;
    admin1?: string;
    admin2?: string;
    timezone?: string;
    population?: number;
  }>;
  generationtime_ms?: number;
}

export interface CurrentWeatherData {
  time: string;
  temperature: number;
  apparentTemperature: number;
  tempMax: number;
  tempMin: number;
  relativeHumidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  precipitation: number;
  cloudCover: number;
  uvIndex: number;
  weatherCode: number;
  isDay: number;
  condition: string;
  windDirectionCompass: string;
}

export interface HourlyForecastItem {
  time: string;
  formattedTime: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  precipitation: number;
  relativeHumidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  condition: string;
  uvIndex: number;
  pressure: number;
  cloudCover: number;
}

export interface DailyForecastItem {
  date: string;
  formattedDate: string;
  dayName: string;
  weatherCode: number;
  condition: string;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  precipitationSum: number;
  windSpeedMax: number;
  windDirectionDominant: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
  daylightDurationSeconds: number;
}

export interface AirQualityData {
  europeanAqi?: number;
  usAqi?: number;
  pm2_5?: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  o3?: number;
  co?: number;
  aqiCategory: string;
  aqiColor: string;
  aqiDescription: string;
}

export interface FullWeatherData {
  location: GeoLocation;
  current: CurrentWeatherData;
  hourly24h: HourlyForecastItem[];
  daily7d: DailyForecastItem[];
  hourlyAll?: HourlyForecastItem[];
  airQuality?: AirQualityData;
  lastUpdated: string;
  isCached: boolean;
}

// ── WMO Weather Code Interpretation ──────────────────────────────────────────

export interface WeatherConditionInfo {
  label: string;
  iconName: 'Sun' | 'CloudSun' | 'Cloud' | 'CloudRain' | 'CloudDrizzle' | 'CloudLightning' | 'CloudSnow' | 'CloudFog' | 'Wind';
  badgeColor: string;
  gradient: string;
  description: string;
}

export function getWeatherConditionInfo(code: number, isDay = 1): WeatherConditionInfo {
  switch (code) {
    case 0:
      return {
        label: isDay ? "Clear Sky" : "Clear Night",
        iconName: isDay ? "Sun" : "CloudSun",
        badgeColor: "#f59e0b",
        gradient: isDay ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "linear-gradient(135deg, #1e293b, #334155)",
        description: "Clear skies with direct sunlight",
      };
    case 1:
      return {
        label: "Mainly Clear",
        iconName: "Sun",
        badgeColor: "#fbbf24",
        gradient: "linear-gradient(135deg, #fef9c3, #fde047)",
        description: "Scattered thin clouds, predominantly clear",
      };
    case 2:
      return {
        label: "Partly Cloudy",
        iconName: "CloudSun",
        badgeColor: "#38bdf8",
        gradient: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
        description: "Sunlight filtered through passing clouds",
      };
    case 3:
      return {
        label: "Overcast",
        iconName: "Cloud",
        badgeColor: "#64748b",
        gradient: "linear-gradient(135deg, #f1f5f9, #cbd5e1)",
        description: "Continuous heavy cloud cover across the sky",
      };
    case 45:
    case 48:
      return {
        label: code === 45 ? "Fog" : "Depositing Rime Fog",
        iconName: "CloudFog",
        badgeColor: "#94a3b8",
        gradient: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
        description: "Dense moisture fog reducing horizontal visibility",
      };
    case 51:
    case 53:
    case 55:
      return {
        label: code === 51 ? "Light Drizzle" : code === 53 ? "Moderate Drizzle" : "Dense Drizzle",
        iconName: "CloudDrizzle",
        badgeColor: "#0284c7",
        gradient: "linear-gradient(135deg, #e0f2fe, #7dd3fc)",
        description: "Fine, light mist rain particles falling softly",
      };
    case 56:
    case 57:
      return {
        label: "Freezing Drizzle",
        iconName: "CloudSnow",
        badgeColor: "#06b6d4",
        gradient: "linear-gradient(135deg, #cffafe, #a5f3fc)",
        description: "Sub-zero freezing drizzle with surface icing risk",
      };
    case 61:
      return {
        label: "Slight Rain",
        iconName: "CloudRain",
        badgeColor: "#0284c7",
        gradient: "linear-gradient(135deg, #bae6fd, #38bdf8)",
        description: "Steady slight rainfall across the area",
      };
    case 63:
      return {
        label: "Moderate Rain",
        iconName: "CloudRain",
        badgeColor: "#0369a1",
        gradient: "linear-gradient(135deg, #7dd3fc, #0284c7)",
        description: "Persistent moderate rain with damp ground accumulation",
      };
    case 65:
      return {
        label: "Heavy Rain",
        iconName: "CloudRain",
        badgeColor: "#1d4ed8",
        gradient: "linear-gradient(135deg, #38bdf8, #1d4ed8)",
        description: "Heavy torrential rainfall with rapid surface runoff",
      };
    case 66:
    case 67:
      return {
        label: "Freezing Rain",
        iconName: "CloudSnow",
        badgeColor: "#0891b2",
        gradient: "linear-gradient(135deg, #a5f3fc, #06b6d4)",
        description: "Freezing cold rain turning to glaze ice on contact",
      };
    case 71:
    case 73:
    case 75:
      return {
        label: code === 71 ? "Slight Snow" : code === 73 ? "Moderate Snow" : "Heavy Snow",
        iconName: "CloudSnow",
        badgeColor: "#60a5fa",
        gradient: "linear-gradient(135deg, #eff6ff, #dbeafe)",
        description: "Cold snowfall with ground accumulation",
      };
    case 77:
      return {
        label: "Snow Grains",
        iconName: "CloudSnow",
        badgeColor: "#93c5fd",
        gradient: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
        description: "Small opaque frozen white ice particles",
      };
    case 80:
    case 81:
    case 82:
      return {
        label: code === 80 ? "Slight Showers" : code === 81 ? "Moderate Showers" : "Violent Showers",
        iconName: "CloudRain",
        badgeColor: "#2563eb",
        gradient: "linear-gradient(135deg, #93c5fd, #3b82f6)",
        description: "Sudden precipitation showers with gusty spells",
      };
    case 85:
    case 86:
      return {
        label: "Snow Showers",
        iconName: "CloudSnow",
        badgeColor: "#3b82f6",
        gradient: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
        description: "Intermittent snow shower gusts",
      };
    case 95:
      return {
        label: "Thunderstorm",
        iconName: "CloudLightning",
        badgeColor: "#7c3aed",
        gradient: "linear-gradient(135deg, #ede9fe, #c4b5fd)",
        description: "Atmospheric instability with lightning and thunder",
      };
    case 96:
    case 99:
      return {
        label: code === 96 ? "Thunderstorm with Hail" : "Severe Hail Thunderstorm",
        iconName: "CloudLightning",
        badgeColor: "#581c87",
        gradient: "linear-gradient(135deg, #ddd6fe, #a78bfa)",
        description: "Severe thunderstorm accompanied by hail stones",
      };
    default:
      return {
        label: "Fair Weather",
        iconName: "CloudSun",
        badgeColor: "#0ea5e9",
        gradient: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
        description: "Stable atmospheric conditions",
      };
  }
}

// ── Compass Direction Helper ──────────────────────────────────────────────────

export function degreesToCompass(degrees: number): string {
  const directions = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
  ];
  const idx = Math.round((degrees % 360) / 22.5) % 16;
  return directions[idx];
}

// ── Air Quality Helper ────────────────────────────────────────────────────────

export function getAqiCategory(usAqi?: number, europeanAqi?: number): {
  category: string;
  color: string;
  description: string;
} {
  const aqi = usAqi ?? europeanAqi ?? 40;

  if (aqi <= 50) {
    return {
      category: "Good",
      color: "#10b981",
      description: "Air quality is satisfactory, poses little or no risk.",
    };
  } else if (aqi <= 100) {
    return {
      category: "Moderate",
      color: "#f59e0b",
      description: "Acceptable quality; sensitive individuals should take care.",
    };
  } else if (aqi <= 150) {
    return {
      category: "Unhealthy for Sensitive Groups",
      color: "#f97316",
      description: "General public not likely affected; sensitive groups at risk.",
    };
  } else if (aqi <= 200) {
    return {
      category: "Unhealthy",
      color: "#ef4444",
      description: "Everyone may begin to experience adverse health effects.",
    };
  } else if (aqi <= 300) {
    return {
      category: "Very Unhealthy",
      color: "#8b5cf6",
      description: "Health alert: serious risk of health effects for all.",
    };
  } else {
    return {
      category: "Hazardous",
      color: "#881337",
      description: "Health warning of emergency conditions. Stay indoors.",
    };
  }
}

// ── UV Index Advisory Helper ──────────────────────────────────────────────────

export function getUvCategory(uv: number): { level: string; color: string; advice: string } {
  if (uv <= 2) {
    return { level: "Low", color: "#10b981", advice: "Minimal danger. Safe outdoors without sunscreen." };
  } else if (uv <= 5) {
    return { level: "Moderate", color: "#f59e0b", advice: "Wear sunglasses, hat, and use SPF 30+ sunscreen." };
  } else if (uv <= 7) {
    return { level: "High", color: "#f97316", advice: "Protection required. Reduce sun exposure between 10am - 4pm." };
  } else if (uv <= 10) {
    return { level: "Very High", color: "#ef4444", advice: "Extra precaution needed. Unprotected skin burns rapidly." };
  } else {
    return { level: "Extreme", color: "#8b5cf6", advice: "Take all precautions. Avoid outdoor sun exposure if possible." };
  }
}

// ── Daylight Duration Formatter ───────────────────────────────────────────────

export function formatDaylightDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "--";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

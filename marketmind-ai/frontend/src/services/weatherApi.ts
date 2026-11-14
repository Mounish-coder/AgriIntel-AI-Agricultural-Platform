import type {
  GeoLocation,
  FullWeatherData,
  CurrentWeatherData,
  HourlyForecastItem,
  DailyForecastItem,
  AirQualityData,
} from "../types/weather";
import {
  getWeatherConditionInfo,
  degreesToCompass,
  getAqiCategory,
} from "../types/weather";

const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_API_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

const WEATHER_CACHE_PREFIX = "agriintel_weather_cache_";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

// In-memory runtime cache
const memoryCache = new Map<string, { data: FullWeatherData; cachedAt: number }>();

function buildCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)}_${lon.toFixed(3)}`;
}

// ── Validation ────────────────────────────────────────────────────────────────

export function validateCoordinates(lat: number, lon: number): { valid: boolean; error?: string } {
  if (typeof lat !== "number" || isNaN(lat)) {
    return { valid: false, error: "Latitude must be a valid number." };
  }
  if (typeof lon !== "number" || isNaN(lon)) {
    return { valid: false, error: "Longitude must be a valid number." };
  }
  if (lat < -90 || lat > 90) {
    return { valid: false, error: "Latitude must be between -90° and +90°." };
  }
  if (lon < -180 || lon > 180) {
    return { valid: false, error: "Longitude must be between -180° and +180°." };
  }
  return { valid: true };
}

// ── Fetch Air Quality (Open-Meteo) ─────────────────────────────────────────────

async function fetchAirQuality(
  lat: number,
  lon: number,
  signal: AbortSignal
): Promise<AirQualityData | undefined> {
  try {
    const url = new URL(AIR_QUALITY_API_URL);
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lon.toString());
    url.searchParams.set(
      "current",
      "european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone"
    );
    url.searchParams.set("timezone", "auto");

    const res = await fetch(url.toString(), { signal });
    if (!res.ok) return undefined;

    const json = await res.json();
    const curr = json.current;
    if (!curr) return undefined;

    const usAqi = typeof curr.us_aqi === "number" ? Math.round(curr.us_aqi) : undefined;
    const euroAqi = typeof curr.european_aqi === "number" ? Math.round(curr.european_aqi) : undefined;
    const aqiCat = getAqiCategory(usAqi, euroAqi);

    return {
      usAqi,
      europeanAqi: euroAqi,
      pm2_5: curr.pm2_5 ? Number(curr.pm2_5.toFixed(1)) : undefined,
      pm10: curr.pm10 ? Number(curr.pm10.toFixed(1)) : undefined,
      no2: curr.nitrogen_dioxide ? Number(curr.nitrogen_dioxide.toFixed(1)) : undefined,
      so2: curr.sulphur_dioxide ? Number(curr.sulphur_dioxide.toFixed(1)) : undefined,
      o3: curr.ozone ? Number(curr.ozone.toFixed(1)) : undefined,
      co: curr.carbon_monoxide ? Number(curr.carbon_monoxide.toFixed(1)) : undefined,
      aqiCategory: aqiCat.category,
      aqiColor: aqiCat.color,
      aqiDescription: aqiCat.description,
    };
  } catch {
    return undefined; // Air quality is supplementary, do not fail main weather
  }
}

// ── Fetch Full Weather Data ───────────────────────────────────────────────────

export async function fetchWeatherData(
  location: GeoLocation,
  forceRefresh = false,
  timeoutMs = 10000
): Promise<FullWeatherData> {
  const coordCheck = validateCoordinates(location.latitude, location.longitude);
  if (!coordCheck.valid) {
    throw new Error(coordCheck.error);
  }

  const cacheKey = buildCacheKey(location.latitude, location.longitude);

  // 1. Check in-memory cache if not forcing refresh
  if (!forceRefresh) {
    const memEntry = memoryCache.get(cacheKey);
    if (memEntry && Date.now() - memEntry.cachedAt < CACHE_TTL_MS) {
      return { ...memEntry.data, isCached: true };
    }

    // 2. Check localStorage
    try {
      const localRaw = localStorage.getItem(`${WEATHER_CACHE_PREFIX}${cacheKey}`);
      if (localRaw) {
        const parsed = JSON.parse(localRaw) as { data: FullWeatherData; cachedAt: number };
        if (Date.now() - parsed.cachedAt < CACHE_TTL_MS) {
          memoryCache.set(cacheKey, parsed);
          return { ...parsed.data, isCached: true };
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Make real API request to Open-Meteo Forecast API
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = new URL(WEATHER_API_URL);
    url.searchParams.set("latitude", location.latitude.toString());
    url.searchParams.set("longitude", location.longitude.toString());
    url.searchParams.set(
      "current",
      [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "rain",
        "showers",
        "snowfall",
        "weather_code",
        "cloud_cover",
        "pressure_msl",
        "surface_pressure",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
      ].join(",")
    );
    url.searchParams.set(
      "hourly",
      [
        "temperature_2m",
        "relative_humidity_2m",
        "dew_point_2m",
        "apparent_temperature",
        "precipitation_probability",
        "precipitation",
        "rain",
        "weather_code",
        "pressure_msl",
        "cloud_cover",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
        "uv_index",
      ].join(",")
    );
    url.searchParams.set(
      "daily",
      [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "apparent_temperature_min",
        "sunrise",
        "sunset",
        "daylight_duration",
        "sunshine_duration",
        "uv_index_max",
        "precipitation_sum",
        "rain_sum",
        "precipitation_probability_max",
        "wind_speed_10m_max",
        "wind_gusts_10m_max",
        "wind_direction_10m_dominant",
      ].join(",")
    );
    url.searchParams.set("timezone", "auto");

    const [forecastResponse, airQualityData] = await Promise.all([
      fetch(url.toString(), {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
      fetchAirQuality(location.latitude, location.longitude, controller.signal),
    ]);

    if (!forecastResponse.ok) {
      throw new Error(`Open-Meteo API returned HTTP ${forecastResponse.status}`);
    }

    const json = await forecastResponse.json();

    if (!json.current || !json.hourly || !json.daily) {
      throw new Error("Incomplete weather data received from Open-Meteo.");
    }

    // ── Parse Current Weather ────────────────────────────────────────────────
    const curr = json.current;
    const daily = json.daily;
    const hourly = json.hourly;

    const weatherInfo = getWeatherConditionInfo(curr.weather_code, curr.is_day);

    // Current UV index from closest hourly slot
    const nowIso = curr.time;
    let currentUv = 0;
    if (hourly.time && hourly.uv_index) {
      const idx = hourly.time.findIndex((t: string) => t >= nowIso);
      if (idx !== -1 && typeof hourly.uv_index[idx] === "number") {
        currentUv = hourly.uv_index[idx];
      } else if (daily.uv_index_max && daily.uv_index_max[0]) {
        currentUv = daily.uv_index_max[0];
      }
    }

    const current: CurrentWeatherData = {
      time: curr.time,
      temperature: Number(curr.temperature_2m.toFixed(1)),
      apparentTemperature: Number(curr.apparent_temperature.toFixed(1)),
      tempMax: daily.temperature_2m_max?.[0] ? Number(daily.temperature_2m_max[0].toFixed(1)) : curr.temperature_2m,
      tempMin: daily.temperature_2m_min?.[0] ? Number(daily.temperature_2m_min[0].toFixed(1)) : curr.temperature_2m,
      relativeHumidity: Math.round(curr.relative_humidity_2m),
      windSpeed: Number(curr.wind_speed_10m.toFixed(1)),
      windDirection: Math.round(curr.wind_direction_10m),
      pressure: Math.round(curr.pressure_msl ?? curr.surface_pressure ?? 1013),
      precipitation: Number((curr.precipitation ?? 0).toFixed(1)),
      cloudCover: Math.round(curr.cloud_cover ?? 0),
      uvIndex: Number(currentUv.toFixed(1)),
      weatherCode: curr.weather_code,
      isDay: curr.is_day,
      condition: weatherInfo.label,
      windDirectionCompass: degreesToCompass(curr.wind_direction_10m),
    };

    // ── Parse Next 24 Hours Forecast ─────────────────────────────────────────
    const hourlyItems: HourlyForecastItem[] = [];
    const currentTimeStr = curr.time;
    let startIdx = 0;

    if (hourly.time && Array.isArray(hourly.time)) {
      const match = hourly.time.findIndex((t: string) => t >= currentTimeStr);
      if (match !== -1) startIdx = match;
    }

    const hourlyEndIdx = Math.min(startIdx + 24, hourly.time?.length || 0);

    for (let i = startIdx; i < hourlyEndIdx; i++) {
      const rawTime = hourly.time[i];
      const d = new Date(rawTime);
      const formattedTime = i === startIdx ? "Now" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const wCode = hourly.weather_code[i] ?? 0;
      const cond = getWeatherConditionInfo(wCode, 1);

      hourlyItems.push({
        time: rawTime,
        formattedTime,
        temperature: Number((hourly.temperature_2m[i] ?? 0).toFixed(1)),
        apparentTemperature: Number((hourly.apparent_temperature[i] ?? 0).toFixed(1)),
        precipitationProbability: Math.round(hourly.precipitation_probability?.[i] ?? 0),
        precipitation: Number((hourly.precipitation?.[i] ?? 0).toFixed(1)),
        relativeHumidity: Math.round(hourly.relative_humidity_2m[i] ?? 0),
        windSpeed: Number((hourly.wind_speed_10m[i] ?? 0).toFixed(1)),
        windDirection: Math.round(hourly.wind_direction_10m[i] ?? 0),
        weatherCode: wCode,
        condition: cond.label,
        uvIndex: Number((hourly.uv_index?.[i] ?? 0).toFixed(1)),
        pressure: Math.round(hourly.pressure_msl?.[i] ?? 1013),
        cloudCover: Math.round(hourly.cloud_cover?.[i] ?? 0),
      });
    }

    // ── Parse 7-Day Forecast ─────────────────────────────────────────────────
    const dailyItems: DailyForecastItem[] = [];
    const dayCount = Math.min(7, daily.time?.length || 0);

    for (let i = 0; i < dayCount; i++) {
      const dateStr = daily.time[i];
      const dateObj = new Date(dateStr);
      const isToday = i === 0;
      const dayName = isToday ? "Today" : dateObj.toLocaleDateString([], { weekday: "short" });
      const formattedDate = dateObj.toLocaleDateString([], { month: "short", day: "numeric" });
      const code = daily.weather_code[i] ?? 0;
      const cond = getWeatherConditionInfo(code, 1);

      dailyItems.push({
        date: dateStr,
        formattedDate,
        dayName,
        weatherCode: code,
        condition: cond.label,
        tempMax: Number((daily.temperature_2m_max[i] ?? 0).toFixed(1)),
        tempMin: Number((daily.temperature_2m_min[i] ?? 0).toFixed(1)),
        precipitationProbability: Math.round(daily.precipitation_probability_max?.[i] ?? 0),
        precipitationSum: Number((daily.precipitation_sum?.[i] ?? 0).toFixed(1)),
        windSpeedMax: Number((daily.wind_speed_10m_max?.[i] ?? 0).toFixed(1)),
        windDirectionDominant: Math.round(daily.wind_direction_10m_dominant?.[i] ?? 0),
        uvIndexMax: Number((daily.uv_index_max?.[i] ?? 0).toFixed(1)),
        sunrise: daily.sunrise?.[i] ? formatTimeStr(daily.sunrise[i]) : "--",
        sunset: daily.sunset?.[i] ? formatTimeStr(daily.sunset[i]) : "--",
        daylightDurationSeconds: daily.daylight_duration?.[i] ?? 0,
      });
    }

    const fullData: FullWeatherData = {
      location,
      current,
      hourly24h: hourlyItems,
      daily7d: dailyItems,
      airQuality: airQualityData,
      lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      isCached: false,
    };

    // Save to memory and localStorage
    const cachePayload = { data: fullData, cachedAt: Date.now() };
    memoryCache.set(cacheKey, cachePayload);
    try {
      localStorage.setItem(`${WEATHER_CACHE_PREFIX}${cacheKey}`, JSON.stringify(cachePayload));
    } catch {
      // ignore
    }

    return fullData;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Weather request timed out. Open-Meteo servers took too long to respond. Please try again.");
    }
    throw new Error(err instanceof Error ? err.message : "Failed to fetch weather forecast data.");
  } finally {
    clearTimeout(timer);
  }
}

function formatTimeStr(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return isoString;
  }
}

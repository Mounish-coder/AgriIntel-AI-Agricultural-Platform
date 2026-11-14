import type { GeoLocation, GeocodingResponse } from "../types/weather";

const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const CACHE_KEY_PREFIX = "agriintel_geo_cache_";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours for geocoding
const LAST_LOCATION_KEY = "agriintel_last_weather_location";

// Memory cache
const memoryCache = new Map<string, { data: GeoLocation[]; expiresAt: number }>();

// ── Default / Featured Agricultural Locations ─────────────────────────────────

export const DEFAULT_LOCATIONS: GeoLocation[] = [
  {
    name: "New Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
    admin1: "Delhi",
    country: "India",
    country_code: "IN",
    timezone: "Asia/Kolkata",
  },
  {
    name: "Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946,
    admin1: "Karnataka",
    country: "India",
    country_code: "IN",
    timezone: "Asia/Kolkata",
  },
  {
    name: "Mumbai",
    latitude: 19.0760,
    longitude: 72.8777,
    admin1: "Maharashtra",
    country: "India",
    country_code: "IN",
    timezone: "Asia/Kolkata",
  },
  {
    name: "Pune",
    latitude: 18.5204,
    longitude: 73.8567,
    admin1: "Maharashtra",
    country: "India",
    country_code: "IN",
    timezone: "Asia/Kolkata",
  },
  {
    name: "Hyderabad",
    latitude: 17.3850,
    longitude: 78.4867,
    admin1: "Telangana",
    country: "India",
    country_code: "IN",
    timezone: "Asia/Kolkata",
  },
  {
    name: "Lucknow",
    latitude: 26.8467,
    longitude: 80.9462,
    admin1: "Uttar Pradesh",
    country: "India",
    country_code: "IN",
    timezone: "Asia/Kolkata",
  },
  {
    name: "Chandigarh",
    latitude: 30.7333,
    longitude: 76.7794,
    admin1: "Punjab / Haryana",
    country: "India",
    country_code: "IN",
    timezone: "Asia/Kolkata",
  },
  {
    name: "Jaipur",
    latitude: 26.9124,
    longitude: 75.7873,
    admin1: "Rajasthan",
    country: "India",
    country_code: "IN",
    timezone: "Asia/Kolkata",
  },
  {
    name: "Chennai",
    latitude: 13.0827,
    longitude: 80.2707,
    admin1: "Tamil Nadu",
    country: "India",
    country_code: "IN",
    timezone: "Asia/Kolkata",
  },
  {
    name: "Indore",
    latitude: 22.7196,
    longitude: 75.8577,
    admin1: "Madhya Pradesh",
    country: "India",
    country_code: "IN",
    timezone: "Asia/Kolkata",
  },
  {
    name: "Nagpur",
    latitude: 21.1458,
    longitude: 79.0882,
    admin1: "Maharashtra",
    country: "India",
    country_code: "IN",
    timezone: "Asia/Kolkata",
  },
  {
    name: "Kolkata",
    latitude: 22.5726,
    longitude: 88.3639,
    admin1: "West Bengal",
    country: "India",
    country_code: "IN",
    timezone: "Asia/Kolkata",
  },
];

// ── Search Locations via Open-Meteo Geocoding API ─────────────────────────────

export async function searchLocations(
  query: string,
  timeoutMs = 8000
): Promise<GeoLocation[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const cacheKey = trimmed.toLowerCase();

  // 1. Check memory cache
  const cachedMem = memoryCache.get(cacheKey);
  if (cachedMem && cachedMem.expiresAt > Date.now()) {
    return cachedMem.data;
  }

  // 2. Check localStorage cache
  try {
    const rawLocal = localStorage.getItem(`${CACHE_KEY_PREFIX}${cacheKey}`);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal) as { data: GeoLocation[]; expiresAt: number };
      if (parsed.expiresAt > Date.now()) {
        memoryCache.set(cacheKey, parsed);
        return parsed.data;
      }
    }
  } catch {
    // ignore localStorage errors
  }

  // 3. Fetch from Open-Meteo Geocoding API
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = new URL(GEOCODING_BASE_URL);
    url.searchParams.set("name", trimmed);
    url.searchParams.set("count", "10");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Geocoding server responded with HTTP ${response.status}`);
    }

    const data: GeocodingResponse = await response.json();
    const results: GeoLocation[] = (data.results || [])
      .filter((item) => typeof item.latitude === "number" && typeof item.longitude === "number")
      .map((item) => ({
        id: item.id,
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        elevation: item.elevation,
        country: item.country,
        country_code: item.country_code,
        admin1: item.admin1,
        admin2: item.admin2,
        timezone: item.timezone,
        population: item.population,
      }));

    // Cache the result
    const cacheEntry = { data: results, expiresAt: Date.now() + CACHE_TTL_MS };
    memoryCache.set(cacheKey, cacheEntry);
    try {
      localStorage.setItem(`${CACHE_KEY_PREFIX}${cacheKey}`, JSON.stringify(cacheEntry));
    } catch {
      // ignore quota errors
    }

    return results;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Geocoding request timed out. Please check your internet connection and try again.");
    }
    throw new Error(err instanceof Error ? err.message : "Failed to search location");
  } finally {
    clearTimeout(timer);
  }
}

// ── GPS-based Location Detection ──────────────────────────────────────────────

export async function getCurrentGpsCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4)),
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location permission denied. Please allow location access or select a location manually."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information is currently unavailable."));
            break;
          case error.TIMEOUT:
            reject(new Error("Location detection request timed out."));
            break;
          default:
            reject(new Error("An unknown error occurred while retrieving GPS location."));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

// ── Reverse Geocode Coordinates ───────────────────────────────────────────────

export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number,
  timeoutMs = 6000
): Promise<GeoLocation> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const resp = await fetch(url, { signal: controller.signal });
    if (resp.ok) {
      const data = await resp.json();
      const name = data.locality || data.city || data.principalSubdivision || "Current Location";
      return {
        name,
        latitude: lat,
        longitude: lon,
        admin1: data.principalSubdivision || "",
        country: data.countryName || "India",
        country_code: data.countryCode || "",
      };
    }
  } catch {
    // fallback gracefully
  } finally {
    clearTimeout(timer);
  }

  return {
    name: `Location (${lat >= 0 ? lat.toFixed(2) + "°N" : Math.abs(lat).toFixed(2) + "°S"}, ${lon >= 0 ? lon.toFixed(2) + "°E" : Math.abs(lon).toFixed(2) + "°W"})`,
    latitude: lat,
    longitude: lon,
    admin1: "Custom Coordinates",
    country: "GPS Detected",
  };
}

// ── Last Location Persistence ─────────────────────────────────────────────────

export function saveLastSelectedLocation(loc: GeoLocation): void {
  try {
    localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(loc));
  } catch {
    // ignore
  }
}

export function loadLastSelectedLocation(): GeoLocation {
  try {
    const saved = localStorage.getItem(LAST_LOCATION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.latitude === "number" && typeof parsed.longitude === "number") {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_LOCATIONS[0]; // Default to New Delhi
}

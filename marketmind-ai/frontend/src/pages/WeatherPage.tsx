import React, { useState, useEffect, useCallback } from "react";
import type { GeoLocation, FullWeatherData } from "../types/weather";
import {
  loadLastSelectedLocation,
  DEFAULT_LOCATIONS,
} from "../services/geocodingApi";
import { fetchWeatherData } from "../services/weatherApi";
import { LocationSearchBar } from "../components/weather/LocationSearchBar";
import { CurrentWeatherCard } from "../components/weather/CurrentWeatherCard";
import { WeatherMetricsGrid } from "../components/weather/WeatherMetricsGrid";
import { HourlyForecast } from "../components/weather/HourlyForecast";
import { DailyForecast } from "../components/weather/DailyForecast";
import { WeatherCharts } from "../components/weather/WeatherCharts";
import { SunAndAirQualityCard } from "../components/weather/SunAndAirQualityCard";
import {
  CloudSun,
  AlertTriangle,
  RefreshCw,
  Info,
  ShieldCheck,
} from "lucide-react";

export const WeatherPage: React.FC = () => {
  const [location, setLocation] = useState<GeoLocation>(() => loadLastSelectedLocation());
  const [weatherData, setWeatherData] = useState<FullWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (targetLoc: GeoLocation, forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(targetLoc, forceRefresh);
      setWeatherData(data);
    } catch (err: unknown) {
      console.error("Failed to load weather data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while communicating with Open-Meteo weather servers."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(location, false);
  }, [location, loadData]);

  const handleLocationSelect = (newLoc: GeoLocation) => {
    setLocation(newLoc);
  };

  const handleRefresh = () => {
    loadData(location, true);
  };

  const handleResetToDefault = () => {
    const def = DEFAULT_LOCATIONS[0];
    setLocation(def);
  };

  return (
    <div style={{ paddingBottom: "3rem" }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 2px 8px rgba(14, 165, 233, 0.4)",
              }}
            >
              <CloudSun size={22} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: "var(--text-primary)",
                  lineHeight: 1.2,
                }}
              >
                Weather Forecast
              </h1>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                Independent real-time meteorological observations, hourly trends, and 7-day forecast
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(14, 165, 233, 0.08)",
              border: "1px solid rgba(14, 165, 233, 0.25)",
              padding: "0.35rem 0.75rem",
              borderRadius: 8,
              fontSize: "0.78rem",
              color: "var(--accent-hover)",
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={14} />
            <span>Autonomous Module</span>
          </div>
        </div>
      </div>

      {/* ── Location Search & Geolocation Controls ─────────────────────────── */}
      <LocationSearchBar
        currentLocation={location}
        onLocationSelect={handleLocationSelect}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        isCached={weatherData?.isCached}
        lastUpdated={weatherData?.lastUpdated}
      />

      {/* ── Error Banner State ──────────────────────────────────────────────── */}
      {error && (
        <div
          className="card"
          style={{
            marginBottom: "1.5rem",
            padding: "1.25rem",
            background: "rgba(239, 68, 68, 0.04)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(239, 68, 68, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-danger)",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={20} />
          </div>

          <div style={{ flex: 1 }}>
            <h4 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--accent-danger)", marginBottom: 4 }}>
              Weather Service Error
            </h4>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
              {error}
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={handleRefresh}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.4rem 0.85rem",
                  borderRadius: 6,
                  border: "none",
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={13} />
                <span>Retry Connection</span>
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Reset to Default Location (New Delhi)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Loading Skeleton State ─────────────────────────────────────────── */}
      {isLoading && !weatherData && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div
            className="card"
            style={{
              padding: "2.5rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <div
              className="spinner"
              style={{
                width: 42,
                height: 42,
                borderWidth: 3,
                borderColor: "var(--accent) transparent var(--accent) transparent",
              }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                Connecting to Open-Meteo Weather Service...
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>
                Retrieving live atmospheric telemetry, 24h hourly forecast, and 7-day projections for {location.name}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Loaded Weather Content ─────────────────────────────────────────── */}
      {weatherData && (
        <>
          {/* Row 1: Hero Current Weather & Sun / Air Quality Card */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "1.25rem",
              alignItems: "stretch",
            }}
          >
            <CurrentWeatherCard
              current={weatherData.current}
              location={weatherData.location}
            />
            <SunAndAirQualityCard
              current={weatherData.current}
              todayForecast={weatherData.daily7d[0]}
              airQuality={weatherData.airQuality}
            />
          </div>

          {/* Row 2: Comprehensive 12-Card Weather Metrics Grid */}
          <WeatherMetricsGrid current={weatherData.current} />

          {/* Row 3: Hourly Forecast Carousel & Interactive Plotly Chart */}
          <HourlyForecast hourly={weatherData.hourly24h} />

          {/* Row 4: 7-Day Forecast Section */}
          <DailyForecast daily={weatherData.daily7d} />

          {/* Row 5: Weather Analytics (Plotly Interactive Charts) */}
          <WeatherCharts
            daily={weatherData.daily7d}
            hourly={weatherData.hourly24h}
          />

          {/* Footer Notice & Attribution */}
          <div
            style={{
              marginTop: "2.5rem",
              padding: "1rem 1.25rem",
              background: "var(--bg-card)",
              borderRadius: 10,
              border: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.75rem",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Info size={15} style={{ color: "var(--accent)" }} />
              <span>
                Weather and Geocoding APIs powered by{" "}
                <a
                  href="https://open-meteo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}
                >
                  Open-Meteo
                </a>{" "}
                under CC BY 4.0. Completely independent weather module decoupled from crop models.
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span>Station Lat: {weatherData.location.latitude.toFixed(4)}°</span>
              <span>Lon: {weatherData.location.longitude.toFixed(4)}°</span>
              <span>Updated: {weatherData.lastUpdated}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

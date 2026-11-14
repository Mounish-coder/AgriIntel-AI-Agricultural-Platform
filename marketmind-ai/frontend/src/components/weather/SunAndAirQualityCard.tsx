import React from "react";
import type { DailyForecastItem, AirQualityData, CurrentWeatherData } from "../../types/weather";
import { formatDaylightDuration, getUvCategory } from "../../types/weather";
import {
  Sunrise,
  Sunset,
  Sun,
  Wind,
} from "lucide-react";

interface SunAndAirQualityCardProps {
  todayForecast?: DailyForecastItem;
  current: CurrentWeatherData;
  airQuality?: AirQualityData;
}

export const SunAndAirQualityCard: React.FC<SunAndAirQualityCardProps> = ({
  todayForecast,
  current,
  airQuality,
}) => {
  const uvInfo = getUvCategory(current.uvIndex);

  // Daylight duration calculation
  const daylightSec = todayForecast?.daylightDurationSeconds ?? 0;
  const daylightStr = formatDaylightDuration(daylightSec);

  // Calculate sun position percentage if sunrise & sunset are available
  let sunProgressPercent = 50;
  if (todayForecast?.sunrise && todayForecast?.sunset) {
    try {
      // Use local station observation time from API if available
      let nowMin = 720; // default midday
      if (current.time && current.time.includes("T")) {
        const timePart = current.time.split("T")[1];
        const [cH, cM] = timePart.split(":").map((v) => parseInt(v));
        if (!isNaN(cH)) {
          nowMin = cH * 60 + (cM || 0);
        }
      }

      const [srH, srM] = todayForecast.sunrise.split(":").map((v) => parseInt(v.trim()));
      const [ssH, ssM] = todayForecast.sunset.split(":").map((v) => parseInt(v.trim()));

      if (!isNaN(srH) && !isNaN(ssH)) {
        const srMin = srH * 60 + (srM || 0);
        const ssMin = ssH * 60 + (ssM || 0);

        if (nowMin < srMin) {
          sunProgressPercent = 0;
        } else if (nowMin > ssMin) {
          sunProgressPercent = 100;
        } else {
          sunProgressPercent = Math.round(((nowMin - srMin) / (ssMin - srMin)) * 100);
        }
      }
    } catch {
      sunProgressPercent = 50;
    }
  }

  return (
    <div
      className="card"
      style={{
        background: "var(--bg-card)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "1.25rem",
      }}
    >
      {/* ── Top Half: Solar Ephemeris (Sunrise, Sunset, Daylight) ──────────── */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.85rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <Sun size={17} style={{ color: "#f59e0b" }} />
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Solar Schedule & Daylight
            </span>
          </div>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "var(--bg-elevated)",
              padding: "0.15rem 0.5rem",
              borderRadius: 10,
            }}
          >
            Daylight: {daylightStr}
          </span>
        </div>

        {/* Visual Daylight Progress Track */}
        <div style={{ margin: "0.85rem 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginBottom: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Sunrise size={14} color="#f59e0b" />
              <span>Rise: {todayForecast?.sunrise || "--"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Sunset size={14} color="#f97316" />
              <span>Set: {todayForecast?.sunset || "--"}</span>
            </div>
          </div>

          <div
            style={{
              height: 7,
              background: "var(--border-subtle)",
              borderRadius: 4,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${sunProgressPercent}%`,
                background: "linear-gradient(90deg, #f59e0b 0%, #0ea5e9 100%)",
                borderRadius: 4,
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              marginTop: 4,
              textAlign: "center",
            }}
          >
            {sunProgressPercent >= 100
              ? "Sun has set for today"
              : sunProgressPercent <= 0
              ? "Sun has not risen yet"
              : `Current daylight elapsed: ${sunProgressPercent}%`}
          </div>
        </div>

        {/* UV Index Detailed Meter */}
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            borderRadius: 10,
            background: `${uvInfo.color}10`,
            border: `1px solid ${uvInfo.color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Sun size={15} color={uvInfo.color} />
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>
                UV Index: {current.uvIndex} ({uvInfo.level})
              </span>
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: 2 }}>
              {uvInfo.advice}
            </div>
          </div>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: uvInfo.color,
              background: "#ffffff",
              padding: "0.2rem 0.6rem",
              borderRadius: 6,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            Peak Today: {todayForecast?.uvIndexMax ?? current.uvIndex}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border-subtle)" }} />

      {/* ── Bottom Half: Air Quality ───────────────────────────────────────── */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <Wind size={17} style={{ color: "#06b6d4" }} />
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Air Quality & Particulate Matter
            </span>
          </div>

          {airQuality && (
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: airQuality.aqiColor,
                background: `${airQuality.aqiColor}15`,
                border: `1px solid ${airQuality.aqiColor}40`,
                padding: "0.15rem 0.55rem",
                borderRadius: 8,
              }}
            >
              AQI: {airQuality.usAqi ?? airQuality.europeanAqi ?? "--"} · {airQuality.aqiCategory}
            </span>
          )}
        </div>

        {airQuality ? (
          <div>
            <div
              style={{
                fontSize: "0.76rem",
                color: "var(--text-secondary)",
                marginBottom: "0.75rem",
              }}
            >
              {airQuality.aqiDescription}
            </div>

            {/* Pollutants Telemetry Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  background: "var(--bg-base)",
                  padding: "0.45rem 0.55rem",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)" }}>
                  PM2.5
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                  {airQuality.pm2_5 !== undefined ? `${airQuality.pm2_5}` : "--"}
                  <span style={{ fontSize: "0.65rem", fontWeight: 400, color: "var(--text-muted)", marginLeft: 2 }}>
                    µg/m³
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: "var(--bg-base)",
                  padding: "0.45rem 0.55rem",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)" }}>
                  PM10
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                  {airQuality.pm10 !== undefined ? `${airQuality.pm10}` : "--"}
                  <span style={{ fontSize: "0.65rem", fontWeight: 400, color: "var(--text-muted)", marginLeft: 2 }}>
                    µg/m³
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: "var(--bg-base)",
                  padding: "0.45rem 0.55rem",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)" }}>
                  Ozone (O₃)
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                  {airQuality.o3 !== undefined ? `${airQuality.o3}` : "--"}
                  <span style={{ fontSize: "0.65rem", fontWeight: 400, color: "var(--text-muted)", marginLeft: 2 }}>
                    µg/m³
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: "var(--bg-base)",
                  padding: "0.45rem 0.55rem",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)" }}>
                  NO₂
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                  {airQuality.no2 !== undefined ? `${airQuality.no2}` : "--"}
                  <span style={{ fontSize: "0.65rem", fontWeight: 400, color: "var(--text-muted)", marginLeft: 2 }}>
                    µg/m³
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: "var(--bg-base)",
                  padding: "0.45rem 0.55rem",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)" }}>
                  SO₂
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                  {airQuality.so2 !== undefined ? `${airQuality.so2}` : "--"}
                  <span style={{ fontSize: "0.65rem", fontWeight: 400, color: "var(--text-muted)", marginLeft: 2 }}>
                    µg/m³
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: "var(--bg-base)",
                  padding: "0.45rem 0.55rem",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)" }}>
                  CO
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                  {airQuality.co !== undefined ? `${airQuality.co}` : "--"}
                  <span style={{ fontSize: "0.65rem", fontWeight: 400, color: "var(--text-muted)", marginLeft: 2 }}>
                    µg/m³
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "0.75rem",
              borderRadius: 8,
              background: "var(--bg-base)",
              color: "var(--text-muted)",
              fontSize: "0.78rem",
              textAlign: "center",
            }}
          >
            Air quality data is currently being fetched or unavailable for this station coordinate.
          </div>
        )}
      </div>
    </div>
  );
};

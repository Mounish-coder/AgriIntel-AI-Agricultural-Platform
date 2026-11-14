import React from "react";
import type { CurrentWeatherData } from "../../types/weather";
import { getWeatherConditionInfo, getUvCategory } from "../../types/weather";
import {
  Thermometer,
  Flame,
  ArrowUp,
  ArrowDown,
  Droplets,
  Wind,
  Compass,
  Gauge,
  CloudRain,
  Cloud,
  Sun,
  Activity,
} from "lucide-react";

interface WeatherMetricsGridProps {
  current: CurrentWeatherData;
}

export const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({ current }) => {
  const condInfo = getWeatherConditionInfo(current.weatherCode, current.isDay);
  const uvInfo = getUvCategory(current.uvIndex);

  const metrics = [
    {
      id: "temp",
      title: "Current Temperature",
      value: `${current.temperature}°C`,
      subtitle: `Observed at ${current.time ? current.time.slice(11, 16) : "now"}`,
      icon: Thermometer,
      iconColor: "#0ea5e9",
      bgColor: "rgba(14, 165, 233, 0.08)",
    },
    {
      id: "apparent_temp",
      title: "Feels-Like Temperature",
      value: `${current.apparentTemperature}°C`,
      subtitle:
        current.apparentTemperature > current.temperature
          ? "Higher due to humidity"
          : current.apparentTemperature < current.temperature
          ? "Cooler due to wind chill"
          : "Matches ambient temp",
      icon: Flame,
      iconColor: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.08)",
    },
    {
      id: "max_temp",
      title: "Maximum Temperature",
      value: `${current.tempMax}°C`,
      subtitle: "Peak forecasted for today",
      icon: ArrowUp,
      iconColor: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.08)",
    },
    {
      id: "min_temp",
      title: "Minimum Temperature",
      value: `${current.tempMin}°C`,
      subtitle: "Lowest forecasted for today",
      icon: ArrowDown,
      iconColor: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.08)",
    },
    {
      id: "humidity",
      title: "Relative Humidity",
      value: `${current.relativeHumidity}%`,
      subtitle:
        current.relativeHumidity > 70
          ? "High moisture level"
          : current.relativeHumidity < 35
          ? "Dry atmospheric air"
          : "Comfortable moisture range",
      icon: Droplets,
      iconColor: "#0284c7",
      bgColor: "rgba(2, 132, 199, 0.08)",
      extra: (
        <div
          style={{
            height: 4,
            width: "100%",
            background: "var(--border-subtle)",
            borderRadius: 2,
            marginTop: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, current.relativeHumidity)}%`,
              background: "#0284c7",
              borderRadius: 2,
            }}
          />
        </div>
      ),
    },
    {
      id: "wind_speed",
      title: "Wind Speed",
      value: `${current.windSpeed} km/h`,
      subtitle:
        current.windSpeed < 5
          ? "Calm / Light air"
          : current.windSpeed < 20
          ? "Gentle to moderate breeze"
          : "Strong / Gusty wind",
      icon: Wind,
      iconColor: "#06b6d4",
      bgColor: "rgba(6, 182, 212, 0.08)",
    },
    {
      id: "wind_direction",
      title: "Wind Direction",
      value: `${current.windDirectionCompass} (${current.windDirection}°)`,
      subtitle: "Blowing from the " + current.windDirectionCompass,
      icon: Compass,
      iconColor: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.08)",
      extra: (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <div
            style={{
              transform: `rotate(${current.windDirection}deg)`,
              display: "inline-flex",
              transition: "transform 0.3s ease",
            }}
          >
            <Compass size={16} color="#8b5cf6" />
          </div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Orientation angle {current.windDirection}°
          </span>
        </div>
      ),
    },
    {
      id: "pressure",
      title: "Atmospheric Pressure",
      value: `${current.pressure} hPa`,
      subtitle:
        current.pressure > 1015
          ? "High pressure (stable)"
          : current.pressure < 1005
          ? "Low pressure (storm system)"
          : "Standard sea-level range",
      icon: Gauge,
      iconColor: "#64748b",
      bgColor: "rgba(100, 116, 139, 0.08)",
    },
    {
      id: "rainfall",
      title: "Precipitation / Rain",
      value: `${current.precipitation} mm`,
      subtitle:
        current.precipitation > 5
          ? "Active rainfall accumulating"
          : current.precipitation > 0
          ? "Trace / light precipitation"
          : "No current precipitation",
      icon: CloudRain,
      iconColor: "#2563eb",
      bgColor: "rgba(37, 99, 235, 0.08)",
    },
    {
      id: "cloud_cover",
      title: "Cloud Cover",
      value: `${current.cloudCover}%`,
      subtitle:
        current.cloudCover > 80
          ? "Heavy overcast sky"
          : current.cloudCover > 40
          ? "Partly cloudy conditions"
          : "Clear / Few clouds",
      icon: Cloud,
      iconColor: "#64748b",
      bgColor: "rgba(100, 116, 139, 0.08)",
      extra: (
        <div
          style={{
            height: 4,
            width: "100%",
            background: "var(--border-subtle)",
            borderRadius: 2,
            marginTop: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, current.cloudCover)}%`,
              background: "#64748b",
              borderRadius: 2,
            }}
          />
        </div>
      ),
    },
    {
      id: "uv_index",
      title: "UV Radiation Index",
      value: `${current.uvIndex} (${uvInfo.level})`,
      subtitle: uvInfo.advice,
      icon: Sun,
      iconColor: uvInfo.color,
      bgColor: `${uvInfo.color}15`,
    },
    {
      id: "weather_condition",
      title: "Weather Condition",
      value: condInfo.label,
      subtitle: `WMO Code: ${current.weatherCode} · ${condInfo.description}`,
      icon: Activity,
      iconColor: condInfo.badgeColor,
      bgColor: `${condInfo.badgeColor}15`,
    },
  ];

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.85rem",
        }}
      >
        <h3
          style={{
            fontSize: "1.05rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>Weather Conditions & Telemetry</span>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "var(--bg-elevated)",
              padding: "0.15rem 0.5rem",
              borderRadius: 12,
            }}
          >
            12 Observations
          </span>
        </h3>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "0.85rem",
        }}
      >
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              className="card"
              style={{
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "var(--bg-card)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0, 40, 80, 0.06)";
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {m.title}
                  </span>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: m.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={15} color={m.iconColor} />
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {m.value}
                </div>
              </div>

              <div>
                {m.extra}
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    marginTop: "0.45rem",
                    lineHeight: 1.3,
                  }}
                >
                  {m.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

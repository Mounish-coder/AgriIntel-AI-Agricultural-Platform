import React from "react";
import type { CurrentWeatherData, GeoLocation } from "../../types/weather";
import { getWeatherConditionInfo, getUvCategory } from "../../types/weather";
import { WeatherIcon } from "./WeatherIcon";
import {
  Thermometer,
  Wind,
  Droplets,
  CloudRain,
  Sun,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface CurrentWeatherCardProps {
  current: CurrentWeatherData;
  location: GeoLocation;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  current,
  location,
}) => {
  const condInfo = getWeatherConditionInfo(current.weatherCode, current.isDay);
  const uvInfo = getUvCategory(current.uvIndex);

  return (
    <div
      className="card"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #ffffff 0%, var(--bg-elevated) 100%)",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 20px -2px rgba(14, 165, 233, 0.12)",
      }}
    >
      {/* Decorative ambient background blur */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: condInfo.badgeColor,
          opacity: 0.12,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left Column: Big Temperature & Condition */}
        <div style={{ flex: "1 1 260px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(14, 165, 233, 0.1)",
              color: "var(--accent-hover)",
              padding: "0.2rem 0.6rem",
              borderRadius: 20,
              fontSize: "0.74rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.75rem",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10b981",
                display: "inline-block",
              }}
            />
            Live Observation · {location.name}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.5rem",
              marginTop: "0.2rem",
            }}
          >
            <span
              style={{
                fontSize: "3.5rem",
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              {current.temperature}°
            </span>
            <span
              style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              C
            </span>
          </div>

          <div
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginTop: "0.35rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>{condInfo.label}</span>
          </div>

          <div
            style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              marginTop: "0.2rem",
              maxWidth: 320,
            }}
          >
            {condInfo.description}
          </div>

          {/* Min / Max / Feels Like Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginTop: "1.25rem",
              paddingTop: "0.85rem",
              borderTop: "1px solid var(--border-subtle)",
              flexWrap: "wrap",
              fontSize: "0.82rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <ArrowUp size={14} style={{ color: "#ef4444" }} />
              <span style={{ color: "var(--text-muted)" }}>High:</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{current.tempMax}°C</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <ArrowDown size={14} style={{ color: "#3b82f6" }} />
              <span style={{ color: "var(--text-muted)" }}>Low:</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{current.tempMin}°C</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Thermometer size={14} style={{ color: "#f59e0b" }} />
              <span style={{ color: "var(--text-muted)" }}>Feels like:</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{current.apparentTemperature}°C</span>
            </div>
          </div>
        </div>

        {/* Right Column: Icon & Quick Metrics */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(8px)",
            borderRadius: 16,
            border: "1px solid var(--border-subtle)",
            minWidth: 200,
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: condInfo.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1)",
              marginBottom: "1rem",
            }}
          >
            <WeatherIcon name={condInfo.iconName} size={48} />
          </div>

          {/* Quick Metrics Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
              width: "100%",
            }}
          >
            <div
              style={{
                background: "var(--bg-base)",
                padding: "0.45rem 0.6rem",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, color: "var(--accent)" }}>
                <Droplets size={12} />
                <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)" }}>Humidity</span>
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                {current.relativeHumidity}%
              </div>
            </div>

            <div
              style={{
                background: "var(--bg-base)",
                padding: "0.45rem 0.6rem",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, color: "var(--accent)" }}>
                <Wind size={12} />
                <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)" }}>Wind</span>
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                {current.windSpeed} <span style={{ fontSize: "0.68rem", fontWeight: 500 }}>km/h</span>
              </div>
            </div>

            <div
              style={{
                background: "var(--bg-base)",
                padding: "0.45rem 0.6rem",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, color: "var(--accent)" }}>
                <CloudRain size={12} />
                <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)" }}>Rainfall</span>
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                {current.precipitation} <span style={{ fontSize: "0.68rem", fontWeight: 500 }}>mm</span>
              </div>
            </div>

            <div
              style={{
                background: "var(--bg-base)",
                padding: "0.45rem 0.6rem",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, color: "var(--accent)" }}>
                <Sun size={12} />
                <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)" }}>UV Index</span>
              </div>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  color: uvInfo.color,
                  marginTop: 2,
                }}
              >
                {current.uvIndex} <span style={{ fontSize: "0.68rem", fontWeight: 600 }}>{uvInfo.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

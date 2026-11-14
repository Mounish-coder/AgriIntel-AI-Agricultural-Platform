import React, { useState } from "react";
import type { DailyForecastItem } from "../../types/weather";
import {
  getWeatherConditionInfo,
  getUvCategory,
  formatDaylightDuration,
} from "../../types/weather";
import { WeatherIcon } from "./WeatherIcon";
import {
  CalendarDays,
  CloudRain,
  Wind,
  Sun,
  Sunrise,
  Sunset,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface DailyForecastProps {
  daily: DailyForecastItem[];
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!daily || daily.length === 0) return null;

  // Calculate min and max across all 7 days for normalized temperature bar rendering
  const allMins = daily.map((d) => d.tempMin);
  const allMaxs = daily.map((d) => d.tempMax);
  const globalMin = Math.floor(Math.min(...allMins));
  const globalMax = Math.ceil(Math.max(...allMaxs));
  const tempRange = Math.max(1, globalMax - globalMin);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div style={{ marginTop: "1.75rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.85rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CalendarDays size={18} style={{ color: "var(--accent)" }} />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>
            7-Day Weather Forecast
          </h3>
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
            Weekly Outlook
          </span>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: 0,
          overflow: "hidden",
          background: "var(--bg-card)",
        }}
      >
        {daily.map((item, idx) => {
          const cond = getWeatherConditionInfo(item.weatherCode, 1);
          const uv = getUvCategory(item.uvIndexMax);
          const isExpanded = expandedIndex === idx;
          const isToday = idx === 0;

          // Bar offset and width
          const leftPercent = Math.max(0, ((item.tempMin - globalMin) / tempRange) * 100);
          const barWidth = Math.max(10, ((item.tempMax - item.tempMin) / tempRange) * 100);

          return (
            <div
              key={item.date}
              style={{
                borderBottom: idx < daily.length - 1 ? "1px solid var(--border-subtle)" : "none",
                background: isToday ? "rgba(14, 165, 233, 0.03)" : "transparent",
                transition: "background 0.15s",
              }}
            >
              <div
                onClick={() => toggleExpand(idx)}
                style={{
                  padding: "0.9rem 1.25rem",
                  display: "grid",
                  gridTemplateColumns: "140px 180px 1fr 100px 100px 90px 80px 30px",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                }}
              >
                {/* Date & Day */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.9rem", color: isToday ? "var(--accent)" : "var(--text-primary)" }}>
                      {item.dayName}
                    </span>
                    {isToday && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          background: "var(--accent)",
                          color: "#fff",
                          padding: "0.1rem 0.35rem",
                          borderRadius: 4,
                        }}
                      >
                        TODAY
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {item.formattedDate}
                  </div>
                </div>

                {/* Weather Icon & Condition */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: cond.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <WeatherIcon name={cond.iconName} size={18} />
                  </div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {cond.label}
                  </div>
                </div>

                {/* Temperature Range Bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#3b82f6", width: 28, textAlign: "right" }}>
                    {item.tempMin}°
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      background: "var(--border-subtle)",
                      borderRadius: 3,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: `${leftPercent}%`,
                        width: `${barWidth}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #38bdf8 0%, #f59e0b 50%, #ef4444 100%)",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ef4444", width: 28 }}>
                    {item.tempMax}°
                  </span>
                </div>

                {/* Rain Probability */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <CloudRain size={14} style={{ color: item.precipitationProbability > 20 ? "#0284c7" : "var(--text-muted)" }} />
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: item.precipitationProbability > 20 ? "#0284c7" : "var(--text-secondary)",
                    }}
                  >
                    {item.precipitationProbability}%
                  </span>
                </div>

                {/* Expected Rainfall */}
                <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                  <span style={{ fontWeight: 600 }}>{item.precipitationSum}</span>{" "}
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>mm</span>
                </div>

                {/* Wind Speed */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Wind size={13} style={{ color: "#06b6d4" }} />
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                    {item.windSpeedMax} <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>k</span>
                  </span>
                </div>

                {/* UV Index */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Sun size={13} style={{ color: uv.color }} />
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: uv.color }}>
                    {item.uvIndexMax}
                  </span>
                </div>

                {/* Expand Toggle */}
                <div style={{ color: "var(--text-muted)", display: "flex", justifyContent: "flex-end" }}>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Expanded details (Sunrise, Sunset, Daylight duration, advisory) */}
              {isExpanded && (
                <div
                  style={{
                    padding: "0.75rem 1.25rem 1rem",
                    background: "var(--bg-elevated)",
                    borderTop: "1px dashed var(--border-subtle)",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "1rem",
                    fontSize: "0.8rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Sunrise size={18} style={{ color: "#f59e0b" }} />
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Sunrise</div>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{item.sunrise}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Sunset size={18} style={{ color: "#f97316" }} />
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Sunset</div>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{item.sunset}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Clock size={18} style={{ color: "var(--accent)" }} />
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Daylight Duration</div>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                        {formatDaylightDuration(item.daylightDurationSeconds)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Sun size={18} style={{ color: uv.color }} />
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>UV Rating</div>
                      <div style={{ fontWeight: 700, color: uv.color }}>
                        {item.uvIndexMax} ({uv.level}) - {uv.advice}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

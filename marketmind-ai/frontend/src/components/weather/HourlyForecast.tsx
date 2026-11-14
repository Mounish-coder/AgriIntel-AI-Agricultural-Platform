import React, { useState } from "react";
import type { HourlyForecastItem } from "../../types/weather";
import { getWeatherConditionInfo } from "../../types/weather";
import { WeatherIcon } from "./WeatherIcon";
import { WeatherPlotlyChart } from "./WeatherPlotlyChart";
import {
  Clock,
  Droplets,
  Wind,
  CloudRain,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly }) => {
  const [activeMetricTab, setActiveMetricTab] = useState<"temp_rain" | "wind_humidity">("temp_rain");
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (!hourly || hourly.length === 0) {
    return null;
  }

  // Prepare Plotly Chart Data
  const times = hourly.map((h) => h.formattedTime);
  const temps = hourly.map((h) => h.temperature);
  const rainProbs = hourly.map((h) => h.precipitationProbability);
  const humidities = hourly.map((h) => h.relativeHumidity);
  const windSpeeds = hourly.map((h) => h.windSpeed);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let chartData: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let chartLayout: Record<string, any> = {};

  if (activeMetricTab === "temp_rain") {
    chartData = [
      {
        type: "bar",
        name: "Rain Probability (%)",
        x: times,
        y: rainProbs,
        yaxis: "y2",
        marker: {
          color: "rgba(56, 189, 248, 0.4)",
          line: { color: "#0ea5e9", width: 1 },
        },
        hovertemplate: "<b>%{x}</b><br>Rain Probability: %{y}%<extra></extra>",
      },
      {
        type: "scatter",
        mode: "lines+markers",
        name: "Temperature (°C)",
        x: times,
        y: temps,
        line: {
          color: "#0284c7",
          width: 3,
          shape: "spline",
        },
        marker: {
          size: 6,
          color: "#0284c7",
          line: { color: "#ffffff", width: 1.5 },
        },
        fill: "tozeroy",
        fillcolor: "rgba(14, 165, 233, 0.08)",
        hovertemplate: "<b>%{x}</b><br>Temperature: %{y}°C<extra></extra>",
      },
    ];

    chartLayout = {
      title: {
        text: "<b>24-Hour Temperature & Rain Probability Curve</b>",
        font: { size: 13, color: "#0f172a" },
        x: 0.02,
      },
      height: 290,
      xaxis: {
        tickangle: -45,
        gridcolor: "#f1f5f9",
        tickfont: { size: 10, color: "#64748b" },
      },
      yaxis: {
        title: { text: "Temp (°C)", font: { size: 11, color: "#0284c7" } },
        tickfont: { size: 10, color: "#0284c7" },
        gridcolor: "#e2e8f0",
      },
      yaxis2: {
        title: { text: "Rain Prob (%)", font: { size: 11, color: "#0ea5e9" } },
        tickfont: { size: 10, color: "#0ea5e9" },
        overlaying: "y",
        side: "right",
        range: [0, 100],
        showgrid: false,
      },
      legend: {
        orientation: "h",
        x: 0.5,
        y: 1.15,
        xanchor: "center",
        font: { size: 10 },
      },
    };
  } else {
    chartData = [
      {
        type: "scatter",
        mode: "lines+markers",
        name: "Humidity (%)",
        x: times,
        y: humidities,
        line: {
          color: "#059669",
          width: 2.5,
          shape: "spline",
        },
        marker: { size: 5, color: "#059669" },
        hovertemplate: "<b>%{x}</b><br>Humidity: %{y}%<extra></extra>",
      },
      {
        type: "scatter",
        mode: "lines+markers",
        name: "Wind Speed (km/h)",
        x: times,
        y: windSpeeds,
        yaxis: "y2",
        line: {
          color: "#8b5cf6",
          width: 2.5,
          shape: "spline",
        },
        marker: { size: 5, color: "#8b5cf6" },
        hovertemplate: "<b>%{x}</b><br>Wind Speed: %{y} km/h<extra></extra>",
      },
    ];

    chartLayout = {
      title: {
        text: "<b>24-Hour Wind Speed & Humidity Trajectory</b>",
        font: { size: 13, color: "#0f172a" },
        x: 0.02,
      },
      height: 290,
      xaxis: {
        tickangle: -45,
        gridcolor: "#f1f5f9",
        tickfont: { size: 10, color: "#64748b" },
      },
      yaxis: {
        title: { text: "Humidity (%)", font: { size: 11, color: "#059669" } },
        tickfont: { size: 10, color: "#059669" },
        range: [0, 100],
        gridcolor: "#e2e8f0",
      },
      yaxis2: {
        title: { text: "Wind (km/h)", font: { size: 11, color: "#8b5cf6" } },
        tickfont: { size: 10, color: "#8b5cf6" },
        overlaying: "y",
        side: "right",
        showgrid: false,
      },
      legend: {
        orientation: "h",
        x: 0.5,
        y: 1.15,
        xanchor: "center",
        font: { size: 10 },
      },
    };
  }

  return (
    <div style={{ marginTop: "1.75rem" }}>
      {/* Header with Title and Scroll Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.85rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Clock size={18} style={{ color: "var(--accent)" }} />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Hourly Forecast (Next 24 Hours)
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
            24 Data Points
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={scrollLeft}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
            title="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
            title="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Horizontal Cards Carousel */}
      <div
        ref={scrollContainerRef}
        style={{
          display: "flex",
          gap: "0.65rem",
          overflowX: "auto",
          paddingBottom: "0.75rem",
          scrollBehavior: "smooth",
          scrollbarWidth: "thin",
        }}
      >
        {hourly.map((item, idx) => {
          const cond = getWeatherConditionInfo(item.weatherCode, 1);
          const isNow = idx === 0;

          return (
            <div
              key={`${item.time}-${idx}`}
              className="card"
              style={{
                flex: "0 0 135px",
                padding: "0.85rem 0.65rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                borderRadius: 12,
                background: isNow ? "var(--bg-elevated)" : "var(--bg-card)",
                border: isNow ? "1.5px solid var(--accent)" : "1px solid var(--border-subtle)",
                transition: "all 0.15s",
              }}
            >
              {/* Time Label */}
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: isNow ? 800 : 600,
                  color: isNow ? "var(--accent)" : "var(--text-secondary)",
                  marginBottom: "0.4rem",
                }}
              >
                {item.formattedTime}
              </div>

              {/* Weather Icon */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: cond.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <WeatherIcon name={cond.iconName} size={22} />
              </div>

              {/* Condition */}
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                  marginBottom: "0.25rem",
                }}
                title={cond.label}
              >
                {cond.label}
              </div>

              {/* Temperature */}
              <div
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                {item.temperature}°
              </div>

              {/* Rain Probability Badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: item.precipitationProbability > 20 ? "#0284c7" : "var(--text-muted)",
                  background: item.precipitationProbability > 20 ? "rgba(14, 165, 233, 0.12)" : "rgba(0,0,0,0.03)",
                  padding: "0.15rem 0.4rem",
                  borderRadius: 6,
                  width: "100%",
                  justifyContent: "center",
                  marginBottom: "0.35rem",
                }}
              >
                <CloudRain size={12} />
                <span>{item.precipitationProbability}%</span>
              </div>

              {/* Humidity & Wind Mini Metrics */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  fontSize: "0.68rem",
                  color: "var(--text-secondary)",
                  paddingTop: "0.35rem",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 2 }} title="Humidity">
                  <Droplets size={10} color="#0284c7" />
                  <span>{item.relativeHumidity}%</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 2 }} title="Wind Speed">
                  <Wind size={10} color="#06b6d4" />
                  <span>{item.windSpeed}k</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Plotly Hourly Chart Section */}
      <div
        className="card"
        style={{
          marginTop: "0.85rem",
          padding: "1.25rem",
          background: "var(--bg-card)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <TrendingUp size={16} style={{ color: "var(--accent)" }} />
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Interactive Hourly Plotly Analysis
            </span>
          </div>

          <div
            style={{
              display: "flex",
              background: "var(--bg-base)",
              borderRadius: 8,
              padding: 2,
              border: "1px solid var(--border-subtle)",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveMetricTab("temp_rain")}
              style={{
                padding: "0.25rem 0.65rem",
                borderRadius: 6,
                fontSize: "0.75rem",
                fontWeight: activeMetricTab === "temp_rain" ? 700 : 500,
                color: activeMetricTab === "temp_rain" ? "var(--accent-hover)" : "var(--text-secondary)",
                background: activeMetricTab === "temp_rain" ? "var(--bg-card)" : "transparent",
                border: "none",
                cursor: "pointer",
                boxShadow: activeMetricTab === "temp_rain" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              Temp & Rain Prob
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricTab("wind_humidity")}
              style={{
                padding: "0.25rem 0.65rem",
                borderRadius: 6,
                fontSize: "0.75rem",
                fontWeight: activeMetricTab === "wind_humidity" ? 700 : 500,
                color: activeMetricTab === "wind_humidity" ? "var(--accent-hover)" : "var(--text-secondary)",
                background: activeMetricTab === "wind_humidity" ? "var(--bg-card)" : "transparent",
                border: "none",
                cursor: "pointer",
                boxShadow: activeMetricTab === "wind_humidity" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              Wind & Humidity
            </button>
          </div>
        </div>

        <WeatherPlotlyChart data={chartData} layout={chartLayout} style={{ minHeight: 290 }} />
      </div>
    </div>
  );
};

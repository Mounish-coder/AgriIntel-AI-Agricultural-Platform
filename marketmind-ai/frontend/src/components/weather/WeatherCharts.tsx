import React, { useState } from "react";
import type { DailyForecastItem, HourlyForecastItem } from "../../types/weather";
import { WeatherPlotlyChart } from "./WeatherPlotlyChart";
import {
  BarChart3,
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  LayoutGrid,
} from "lucide-react";

interface WeatherChartsProps {
  daily: DailyForecastItem[];
  hourly: HourlyForecastItem[];
}

export const WeatherCharts: React.FC<WeatherChartsProps> = ({ daily, hourly }) => {
  const [activeTab, setActiveTab] = useState<"all" | "temp" | "rain" | "humidity" | "wind">("all");

  const dailyDates = daily.map((d) => `${d.dayName} (${d.formattedDate})`);
  const dailyMaxs = daily.map((d) => d.tempMax);
  const dailyMins = daily.map((d) => d.tempMin);
  const dailyRainSums = daily.map((d) => d.precipitationSum);
  const dailyRainProbs = daily.map((d) => d.precipitationProbability);
  const dailyWinds = daily.map((d) => d.windSpeedMax);

  // Next 24 hours data
  const hourlyTimes = hourly.map((h) => h.formattedTime);
  const hourlyHumidities = hourly.map((h) => h.relativeHumidity);
  const hourlyWinds = hourly.map((h) => h.windSpeed);

  // ── Chart 1: Temperature Trends (7-Day Max / Min Range) ────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tempChartData: any[] = [
    {
      type: "scatter",
      mode: "lines",
      name: "Min Temp (°C)",
      x: dailyDates,
      y: dailyMins,
      line: { color: "#38bdf8", width: 2, shape: "spline" },
      marker: { size: 6, color: "#0284c7" },
      hovertemplate: "<b>%{x}</b><br>Minimum: %{y}°C<extra></extra>",
    },
    {
      type: "scatter",
      mode: "lines+markers",
      name: "Max Temp (°C)",
      x: dailyDates,
      y: dailyMaxs,
      fill: "tonexty",
      fillcolor: "rgba(14, 165, 233, 0.12)",
      line: { color: "#ef4444", width: 2.5, shape: "spline" },
      marker: { size: 7, color: "#dc2626" },
      hovertemplate: "<b>%{x}</b><br>Maximum: %{y}°C<extra></extra>",
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tempChartLayout: Record<string, any> = {
    title: {
      text: "<b>7-Day Temperature Range & Trends</b>",
      font: { size: 13, color: "#0f172a" },
      x: 0.02,
    },
    height: 290,
    xaxis: { tickfont: { size: 10, color: "#64748b" }, gridcolor: "#f1f5f9" },
    yaxis: {
      title: { text: "Temperature (°C)", font: { size: 11, color: "#475569" } },
      gridcolor: "#e2e8f0",
      tickfont: { size: 10 },
    },
    legend: { orientation: "h", x: 0.5, y: 1.15, xanchor: "center", font: { size: 10 } },
  };

  // ── Chart 2: Rainfall Forecast (Expected Rain mm & Probability %) ──────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rainChartData: any[] = [
    {
      type: "bar",
      name: "Expected Rainfall (mm)",
      x: dailyDates,
      y: dailyRainSums,
      marker: {
        color: "rgba(2, 132, 199, 0.75)",
        line: { color: "#0284c7", width: 1 },
      },
      hovertemplate: "<b>%{x}</b><br>Expected Rain: %{y} mm<extra></extra>",
    },
    {
      type: "scatter",
      mode: "lines+markers",
      name: "Precipitation Probability (%)",
      x: dailyDates,
      y: dailyRainProbs,
      yaxis: "y2",
      line: { color: "#2563eb", width: 2.5, shape: "spline" },
      marker: { size: 6, color: "#1d4ed8" },
      hovertemplate: "<b>%{x}</b><br>Rain Probability: %{y}%<extra></extra>",
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rainChartLayout: Record<string, any> = {
    title: {
      text: "<b>7-Day Rainfall Forecast & Probability</b>",
      font: { size: 13, color: "#0f172a" },
      x: 0.02,
    },
    height: 290,
    xaxis: { tickfont: { size: 10, color: "#64748b" }, gridcolor: "#f1f5f9" },
    yaxis: {
      title: { text: "Rainfall (mm)", font: { size: 11, color: "#0284c7" } },
      gridcolor: "#e2e8f0",
      tickfont: { size: 10, color: "#0284c7" },
    },
    yaxis2: {
      title: { text: "Probability (%)", font: { size: 11, color: "#2563eb" } },
      overlaying: "y",
      side: "right",
      range: [0, 100],
      showgrid: false,
      tickfont: { size: 10, color: "#2563eb" },
    },
    legend: { orientation: "h", x: 0.5, y: 1.15, xanchor: "center", font: { size: 10 } },
  };

  // ── Chart 3: Humidity Trends (Hourly Relative Humidity & Comfort Band) ────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const humidityChartData: any[] = [
    {
      type: "scatter",
      mode: "lines",
      name: "Relative Humidity (%)",
      x: hourlyTimes,
      y: hourlyHumidities,
      line: { color: "#059669", width: 2.5, shape: "spline" },
      fill: "tozeroy",
      fillcolor: "rgba(5, 150, 105, 0.08)",
      marker: { size: 5, color: "#047857" },
      hovertemplate: "<b>%{x}</b><br>Humidity: %{y}%<extra></extra>",
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const humidityChartLayout: Record<string, any> = {
    title: {
      text: "<b>24-Hour Relative Humidity Trends</b>",
      font: { size: 13, color: "#0f172a" },
      x: 0.02,
    },
    height: 290,
    xaxis: {
      tickangle: -45,
      tickfont: { size: 10, color: "#64748b" },
      gridcolor: "#f1f5f9",
    },
    yaxis: {
      title: { text: "Humidity (%)", font: { size: 11, color: "#059669" } },
      range: [0, 100],
      gridcolor: "#e2e8f0",
      tickfont: { size: 10, color: "#059669" },
    },
    shapes: [
      {
        type: "rect",
        xref: "paper",
        x0: 0,
        x1: 1,
        yref: "y",
        y0: 40,
        y1: 60,
        fillcolor: "rgba(16, 185, 129, 0.08)",
        line: { width: 0 },
        layer: "below",
      },
    ],
    annotations: [
      {
        xref: "paper",
        x: 0.98,
        yref: "y",
        y: 50,
        text: "Optimal Range (40-60%)",
        showarrow: false,
        font: { size: 9, color: "#059669" },
        xanchor: "right",
      },
    ],
  };

  // ── Chart 4: Wind Speed Trends ───────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const windChartData: any[] = [
    {
      type: "scatter",
      mode: "lines+markers",
      name: "Hourly Wind (km/h)",
      x: hourlyTimes,
      y: hourlyWinds,
      line: { color: "#8b5cf6", width: 2.5, shape: "spline" },
      marker: { size: 5, color: "#7c3aed" },
      fill: "tozeroy",
      fillcolor: "rgba(139, 92, 246, 0.06)",
      hovertemplate: "<b>%{x}</b><br>Wind: %{y} km/h<extra></extra>",
    },
    {
      type: "bar",
      name: "7-Day Peak Wind (km/h)",
      x: dailyDates,
      y: dailyWinds,
      marker: { color: "rgba(245, 158, 11, 0.45)" },
      hovertemplate: "<b>%{x}</b><br>Daily Peak Wind: %{y} km/h<extra></extra>",
      visible: "legendonly",
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const windChartLayout: Record<string, any> = {
    title: {
      text: "<b>Wind Speed Velocity Trends & Dynamics</b>",
      font: { size: 13, color: "#0f172a" },
      x: 0.02,
    },
    height: 290,
    xaxis: {
      tickangle: -45,
      tickfont: { size: 10, color: "#64748b" },
      gridcolor: "#f1f5f9",
    },
    yaxis: {
      title: { text: "Wind Speed (km/h)", font: { size: 11, color: "#8b5cf6" } },
      gridcolor: "#e2e8f0",
      tickfont: { size: 10, color: "#8b5cf6" },
    },
    legend: { orientation: "h", x: 0.5, y: 1.15, xanchor: "center", font: { size: 10 } },
  };

  return (
    <div style={{ marginTop: "1.75rem" }}>
      {/* Analytics Section Header & Tab Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.85rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BarChart3 size={18} style={{ color: "var(--accent)" }} />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Weather Analytics & Trends
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
            Plotly Engine
          </span>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: "flex",
            background: "var(--bg-card)",
            borderRadius: 8,
            padding: 3,
            border: "1px solid var(--border)",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.3rem 0.65rem",
              borderRadius: 6,
              fontSize: "0.76rem",
              fontWeight: activeTab === "all" ? 700 : 500,
              color: activeTab === "all" ? "var(--accent-hover)" : "var(--text-secondary)",
              background: activeTab === "all" ? "var(--bg-elevated)" : "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <LayoutGrid size={13} />
            <span>All Analytics (4 Grid)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("temp")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.3rem 0.65rem",
              borderRadius: 6,
              fontSize: "0.76rem",
              fontWeight: activeTab === "temp" ? 700 : 500,
              color: activeTab === "temp" ? "#dc2626" : "var(--text-secondary)",
              background: activeTab === "temp" ? "rgba(220, 38, 38, 0.08)" : "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Thermometer size={13} />
            <span>1. Temperature Trends</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rain")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.3rem 0.65rem",
              borderRadius: 6,
              fontSize: "0.76rem",
              fontWeight: activeTab === "rain" ? 700 : 500,
              color: activeTab === "rain" ? "#0284c7" : "var(--text-secondary)",
              background: activeTab === "rain" ? "rgba(2, 132, 199, 0.08)" : "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <CloudRain size={13} />
            <span>2. Rainfall Forecast</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("humidity")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.3rem 0.65rem",
              borderRadius: 6,
              fontSize: "0.76rem",
              fontWeight: activeTab === "humidity" ? 700 : 500,
              color: activeTab === "humidity" ? "#059669" : "var(--text-secondary)",
              background: activeTab === "humidity" ? "rgba(5, 150, 105, 0.08)" : "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Droplets size={13} />
            <span>3. Humidity Trends</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wind")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.3rem 0.65rem",
              borderRadius: 6,
              fontSize: "0.76rem",
              fontWeight: activeTab === "wind" ? 700 : 500,
              color: activeTab === "wind" ? "#8b5cf6" : "var(--text-secondary)",
              background: activeTab === "wind" ? "rgba(139, 92, 246, 0.08)" : "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Wind size={13} />
            <span>4. Wind Speed Trends</span>
          </button>
        </div>
      </div>

      {/* Grid of Charts */}
      {activeTab === "all" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
            gap: "1rem",
          }}
        >
          {/* 1. Temperature */}
          <div className="card" style={{ padding: "1rem", background: "var(--bg-card)" }}>
            <WeatherPlotlyChart data={tempChartData} layout={tempChartLayout} />
          </div>

          {/* 2. Rainfall */}
          <div className="card" style={{ padding: "1rem", background: "var(--bg-card)" }}>
            <WeatherPlotlyChart data={rainChartData} layout={rainChartLayout} />
          </div>

          {/* 3. Humidity */}
          <div className="card" style={{ padding: "1rem", background: "var(--bg-card)" }}>
            <WeatherPlotlyChart data={humidityChartData} layout={humidityChartLayout} />
          </div>

          {/* 4. Wind Speed */}
          <div className="card" style={{ padding: "1rem", background: "var(--bg-card)" }}>
            <WeatherPlotlyChart data={windChartData} layout={windChartLayout} />
          </div>
        </div>
      ) : activeTab === "temp" ? (
        <div className="card" style={{ padding: "1.25rem", background: "var(--bg-card)" }}>
          <WeatherPlotlyChart data={tempChartData} layout={{ ...tempChartLayout, height: 380 }} />
        </div>
      ) : activeTab === "rain" ? (
        <div className="card" style={{ padding: "1.25rem", background: "var(--bg-card)" }}>
          <WeatherPlotlyChart data={rainChartData} layout={{ ...rainChartLayout, height: 380 }} />
        </div>
      ) : activeTab === "humidity" ? (
        <div className="card" style={{ padding: "1.25rem", background: "var(--bg-card)" }}>
          <WeatherPlotlyChart data={humidityChartData} layout={{ ...humidityChartLayout, height: 380 }} />
        </div>
      ) : (
        <div className="card" style={{ padding: "1.25rem", background: "var(--bg-card)" }}>
          <WeatherPlotlyChart data={windChartData} layout={{ ...windChartLayout, height: 380 }} />
        </div>
      )}
    </div>
  );
};

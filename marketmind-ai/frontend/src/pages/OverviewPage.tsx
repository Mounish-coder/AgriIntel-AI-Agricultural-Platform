import { Link } from "react-router-dom";
import { TrendingUp, Brain, Sprout, ArrowRight, Database, MapPin, CalendarDays, BarChart3 } from "lucide-react";
import type { ForecastRunResponse, AgmarknetStatus } from "../types";

interface Props {
  agmarknetStatus?: AgmarknetStatus | null;
  lastRun: ForecastRunResponse | null;
}

export function OverviewPage({ agmarknetStatus, lastRun }: Props) {
  const meta = agmarknetStatus?.metadata;
  const isReady = agmarknetStatus?.status === "ready";
  const isError = agmarknetStatus?.status === "error";

  return (
    <div className="fade-in">
      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
        borderRadius: 14,
        padding: "2rem 2rem",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1.5rem",
        color: "#fff",
        boxShadow: "0 4px 16px rgba(14,165,233,0.3)",
      }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", opacity: 0.85, marginBottom: "0.5rem", textTransform: "uppercase" }}>
            🌾 Agricultural Price Intelligence
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>
            AgriIntel — Crop Price Forecasting
          </h1>
          <p style={{ opacity: 0.9, fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
            AgriIntel predicts agricultural crop prices using historical market data.
            Select a state and crop to generate forecasts using ARIMA, SARIMA, Prophet, and ML models.
          </p>
        </div>

        <Link to="/forecast" style={{
          background: "#fff",
          color: "var(--accent)",
          padding: "0.85rem 1.5rem",
          borderRadius: 10,
          fontWeight: 700,
          fontSize: "0.95rem",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          flexShrink: 0,
        }}>
          <Sprout size={18} />
          Start Forecasting
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Dataset Status Banner */}
      {isError ? (
        <div style={{
          background: "rgba(220,38,38,0.08)",
          border: "1px solid rgba(220,38,38,0.3)",
          borderRadius: 10,
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          color: "var(--accent-danger)",
          fontSize: "0.875rem",
          fontWeight: 500,
        }}>
          ⚠️ Dataset Error: {agmarknetStatus?.error}
        </div>
      ) : (
        <div style={{
          background: isReady ? "rgba(5,150,105,0.07)" : "#f0f7ff",
          border: `1px solid ${isReady ? "rgba(5,150,105,0.25)" : "var(--border-subtle)"}`,
          borderRadius: 10,
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Database size={20} style={{ color: isReady ? "#059669" : "var(--text-muted)", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                {isReady
                  ? `Dataset Loaded: ${meta?.filename}`
                  : "Loading AGMARKNET dataset…"}
              </div>
              {meta && (
                <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: 2 }}>
                  {meta.source_files?.join(", ") || meta.filename}
                </div>
              )}
            </div>
          </div>

          {meta && (
            <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.82rem", flexWrap: "wrap" }}>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Records </span>
                <strong style={{ color: "var(--text-primary)" }}>{meta.total_records.toLocaleString()}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Date Range </span>
                <strong style={{ color: "var(--text-primary)" }}>{meta.date_range?.start} → {meta.date_range?.end}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>States </span>
                <strong style={{ color: "var(--accent)" }}>{meta.states_count}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Crops </span>
                <strong style={{ color: "var(--accent)" }}>{meta.crops_count}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          {
            icon: <Database size={20} style={{ color: "var(--accent)" }} />,
            label: "Total Records",
            value: meta ? meta.total_records.toLocaleString() : "—",
            sub: "AGMARKNET mandi arrivals",
            accent: "var(--accent)",
          },
          {
            icon: <MapPin size={20} style={{ color: "#059669" }} />,
            label: "States Covered",
            value: meta ? `${meta.states_count} States` : "—",
            sub: "Across Indian markets",
            accent: "#059669",
          },
          {
            icon: <Sprout size={20} style={{ color: "#d97706" }} />,
            label: "Crop Types",
            value: meta ? `${meta.crops_count} Crops` : "—",
            sub: "Agricultural commodities",
            accent: "#d97706",
          },
          {
            icon: <CalendarDays size={20} style={{ color: "#6366f1" }} />,
            label: "Latest Observation",
            value: meta?.date_range?.end || "—",
            sub: `From ${meta?.date_range?.start || "—"}`,
            accent: "#6366f1",
          },
        ].map(card => (
          <div
            key={card.label}
            className="metric-card"
            style={{ borderTop: `3px solid ${card.accent}` }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              {card.icon}
              <span className="label">{card.label}</span>
            </div>
            <span className="value" style={{ fontSize: "1.3rem", color: "var(--text-primary)" }}>{card.value}</span>
            <span className="sub">{card.sub}</span>
          </div>
        ))}
      </div>

      {/* Two-column: Quick links + Last run */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        {/* Quick Actions */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Brain size={16} style={{ color: "var(--accent)" }} />
            Quick Actions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {[
              { to: "/forecast", icon: "🎯", label: "Generate Price Forecast", desc: "Select state, crop, and horizon", color: "var(--accent)" },
              { to: "/analysis", icon: "📊", label: "Explore Dataset", desc: "View records, crops, and states", color: "#059669" },
              { to: "/results",  icon: "📈", label: "View Predictions", desc: "See latest forecast results", color: "#6366f1" },
              { to: "/history",  icon: "🗂️", label: "Audit History", desc: "All previous forecast runs", color: "#d97706" },
            ].map(item => (
              <Link key={item.to} to={item.to} style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.75rem", borderRadius: 8,
                background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
                textDecoration: "none", transition: "all 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = item.color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
              >
                <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>{item.label}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{item.desc}</div>
                </div>
                <ArrowRight size={14} style={{ color: "var(--text-muted)", marginLeft: "auto" }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Last Run Summary */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={16} style={{ color: "#059669" }} />
            Latest Forecast Run
          </div>
          {lastRun ? (
            <div>
              <div style={{
                background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)",
                borderRadius: 8, padding: "1rem", marginBottom: "0.75rem",
              }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Best Model</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#059669" }}>
                  🏆 {lastRun.best_model}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 4 }}>
                  Run ID: {lastRun.id.slice(0, 8)}… · {lastRun.forecast_horizon} day horizon
                </div>
              </div>
              <Link to="/results" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                View Full Results <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
              <BarChart3 size={32} style={{ color: "var(--text-muted)", margin: "0 auto 0.75rem" }} />
              <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                No forecast runs yet.
              </div>
              <Link to="/forecast" className="btn btn-primary">
                <Sprout size={16} /> Generate First Forecast
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* How it works — 3-step simple */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "1rem", color: "var(--text-primary)" }}>
          How It Works
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {[
            { step: "01", icon: "🗺️", title: "Select State & Crop", desc: "Choose any Indian state and commodity from the AGMARKNET dataset." },
            { step: "02", icon: "🤖", title: "Automatic Model Selection", desc: "ARIMA, SARIMA, Prophet, Random Forest, and XGBoost are trained and evaluated. The best model is selected automatically." },
            { step: "03", icon: "📈", title: "View Price Forecast", desc: "See the forecast for 7, 14, or 30 days ahead, including model accuracy metrics." },
          ].map(item => (
            <div key={item.step} style={{
              padding: "1.25rem",
              background: "var(--bg-base)",
              borderRadius: 10,
              border: "1px solid var(--border-subtle)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span style={{
                  fontSize: "0.65rem", fontWeight: 800, color: "var(--accent)",
                  background: "rgba(14,165,233,0.1)", padding: "0.15rem 0.4rem",
                  borderRadius: 4, letterSpacing: "0.05em",
                }}>
                  STEP {item.step}
                </span>
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)", marginBottom: "0.3rem" }}>
                {item.title}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

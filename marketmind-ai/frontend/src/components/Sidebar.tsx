import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, BarChart2, Brain,
  TrendingUp, History, ChevronRight, CloudSun, Sprout
} from "lucide-react";

const nav = [
  { to: "/",         icon: LayoutDashboard, label: "Overview" },
  { to: "/analysis", icon: BarChart2,       label: "Data Analysis" },
  { to: "/forecast", icon: Brain,           label: "Forecasting" },
  { to: "/results",  icon: TrendingUp,      label: "Predictions" },
  { to: "/history",  icon: History,         label: "Audit History" },
  { to: "/advisory", icon: Sprout,          label: "🌱 Farmer Advisory" },
  { to: "/weather",  icon: CloudSun,        label: "🌦️ Weather Forecast" },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: "1.5rem 1.25rem 1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(14, 165, 233, 0.4)",
          }}>
            <span style={{ fontSize: "1.15rem" }}>🌾</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.2, letterSpacing: "-0.01em", color: "var(--sidebar-text)" }}>AgriIntel</div>
            <div style={{ fontSize: "0.62rem", color: "var(--sidebar-muted)", letterSpacing: "0.08em", fontWeight: 700 }}>CROP PRICE AI</div>
          </div>
        </div>
      </div>

      <div className="divider" style={{ margin: "0" }} />

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "0.75rem 0.625rem" }}>
        <div style={{
          fontSize: "0.62rem", color: "var(--sidebar-muted)", fontWeight: 700,
          letterSpacing: "0.12em", padding: "0.5rem 0.625rem 0.25rem", textTransform: "uppercase"
        }}>
          Navigation
        </div>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === "/"}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "0.625rem",
              padding: "0.5rem 0.625rem", borderRadius: 8,
              marginBottom: 2, textDecoration: "none",
              fontSize: "0.85rem", fontWeight: 500,
              color: isActive ? "var(--sidebar-active-text)" : "var(--sidebar-muted)",
              background: isActive ? "var(--sidebar-active-bg)" : "transparent",
              transition: "all 0.15s",
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={12} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: "1rem 1.25rem",
        borderTop: "1px solid var(--sidebar-border)",
        fontSize: "0.7rem",
        color: "var(--sidebar-muted)",
      }}>
        <div style={{ fontWeight: 600, color: "var(--sidebar-text)", marginBottom: 2 }}>AgriIntel v2.0</div>
        <div>AGMARKNET Price Forecasting</div>
      </div>
    </aside>
  );
}

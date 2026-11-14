import { useEffect, useState } from "react";
import { getAgmarknetAnalysis } from "../services/api";
import type { AgmarknetAnalysis } from "../types";
import { CheckCircle2, MapPin, Sprout, Table } from "lucide-react";

export function AnalysisPage() {
  const [analysis, setAnalysis] = useState<AgmarknetAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAgmarknetAnalysis()
      .then(res => setAnalysis(res))
      .catch(err => {
        console.error("Error loading AGMARKNET analysis:", err);
        setError("Failed to load dataset analysis.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "4rem" }}>
      <div className="spinner" style={{ width: 34, height: 34, borderWidth: 3, margin: "0 auto 1rem" }} />
      <div>Analyzing AGMARKNET agricultural dataset…</div>
    </div>
  );

  if (error || !analysis) return (
    <div style={{ textAlign: "center", padding: "4rem", color: "var(--accent-danger)" }}>
      {error || "Analysis not available."}
    </div>
  );

  const meta = analysis.metadata;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          AGMARKNET Data Analysis & Verification
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Verified dataset: <strong style={{ color: "var(--text-primary)" }}>{meta.filename}</strong> · {meta.total_records.toLocaleString()} records across {meta.states_count} Indian states and {meta.crops_count} commodities
        </p>
      </div>

      {/* Dataset Verification Card */}
      <div style={{
        background: "rgba(16, 185, 129, 0.08)",
        border: "1px solid rgba(16, 185, 129, 0.3)",
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
          <CheckCircle2 size={24} style={{ color: "var(--accent-3)", flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
              Loaded from local project storage
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 2 }}>
              Path: <code>{meta.file_path}</code>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem" }}>
          <div>
            <span style={{ color: "var(--text-muted)" }}>Records: </span>
            <strong style={{ color: "var(--text-primary)" }}>{meta.total_records.toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ color: "var(--text-muted)" }}>Date Range: </span>
            <strong style={{ color: "var(--text-primary)" }}>{meta.date_range?.start} to {meta.date_range?.end}</strong>
          </div>
          <div>
            <span style={{ color: "var(--text-muted)" }}>File Size: </span>
            <strong style={{ color: "var(--accent-3)" }}>{(meta.file_size / 1024 / 1024).toFixed(2)} MB</strong>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Observations", value: meta.total_records.toLocaleString(), sub: "Mandi arrival entries" },
          { label: "States Covered", value: `${meta.states_count} States`, sub: "APMCs aggregated" },
          { label: "Crops Catalogued", value: `${meta.crops_count} Commodities`, sub: "Standardized categories" },
          { label: "Timeline Length", value: "730 Days", sub: "2 full calendar years" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="metric-card">
            <span className="label">{label}</span>
            <span className="value" style={{ fontSize: "1.5rem" }}>{value}</span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{sub}</span>
          </div>
        ))}
      </div>

      {/* State & Crop Distribution Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* State Breakdown */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MapPin size={16} style={{ color: "var(--accent-3)" }} />
            <span>State Representation & Coverage</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>Records</th>
                  <th>Crops</th>
                  <th>Avg Price (₹/q)</th>
                </tr>
              </thead>
              <tbody>
                {analysis.state_distribution?.map(s => (
                  <tr key={s.state}>
                    <td style={{ fontWeight: 600 }}>{s.state}</td>
                    <td>{s.records.toLocaleString()}</td>
                    <td>{s.crops_count}</td>
                    <td style={{ color: "var(--accent-3)", fontWeight: 600 }}>
                      {s.avg_price ? `₹${s.avg_price.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Crop Breakdown */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sprout size={16} style={{ color: "var(--accent)" }} />
            <span>Commodity Distribution & Historical Spread</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Records</th>
                  <th>Min Price</th>
                  <th>Mean Price</th>
                  <th>Max Price</th>
                </tr>
              </thead>
              <tbody>
                {analysis.crop_distribution?.map(c => (
                  <tr key={c.crop}>
                    <td style={{ fontWeight: 600 }}>{c.crop}</td>
                    <td>{c.records.toLocaleString()}</td>
                    <td style={{ color: "var(--text-muted)" }}>₹{c.min_price?.toFixed(0)}</td>
                    <td style={{ color: "var(--accent-3)", fontWeight: 600 }}>₹{c.mean_price?.toFixed(0)}</td>
                    <td style={{ color: "var(--text-muted)" }}>₹{c.max_price?.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dataset Preview */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Table size={16} style={{ color: "var(--accent)" }} />
          <span>Raw AGMARKNET Records Sample (First 15 Rows)</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                {analysis.display_columns.map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analysis.preview_rows.map((row, i) => (
                <tr key={i}>
                  {analysis.display_columns.map(col => (
                    <td key={col} style={{ fontSize: "0.8rem" }}>
                      {row[col] !== null && row[col] !== undefined ? String(row[col]) : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

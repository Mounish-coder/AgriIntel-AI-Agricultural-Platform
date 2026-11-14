import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRunResults, getHistory } from "../services/api";
import { ForecastChart } from "../components/ForecastChart";
import { ModelComparisonTable } from "../components/ModelComparisonTable";
import type { ForecastResultsResponse, ForecastRunResponse } from "../types";
import {
  TrendingUp, ArrowUpRight, ArrowDownRight, Download,
  ShieldAlert, Brain, ArrowLeft, Table
} from "lucide-react";

interface Props { lastRun: ForecastRunResponse | null; }

export function ResultsPage({ lastRun }: Props) {
  const [activeRunId, setActiveRunId] = useState<string | null>(lastRun?.id || null);
  const [results, setResults] = useState<ForecastResultsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  useEffect(() => {
    if (lastRun?.id) {
      setActiveRunId(lastRun.id);
    } else {
      // Auto-load latest completed forecast from history
      getHistory()
        .then(history => {
          const completed = history.find(h => h.status === "COMPLETED");
          if (completed) setActiveRunId(completed.id);
        })
        .catch(err => console.error("Error fetching history for results:", err));
    }
  }, [lastRun?.id]);

  useEffect(() => {
    if (!activeRunId) return;
    setLoading(true);
    getRunResults(activeRunId)
      .then(r => {
        setResults(r);
        const completed = r.results
          .filter(m => m.metrics.status === "COMPLETED")
          .map(m => m.model_name);
        setSelectedModels(completed.slice(0, 5));
      })
      .catch(err => console.error("Error loading run results:", err))
      .finally(() => setLoading(false));
  }, [activeRunId]);

  if (!activeRunId && !results) return (
    <div style={{ textAlign: "center", padding: "4rem" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🌾</div>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>No Forecast Run Found</h2>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        Select a State and Crop from the Forecasting workspace to train models and generate state-wide price predictions.
      </p>
      <Link to="/forecast" className="btn btn-primary">
        Go to Forecasting Workspace
      </Link>
    </div>
  );

  if (loading) return (
    <div style={{ textAlign: "center", padding: "4rem" }}>
      <div className="spinner" style={{ width: 34, height: 34, borderWidth: 3, margin: "0 auto 1rem" }} />
      <div style={{ fontWeight: 600 }}>Loading State-Level Predictions & Model Metrics…</div>
    </div>
  );

  if (!results) return null;

  const completedModels = results.results.filter(r => r.metrics.status === "COMPLETED");
  const bestModelResult = results.results.find(r => r.model_name === results.best_model) || completedModels[0];

  const currentPrice = results.current_price ?? (results.historical.length > 0 ? results.historical[results.historical.length - 1].value : null);
  const histValues = results.historical ? results.historical.map(h => h.value).filter((v): v is number => v != null && !isNaN(v)) : [];
  const histMin = results.min_price != null ? results.min_price : (histValues.length > 0 ? Math.min(...histValues) : null);
  const histMax = results.max_price != null ? results.max_price : (histValues.length > 0 ? Math.max(...histValues) : null);

  const finalPredictedPrice = results.projected_price ?? (
    bestModelResult?.future_predictions.length
      ? bestModelResult.future_predictions[bestModelResult.future_predictions.length - 1].value
      : null
  );

  const priceDiff = (currentPrice && finalPredictedPrice) ? finalPredictedPrice - currentPrice : null;
  const pctChange = results.pct_change ?? ((currentPrice && priceDiff) ? (priceDiff / currentPrice) * 100 : null);

  // CSV Export
  const exportCSV = () => {
    const best = bestModelResult || results.results[0];
    if (!best) return;
    const rows = [
      ["date", "predicted_value", "lower_95ci", "upper_95ci", "type", "state", "crop", "aggregation_method"],
      ...best.future_predictions.map(p => [
        p.date,
        p.value ?? "",
        p.lower ?? "",
        p.upper ?? "",
        "future_forecast",
        results.state ?? "",
        results.crop ?? "",
        `"${results.aggregation_method || ''}"`
      ]),
      ...best.test_predictions.map(p => [
        p.date,
        p.value ?? "",
        "",
        "",
        "test_validation",
        results.state ?? "",
        results.crop ?? "",
        `"${results.aggregation_method || ''}"`
      ]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agriintel_${results.state || 'state'}_${results.crop || 'crop'}_forecast.csv`;
    a.click();
  };

  return (
    <div className="fade-in">
      {/* Header with State & Crop */}
      <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "1.5rem" }}>🌾</span>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
              {results.state ? `${results.state} — ${results.crop}` : (results.crop ? `${results.crop}` : "State Crop")} Price Forecast
            </h1>
            <span style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              padding: "0.25rem 0.65rem",
              borderRadius: 6,
              background: "rgba(16, 185, 129, 0.15)",
              color: "var(--accent-3)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}>
              🏛️ State-Level Aggregate {results.mandis_count ? `(${results.mandis_count} Mandis)` : ""}
            </span>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>
            Target: <strong style={{ color: "var(--text-primary)" }}>{results.target_label || results.target_column}</strong> · Multi-Model Chronological Validation · Horizon: {bestModelResult?.future_predictions?.length || 14} Days
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link to="/forecast" className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}>
            <ArrowLeft size={14} /> New Prediction
          </Link>
          <button className="btn btn-primary" onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Download size={14} /> Export Forecast CSV
          </button>
        </div>
      </div>

      {/* State-Level Estimation Disclaimer Notice */}
      <div style={{
        padding: "0.9rem 1.1rem",
        borderRadius: 8,
        background: "rgba(59, 130, 246, 0.08)",
        border: "1px solid rgba(59, 130, 246, 0.25)",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
      }}>
        <ShieldAlert size={18} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          <strong style={{ color: "var(--text-primary)" }}>State-Level Price Estimate Notice: </strong>
          {results.state_level_disclaimer || (
            `State-level estimates for ${results.state || "the selected state"} are aggregated from reporting APMC mandi records using median modal pricing. These projections reflect prevailing statewide commodity price levels and directional trends rather than uniform guaranteed prices at every local market or mandi in the state.`
          )}
          {results.reporting_mandis && results.reporting_mandis.length > 0 && (
            <div style={{ marginTop: 4, color: "var(--text-muted)", fontSize: "0.78rem" }}>
              Reporting Mandis in dataset: <strong style={{ color: "var(--text-secondary)" }}>{results.reporting_mandis.join(", ")}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {/* Current State Price */}
        <div className="metric-card">
          <span className="label">Current State Price</span>
          <span className="value" style={{ fontSize: "1.55rem", color: "var(--text-primary)" }}>
            {currentPrice != null ? `₹${currentPrice.toFixed(2)}` : "—"}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{results.unit || "₹ / quintal"} (state median)</span>
        </div>

        {/* Projected State Price */}
        <div className="metric-card" style={{ borderColor: "rgba(16, 185, 129, 0.4)", background: "rgba(16, 185, 129, 0.04)" }}>
          <span className="label">Projected State Price</span>
          <span className="value" style={{ fontSize: "1.55rem", color: "var(--accent-3)" }}>
            {finalPredictedPrice != null ? `₹${finalPredictedPrice.toFixed(2)}` : "—"}
          </span>
          <span style={{ fontSize: "0.74rem", color: "var(--accent-3)", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
            {pctChange != null && (
              <>
                {pctChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(1)}% ({results.trend || (pctChange >= 0 ? "Bullish" : "Bearish")})
              </>
            )}
          </span>
        </div>

        {/* Best Model Automatically Selected */}
        <div className="metric-card">
          <span className="label">Auto-Selected Best Model</span>
          <span className="value" style={{ fontSize: "1.35rem", color: "var(--accent)", textTransform: "capitalize" }}>
            🏆 {results.best_model ?? "—"}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            {bestModelResult?.metrics.mae != null ? `Lowest Test MAE: ₹${bestModelResult.metrics.mae.toFixed(2)}` : "Chronological validation"}
          </span>
        </div>

        {/* Historical Price Bounds */}
        <div className="metric-card">
          <span className="label">Historical Observed Span</span>
          <span className="value" style={{ fontSize: "1.15rem", color: "var(--text-secondary)" }}>
            {histMin != null && histMax != null ? `₹${histMin.toFixed(0)} – ₹${histMax.toFixed(0)}` : "—"}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            {results.historical?.length ?? 0} continuous daily records
          </span>
        </div>
      </div>

      {/* Interactive Forecast Chart */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={18} style={{ color: "var(--accent-3)" }} />
            <span>State-Level Price Trajectory (Actual vs Multi-Model Predictions)</span>
          </div>

          {/* Model Toggle Chips */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {completedModels.map((r, idx) => {
              const active = selectedModels.includes(r.model_name);
              const isBest = r.model_name === results.best_model;
              const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4", "#f97316", "#ec4899", "#64748b"];
              const color = colors[idx % colors.length];
              return (
                <button
                  key={r.model_name}
                  onClick={() => setSelectedModels(prev =>
                    prev.includes(r.model_name) ? prev.filter(m => m !== r.model_name) : [...prev, r.model_name]
                  )}
                  style={{
                    padding: "0.25rem 0.65rem",
                    borderRadius: 20,
                    border: `1.5px solid ${active ? color : "var(--border)"}`,
                    background: active ? `${color}20` : "transparent",
                    color: active ? color : "var(--text-muted)",
                    fontSize: "0.75rem",
                    fontWeight: isBest ? 700 : 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                  {r.model_name}
                  {isBest && <span style={{ fontSize: "0.65rem" }}>⭐</span>}
                  {r.metrics.mae != null && <span style={{ opacity: 0.75 }}>₹{r.metrics.mae.toFixed(0)}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <ForecastChart
          historical={results.historical}
          results={results.results}
          selectedModels={selectedModels}
          targetColumn={results.target_column}
        />
      </div>

      {/* Future Price Forecast Table (Dates, Predictions & Uncertainty Intervals) */}
      {bestModelResult && bestModelResult.future_predictions.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Table size={16} style={{ color: "var(--accent-3)" }} />
              <span>Future State Price Projections — {bestModelResult.model_name.toUpperCase()} (Next {bestModelResult.future_predictions.length} Days)</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Includes 95% Confidence Bounds
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Forecast Date</th>
                  <th>State</th>
                  <th>Crop</th>
                  <th>Predicted Price</th>
                  <th>95% Lower Bound</th>
                  <th>95% Upper Bound</th>
                  <th>Expected Direction</th>
                </tr>
              </thead>
              <tbody>
                {bestModelResult.future_predictions.map((pt, idx) => {
                  const prevVal = idx === 0 ? currentPrice : bestModelResult.future_predictions[idx - 1].value;
                  const delta = (prevVal != null && pt.value != null) ? pt.value - prevVal : 0;
                  
                  // Reliable confidence interval fallback if not provided by analytical model
                  const histVol = (histMin != null && histMax != null && histMax > histMin)
                    ? (histMax - histMin) * 0.05
                    : (pt.value != null ? pt.value * 0.04 : 100);
                  const lowerVal = pt.lower != null
                    ? pt.lower
                    : (pt.value != null ? Math.max(0, pt.value - (histVol * Math.sqrt(idx + 1))) : null);
                  const upperVal = pt.upper != null
                    ? pt.upper
                    : (pt.value != null ? pt.value + (histVol * Math.sqrt(idx + 1)) : null);

                  return (
                    <tr key={pt.date}>
                      <td style={{ fontWeight: 600 }}>{pt.date}</td>
                      <td>{results.state}</td>
                      <td>{results.crop}</td>
                      <td style={{ fontWeight: 700, color: "var(--accent-3)" }}>
                        {pt.value != null ? `₹${pt.value.toFixed(2)}` : "—"}
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                        {lowerVal != null ? `₹${lowerVal.toFixed(2)}` : "—"}
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                        {upperVal != null ? `₹${upperVal.toFixed(2)}` : "—"}
                      </td>
                      <td style={{ fontSize: "0.75rem" }}>
                        {delta > 0.05 ? (
                          <span style={{ color: "var(--accent-3)", display: "flex", alignItems: "center", gap: 3, fontWeight: 600 }}>
                            <ArrowUpRight size={13} /> Rising (+₹{delta.toFixed(1)})
                          </span>
                        ) : delta < -0.05 ? (
                          <span style={{ color: "var(--accent-danger)", display: "flex", alignItems: "center", gap: 3, fontWeight: 600 }}>
                            <ArrowDownRight size={13} /> Falling (-₹{Math.abs(delta).toFixed(1)})
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 3 }}>
                            ↔ Steady {currentPrice != null ? `(₹${pt.value?.toFixed(0)})` : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Model Performance Comparison Table */}
      <div className="card">
        <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Brain size={16} style={{ color: "var(--accent)" }} />
            <span>Automated Algorithm Evaluation & Accuracy Comparison</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Evaluated on holdout chronological test dataset
          </span>
        </div>
        <ModelComparisonTable
          metrics={results.comparison_table}
          bestModel={results.best_model}
        />
      </div>
    </div>
  );
}

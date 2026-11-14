import type { ModelMetrics } from "../types";
import { Trophy, TrendingDown } from "lucide-react";

interface Props {
  metrics: ModelMetrics[];
  bestModel?: string | null;
}

function cell(v: number | null) {
  if (v == null || isNaN(v)) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  return <span>{v.toFixed(4)}</span>;
}

function statusBadge(status: string) {
  const cls: Record<string, string> = {
    COMPLETED: "badge-green", FAILED: "badge-red",
    UNAVAILABLE: "badge-muted", RUNNING: "badge-blue",
    PENDING: "badge-muted",
  };
  return <span className={`badge ${cls[status] ?? "badge-muted"}`}>{status}</span>;
}

export function ModelComparisonTable({ metrics, bestModel }: Props) {
  // Sort: completed first by MAE ascending
  const sorted = [...metrics].sort((a, b) => {
    if (a.status === "COMPLETED" && b.status !== "COMPLETED") return -1;
    if (b.status === "COMPLETED" && a.status !== "COMPLETED") return 1;
    if (a.mae != null && b.mae != null) return a.mae - b.mae;
    return 0;
  });

  return (
    <div className="card fade-in">
      <div style={{ fontWeight: 600, marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <TrendingDown size={18} style={{ color: "var(--accent)" }} />
        Model Comparison
        {bestModel && (
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.375rem",
            fontSize: "0.8rem", color: "var(--accent-3)" }}>
            <Trophy size={14} /> Best: <strong>{bestModel}</strong>
          </span>
        )}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table" style={{ minWidth: 760 }}>
          <thead>
            <tr>
              <th>Model</th>
              <th>Status</th>
              <th>MAE ↓</th>
              <th>RMSE ↓</th>
              <th>MAPE ↓</th>
              <th>sMAPE ↓</th>
              <th>WAPE ↓</th>
              <th>Val MAE</th>
              <th>Train (s)</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(m => (
              <tr key={m.model_name} style={m.model_name === bestModel ? {
                background: "rgba(16,185,129,0.06)",
              } : {}}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    {m.model_name === bestModel && <Trophy size={12} style={{ color: "var(--accent-3)" }} />}
                    <span style={{ fontWeight: m.model_name === bestModel ? 700 : 400,
                      color: m.model_name === bestModel ? "var(--accent-3)" : "var(--text-primary)" }}>
                      {m.model_name}
                    </span>
                  </div>
                </td>
                <td>{statusBadge(m.status)}</td>
                <td className="num-neutral">{cell(m.mae)}</td>
                <td>{cell(m.rmse)}</td>
                <td>{cell(m.mape)}</td>
                <td>{cell(m.smape)}</td>
                <td>{cell(m.wape)}</td>
                <td>{cell(m.val_mae)}</td>
                <td className="mono">{m.train_duration_s != null ? m.train_duration_s.toFixed(2) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: "0.75rem", fontSize: "0.72rem", color: "var(--text-muted)" }}>
        ↓ Lower is better · MAE/RMSE are in original price units · MAPE/sMAPE/WAPE are percentages
        · Best model selected by lowest test MAE on held-out test set (chronological split).
      </div>
    </div>
  );
}

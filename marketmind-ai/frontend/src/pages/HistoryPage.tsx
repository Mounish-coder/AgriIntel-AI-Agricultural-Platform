import { useEffect, useState } from "react";
import { getHistory } from "../services/api";
import type { ForecastRunResponse } from "../types";
import { History, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

export function HistoryPage() {
  const [runs, setRuns] = useState<ForecastRunResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory().then(setRuns).finally(() => setLoading(false));
  }, []);

  const STATUS_ICON: Record<string, React.ReactNode> = {
    QUEUED:    <Clock size={14} style={{ color: "var(--accent-warn)" }} />,
    RUNNING:   <Loader2 size={14} style={{ color: "var(--accent)" }} />,
    COMPLETED: <CheckCircle2 size={14} style={{ color: "var(--accent-3)" }} />,
    FAILED:    <XCircle size={14} style={{ color: "var(--accent-danger)" }} />,
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <History size={22} style={{ color: "var(--accent)" }} /> Audit History
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          All previous forecasting runs with dataset fingerprints, configurations, and results.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, margin: "0 auto 1rem" }} />
          Loading history…
        </div>
      ) : runs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          No forecast runs yet. Start a training run from the Forecasting page.
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Target / Crop</th>
                <th>Status</th>
                <th>Best Model</th>
                <th>Horizon</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {runs.map(run => (
                <tr key={run.id}>
                  <td className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {run.id.slice(0, 8)}…
                  </td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {run.dataset_fingerprint?.replace("agmarknet-state-", "").replace("agmarknet-", "") || run.target_column}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      {STATUS_ICON[run.status]}
                      <span className={`status-${run.status}`} style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                        {run.status}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: "var(--accent-3)", fontWeight: 600 }}>🏆 {run.best_model ?? "—"}</td>
                  <td>{run.forecast_horizon} Days</td>
                  <td style={{ fontSize: "0.78rem" }}>{new Date(run.created_at).toLocaleString()}</td>
                  <td>
                    {run.status === "COMPLETED" && (
                      <a
                        href="/results"
                        className="btn btn-secondary"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", textDecoration: "none" }}
                      >
                        View
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

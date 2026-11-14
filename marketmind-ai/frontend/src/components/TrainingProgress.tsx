import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, Clock, Loader2, AlertTriangle } from "lucide-react";
import type { ForecastRunResponse } from "../types";

interface Props {
  run: ForecastRunResponse;
  onDone: (run: ForecastRunResponse) => void;
  onPoll: (runId: string) => Promise<ForecastRunResponse>;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  QUEUED:    <Clock size={16} style={{ color: "var(--accent-warn)" }} />,
  RUNNING:   <Loader2 size={16} style={{ color: "var(--accent)", animation: "spin 1s linear infinite" }} />,
  COMPLETED: <CheckCircle2 size={16} style={{ color: "var(--accent-3)" }} />,
  FAILED:    <XCircle size={16} style={{ color: "var(--accent-danger)" }} />,
  CANCELLED: <AlertTriangle size={16} style={{ color: "var(--text-muted)" }} />,
};

export function TrainingProgress({ run: initialRun, onDone, onPoll }: Props) {
  const [run, setRun] = useState<ForecastRunResponse>(initialRun);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRun(initialRun);
  }, [initialRun]);

  useEffect(() => {
    if (["COMPLETED", "FAILED", "CANCELLED"].includes(run.status)) return;

    timerRef.current = setInterval(async () => {
      try {
        const fresh = await onPoll(run.id);
        setRun(fresh);
        if (["COMPLETED", "FAILED", "CANCELLED"].includes(fresh.status)) {
          clearInterval(timerRef.current!);
          onDone(fresh);
        }
      } catch {/* silently ignore poll errors */}
    }, 2000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [run.id, run.status, onDone, onPoll]);

  const isDone = ["COMPLETED", "FAILED", "CANCELLED"].includes(run.status);

  return (
    <div className="card fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {STATUS_ICON[run.status]}
          <span style={{ fontWeight: 600 }}>Training Run</span>
          <span className="mono" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{run.id.slice(0, 8)}</span>
        </div>
        <span className={`status-${run.status}`} style={{ fontWeight: 600, fontSize: "0.82rem" }}>
          {run.status}
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: "0.75rem" }}>
        <div className="progress-bar-fill" style={{ width: `${run.progress}%` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem",
        color: "var(--text-muted)", marginBottom: "1rem" }}>
        <span>{run.current_model ? `Training: ${run.current_model}` : (isDone ? "Done" : "Queued")}</span>
        <span>{run.progress}%</span>
      </div>

      {/* Error */}
      {run.error_message && (
        <div style={{
          padding: "0.75rem", borderRadius: 8,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          color: "var(--accent-danger)", fontSize: "0.82rem",
        }}>
          {run.error_message}
        </div>
      )}

      {/* Done summary */}
      {run.status === "COMPLETED" && run.best_model && (
        <div style={{
          padding: "0.75rem 1rem", borderRadius: 8, marginTop: "0.5rem",
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
          fontSize: "0.85rem", color: "var(--accent-3)",
          display: "flex", alignItems: "center", gap: "0.5rem",
        }}>
          <CheckCircle2 size={14} />
          Best model: <strong>{run.best_model}</strong>
        </div>
      )}
    </div>
  );
}

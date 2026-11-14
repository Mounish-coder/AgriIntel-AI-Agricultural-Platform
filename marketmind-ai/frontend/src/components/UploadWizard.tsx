import { useCallback, useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { uploadDataset, analyseDataset, updateDatasetConfig } from "../services/api";
import type { DatasetAnalysis, DatasetResponse } from "../types";

interface Props {
  onComplete: (ds: DatasetResponse, analysis: DatasetAnalysis) => void;
}

type Stage = "idle" | "uploading" | "analysing" | "configuring" | "done" | "error";

export function UploadWizard({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>("idle");
  const [drag, setDrag] = useState(false);
  const [dataset, setDataset] = useState<DatasetResponse | null>(null);
  const [analysis, setAnalysis] = useState<DatasetAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateCol, setDateCol] = useState("");
  const [targetCol, setTargetCol] = useState("");

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setStage("uploading");
    try {
      const ds = await uploadDataset(file);
      setDataset(ds);
      setStage("analysing");

      const ana = await analyseDataset(ds.id);
      setAnalysis(ana);
      setDateCol(ana.detected_date_column ?? "");
      setTargetCol(ana.detected_target_column ?? "");
      setStage("configuring");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setStage("error");
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const confirm = async () => {
    if (!dataset || !dateCol || !targetCol) return;
    try {
      const updated = await updateDatasetConfig(dataset.id, {
        date_column: dateCol, target_column: targetCol,
      });
      setStage("done");
      onComplete(updated, analysis!);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  // ── Render stages ──────────────────────────────────────────────────────────

  if (stage === "idle" || stage === "error") return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div
        className={`upload-zone ${drag ? "drag-over" : ""}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input id="file-input" type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={onFileInput} />
        <Upload size={40} style={{ color: "var(--accent)", marginBottom: "1rem" }} />
        <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
          Drop your dataset here
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1rem" }}>
          CSV or Excel (.csv, .xlsx, .xls) · Max 50 MB
        </div>
        <button className="btn btn-primary">Browse Files</button>
      </div>
      {error && (
        <div style={{
          marginTop: "1rem", padding: "0.875rem 1rem", borderRadius: 8,
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          color: "var(--accent-danger)", display: "flex", gap: "0.5rem", alignItems: "flex-start",
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: "0.85rem" }}>{error}</span>
        </div>
      )}
    </div>
  );

  if (stage === "uploading") return (
    <div style={{ textAlign: "center", padding: "3rem" }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, margin: "0 auto 1rem" }} />
      <div style={{ fontWeight: 600 }}>Uploading dataset…</div>
    </div>
  );

  if (stage === "analysing") return (
    <div style={{ textAlign: "center", padding: "3rem" }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, margin: "0 auto 1rem" }} />
      <div style={{ fontWeight: 600 }}>Analysing dataset…</div>
      <div style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "0.85rem" }}>
        Detecting columns, frequency, and data quality
      </div>
    </div>
  );

  if (stage === "configuring" && analysis && dataset) {
    const allCols = analysis.columns.map(c => c.name);
    const numCols = analysis.columns.filter(c => c.is_numeric).map(c => c.name);
    return (
      <div className="fade-in" style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* File info */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.5rem" }}>
          <FileText size={20} style={{ color: "var(--accent)" }} />
          <div>
            <div style={{ fontWeight: 600 }}>{dataset.original_filename}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
              {analysis.row_count.toLocaleString()} rows · {analysis.column_count} columns ·{" "}
              {(dataset.file_size / 1024).toFixed(1)} KB
            </div>
          </div>
        </div>

        {/* Warnings */}
        {analysis.warnings.length > 0 && (
          <div style={{
            padding: "0.875rem 1rem", borderRadius: 8, marginBottom: "1.25rem",
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
          }}>
            <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "var(--accent-warn)", marginBottom: "0.5rem" }}>
              ⚠ Data Quality Notices
            </div>
            {analysis.warnings.map((w, i) => (
              <div key={i} style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 2 }}>• {w}</div>
            ))}
          </div>
        )}

        {/* Column configuration */}
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div style={{ fontWeight: 600, marginBottom: "1rem" }}>Configure Columns</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Date Column *
              </label>
              <select className="input" value={dateCol} onChange={e => setDateCol(e.target.value)}>
                <option value="">— select —</option>
                {allCols.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Target (Price) Column *
              </label>
              <select className="input" value={targetCol} onChange={e => setTargetCol(e.target.value)}>
                <option value="">— select —</option>
                {numCols.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats preview */}
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Column Summary</div>
          <div style={{ overflowX: "auto", maxHeight: 260, overflowY: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Column</th><th>Type</th><th>Non-null</th><th>Nulls %</th><th>Unique</th><th>Sample</th>
                </tr>
              </thead>
              <tbody>
                {analysis.columns.map(col => (
                  <tr key={col.name}>
                    <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                      {col.name}
                      {col.is_candidate_date && <span className="badge badge-blue" style={{ marginLeft: 6 }}>date</span>}
                      {col.is_candidate_target && <span className="badge badge-green" style={{ marginLeft: 6 }}>price</span>}
                    </td>
                    <td className="mono">{col.dtype}</td>
                    <td>{col.non_null_count.toLocaleString()}</td>
                    <td style={{ color: col.null_pct > 5 ? "var(--accent-warn)" : "inherit" }}>
                      {col.null_pct.toFixed(1)}%
                    </td>
                    <td>{col.unique_count.toLocaleString()}</td>
                    <td className="mono" style={{ fontSize: "0.75rem" }}>
                      {col.sample_values.slice(0, 2).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
          disabled={!dateCol || !targetCol}
          onClick={confirm}
        >
          <CheckCircle2 size={16} /> Confirm & Continue
        </button>
      </div>
    );
  }

  return null;
}

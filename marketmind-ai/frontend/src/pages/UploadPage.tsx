import { UploadWizard } from "../components/UploadWizard";
import type { DatasetAnalysis, DatasetResponse } from "../types";

interface Props {
  onDatasetReady: (ds: DatasetResponse, analysis: DatasetAnalysis) => void;
  currentDataset: DatasetResponse | null;
}

export function UploadPage({ onDatasetReady, currentDataset }: Props) {
  return (
    <div className="fade-in">
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Upload Dataset</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Upload a CSV or Excel file. The system will automatically detect date and price columns,
          analyse data quality, and guide you through configuration.
        </p>
      </div>

      {currentDataset && (
        <div style={{
          padding: "0.75rem 1rem", borderRadius: 8, marginBottom: "1.5rem",
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
          fontSize: "0.85rem", color: "var(--accent-3)",
        }}>
          ✓ Current dataset: <strong>{currentDataset.original_filename}</strong>{" "}
          ({currentDataset.row_count.toLocaleString()} rows) — upload a new one to replace it.
        </div>
      )}

      <UploadWizard onComplete={onDatasetReady} />
    </div>
  );
}

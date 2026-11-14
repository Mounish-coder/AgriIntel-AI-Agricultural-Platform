import { Calendar, CheckCircle2 } from "lucide-react";
import type { CropCalendarResponse, AdvisoryLanguage } from "../../types/advisory";

interface Props {
  data: CropCalendarResponse | null;
  loading: boolean;
  lang: AdvisoryLanguage;
}

export function CropCalendarModule({ data, loading, lang }: Props) {
  const isTe = lang === "te";

  if (loading) {
    return (
      <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
        <div className="spinner" style={{ width: 32, height: 32, margin: "0 auto 1rem" }} />
        <div style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
          {isTe ? "పంట కాల నిర్ణయ పట్టిక లోడ్ అవుతోంది..." : "Loading Crop Growth Calendar..."}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {/* Header */}
      <div
        className="card"
        style={{
          padding: "1.25rem 1.5rem",
          background: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(5,150,105,0.04))",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>📅</span>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              {data.crop_name} — {isTe ? "పంట కాల నిర్ణయ పట్టిక (సమగ్ర దశలు)" : "Crop Calendar & Growth Schedule"}
            </h2>
          </div>
          <p style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {isTe
              ? "విత్తిన నాటి నుంచి కోత వరకు రోజువారీ చేపట్టవలసిన ముఖ్యమైన పనుల వివరాలు."
              : "Chronological operational schedule from sowing to harvest (Days After Sowing - DAS)."}
          </p>
        </div>

        <div
          style={{
            padding: "0.35rem 0.75rem",
            borderRadius: "6px",
            background: "rgba(139,92,246,0.1)",
            color: "#7c3aed",
            fontSize: "0.75rem",
            fontWeight: 700,
          }}
        >
          {data.total_stages} {isTe ? "వృద్ధి దశలు" : "Growth Stages"}
        </div>
      </div>

      {/* Chronological Timeline Cards */}
      <div style={{ display: "grid", gap: "1rem" }}>
        {data.timeline.map((step, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: "1.25rem 1.5rem",
              borderRadius: "12px",
              display: "grid",
              gridTemplateColumns: "150px 1fr",
              gap: "1.25rem",
              alignItems: "center",
              borderLeft: "4px solid #7c3aed",
            }}
          >
            {/* Timeline Badge */}
            <div
              style={{
                background: "var(--bg-main)",
                padding: "0.6rem 0.85rem",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", color: "#7c3aed", marginBottom: "2px" }}>
                <Calendar size={13} />
                <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
                  {isTe ? "కాలవ్యవధి" : "TIMELINE"}
                </span>
              </div>
              <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)", display: "block" }}>
                {step.day_range}
              </strong>
            </div>

            {/* Actions Detail */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <CheckCircle2 size={16} style={{ color: "#059669", flexShrink: 0 }} />
                <h3 style={{ fontSize: "0.98rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  {step.stage}
                </h3>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                {step.actions}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" }}>
        {data.source}
      </div>
    </div>
  );
}

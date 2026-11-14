import { Droplets, AlertTriangle, Layers, Award } from "lucide-react";
import type { IrrigationAdvisoryResponse, AdvisoryLanguage } from "../../types/advisory";

interface Props {
  data: IrrigationAdvisoryResponse | null;
  loading: boolean;
  lang: AdvisoryLanguage;
}

export function IrrigationAdvisoryModule({ data, loading, lang }: Props) {
  const isTe = lang === "te";

  if (loading) {
    return (
      <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
        <div className="spinner" style={{ width: 32, height: 32, margin: "0 auto 1rem" }} />
        <div style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
          {isTe ? "నీటి యాజమాన్య ప్రణాళిక లోడ్ అవుతోంది..." : "Loading Irrigation & Water Management Advisory..."}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {/* Header Card */}
      <div
        className="card"
        style={{
          padding: "1.25rem 1.5rem",
          background: "linear-gradient(135deg, rgba(14,165,233,0.08), rgba(5,150,105,0.04))",
          border: "1px solid rgba(14,165,233,0.25)",
          borderRadius: "12px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>💧</span>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                {data.crop_name} — {isTe ? "నీటి యాజమాన్య మార్గదర్శకాలు" : "Irrigation & Water Advisory"}
              </h2>
            </div>
            <p style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              {isTe ? "నేల రకం:" : "Soil Type:"} <strong>{data.soil_type}</strong> · {isTe ? "పద్ధతి:" : "Method:"} <strong>{data.irrigation_method}</strong>
            </p>
          </div>

          <div
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "6px",
              background: "rgba(14,165,233,0.1)",
              color: "#0284c7",
              fontSize: "0.75rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Layers size={13} />
            {data.water_retention_note}
          </div>
        </div>
      </div>

      {/* Critical Stages of Irrigation */}
      <div className="card" style={{ padding: "1.25rem", borderRadius: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
          <Droplets size={18} style={{ color: "#0284c7" }} />
          <h3 style={{ fontSize: "0.98rem", fontWeight: 700, margin: 0 }}>
            {isTe ? "అత్యంత కీలకమైన నీటి తడుల దశలు (ఈ దశల్లో నీటి ఎద్దడి రాకూడదు)" : "Critical Stages of Irrigation (Yield-Sensitive Stages)"}
          </h3>
        </div>

        <div style={{ display: "grid", gap: "0.6rem" }}>
          {data.critical_stages.map((stage, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                background: "var(--bg-main)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "rgba(14,165,233,0.15)",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 500 }}>
                {stage}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Method Recommendation and Drainage */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
        {/* Method Advice */}
        <div className="card" style={{ padding: "1.25rem", borderRadius: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Award size={16} style={{ color: "#059669" }} />
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: 0 }}>
              {isTe ? "నీటి పారుదల పద్ధతి సిఫార్సు" : "Method Recommendation"}
            </h4>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            {data.method_recommendation}
          </p>
        </div>

        {/* Drainage Guidelines */}
        <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <AlertTriangle size={16} style={{ color: "#d97706" }} />
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: 0, color: "#d97706" }}>
              {isTe ? "మురుగు నీటి పారుదల & జాగ్రత్తలు" : "Drainage & Stagnation Warnings"}
            </h4>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            {data.drainage_guideline}
          </p>
        </div>
      </div>

      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" }}>
        {data.source}
      </div>
    </div>
  );
}

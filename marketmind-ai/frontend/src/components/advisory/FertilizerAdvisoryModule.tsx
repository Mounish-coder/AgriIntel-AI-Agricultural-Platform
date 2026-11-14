import { useState } from "react";
import { Package, Calculator, Sprout, AlertCircle, Calendar } from "lucide-react";
import type { FertilizerAdvisoryResponse, AdvisoryLanguage } from "../../types/advisory";

interface Props {
  data: FertilizerAdvisoryResponse | null;
  loading: boolean;
  lang: AdvisoryLanguage;
  onAcresChange: (acres: number) => void;
}

export function FertilizerAdvisoryModule({ data, loading, lang, onAcresChange }: Props) {
  const isTe = lang === "te";
  const [acresInput, setAcresInput] = useState<number>(data?.acres || 1.0);

  const handleAcresUpdate = (newVal: number) => {
    const val = Math.max(0.5, Math.min(100, newVal));
    setAcresInput(val);
    onAcresChange(val);
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
        <div className="spinner" style={{ width: 32, height: 32, margin: "0 auto 1rem" }} />
        <div style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
          {isTe ? "ఎరువుల సమగ్ర ప్రణాళిక లోడ్ అవుతోంది..." : "Loading Fertilizer Advisory & Dosage Schedules..."}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {/* Acre Calculator Header */}
      <div
        className="card"
        style={{
          padding: "1.25rem 1.5rem",
          background: "linear-gradient(135deg, rgba(2,132,199,0.06), rgba(5,150,105,0.04))",
          border: "1px solid rgba(2,132,199,0.2)",
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
            <span style={{ fontSize: "1.2rem" }}>🧪</span>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              {data.crop_name} — {isTe ? "ఎరువుల సమగ్ర పోషణ ప్రణాళిక" : "Fertilizer Schedule & Calculator"}
            </h2>
          </div>
          <p style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {isTe ? "సిఫార్సు చేసిన NPK మోతాదు:" : "Standard Recommended NPK:"} <strong>{data.recommended_npk}</strong>
          </p>
        </div>

        {/* Acre Quick Adjuster */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "var(--bg-card)",
            padding: "0.4rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid var(--border)",
          }}
        >
          <Calculator size={16} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            {isTe ? "విస్తీర్ణం (ఎకరాలు):" : "Farm Area (Acres):"}
          </span>
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="50"
            value={acresInput}
            onChange={(e) => handleAcresUpdate(parseFloat(e.target.value) || 1)}
            style={{
              width: "65px",
              padding: "0.25rem 0.4rem",
              borderRadius: "4px",
              border: "1px solid var(--border)",
              fontWeight: 700,
              fontSize: "0.85rem",
              textAlign: "center",
            }}
          />
        </div>
      </div>

      {/* Commercial Quantities Card */}
      <div
        className="card"
        style={{
          padding: "1.25rem",
          borderRadius: "10px",
          borderLeft: "4px solid #059669",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <Package size={16} style={{ color: "#059669" }} />
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
            {isTe ? `మొత్తం అవసరమయ్యే ఎరువుల పరిమాణం (${data.acres} ఎకరం కొరకు)` : `Commercial Fertilizer Requirement (For ${data.acres} Acre)`}
          </h3>
        </div>
        <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 600, margin: "0.25rem 0" }}>
          {data.commercial_fertilizers}
        </p>
        {data.soil_adjustment && (
          <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#d97706" }}>
            <AlertCircle size={14} />
            <span>{data.soil_adjustment}</span>
          </div>
        )}
      </div>

      {/* Split Application Timeline */}
      <div className="card" style={{ padding: "1.25rem", borderRadius: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Calendar size={16} style={{ color: "#0284c7" }} />
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
            {isTe ? "విడతలవారీగా ఎరువులు వేసే విధానం (Split Schedules)" : "Stage-Wise Split Application Schedule"}
          </h3>
        </div>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          {data.splits.map((s, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "0.85rem 1rem",
                borderRadius: "8px",
                background: "var(--bg-main)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "#0284c7",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                {idx + 1}
              </div>
              <div>
                <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "2px" }}>
                  {s.stage}
                </strong>
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {s.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Biofertilizers & Micronutrients */}
      <div className="card" style={{ padding: "1.25rem", borderRadius: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <Sprout size={16} style={{ color: "#10b981" }} />
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
            {isTe ? "సేంద్రీయ & జీవ ఎరువుల యాజమాన్యం" : "Biofertilizers & Soil Organic Health"}
          </h3>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
          {data.biofertilizer}
        </p>
      </div>

      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" }}>
        {data.source}
      </div>
    </div>
  );
}

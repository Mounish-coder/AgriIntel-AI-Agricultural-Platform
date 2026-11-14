import { CheckCircle2, Sprout, Sparkles, HelpCircle, Shield, Info } from "lucide-react";
import type { CropAdvisoryResponse, AdvisoryLanguage } from "../../types/advisory";

interface Props {
  data: CropAdvisoryResponse | null;
  loading: boolean;
  lang: AdvisoryLanguage;
}

export function CropAdvisoryModule({ data, loading, lang }: Props) {
  const isTe = lang === "te";

  if (loading) {
    return (
      <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
        <div className="spinner" style={{ width: 32, height: 32, margin: "0 auto 1rem" }} />
        <div style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
          {isTe ? "సమగ్ర సాగు మార్గదర్శకాలు లోడ్ అవుతున్నాయి..." : "Loading Verified Crop Advisory..."}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {/* Hero Overview */}
      <div
        className="card"
        style={{
          padding: "1.25rem 1.5rem",
          background: "linear-gradient(135deg, rgba(5,150,105,0.08), rgba(2,132,199,0.04))",
          border: "1px solid rgba(5,150,105,0.2)",
          borderRadius: "12px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "1.2rem" }}>🌾</span>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                {data.crop_name} — {isTe ? "సమగ్ర సాగు యాజమాన్యం" : "Cultivation Advisory"}
              </h2>
            </div>
            <p style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              {isTe ? "ప్రాంతం:" : "Region:"} <strong>{data.state}</strong> · {isTe ? "నేల:" : "Soil:"} <strong>{data.soil_type}</strong> · {isTe ? "దశ:" : "Stage:"} <strong>{data.growth_stage}</strong>
            </p>
          </div>
          <div
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "6px",
              background: "rgba(5,150,105,0.12)",
              color: "#047857",
              fontSize: "0.75rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Shield size={13} />
            ICAR / ANGRAU Certified
          </div>
        </div>

        {/* Dynamic Contextual Guidance Alerts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.75rem", marginTop: "1rem" }}>
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.8rem",
            }}
          >
            <strong style={{ color: "#059669", display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
              <Info size={13} /> {isTe ? "నేల అనుకూలత సూచన" : "Soil Suitability Note"}
            </strong>
            <span style={{ color: "var(--text-secondary)" }}>{data.soil_specific_guidance}</span>
          </div>

          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.8rem",
            }}
          >
            <strong style={{ color: "#0284c7", display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
              <Sparkles size={13} /> {isTe ? "ప్రస్తుత దశ ప్రాధాన్యత" : "Growth Stage Focus"}
            </strong>
            <span style={{ color: "var(--text-secondary)" }}>{data.growth_stage_guidance}</span>
          </div>
        </div>
      </div>

      {/* Grid of Key Agronomic Practices */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
        {/* Varieties */}
        <div className="card" style={{ padding: "1.25rem", borderRadius: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div style={{ padding: "6px", borderRadius: "6px", background: "rgba(5,150,105,0.1)", color: "#059669" }}>
              <Sprout size={16} />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
              {isTe ? "సిఫార్సు చేసిన అధిక దిగుబడి రకాలు" : "Recommended Varieties"}
            </h3>
          </div>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--text-secondary)", margin: 0 }}>
            {data.varieties}
          </p>
        </div>

        {/* Seed Rate & Spacing */}
        <div className="card" style={{ padding: "1.25rem", borderRadius: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div style={{ padding: "6px", borderRadius: "6px", background: "rgba(14,165,233,0.1)", color: "#0284c7" }}>
              <CheckCircle2 size={16} />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
              {isTe ? "విత్తన మోతాదు మరియు ఎడం (Spacing)" : "Seed Rate & Spacing"}
            </h3>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "grid", gap: "0.5rem" }}>
            <div>
              <strong>{isTe ? "విత్తన మోతాదు:" : "Seed Rate:"}</strong> {data.seed_rate}
            </div>
            <div>
              <strong>{isTe ? "మొక్కల ఎడం (Spacing):" : "Recommended Spacing:"}</strong> {data.spacing}
            </div>
          </div>
        </div>

        {/* Seed Treatment */}
        <div className="card" style={{ padding: "1.25rem", borderRadius: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div style={{ padding: "6px", borderRadius: "6px", background: "rgba(245,158,11,0.1)", color: "#d97706" }}>
              <Sparkles size={16} />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
              {isTe ? "విత్తన శుద్ధి విధానం (Seed Treatment)" : "Seed Treatment Protocol"}
            </h3>
          </div>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--text-secondary)", margin: 0 }}>
            {data.seed_treatment}
          </p>
        </div>

        {/* Cultivation Tips */}
        <div className="card" style={{ padding: "1.25rem", borderRadius: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div style={{ padding: "6px", borderRadius: "6px", background: "rgba(139,92,246,0.1)", color: "#7c3aed" }}>
              <HelpCircle size={16} />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
              {isTe ? "రైతుకు ముఖ్య సలహాలు (Good Practices)" : "Key Cultivation Practices"}
            </h3>
          </div>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--text-secondary)", margin: 0 }}>
            {data.cultivation_tips}
          </p>
        </div>
      </div>

      {/* Citation footer */}
      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", marginTop: "0.5rem" }}>
        {data.source}
      </div>
    </div>
  );
}

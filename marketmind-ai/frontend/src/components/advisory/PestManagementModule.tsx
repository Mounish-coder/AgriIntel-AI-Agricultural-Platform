import { useState } from "react";
import { Search, ShieldAlert, CheckCircle, Bug, Sparkles, Filter } from "lucide-react";
import type { PestManagementResponse, AdvisoryLanguage } from "../../types/advisory";

interface Props {
  data: PestManagementResponse | null;
  loading: boolean;
  lang: AdvisoryLanguage;
  onFilterChange: (plantPart: string, query: string) => void;
}

export function PestManagementModule({ data, loading, lang, onFilterChange }: Props) {
  const isTe = lang === "te";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPart, setSelectedPart] = useState("All");

  const plantParts = [
    { id: "All", label_en: "All Parts", label_te: "అన్ని భాగాలు" },
    { id: "Leaves", label_en: "Leaves & Shoots", label_te: "ఆకులు & కొమ్మలు" },
    { id: "Stem", label_en: "Stem & Trunk", label_te: "కాండం & మొదలు" },
    { id: "Flowers", label_en: "Flowers / Buds", label_te: "పూత & మొగ్గలు" },
    { id: "Fruits", label_en: "Fruits / Pods / Grain", label_te: "కాయలు / గింజలు" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(selectedPart === "All" ? "" : selectedPart, searchTerm);
  };

  const handlePartSelect = (part: string) => {
    setSelectedPart(part);
    onFilterChange(part === "All" ? "" : part, searchTerm);
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
        <div className="spinner" style={{ width: 32, height: 32, margin: "0 auto 1rem" }} />
        <div style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
          {isTe ? "కీటకాలు & తెగుళ్ల లక్షణాలు లోడ్ అవుతున్నాయి..." : "Searching Verified Pest & Disease Diagnostics..."}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {/* 100% Text-Based Search & Part Selector Hero */}
      <div
        className="card"
        style={{
          padding: "1.25rem 1.5rem",
          background: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(245,158,11,0.04))",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "12px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>🔬</span>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                {data.crop_name} — {isTe ? "టెక్స్ట్ ఆధారిత తెగుళ్ల నిర్ధారణ & నివారణ" : "Text-Based Pest & Disease Symptom Checker"}
              </h2>
            </div>
            <p style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              {isTe
                ? "మొక్కపై కనిపించే లక్షణాలను బట్టి పురుగు లేదా తెగులును గుర్తించి ఖచ్చితమైన మోతాదులను తెలుసుకోండి."
                : "Identify pests and diseases by observed textual symptoms and obtain certified IPM & chemical dosages."}
            </p>
          </div>

          <div
            style={{
              padding: "0.3rem 0.65rem",
              borderRadius: "6px",
              background: "rgba(239,68,68,0.1)",
              color: "#dc2626",
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            100% Text-Based Diagnostic (No Camera/Image Upload)
          </div>
        </div>

        {/* Text Search Form */}
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.85rem" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder={isTe ? "లక్షణాలను వెతకండి (ఉదా: ఆకుముడత, రంధ్రాలు, చచ్చిన మొవ్వు, పసుపు మచ్చలు...)" : "Type observed symptoms (e.g. dead heart, curl, yellow spots, borer holes...)"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem 0.6rem 2.25rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                fontSize: "0.85rem",
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Filter size={14} />
            {isTe ? "వెతకండి" : "Search"}
          </button>
        </form>

        {/* Affected Plant Part Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>
            {isTe ? "దెబ్బతిన్న భాగం:" : "Affected Part:"}
          </span>
          {plantParts.map((part) => {
            const active = selectedPart === part.id;
            return (
              <button
                key={part.id}
                type="button"
                onClick={() => handlePartSelect(part.id)}
                style={{
                  padding: "0.25rem 0.65rem",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  fontWeight: active ? 700 : 500,
                  background: active ? "var(--accent)" : "var(--bg-card)",
                  color: active ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  cursor: "pointer",
                }}
              >
                {isTe ? part.label_te : part.label_en}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pest Cards */}
      <div style={{ display: "grid", gap: "1rem" }}>
        {data.pests.length === 0 ? (
          <div className="card" style={{ padding: "2.5rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>
              {isTe ? "ఎటువంటి ఫలితాలు లభించలేదు. దయచేసి వేరే లక్షణాలను వెతకండి." : "No matching pest symptoms found. Try searching with different keywords."}
            </p>
          </div>
        ) : (
          data.pests.map((pest, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                padding: "1.25rem 1.5rem",
                borderRadius: "12px",
                borderLeft: "4px solid #ef4444",
              }}
            >
              {/* Header: Pest Name + Part Tag */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Bug size={18} style={{ color: "#ef4444" }} />
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                    {pest.name}
                  </h3>
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    background: "rgba(0,0,0,0.05)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {isTe ? "బాధిత భాగం:" : "Part:"} {pest.affected_part}
                </span>
              </div>

              {/* Symptom Description (Text-Based) */}
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  background: "var(--bg-main)",
                  border: "1px solid var(--border-subtle)",
                  marginBottom: "0.85rem",
                }}
              >
                <strong style={{ fontSize: "0.8rem", color: "#dc2626", display: "block", marginBottom: "3px" }}>
                  🔍 {isTe ? "క్షేత్రస్థాయిలో కనిపించే స్పష్టమైన లక్షణాలు:" : "Field Diagnostic Symptoms:"}
                </strong>
                <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", margin: 0, lineHeight: 1.5 }}>
                  {pest.symptoms}
                </p>
              </div>

              {/* ETL Warning */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#b45309", marginBottom: "0.85rem" }}>
                <ShieldAlert size={15} />
                <strong>{isTe ? "ఆర్థిక నష్ట పరిమితి (ETL):" : "Economic Threshold Level (ETL):"}</strong>
                <span>{pest.etl}</span>
              </div>

              {/* IPM Control Recommendations */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.75rem" }}>
                {/* Cultural Controls */}
                <div style={{ padding: "0.75rem", borderRadius: "8px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <strong style={{ fontSize: "0.8rem", color: "#059669", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                    <CheckCircle size={13} /> {isTe ? "యాజమాన్య పద్ధతులు (Cultural IPM)" : "Cultural & Mechanical Control"}
                  </strong>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                    {pest.cultural_control}
                  </p>
                </div>

                {/* Biological Controls */}
                <div style={{ padding: "0.75rem", borderRadius: "8px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <strong style={{ fontSize: "0.8rem", color: "#0284c7", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                    <Sparkles size={13} /> {isTe ? "జీవ నియంత్రణ (Biological Control)" : "Biological / Organic Control"}
                  </strong>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                    {pest.biological_control}
                  </p>
                </div>

                {/* Chemical Controls */}
                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: "0.85rem 1rem",
                    borderRadius: "8px",
                    background: "rgba(239,68,68,0.04)",
                    border: "1px solid rgba(239,68,68,0.25)",
                  }}
                >
                  <strong style={{ fontSize: "0.82rem", color: "#dc2626", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                    💊 {isTe ? "సిఫార్సు చేసిన రసాయన మందులు & ఖచ్చితమైన మోతాదు:" : "Certified Chemical Control (Exact Dosages):"}
                  </strong>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, lineHeight: 1.5 }}>
                    {pest.chemical_control}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Safety Banner */}
      <div
        className="card"
        style={{
          padding: "0.85rem 1.25rem",
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          fontSize: "0.8rem",
          color: "#b45309",
        }}
      >
        <ShieldAlert size={18} style={{ flexShrink: 0 }} />
        <span>{data.safety_note}</span>
      </div>
    </div>
  );
}

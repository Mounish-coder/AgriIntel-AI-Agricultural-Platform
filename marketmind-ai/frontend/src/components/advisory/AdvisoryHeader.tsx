import { Languages, ShieldCheck, MapPin, Layers, Clock } from "lucide-react";
import type {
  AdvisoryLanguage,
  CropMetaItem,
  SoilTypeItem,
  GrowthStageItem,
} from "../../types/advisory";

interface Props {
  lang: AdvisoryLanguage;
  onLanguageChange: (lang: AdvisoryLanguage) => void;
  crops: CropMetaItem[];
  selectedCrop: string;
  onCropChange: (crop: string) => void;
  states: string[];
  selectedState: string;
  onStateChange: (state: string) => void;
  soilTypes: SoilTypeItem[];
  selectedSoil: string;
  onSoilChange: (soil: string) => void;
  growthStages: GrowthStageItem[];
  selectedStage: string;
  onStageChange: (stage: string) => void;
}

export function AdvisoryHeader({
  lang,
  onLanguageChange,
  crops,
  selectedCrop,
  onCropChange,
  states,
  selectedState,
  onStateChange,
  soilTypes,
  selectedSoil,
  onSoilChange,
  growthStages,
  selectedStage,
  onStageChange,
}: Props) {
  const isTe = lang === "te";

  return (
    <div
      className="card"
      style={{
        padding: "1.25rem 1.5rem",
        marginBottom: "1.5rem",
        background: "linear-gradient(135deg, rgba(5,150,105,0.06), rgba(14,165,233,0.04))",
        border: "1px solid rgba(5,150,105,0.25)",
        borderRadius: "12px",
      }}
    >
      {/* Top Banner: Title + Verified Badge + Language Switcher */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.25rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #059669, #047857)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "1.4rem",
              boxShadow: "0 2px 8px rgba(5,150,105,0.3)",
            }}
          >
            🌱
          </div>
          <div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              {isTe ? "రైతు వ్యవసాయ సలహా వేదిక" : "Farmer Advisory Platform"}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "2px" }}>
              <ShieldCheck size={14} style={{ color: "#059669" }} />
              <span style={{ fontSize: "0.75rem", color: "#047857", fontWeight: 600 }}>
                {isTe ? "ICAR, ANGRAU & KVK అధికారిక సమాచారం" : "Grounded on Verified ICAR, ANGRAU & KVK Guidelines"}
              </span>
            </div>
          </div>
        </div>

        {/* Bilingual Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Languages size={16} style={{ color: "var(--text-secondary)" }} />
          <div
            style={{
              display: "inline-flex",
              background: "var(--bg-main)",
              borderRadius: "8px",
              padding: "2px",
              border: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              onClick={() => onLanguageChange("en")}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "6px",
                border: "none",
                fontSize: "0.8rem",
                fontWeight: lang === "en" ? 700 : 500,
                background: lang === "en" ? "#059669" : "transparent",
                color: lang === "en" ? "#fff" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("te")}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "6px",
                border: "none",
                fontSize: "0.82rem",
                fontWeight: lang === "te" ? 700 : 500,
                background: lang === "te" ? "#059669" : "transparent",
                color: lang === "te" ? "#fff" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              తెలుగు (Telugu)
            </button>
          </div>
        </div>
      </div>

      {/* Cascading Farmer Selector Filters */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {/* Crop Select */}
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
            <span>🌾</span> {isTe ? "పంటను ఎంచుకోండి" : "Select Crop"}
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => onCropChange(e.target.value)}
            className="input-select"
            style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", fontWeight: 600 }}
          >
            {crops.map((c) => (
              <option key={c.key} value={c.key}>
                {isTe ? c.name_te : c.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* State Select */}
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
            <MapPin size={13} /> {isTe ? "రాష్ట్రం" : "Location / State"}
          </label>
          <select
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            className="input-select"
            style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px" }}
          >
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Soil Type Select */}
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
            <Layers size={13} /> {isTe ? "నేల రకం" : "Soil Type"}
          </label>
          <select
            value={selectedSoil}
            onChange={(e) => onSoilChange(e.target.value)}
            className="input-select"
            style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px" }}
          >
            {soilTypes.map((s) => (
              <option key={s.id} value={s.id}>
                {isTe ? s.name_te : s.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* Growth Stage Select */}
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
            <Clock size={13} /> {isTe ? "పైరు పెరుగుదల దశ" : "Crop Growth Stage"}
          </label>
          <select
            value={selectedStage}
            onChange={(e) => onStageChange(e.target.value)}
            className="input-select"
            style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px" }}
          >
            {growthStages.map((st) => (
              <option key={st.id} value={st.id}>
                {isTe ? st.name_te : st.name_en}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

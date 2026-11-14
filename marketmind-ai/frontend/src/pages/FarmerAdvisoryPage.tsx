import { useState, useEffect } from "react";
import {
  Sprout,
  Package,
  Bug,
  Droplets,
  Calendar,
  Bot,
  AlertCircle,
} from "lucide-react";
import type {
  AdvisoryLanguage,
  AdvisoryMetaResponse,
  CropAdvisoryResponse,
  FertilizerAdvisoryResponse,
  PestManagementResponse,
  IrrigationAdvisoryResponse,
  CropCalendarResponse,
} from "../types/advisory";
import {
  getAdvisoryMeta,
  fetchCropAdvisory,
  fetchFertilizerAdvisory,
  fetchPestManagement,
  fetchIrrigationAdvisory,
  fetchCropCalendar,
} from "../services/advisoryApi";
import { AdvisoryHeader } from "../components/advisory/AdvisoryHeader";
import { CropAdvisoryModule } from "../components/advisory/CropAdvisoryModule";
import { FertilizerAdvisoryModule } from "../components/advisory/FertilizerAdvisoryModule";
import { PestManagementModule } from "../components/advisory/PestManagementModule";
import { IrrigationAdvisoryModule } from "../components/advisory/IrrigationAdvisoryModule";
import { CropCalendarModule } from "../components/advisory/CropCalendarModule";
import { AIFarmerAssistantModule } from "../components/advisory/AIFarmerAssistantModule";

type AdvisoryTab = "crop" | "fertilizer" | "pest" | "irrigation" | "calendar" | "assistant";

export function FarmerAdvisoryPage() {
  const [lang, setLang] = useState<AdvisoryLanguage>("en");
  const [activeTab, setActiveTab] = useState<AdvisoryTab>("crop");

  // Filter states
  const [meta, setMeta] = useState<AdvisoryMetaResponse | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>("Paddy (Rice)");
  const [selectedState, setSelectedState] = useState<string>("Andhra Pradesh");
  const [selectedSoil, setSelectedSoil] = useState<string>("black_clay");
  const [selectedStage, setSelectedStage] = useState<string>("vegetative");
  const [acres, setAcres] = useState<number>(1.0);
  const [pestPart, setPestPart] = useState<string>("");
  const [pestQuery, setPestQuery] = useState<string>("");

  // Module data states
  const [cropData, setCropData] = useState<CropAdvisoryResponse | null>(null);
  const [fertData, setFertData] = useState<FertilizerAdvisoryResponse | null>(null);
  const [pestData, setPestData] = useState<PestManagementResponse | null>(null);
  const [irrData, setIrrData] = useState<IrrigationAdvisoryResponse | null>(null);
  const [calData, setCalData] = useState<CropCalendarResponse | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isTe = lang === "te";

  // Load metadata on initial mount
  useEffect(() => {
    getAdvisoryMeta()
      .then((m) => {
        setMeta(m);
        if (m.crops.length > 0) setSelectedCrop(m.crops[0].key);
        if (m.states.length > 0) setSelectedState(m.states[0]);
        if (m.soil_types.length > 0) setSelectedSoil(m.soil_types[0].id);
        if (m.growth_stages.length > 0) setSelectedStage(m.growth_stages[1].id);
      })
      .catch((err) => {
        console.error("Advisory meta error:", err);
        setError("Could not load advisory metadata. Please ensure the backend is running.");
      });
  }, []);

  // Fetch data when crop, filters, tab, or language changes
  useEffect(() => {
    if (!selectedCrop) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        if (activeTab === "crop") {
          const res = await fetchCropAdvisory({
            crop: selectedCrop,
            state: selectedState,
            soil_type: selectedSoil,
            growth_stage: selectedStage,
            lang: lang,
          });
          if (isMounted) setCropData(res);
        } else if (activeTab === "fertilizer") {
          const res = await fetchFertilizerAdvisory({
            crop: selectedCrop,
            soil_type: selectedSoil,
            growth_stage: selectedStage,
            acres: acres,
            lang: lang,
          });
          if (isMounted) setFertData(res);
        } else if (activeTab === "pest") {
          const res = await fetchPestManagement({
            crop: selectedCrop,
            plant_part: pestPart,
            query: pestQuery,
            lang: lang,
          });
          if (isMounted) setPestData(res);
        } else if (activeTab === "irrigation") {
          const res = await fetchIrrigationAdvisory({
            crop: selectedCrop,
            growth_stage: selectedStage,
            soil_type: selectedSoil,
            lang: lang,
          });
          if (isMounted) setIrrData(res);
        } else if (activeTab === "calendar") {
          const res = await fetchCropCalendar({
            crop: selectedCrop,
            lang: lang,
          });
          if (isMounted) setCalData(res);
        }
      } catch (err: unknown) {
        console.error("Error loading module data:", err);
        if (isMounted) {
          const msg = err instanceof Error ? err.message : String(err);
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [
    selectedCrop,
    selectedState,
    selectedSoil,
    selectedStage,
    acres,
    pestPart,
    pestQuery,
    activeTab,
    lang,
  ]);

  const tabs: Array<{ id: AdvisoryTab; icon: typeof Sprout; label_en: string; label_te: string }> = [
    { id: "crop", icon: Sprout, label_en: "Crop Advisory", label_te: "సాగు సలహా" },
    { id: "fertilizer", icon: Package, label_en: "Fertilizer Advisory", label_te: "ఎరువుల ప్రణాళిక" },
    { id: "pest", icon: Bug, label_en: "Pest Management", label_te: "తెగుళ్ల నివారణ (Text-Based)" },
    { id: "irrigation", icon: Droplets, label_en: "Irrigation Advisory", label_te: "నీటి యాజమాన్యం" },
    { id: "calendar", icon: Calendar, label_en: "Crop Calendar", label_te: "పంట క్యాలెండర్" },
    { id: "assistant", icon: Bot, label_en: "AI Farmer Assistant", label_te: "రైతు మిత్ర (AI Chat)" },
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: "2rem" }}>
      {/* Cascading Filter & Language Header */}
      <AdvisoryHeader
        lang={lang}
        onLanguageChange={setLang}
        crops={meta?.crops || []}
        selectedCrop={selectedCrop}
        onCropChange={setSelectedCrop}
        states={meta?.states || []}
        selectedState={selectedState}
        onStateChange={setSelectedState}
        soilTypes={meta?.soil_types || []}
        selectedSoil={selectedSoil}
        onSoilChange={setSelectedSoil}
        growthStages={meta?.growth_stages || []}
        selectedStage={selectedStage}
        onStageChange={setSelectedStage}
      />

      {/* Module Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
          marginBottom: "1.25rem",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                border: active ? "1px solid #059669" : "1px solid var(--border)",
                background: active ? "rgba(5,150,105,0.12)" : "var(--bg-card)",
                color: active ? "#047857" : "var(--text-secondary)",
                fontWeight: active ? 700 : 500,
                fontSize: "0.85rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={16} />
              <span>{isTe ? tab.label_te : tab.label_en}</span>
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className="card"
          style={{
            padding: "1rem",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "8px",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
            fontSize: "0.85rem",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Panels */}
      {activeTab === "crop" && (
        <CropAdvisoryModule data={cropData} loading={loading} lang={lang} />
      )}

      {activeTab === "fertilizer" && (
        <FertilizerAdvisoryModule
          data={fertData}
          loading={loading}
          lang={lang}
          onAcresChange={setAcres}
        />
      )}

      {activeTab === "pest" && (
        <PestManagementModule
          data={pestData}
          loading={loading}
          lang={lang}
          onFilterChange={(part, q) => {
            setPestPart(part);
            setPestQuery(q);
          }}
        />
      )}

      {activeTab === "irrigation" && (
        <IrrigationAdvisoryModule data={irrData} loading={loading} lang={lang} />
      )}

      {activeTab === "calendar" && (
        <CropCalendarModule data={calData} loading={loading} lang={lang} />
      )}

      {activeTab === "assistant" && (
        <AIFarmerAssistantModule activeCrop={selectedCrop} lang={lang} />
      )}
    </div>
  );
}

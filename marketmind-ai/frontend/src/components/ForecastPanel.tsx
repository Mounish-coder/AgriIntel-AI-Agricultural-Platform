import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play, AlertCircle, Sprout, TrendingUp, Check,
  MapPin, Calendar, Info, Loader2
} from "lucide-react";
import { getAgmarknetFilters, predictCropPrices } from "../services/api";
import type {
  AgmarknetFilters,
  ForecastResultsResponse,
  CropPredictPayload,
  ForecastRunResponse,
} from "../types";

interface Props {
  onRunStarted?: (run: ForecastRunResponse) => void;
  onPredictionComplete?: (result: ForecastResultsResponse) => void;
  defaultState?: string;
  defaultCrop?: string;
}

const TARGET_PRICE_OPTIONS = [
  {
    value: "Modal_Price",
    label: "Modal Price",
    subtext: "State median of reporting APMC mandis — recommended for forecasting",
    badge: "Recommended",
    color: "#0ea5e9",
  },
  {
    value: "Min_Price",
    label: "Minimum Floor Price",
    subtext: "Lowest price observed across mandis — buyer's reference",
    badge: "Floor",
    color: "#059669",
  },
  {
    value: "Max_Price",
    label: "Maximum Peak Price",
    subtext: "Highest price observed across mandis — ceiling reference",
    badge: "Peak",
    color: "#d97706",
  },
];

const HORIZON_OPTIONS = [
  { days: 7,  label: "7 Days",  desc: "Short-term weekly trend" },
  { days: 14, label: "14 Days", desc: "Bi-weekly horizon (Recommended)" },
  { days: 30, label: "30 Days", desc: "Monthly seasonal forecast" },
];

export function ForecastPanel({
  onPredictionComplete,
  defaultState,
  defaultCrop,
}: Props) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AgmarknetFilters | null>(null);
  const [selectedState, setSelectedState] = useState<string>(defaultState || "");
  const [selectedCrop, setSelectedCrop] = useState<string>(defaultCrop || "");
  const [targetPrice, setTargetPrice] = useState<string>("Modal_Price");
  const [horizon, setHorizon] = useState<number>(14);
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial load: fetch all states from dataset
  useEffect(() => {
    setLoadingFilters(true);
    setError(null);
    getAgmarknetFilters()
      .then(res => {
        setFilters(res);
        // Set defaults from actual dataset (don't hardcode)
        if (!selectedState && res.all_states.length > 0) {
          setSelectedState(res.all_states[0]);
        }
        if (!selectedCrop && res.available_crops.length > 0) {
          setSelectedCrop(res.available_crops[0]);
        }
      })
      .catch(err => {
        console.error("Error loading filters:", err);
        setError("Could not load dataset filters. Please ensure the backend is running and the AGMARKNET dataset is available.");
      })
      .finally(() => setLoadingFilters(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When state changes, reload crops for that state
  useEffect(() => {
    if (!selectedState) return;
    getAgmarknetFilters(undefined, selectedState)
      .then(res => {
        setFilters(res);
        // Reset crop to first available in new state
        if (res.available_crops.length > 0 && !res.available_crops.includes(selectedCrop)) {
          setSelectedCrop(res.available_crops[0]);
        }
      })
      .catch(err => console.error("Error refreshing crops for state:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState]);

  // When crop changes, reload price stats
  useEffect(() => {
    if (!selectedState || !selectedCrop) return;
    getAgmarknetFilters(selectedCrop, selectedState)
      .then(res => setFilters(res))
      .catch(err => console.error("Error refreshing price stats:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCrop]);

  const handlePredict = async () => {
    if (!selectedState) return setError("Please select a State.");
    if (!selectedCrop) return setError("Please select a Crop.");

    setError(null);
    setLoading(true);

    try {
      const payload: CropPredictPayload = {
        state: selectedState,
        crop: selectedCrop,
        target_price: targetPrice,
        horizon: horizon,
        models: ["naive", "drift", "seasonal_naive", "arima", "sarima", "prophet", "random_forest", "xgboost"],
        train_ratio: 0.75,
      };

      const result = await predictCropPrices(payload);
      if (onPredictionComplete) onPredictionComplete(result);
      navigate("/results");
    } catch (err: unknown) {
      console.error("Forecasting failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Forecasting Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // Use ONLY real data from API — no hardcoded fallbacks
  const states = filters?.all_states ?? [];
  const crops = filters?.available_crops ?? [];
  const pStats = filters?.price_stats;

  return (
    <div className="fade-in" style={{ display: "grid", gap: "1.25rem" }}>

      {/* State & Crop Selection */}
      <div className="card" style={{ borderTop: "3px solid var(--accent)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sprout size={18} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Select State & Crop
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>
              Choose target state and commodity from the AGMARKNET dataset
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.75rem 1rem", borderRadius: 8, marginBottom: "1.25rem",
            background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)",
            color: "var(--accent-danger)", fontSize: "0.85rem",
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {loadingFilters ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-secondary)", padding: "1rem 0" }}>
            <Loader2 size={18} style={{ animation: "spin 0.8s linear infinite", color: "var(--accent)" }} />
            <span>Loading states and crops from dataset…</span>
          </div>
        ) : states.length === 0 ? (
          <div style={{ padding: "1rem", background: "rgba(220,38,38,0.06)", borderRadius: 8, border: "1px solid rgba(220,38,38,0.2)", color: "var(--accent-danger)", fontSize: "0.85rem" }}>
            No states found. Please verify the AGMARKNET dataset is loaded correctly.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
            {/* State Selector */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                <MapPin size={14} style={{ color: "var(--accent)" }} />
                1. Select State
              </label>
              <select
                className="input"
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                {states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>
                {states.length} state{states.length !== 1 ? "s" : ""} in dataset
              </div>
            </div>

            {/* Crop Selector */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                <Sprout size={14} style={{ color: "var(--accent)" }} />
                2. Select Crop / Commodity
              </label>
              <select
                className="input"
                value={selectedCrop}
                onChange={e => setSelectedCrop(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                {crops.length === 0 ? (
                  <option value="">No crops found for {selectedState}</option>
                ) : (
                  crops.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))
                )}
              </select>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>
                {crops.length} crop{crops.length !== 1 ? "s" : ""} available in {selectedState}
              </div>
            </div>
          </div>
        )}

        {/* Live Stats Banner */}
        {!loadingFilters && pStats && (
          <div style={{
            padding: "0.875rem 1rem",
            borderRadius: 8,
            background: "var(--bg-base)",
            border: "1px solid var(--border-subtle)",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.75rem",
          }}>
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Reporting Mandis</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
                {filters?.mandis_count ?? 0} Mandis
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Current Price</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent)", marginTop: 2 }}>
                {pStats.latest_modal_price != null
                  ? `₹${pStats.latest_modal_price.toLocaleString()}`
                  : "No data"}
              </div>
              {(pStats as { latest_obs_date?: string }).latest_obs_date && (
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 1 }}>
                  as of {(pStats as { latest_obs_date?: string }).latest_obs_date}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Price Range</div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
                {pStats.min_price != null ? `₹${pStats.min_price} – ₹${pStats.max_price}` : "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Observations</div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
                {filters?.date_range?.start || "—"} →
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--accent)", marginTop: 1 }}>
                {filters?.total_matching_records?.toLocaleString() ?? 0} records
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target Price & Horizon */}
      <div className="card">
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.875rem", display: "flex", alignItems: "center", gap: 6, color: "var(--text-primary)" }}>
          <TrendingUp size={16} style={{ color: "var(--accent)" }} />
          3. Select Price Target
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.875rem", marginBottom: "1.25rem" }}>
          {TARGET_PRICE_OPTIONS.map(opt => {
            const isSel = targetPrice === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => setTargetPrice(opt.value)}
                style={{
                  padding: "1rem",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: `2px solid ${isSel ? opt.color : "var(--border-subtle)"}`,
                  background: isSel ? `rgba(14,165,233,0.05)` : "var(--bg-base)",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>{opt.label}</span>
                  {isSel && <Check size={16} style={{ color: opt.color }} />}
                </div>
                <p style={{ fontSize: "0.73rem", color: "var(--text-secondary)", margin: "0 0 0.625rem", lineHeight: 1.4 }}>
                  {opt.subtext}
                </p>
                <span style={{
                  fontSize: "0.65rem", fontWeight: 700,
                  padding: "0.15rem 0.45rem", borderRadius: 4,
                  background: `${opt.color}18`, color: opt.color,
                }}>
                  {opt.badge}
                </span>
              </div>
            );
          })}
        </div>

        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 6, color: "var(--text-primary)" }}>
          <Calendar size={16} style={{ color: "var(--accent)" }} />
          4. Forecast Horizon
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.875rem", marginBottom: "0.25rem" }}>
          {HORIZON_OPTIONS.map(h => {
            const isSel = horizon === h.days;
            return (
              <button
                key={h.days}
                type="button"
                onClick={() => setHorizon(h.days)}
                style={{
                  padding: "0.85rem 1rem",
                  borderRadius: 8,
                  cursor: "pointer",
                  textAlign: "left",
                  border: `2px solid ${isSel ? "var(--accent)" : "var(--border-subtle)"}`,
                  background: isSel ? "rgba(14,165,233,0.07)" : "var(--bg-base)",
                  transition: "all 0.15s ease",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: isSel ? "var(--accent)" : "var(--text-primary)" }}>
                    {h.label}
                  </span>
                  {isSel && <Check size={15} style={{ color: "var(--accent)" }} />}
                </div>
                <div style={{ fontSize: "0.73rem", color: "var(--text-secondary)", marginTop: 3 }}>{h.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Model Info */}
      <div style={{
        padding: "0.875rem 1.1rem",
        borderRadius: 8,
        background: "rgba(14,165,233,0.05)",
        border: "1px solid rgba(14,165,233,0.2)",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.625rem",
        fontSize: "0.8rem",
        color: "var(--text-secondary)",
      }}>
        <Info size={16} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
        <span>
          <strong style={{ color: "var(--text-primary)" }}>Automatic model selection: </strong>
          ARIMA, SARIMA, Prophet, Random Forest, and XGBoost are trained and evaluated on chronological holdout data.
          The model with the lowest test MAE is selected automatically — no manual configuration required.
        </span>
      </div>

      {/* Predict Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          {selectedState && selectedCrop ? (
            <>Target: <strong style={{ color: "var(--text-primary)" }}>{selectedState} · {selectedCrop}</strong> · {horizon} Days</>
          ) : (
            <span style={{ color: "var(--text-muted)" }}>Select a state and crop to begin</span>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={handlePredict}
          disabled={loading || loadingFilters || !selectedState || !selectedCrop}
          style={{
            padding: "0.85rem 2rem",
            fontSize: "0.95rem",
            fontWeight: 700,
          }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              <span>Training Models…</span>
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" />
              <span>Predict Prices</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

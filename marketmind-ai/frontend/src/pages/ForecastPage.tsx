import { ForecastPanel } from "../components/ForecastPanel";
import type { ForecastRunResponse, ForecastResultsResponse } from "../types";

interface Props {
  onRunComplete: (run: ForecastRunResponse) => void;
}

export function ForecastPage({ onRunComplete }: Props) {
  const handlePredictionComplete = (result: ForecastResultsResponse) => {
    const run: ForecastRunResponse = {
      id: result.run_id,
      dataset_id: result.dataset_id || "agmarknet",
      target_column: result.target_column,
      date_column: "Arrival_Date",
      status: "COMPLETED",
      progress: 100,
      current_model: result.best_model,
      error_message: null,
      best_model: result.best_model,
      forecast_horizon: 14,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    };
    onRunComplete(run);
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem", color: "var(--text-primary)" }}>
          Crop Price Forecasting
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Select a state and crop to generate price forecasts using the AGMARKNET dataset.
          Models are trained and evaluated automatically.
        </p>
      </div>

      <ForecastPanel onPredictionComplete={handlePredictionComplete} />
    </div>
  );
}

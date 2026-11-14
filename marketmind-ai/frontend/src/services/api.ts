import axios from "axios";
import { API_BASE } from "../config";
import type {
  AgriOptions,
  DatasetAnalysis,
  DatasetResponse,
  ForecastConfig,
  ForecastResultsResponse,
  ForecastRunResponse,
} from "../types";

const api = axios.create({ baseURL: API_BASE });

// ── Datasets ─────────────────────────────────────────────────────────────────

export async function getDatasets(): Promise<DatasetResponse[]> {
  const { data } = await api.get<DatasetResponse[]>("/api/datasets");
  return data;
}

export async function getAgriOptions(id: string, crop?: string): Promise<AgriOptions> {
  const { data } = await api.get<AgriOptions>(`/api/datasets/${id}/agri-options`, {
    params: crop ? { crop } : undefined,
  });
  return data;
}

export async function uploadDataset(file: File): Promise<DatasetResponse> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<DatasetResponse>("/api/datasets/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getDataset(id: string): Promise<DatasetResponse> {
  const { data } = await api.get<DatasetResponse>(`/api/datasets/${id}`);
  return data;
}

export async function analyseDataset(id: string): Promise<DatasetAnalysis> {
  const { data } = await api.get<DatasetAnalysis>(`/api/datasets/${id}/analysis`);
  return data;
}

export async function previewDataset(id: string, rows = 20) {
  const { data } = await api.get(`/api/datasets/${id}/preview`, { params: { rows } });
  return data as { columns: string[]; rows: Record<string, unknown>[]; total_rows: number };
}

export async function updateDatasetConfig(
  id: string,
  payload: { date_column: string; target_column: string; frequency?: string }
): Promise<DatasetResponse> {
  const { data } = await api.put<DatasetResponse>(`/api/datasets/${id}/config`, payload);
  return data;
}

// ── Forecasts ─────────────────────────────────────────────────────────────────

export async function startTraining(config: ForecastConfig): Promise<ForecastRunResponse> {
  const { data } = await api.post<ForecastRunResponse>("/api/forecasts/train", config);
  return data;
}

export async function getRunStatus(runId: string): Promise<ForecastRunResponse> {
  const { data } = await api.get<ForecastRunResponse>(`/api/forecasts/${runId}/status`);
  return data;
}

export async function getRunResults(runId: string): Promise<ForecastResultsResponse> {
  const { data } = await api.get<ForecastResultsResponse>(`/api/forecasts/${runId}/results`);
  return data;
}

export async function getComparison(runId: string) {
  const { data } = await api.get(`/api/forecasts/${runId}/comparison`);
  return data;
}

// ── AGMARKNET Agricultural Forecasting API ─────────────────────────────────────

import type {
  AgmarknetStatus,
  AgmarknetFilters,
  AgmarknetAnalysis,
  CropPredictPayload,
} from "../types";

export async function getAgmarknetStatus(): Promise<AgmarknetStatus> {
  const { data } = await api.get<AgmarknetStatus>("/api/agmarknet/status");
  return data;
}

export async function getAgmarknetFilters(crop?: string, state?: string): Promise<AgmarknetFilters> {
  const { data } = await api.get<AgmarknetFilters>("/api/agmarknet/filters", {
    params: {
      crop: crop || undefined,
      state: state || undefined,
    },
  });
  return data;
}

export async function getAgmarknetAnalysis(): Promise<AgmarknetAnalysis> {
  const { data } = await api.get<AgmarknetAnalysis>("/api/agmarknet/analysis");
  return data;
}

export async function predictCropPrices(payload: CropPredictPayload): Promise<ForecastResultsResponse> {
  const { data } = await api.post<ForecastResultsResponse>("/api/agmarknet/predict", payload);
  return data;
}

// ── System ────────────────────────────────────────────────────────────────────

export async function getHistory(): Promise<ForecastRunResponse[]> {
  const { data } = await api.get<ForecastRunResponse[]>("/api/history");
  return data;
}

export async function healthCheck() {
  const { data } = await api.get("/api/health");
  return data;
}


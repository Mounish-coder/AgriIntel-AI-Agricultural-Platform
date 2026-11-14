import type {
  AdvisoryLanguage,
  AdvisoryMetaResponse,
  CropAdvisoryResponse,
  FertilizerAdvisoryResponse,
  PestManagementResponse,
  IrrigationAdvisoryResponse,
  CropCalendarResponse,
  AssistantChatResponse,
} from "../types/advisory";

const BASE_URL = "/api/advisory";

export async function getAdvisoryMeta(): Promise<AdvisoryMetaResponse> {
  const res = await fetch(`${BASE_URL}/meta`);
  if (!res.ok) throw new Error(`Failed to load advisory metadata: ${res.statusText}`);
  return res.json();
}

export async function fetchCropAdvisory(payload: {
  crop: string;
  state?: string;
  soil_type?: string;
  growth_stage?: string;
  lang: AdvisoryLanguage;
}): Promise<CropAdvisoryResponse> {
  const res = await fetch(`${BASE_URL}/crop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Crop Advisory error: ${res.statusText}`);
  return res.json();
}

export async function fetchFertilizerAdvisory(payload: {
  crop: string;
  soil_type?: string;
  growth_stage?: string;
  acres?: number;
  lang: AdvisoryLanguage;
}): Promise<FertilizerAdvisoryResponse> {
  const res = await fetch(`${BASE_URL}/fertilizer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Fertilizer Advisory error: ${res.statusText}`);
  return res.json();
}

export async function fetchPestManagement(payload: {
  crop: string;
  plant_part?: string;
  query?: string;
  lang: AdvisoryLanguage;
}): Promise<PestManagementResponse> {
  const res = await fetch(`${BASE_URL}/pests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Pest Management error: ${res.statusText}`);
  return res.json();
}

export async function fetchIrrigationAdvisory(payload: {
  crop: string;
  growth_stage?: string;
  soil_type?: string;
  irrigation_method?: string;
  lang: AdvisoryLanguage;
}): Promise<IrrigationAdvisoryResponse> {
  const res = await fetch(`${BASE_URL}/irrigation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Irrigation Advisory error: ${res.statusText}`);
  return res.json();
}

export async function fetchCropCalendar(payload: {
  crop: string;
  lang: AdvisoryLanguage;
}): Promise<CropCalendarResponse> {
  const res = await fetch(`${BASE_URL}/calendar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Crop Calendar error: ${res.statusText}`);
  return res.json();
}

export async function askAssistant(payload: {
  query: string;
  crop?: string;
  lang: AdvisoryLanguage;
  history?: Array<{ role: string; content: string }>;
}): Promise<AssistantChatResponse> {
  const res = await fetch(`${BASE_URL}/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Assistant error: ${res.statusText}`);
  return res.json();
}

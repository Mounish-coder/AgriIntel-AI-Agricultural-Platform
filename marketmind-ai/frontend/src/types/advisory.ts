export type AdvisoryLanguage = "en" | "te";

export interface CropMetaItem {
  key: string;
  id: string;
  name_en: string;
  name_te: string;
  category: string;
}

export interface SoilTypeItem {
  id: string;
  name_en: string;
  name_te: string;
  water_retention: string;
  characteristics_en: string;
  characteristics_te: string;
}

export interface GrowthStageItem {
  id: string;
  name_en: string;
  name_te: string;
}

export interface AdvisoryMetaResponse {
  crops: CropMetaItem[];
  soil_types: SoilTypeItem[];
  growth_stages: GrowthStageItem[];
  states: string[];
}

export interface CropAdvisoryResponse {
  crop_key: string;
  crop_name: string;
  state: string;
  soil_type: string;
  growth_stage: string;
  lang: AdvisoryLanguage;
  varieties: string;
  soil_suitability: string;
  seed_rate: string;
  seed_treatment: string;
  spacing: string;
  cultivation_tips: string;
  soil_specific_guidance: string;
  growth_stage_guidance: string;
  source: string;
}

export interface FertilizerSplit {
  stage: string;
  detail: string;
}

export interface FertilizerAdvisoryResponse {
  crop_key: string;
  crop_name: string;
  acres: number;
  soil_type: string;
  growth_stage: string;
  lang: AdvisoryLanguage;
  recommended_npk: string;
  commercial_fertilizers: string;
  splits: FertilizerSplit[];
  biofertilizer: string;
  soil_adjustment: string;
  source: string;
}

export interface PestItem {
  name: string;
  symptoms: string;
  affected_part: string;
  etl: string;
  cultural_control: string;
  biological_control: string;
  chemical_control: string;
}

export interface PestManagementResponse {
  crop_key: string;
  crop_name: string;
  plant_part_filter: string;
  query: string;
  lang: AdvisoryLanguage;
  pests_count: number;
  pests: PestItem[];
  mode: string;
  safety_note: string;
}

export interface IrrigationAdvisoryResponse {
  crop_key: string;
  crop_name: string;
  soil_type: string;
  growth_stage: string;
  irrigation_method: string;
  lang: AdvisoryLanguage;
  critical_stages: string[];
  drainage_guideline: string;
  method_recommendation: string;
  water_retention_note: string;
  source: string;
}

export interface CropCalendarStep {
  day_range: string;
  stage: string;
  actions: string;
}

export interface CropCalendarResponse {
  crop_key: string;
  crop_name: string;
  lang: AdvisoryLanguage;
  total_stages: number;
  timeline: CropCalendarStep[];
  source: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  verifiedBy?: string;
  suggestedPills?: string[];
}

export interface AssistantChatResponse {
  query: string;
  crop: string;
  lang: AdvisoryLanguage;
  category: string;
  reply: string;
  suggested_pills: string[];
  verified_by: string;
}

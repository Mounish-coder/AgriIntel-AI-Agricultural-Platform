"""
Farmer Advisory API Router.
Strictly text-based, verified agronomic intelligence.
No image upload, no computer vision, no camera dependencies.
"""
from typing import Optional, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.advisory_service import farmer_advisory_service

router = APIRouter(prefix="/api/advisory", tags=["farmer-advisory"])


class CropAdvisoryRequest(BaseModel):
    crop: str = Field(..., description="Crop name (e.g. Paddy (Rice), Cotton, Chilli, Tomato)")
    state: Optional[str] = Field("Andhra Pradesh", description="Indian State")
    soil_type: Optional[str] = Field("black_clay", description="Soil Type ID")
    growth_stage: Optional[str] = Field("vegetative", description="Current Growth Stage ID")
    lang: str = Field("en", description="Language: 'en' or 'te'")


class FertilizerAdvisoryRequest(BaseModel):
    crop: str = Field(..., description="Crop name")
    soil_type: Optional[str] = Field("black_clay", description="Soil Type ID")
    growth_stage: Optional[str] = Field("vegetative", description="Current Growth Stage ID")
    acres: float = Field(1.0, ge=0.1, le=100.0, description="Farm area in acres")
    lang: str = Field("en", description="Language: 'en' or 'te'")


class PestManagementRequest(BaseModel):
    crop: str = Field(..., description="Crop name")
    plant_part: Optional[str] = Field(None, description="Affected plant part (e.g. Leaves, Stem, Flowers, Fruits)")
    query: Optional[str] = Field(None, description="Observed symptom text keywords")
    lang: str = Field("en", description="Language: 'en' or 'te'")


class IrrigationAdvisoryRequest(BaseModel):
    crop: str = Field(..., description="Crop name")
    growth_stage: Optional[str] = Field("vegetative", description="Current Growth Stage ID")
    soil_type: Optional[str] = Field("black_clay", description="Soil Type ID")
    irrigation_method: Optional[str] = Field("Drip Irrigation", description="Irrigation method: Drip, Sprinkler, Furrow")
    lang: str = Field("en", description="Language: 'en' or 'te'")


class CropCalendarRequest(BaseModel):
    crop: str = Field(..., description="Crop name")
    lang: str = Field("en", description="Language: 'en' or 'te'")


class AssistantChatRequest(BaseModel):
    query: str = Field(..., description="Farmer question or query text")
    crop: Optional[str] = Field(None, description="Contextual crop name")
    lang: str = Field("en", description="Language: 'en' or 'te'")
    history: Optional[list[dict[str, str]]] = Field(default_factory=list, description="Prior conversation messages")


@router.get("/meta")
async def get_advisory_metadata():
    """Return available crops, soil types, growth stages, and states for farmer selection."""
    return farmer_advisory_service.get_metadata()


@router.post("/crop")
async def get_crop_advisory(req: CropAdvisoryRequest):
    """Module 1: Comprehensive Crop Advisory & Cultivation Guidance."""
    try:
        return farmer_advisory_service.get_crop_advisory(
            crop=req.crop,
            state=req.state,
            soil_type=req.soil_type,
            growth_stage=req.growth_stage,
            lang=req.lang,
        )
    except Exception as e:
        raise HTTPException(500, detail=str(e))


@router.post("/fertilizer")
async def get_fertilizer_advisory(req: FertilizerAdvisoryRequest):
    """Module 2: Stage-wise Fertilizer Dosage Schedule & Nutrient Calculator."""
    try:
        return farmer_advisory_service.get_fertilizer_advisory(
            crop=req.crop,
            soil_type=req.soil_type,
            growth_stage=req.growth_stage,
            acres=req.acres,
            lang=req.lang,
        )
    except Exception as e:
        raise HTTPException(500, detail=str(e))


@router.post("/pests")
async def get_pest_management(req: PestManagementRequest):
    """Module 3: 100% Text-Based Pest & Disease Diagnostic Symptom Checker & IPM."""
    try:
        return farmer_advisory_service.get_pest_management(
            crop=req.crop,
            plant_part=req.plant_part,
            query=req.query,
            lang=req.lang,
        )
    except Exception as e:
        raise HTTPException(500, detail=str(e))


@router.post("/irrigation")
async def get_irrigation_advisory(req: IrrigationAdvisoryRequest):
    """Module 4: Critical Irrigation Stages, Frequency & Water Management."""
    try:
        return farmer_advisory_service.get_irrigation_advisory(
            crop=req.crop,
            growth_stage=req.growth_stage,
            soil_type=req.soil_type,
            irrigation_method=req.irrigation_method,
            lang=req.lang,
        )
    except Exception as e:
        raise HTTPException(500, detail=str(e))


@router.post("/calendar")
async def get_crop_calendar(req: CropCalendarRequest):
    """Module 5: Crop Cultivation Timeline & Growth Schedules by Days After Sowing (DAS)."""
    try:
        return farmer_advisory_service.get_crop_calendar(
            crop=req.crop,
            lang=req.lang,
        )
    except Exception as e:
        raise HTTPException(500, detail=str(e))


@router.post("/assistant")
async def ask_farmer_assistant(req: AssistantChatRequest):
    """Module 6: Conversational Bilingual AI Farmer Assistant."""
    try:
        return farmer_advisory_service.ask_farmer_assistant(
            query=req.query,
            crop=req.crop,
            lang=req.lang,
            history=req.history,
        )
    except Exception as e:
        raise HTTPException(500, detail=str(e))

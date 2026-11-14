"""
Automated tests for Farmer Advisory Platform.
Verifies all 6 text-based modules and bilingual (English/Telugu) support:
1. Crop Advisory
2. Fertilizer Advisory
3. Pest Management (100% Text-Based)
4. Irrigation Advisory
5. Crop Calendar
6. AI Farmer Assistant
"""
import pytest
from app.services.advisory_service import farmer_advisory_service


def test_advisory_metadata():
    meta = farmer_advisory_service.get_metadata()
    assert "crops" in meta
    assert len(meta["crops"]) >= 6
    assert "soil_types" in meta
    assert len(meta["soil_types"]) >= 4
    assert "growth_stages" in meta
    assert len(meta["growth_stages"]) >= 4
    assert "states" in meta
    assert "Andhra Pradesh" in meta["states"]
    assert "Telangana" in meta["states"]


def test_crop_advisory_bilingual():
    # English
    adv_en = farmer_advisory_service.get_crop_advisory("Paddy (Rice)", "Andhra Pradesh", "black_clay", "vegetative", "en")
    assert adv_en["crop_name"] == "Paddy (Rice)"
    assert len(adv_en["varieties"]) > 10
    assert len(adv_en["seed_rate"]) > 5
    assert len(adv_en["seed_treatment"]) > 5
    assert len(adv_en["spacing"]) > 5

    # Telugu
    adv_te = farmer_advisory_service.get_crop_advisory("Paddy (Rice)", "Andhra Pradesh", "black_clay", "vegetative", "te")
    assert "వరి" in adv_te["crop_name"]
    assert len(adv_te["seed_rate"]) > 5
    assert len(adv_te["seed_treatment"]) > 5
    assert any("\u0c00" <= ch <= "\u0c7f" for ch in adv_te["spacing"])


def test_fertilizer_advisory_acre_scaling():
    # 1 acre
    f1 = farmer_advisory_service.get_fertilizer_advisory("Cotton", "black_clay", "vegetative", 1.0, "en")
    assert f1["acres"] == 1.0
    assert len(f1["splits"]) >= 3
    assert "recommended_npk" in f1

    # 3 acres
    f3 = farmer_advisory_service.get_fertilizer_advisory("Cotton", "black_clay", "vegetative", 3.0, "te")
    assert f3["acres"] == 3.0
    assert len(f3["splits"]) >= 3
    assert any("\u0c00" <= ch <= "\u0c7f" for ch in f3["splits"][0]["stage"])


def test_pest_management_text_based():
    # Search by symptom text keyword "thrips"
    p_thrips = farmer_advisory_service.get_pest_management("Chilli", query="thrips", lang="en")
    assert p_thrips["pests_count"] >= 1
    pest = p_thrips["pests"][0]
    assert "symptoms" in pest
    assert "etl" in pest
    assert "cultural_control" in pest
    assert "biological_control" in pest
    assert "chemical_control" in pest

    # Telugu search
    p_te = farmer_advisory_service.get_pest_management("Chilli", query="తామర", lang="te")
    assert p_te["pests_count"] >= 1
    assert any("\u0c00" <= ch <= "\u0c7f" for ch in p_te["pests"][0]["name"])


def test_irrigation_advisory():
    irr = farmer_advisory_service.get_irrigation_advisory("Maize", "flowering", "red_sandy_loam", "Drip Irrigation", "en")
    assert len(irr["critical_stages"]) >= 3
    assert len(irr["drainage_guideline"]) > 10
    assert "Drip" in irr["method_recommendation"]

    # Telugu
    irr_te = farmer_advisory_service.get_irrigation_advisory("Maize", "flowering", "red_sandy_loam", "Drip Irrigation", "te")
    assert len(irr_te["critical_stages"]) >= 3
    assert any("\u0c00" <= ch <= "\u0c7f" for ch in irr_te["critical_stages"][0])


def test_crop_calendar():
    cal_en = farmer_advisory_service.get_crop_calendar("Groundnut", "en")
    assert cal_en["total_stages"] >= 4
    for step in cal_en["timeline"]:
        assert "day_range" in step
        assert "stage" in step
        assert "actions" in step

    cal_te = farmer_advisory_service.get_crop_calendar("Groundnut", "te")
    assert cal_te["total_stages"] >= 4
    assert any("\u0c00" <= ch <= "\u0c7f" for ch in cal_te["timeline"][0]["stage"])


def test_ai_farmer_assistant_bilingual():
    # English query about pest control
    res_en = farmer_advisory_service.ask_farmer_assistant("How to control pink bollworm in cotton?", "Cotton", "en")
    assert "Pink Bollworm" in res_en["reply"] or "bollworm" in res_en["reply"].lower()
    assert len(res_en["suggested_pills"]) >= 2
    assert "ICAR" in res_en["verified_by"]

    # Telugu query about fertilizer
    res_te = farmer_advisory_service.ask_farmer_assistant("వరిలో ఎరువుల మోతాదు ఎంత?", "Paddy (Rice)", "te")
    assert "ఎరువుల" in res_te["reply"] or "యూరియా" in res_te["reply"]
    assert any("\u0c00" <= ch <= "\u0c7f" for ch in res_te["reply"])

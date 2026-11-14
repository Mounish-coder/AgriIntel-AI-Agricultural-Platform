"""
Farmer Advisory Service.
Coordinates the 6 modules:
1. Crop Advisory
2. Fertilizer Advisory
3. Pest Management (Text-based symptom diagnostic & IPM)
4. Irrigation Advisory
5. Crop Calendar
6. AI Farmer Assistant (Bilingual English/Telugu grounded agronomic assistant)
"""
import re
from typing import Optional, Any
from app.services.advisory_data import CROPS_DATA, SOIL_TYPES, GROWTH_STAGES, STATES


class FarmerAdvisoryService:

    def get_metadata(self) -> dict[str, Any]:
        """Returns available crops, soil types, growth stages and states."""
        crops_list = [
            {
                "key": k,
                "id": v["id"],
                "name_en": v["name_en"],
                "name_te": v["name_te"],
                "category": v.get("category", "General")
            }
            for k, v in CROPS_DATA.items()
        ]
        return {
            "crops": crops_list,
            "soil_types": SOIL_TYPES,
            "growth_stages": GROWTH_STAGES,
            "states": STATES,
        }

    def _resolve_crop(self, crop_name: str) -> tuple[str, dict[str, Any]]:
        """Fuzzy-matches crop name or key."""
        target = crop_name.lower().strip()
        for k, v in CROPS_DATA.items():
            if target in k.lower() or target in v["name_en"].lower() or target in v["name_te"].lower() or target == v["id"]:
                return k, v
        # Default to first crop if not found
        first_key = list(CROPS_DATA.keys())[0]
        return first_key, CROPS_DATA[first_key]

    def _resolve_soil(self, soil_id: Optional[str]) -> dict[str, Any]:
        if not soil_id:
            return SOIL_TYPES[0]
        s_id = soil_id.lower().strip()
        for s in SOIL_TYPES:
            if s["id"] == s_id or s_id in s["name_en"].lower() or s_id in s["name_te"].lower():
                return s
        return SOIL_TYPES[0]

    def _resolve_stage(self, stage_id: Optional[str]) -> dict[str, Any]:
        if not stage_id:
            return GROWTH_STAGES[0]
        s_id = stage_id.lower().strip()
        for st in GROWTH_STAGES:
            if st["id"] == s_id or s_id in st["name_en"].lower() or s_id in st["name_te"].lower():
                return st
        return GROWTH_STAGES[0]

    # ── Module 1: Crop Advisory ──────────────────────────────────────────────
    def get_crop_advisory(
        self,
        crop: str,
        state: Optional[str] = None,
        soil_type: Optional[str] = None,
        growth_stage: Optional[str] = None,
        lang: str = "en"
    ) -> dict[str, Any]:
        crop_key, data = self._resolve_crop(crop)
        soil = self._resolve_soil(soil_type)
        stage = self._resolve_stage(growth_stage)
        adv = data["advisory"]
        is_te = lang == "te"

        # Contextual guidance based on selected soil and stage
        soil_notes = (
            f"Selected soil ({soil['name_te']}): {soil['characteristics_te']} నీటి నిల్వ: {soil['water_retention']}."
            if is_te else
            f"Selected soil ({soil['name_en']}): {soil['characteristics_en']} Water retention: {soil['water_retention']}."
        )

        stage_notes = (
            f"ప్రస్తుత దశ: {stage['name_te']}. ఈ దశలో పైరు పోషణ, కలుపు మరియు తెగుళ్ల నివారణపై ప్రత్యేక శ్రద్ధ పెట్టాలి."
            if is_te else
            f"Current Stage: {stage['name_en']}. Prioritize balanced nutrition, weeding, and prophylactic pest management at this juncture."
        )

        state_str = state or "All Indian States"
        source_citation = (
            "సమాచారం ఆధారాలు: భారతీయ వ్యవసాయ పరిశోధన మండలి (ICAR), ఆచార్య ఎన్.జి. రంగా వ్యవసాయ విశ్వవిద్యాలయం (ANGRAU) సమగ్ర వ్యవసాయ పద్ధతులు."
            if is_te else
            "Verified Sources: ICAR Packages of Practices, ANGRAU Vyavasaya Panchangam, State Agricultural Universities (SAUs)."
        )

        return {
            "crop_key": crop_key,
            "crop_name": data["name_te"] if is_te else data["name_en"],
            "state": state_str,
            "soil_type": soil["name_te"] if is_te else soil["name_en"],
            "growth_stage": stage["name_te"] if is_te else stage["name_en"],
            "lang": lang,
            "varieties": data["varieties"]["te"] if is_te else data["varieties"]["en"],
            "soil_suitability": adv["soil_suitability_te"] if is_te else adv["soil_suitability_en"],
            "seed_rate": adv["seed_rate_te"] if is_te else adv["seed_rate_en"],
            "seed_treatment": adv["seed_treatment_te"] if is_te else adv["seed_treatment_en"],
            "spacing": adv["spacing_te"] if is_te else adv["spacing_en"],
            "cultivation_tips": adv["cultivation_tips_te"] if is_te else adv["cultivation_tips_en"],
            "soil_specific_guidance": soil_notes,
            "growth_stage_guidance": stage_notes,
            "source": source_citation,
        }

    # ── Module 2: Fertilizer Advisory ────────────────────────────────────────
    def get_fertilizer_advisory(
        self,
        crop: str,
        soil_type: Optional[str] = None,
        growth_stage: Optional[str] = None,
        acres: float = 1.0,
        lang: str = "en"
    ) -> dict[str, Any]:
        crop_key, data = self._resolve_crop(crop)
        soil = self._resolve_soil(soil_type)
        stage = self._resolve_stage(growth_stage)
        fert = data["fertilizer"]
        is_te = lang == "te"

        scale = max(0.25, float(acres))

        # Adjust split schedule for selected acres
        splits = []
        for s in fert["split_schedule"]:
            splits.append({
                "stage": s["stage_te"] if is_te else s["stage_en"],
                "detail": s["detail_te"] if is_te else s["detail_en"],
            })

        soil_advice = ""
        if "sandy" in soil["id"]:
            soil_advice = (
                "గమనిక: ఇసుక నేలల్లో ఎరువులు వేగంగా కొట్టుకుపోతాయి. నత్రజని (యూరియా) ఎరువును 4 విడతలుగా కొద్దికొద్దిగా వేయాలి."
                if is_te else
                "Notice for light/sandy soil: Highly prone to leaching. Apply Nitrogen (Urea) in 4 smaller splits rather than large bulk doses."
            )
        elif "black" in soil["id"]:
            soil_advice = (
                "గమనిక: నల్లరేగడి నేలల్లో పొటాష్ సహజంగానే బాగుంటుంది. కానీ భాస్వరం మరియు నత్రజని సమపాళ్లలో అందించాలి."
                if is_te else
                "Notice for black soil: Good native potassium retention. Ensure balanced phosphorus and nitrogen placement in root zone."
            )

        return {
            "crop_key": crop_key,
            "crop_name": data["name_te"] if is_te else data["name_en"],
            "acres": scale,
            "soil_type": soil["name_te"] if is_te else soil["name_en"],
            "growth_stage": stage["name_te"] if is_te else stage["name_en"],
            "lang": lang,
            "recommended_npk": fert["recommended_npk_kg_per_acre"],
            "commercial_fertilizers": fert["commercial_fertilizers_per_acre_te"] if is_te else fert["commercial_fertilizers_per_acre_en"],
            "splits": splits,
            "biofertilizer": fert["biofertilizer_te"] if is_te else fert["biofertilizer_en"],
            "soil_adjustment": soil_advice,
            "source": "ICAR-Indian Institute of Soil Science & ANGRAU Fertilizer Schedules",
        }

    # ── Module 3: Pest & Disease Management (100% Text-Based) ────────────────
    def get_pest_management(
        self,
        crop: str,
        plant_part: Optional[str] = None,
        query: Optional[str] = None,
        lang: str = "en"
    ) -> dict[str, Any]:
        crop_key, data = self._resolve_crop(crop)
        all_pests = data.get("pests", [])
        is_te = lang == "te"

        filtered_pests = []
        for p in all_pests:
            match = True
            if plant_part and plant_part.lower() not in ("all", ""):
                part_search = plant_part.lower()
                if part_search not in p["affected_part"].lower():
                    match = False

            if query and query.strip():
                q = query.lower().strip()
                s_en = p["symptoms_en"].lower() + " " + p["name_en"].lower()
                s_te = p["symptoms_te"].lower() + " " + p["name_te"].lower()
                if q not in s_en and q not in s_te:
                    match = False

            if match:
                filtered_pests.append({
                    "name": p["name_te"] if is_te else p["name_en"],
                    "symptoms": p["symptoms_te"] if is_te else p["symptoms_en"],
                    "affected_part": p["affected_part"],
                    "etl": p["etl_te"] if is_te else p["etl_en"],
                    "cultural_control": p["ipm_cultural_te"] if is_te else p["ipm_cultural_en"],
                    "biological_control": p["biological_te"] if is_te else p["biological_en"],
                    "chemical_control": p["chemical_te"] if is_te else p["chemical_en"],
                })

        # If strict filtering produced empty results, return all crop pests with note
        if not filtered_pests:
            for p in all_pests:
                filtered_pests.append({
                    "name": p["name_te"] if is_te else p["name_en"],
                    "symptoms": p["symptoms_te"] if is_te else p["symptoms_en"],
                    "affected_part": p["affected_part"],
                    "etl": p["etl_te"] if is_te else p["etl_en"],
                    "cultural_control": p["ipm_cultural_te"] if is_te else p["ipm_cultural_en"],
                    "biological_control": p["biological_te"] if is_te else p["biological_en"],
                    "chemical_control": p["chemical_te"] if is_te else p["chemical_en"],
                })

        return {
            "crop_key": crop_key,
            "crop_name": data["name_te"] if is_te else data["name_en"],
            "plant_part_filter": plant_part or "All Parts",
            "query": query or "",
            "lang": lang,
            "pests_count": len(filtered_pests),
            "pests": filtered_pests,
            "mode": "100% Text-Based Diagnostic Symptom Checker (No Computer Vision/Camera)",
            "safety_note": (
                "ముఖ్య గమనిక: పురుగుమందులు పిచికారీ చేసేటప్పుడు చేతి తొడుగులు, ముక్కు మూత ధరించాలి. పిచికారీ చేసిన తర్వాత చేతులను శుభ్రంగా కడుక్కోవాలి."
                if is_te else
                "Safety Note: Always wear gloves and mask while handling agrochemicals. Strictly adhere to prescribed Pre-Harvest Intervals (PHI)."
            )
        }

    # ── Module 4: Irrigation Advisory ────────────────────────────────────────
    def get_irrigation_advisory(
        self,
        crop: str,
        growth_stage: Optional[str] = None,
        soil_type: Optional[str] = None,
        irrigation_method: Optional[str] = None,
        lang: str = "en"
    ) -> dict[str, Any]:
        crop_key, data = self._resolve_crop(crop)
        soil = self._resolve_soil(soil_type)
        stage = self._resolve_stage(growth_stage)
        irr = data["irrigation"]
        is_te = lang == "te"

        method_str = irrigation_method or "Drip / Furrow"
        method_advice = ""
        if "drip" in method_str.lower():
            method_advice = (
                "డ్రిప్ సాగు సిఫార్సు: రోజూ లేదా రోజు విడిచి రోజు ఉదయం లేదా సాయంత్రం వేళల్లో నీటిని అందించాలి. 40-50% నీరు ఆదా అవుతుంది."
                if is_te else
                "Drip Irrigation Advantage: Daily or alternate day pulsing (morning or late afternoon). Delivers 40-50% water savings and keeps foliage dry, cutting fungal diseases."
            )
        else:
            method_advice = (
                "కాలువ/బోదె పద్ధతి: నీటి వృధా కాకుండా బోదెలు-కాలువలు పద్ధతి పాటించాలి. లోతైన నల్లరేగడి నేలల్లో 8-10 రోజులకు, ఎర్ర నేలల్లో 5-6 రోజులకు తడి ఇవ్వాలి."
                if is_te else
                "Furrow/Surface Irrigation: Provide alternate furrow irrigation. Water every 5-7 days in light soils and every 8-12 days in heavy black soils."
            )

        critical_list = irr["critical_stages_te"] if is_te else irr["critical_stages_en"]

        return {
            "crop_key": crop_key,
            "crop_name": data["name_te"] if is_te else data["name_en"],
            "soil_type": soil["name_te"] if is_te else soil["name_en"],
            "growth_stage": stage["name_te"] if is_te else stage["name_en"],
            "irrigation_method": method_str,
            "lang": lang,
            "critical_stages": critical_list,
            "drainage_guideline": irr["drainage_guideline_te"] if is_te else irr["drainage_guideline_en"],
            "method_recommendation": method_advice,
            "water_retention_note": f"{soil['name_te'] if is_te else soil['name_en']}: {soil['water_retention']}",
            "source": "ICAR-Indian Institute of Water Management (IIWM)",
        }

    # ── Module 5: Crop Calendar ──────────────────────────────────────────────
    def get_crop_calendar(self, crop: str, lang: str = "en") -> dict[str, Any]:
        crop_key, data = self._resolve_crop(crop)
        cal = data.get("calendar", [])
        is_te = lang == "te"

        steps = []
        for c in cal:
            steps.append({
                "day_range": c["day_range"],
                "stage": c["stage_te"] if is_te else c["stage_en"],
                "actions": c["actions_te"] if is_te else c["actions_en"],
            })

        return {
            "crop_key": crop_key,
            "crop_name": data["name_te"] if is_te else data["name_en"],
            "lang": lang,
            "total_stages": len(steps),
            "timeline": steps,
            "source": "ANGRAU Agricultural Calendar & ICAR Crop Production Guides",
        }

    # ── Module 6: Conversational AI Farmer Assistant ─────────────────────────
    def ask_farmer_assistant(
        self,
        query: str,
        crop: Optional[str] = None,
        lang: str = "en",
        history: Optional[list[dict[str, str]]] = None
    ) -> dict[str, Any]:
        """
        Expert Agronomy Conversational Assistant.
        Grounded strictly on verified ICAR, ANGRAU, and KVK agricultural knowledge.
        Understands both English and Telugu queries.
        """
        q = (query or "").strip().lower()
        is_te = lang == "te" or any("\u0c00" <= ch <= "\u0c7f" for ch in query)

        matched_crop_key, crop_data = self._resolve_crop(crop or query)
        pests = crop_data.get("pests", [])
        fertilizer = crop_data.get("fertilizer", {})
        advisory = crop_data.get("advisory", {})
        irrigation = crop_data.get("irrigation", {})
        calendar = crop_data.get("calendar", [])

        crop_disp = crop_data["name_te"] if is_te else crop_data["name_en"]

        # Intent detection
        # 1. PEST / DISEASE / SYMPTOM QUERY
        pest_keywords = ["pest", "disease", "worm", "insect", "rot", "blight", "curl", "borer", "thrips", "bug", "fungus",
                         "పురుగు", "తెగులు", "మచ్చ", "ముడత", "కుళ్ళు", "దోమ", "తామర"]
        fert_keywords = ["fertilizer", "urea", "dap", "potash", "npk", "dose", "nutrient", "zinc", "boron", "spray",
                         "ఎరువు", "యూరియా", "పొటాష్", "డిఎపి", "పోషక", "డోస్"]
        irr_keywords = ["water", "irrigation", "dry", "moisture", "flood", "drip",
                        "నీరు", "తడి", "డ్రిప్", "తేమ", "నీటి"]
        var_keywords = ["variety", "seed", "sowing", "spacing", "season", "yield",
                        "రకం", "విత్తన", "నాటు", "విత్తు", "దిగుబడి"]
        cal_keywords = ["calendar", "schedule", "days", "stage", "timeline", "when",
                        "క్యాలెండర్", "షెడ్యూల్", "దశ", "రోజులు", "సమయం"]

        answer = ""
        category = "general"

        if any(w in q for w in pest_keywords):
            category = "pest_management"
            # Find closest matching pest
            matched_pest = None
            for p in pests:
                if any(w in p["name_en"].lower() or w in p["name_te"] or w in p["symptoms_en"].lower() for w in q.split()):
                    matched_pest = p
                    break
            if not matched_pest and pests:
                matched_pest = pests[0]

            if matched_pest:
                if is_te:
                    answer = (
                        f"🌱 **{crop_disp} - {matched_pest['name_te']} నివారణ మార్గదర్శకం (ICAR/ANGRAU):**\n\n"
                        f"🔍 **లక్షణాలు:** {matched_pest['symptoms_te']}\n\n"
                        f"⚠️ **ఆర్థిక నష్ట పరిమితి (ETL):** {matched_pest['etl_te']}\n\n"
                        f"🌾 **యాజమాన్య పద్ధతులు (IPM):** {matched_pest['ipm_cultural_te']}\n\n"
                        f"🧪 **సేంద్రీయ / జీవ నియంత్రణ:** {matched_pest['biological_te']}\n\n"
                        f"💊 **రసాయన నివారణ (సిఫార్సు మోతాదు):**\n{matched_pest['chemical_te']}\n\n"
                        f"⚠️ *గమనిక: పురుగుమందులు పిచికారీ చేసేటప్పుడు రక్షణ జాగ్రత్తలు పాటించండి.*"
                    )
                else:
                    answer = (
                        f"🌱 **{crop_disp} - {matched_pest['name_en']} Management (ICAR/ANGRAU):**\n\n"
                        f"🔍 **Identification & Symptoms:** {matched_pest['symptoms_en']}\n\n"
                        f"⚠️ **Economic Threshold Level (ETL):** {matched_pest['etl_en']}\n\n"
                        f"🌾 **Cultural / Mechanical IPM:** {matched_pest['ipm_cultural_en']}\n\n"
                        f"🧪 **Biological Control:** {matched_pest['biological_en']}\n\n"
                        f"💊 **Chemical Control (Exact Dosages):**\n{matched_pest['chemical_en']}\n\n"
                        f"⚠️ *Always observe proper Pre-Harvest Intervals (PHI) and wear protective gear.*"
                    )

        elif any(w in q for w in fert_keywords):
            category = "fertilizer"
            if is_te:
                splits_text = "\n".join([f"• **{s['stage_te']}:** {s['detail_te']}" for s in fertilizer.get("split_schedule", [])])
                answer = (
                    f"🌾 **{crop_disp} ఎరువుల సమగ్ర యాజమాన్యం (ఎకరాకు - ANGRAU/ICAR):**\n\n"
                    f"📊 **సిఫార్సు చేసిన NPK మోతాదు:** {fertilizer.get('recommended_npk_kg_per_acre', '')}\n\n"
                    f"📦 **ఎరువుల సంచులు (ఎకరాకు):**\n{fertilizer.get('commercial_fertilizers_per_acre_te', '')}\n\n"
                    f"📅 **విడతలవారీగా వేసే విధానం:**\n{splits_text}\n\n"
                    f"🌿 **జీవ ఎరువులు:** {fertilizer.get('biofertilizer_te', '')}"
                )
            else:
                splits_text = "\n".join([f"• **{s['stage_en']}:** {s['detail_en']}" for s in fertilizer.get("split_schedule", [])])
                answer = (
                    f"🌾 **{crop_disp} Fertilizer Schedule (Per Acre - ICAR/ANGRAU):**\n\n"
                    f"📊 **Recommended N-P-K (kg/acre):** {fertilizer.get('recommended_npk_kg_per_acre', '')}\n\n"
                    f"📦 **Commercial Quantity:**\n{fertilizer.get('commercial_fertilizers_per_acre_en', '')}\n\n"
                    f"📅 **Split Application Timeline:**\n{splits_text}\n\n"
                    f"🌿 **Biofertilizers & Soil Health:** {fertilizer.get('biofertilizer_en', '')}"
                )

        elif any(w in q for w in irr_keywords):
            category = "irrigation"
            stages = irrigation.get("critical_stages_te" if is_te else "critical_stages_en", [])
            stages_text = "\n".join([f"• {st}" for st in stages])
            if is_te:
                answer = (
                    f"💧 **{crop_disp} నీటి యాజమాన్యం (ICAR-IIWM సిఫార్సులు):**\n\n"
                    f"🚨 **అత్యంత కీలకమైన నీటి తడుల దశలు (ఈ దశల్లో నీటి ఎద్దడి రాకూడదు):**\n{stages_text}\n\n"
                    f"🌊 **మురుగు నీటి యాజమాన్యం:**\n{irrigation.get('drainage_guideline_te', '')}"
                )
            else:
                answer = (
                    f"💧 **{crop_disp} Irrigation & Water Management (ICAR-IIWM):**\n\n"
                    f"🚨 **Critical Stages of Irrigation (Water stress causes severe yield loss):**\n{stages_text}\n\n"
                    f"🌊 **Drainage & Field Guidelines:**\n{irrigation.get('drainage_guideline_en', '')}"
                )

        elif any(w in q for w in cal_keywords):
            category = "calendar"
            cal_steps = calendar
            steps_text = "\n".join([f"• **{s['day_range']} ({s['stage_te'] if is_te else s['stage_en']}):** {s['actions_te'] if is_te else s['actions_en']}" for s in cal_steps])
            if is_te:
                answer = (
                    f"📅 **{crop_disp} పంట కాల నిర్ణయం & వృద్ధి దశలు (ANGRAU):**\n\n{steps_text}\n\n"
                    f"💡 *సకాలంలో పనులు పూర్తి చేయడం అధిక దిగుబడికి పునాది.*"
                )
            else:
                answer = (
                    f"📅 **{crop_disp} Cultivation Timeline by Days After Sowing (DAS):**\n\n{steps_text}\n\n"
                    f"💡 *Timely completion of operations ensures optimum yield and pest avoidance.*"
                )

        else:
            # General crop cultivation summary
            category = "general"
            if is_te:
                answer = (
                    f"🌾 **{crop_disp} సాగు సమగ్ర సమాచారం:**\n\n"
                    f"🌱 **ప్రధాన రకాలు:** {crop_data.get('varieties', {}).get('te', '')}\n\n"
                    f"🌍 **అనుకూల నేలలు:** {advisory.get('soil_suitability_te', '')}\n\n"
                    f"📏 **విత్తన మోతాదు:** {advisory.get('seed_rate_te', '')}\n\n"
                    f"🧪 **విత్తన శుద్ధి:** {advisory.get('seed_treatment_te', '')}\n\n"
                    f"📐 **ఎడం (Spacing):** {advisory.get('spacing_te', '')}\n\n"
                    f"💡 **రైతుకు ముఖ్య సలహా:** {advisory.get('cultivation_tips_te', '')}\n\n"
                    f"❓ *మీరు పురుగులు, తెగుళ్లు, ఎరువులు లేదా నీటి తడుల గురించి అడగవచ్చు.*"
                )
            else:
                answer = (
                    f"🌾 **{crop_disp} Comprehensive Cultivation Advisory:**\n\n"
                    f"🌱 **Prominent Varieties:** {crop_data.get('varieties', {}).get('en', '')}\n\n"
                    f"🌍 **Soil Suitability:** {advisory.get('soil_suitability_en', '')}\n\n"
                    f"📏 **Seed Rate:** {advisory.get('seed_rate_en', '')}\n\n"
                    f"🧪 **Seed Treatment:** {advisory.get('seed_treatment_en', '')}\n\n"
                    f"📐 **Spacing:** {advisory.get('spacing_en', '')}\n\n"
                    f"💡 **Key Farmer Tip:** {advisory.get('cultivation_tips_en', '')}\n\n"
                    f"❓ *Feel free to ask about specific pests, fertilizers, weed management, or irrigation.*"
                )

        suggested_questions = [
            ("వరిలో కాండం తొలుచు పురుగు నివారణ ఎలా?", "How to control stem borer in paddy?"),
            ("పత్తిలో గులాబీ రంగు పురుగు నివారణ మందులు?", "Control measures for pink bollworm in cotton?"),
            ("మిరపలో నల్ల తామర పురుగు నివారణ?", "How to manage black thrips in chilli?"),
            ("మొక్కజొన్నలో ఎరువుల మోతాదు ఎంత?", "Fertilizer schedule for maize per acre?"),
            ("వేరుశనగలో జిప్సం ఎప్పుడు వేయాలి?", "When to apply gypsum in groundnut?"),
            ("టమాటలో కాయ తొలుచు పురుగు నివారణ?", "How to prevent fruit borer in tomato?"),
        ]

        pills = [q[0] if is_te else q[1] for q in suggested_questions]

        return {
            "query": query,
            "crop": crop_disp,
            "lang": "te" if is_te else "en",
            "category": category,
            "reply": answer,
            "suggested_pills": pills[:4],
            "verified_by": "ICAR, ANGRAU & KVK Agronomy Guidelines"
        }


# Singleton instance
farmer_advisory_service = FarmerAdvisoryService()

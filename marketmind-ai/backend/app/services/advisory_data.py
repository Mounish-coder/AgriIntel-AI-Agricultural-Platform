"""
Verified Agricultural Knowledge Base.
Sourced from:
- ICAR (Indian Council of Agricultural Research) Packages of Practices
- ANGRAU (Acharya N.G. Ranga Agricultural University) Vyavasaya Panchangam
- PJTSAU (Professor Jayashankar Telangana State Agricultural University)
- KVK (Krishi Vigyan Kendra) field advisories
- TNAU Agritech Portal

Fully bilingual: English (en) and Telugu (te).
Strictly text-based: No image or computer vision dependencies.
"""
from typing import Any

SOIL_TYPES = [
    {"id": "black_clay", "name_en": "Black Clay / Regur Soil", "name_te": "నల్లరేగడి నేలలు", "water_retention": "High (10-14 days)", "characteristics_en": "High clay content, swells when wet, cracks when dry. Rich in Calcium, Potassium, Magnesium, poor in Nitrogen and Phosphorus.", "characteristics_te": "తేమను ఎక్కువ కాలం నిలుపుకునే గుణం ఉంది. కాల్షియం, పొటాషియం పుష్కలంగా ఉంటాయి, నత్రజని, భాస్వరం తక్కువగా ఉంటాయి."},
    {"id": "red_sandy_loam", "name_en": "Red Sandy Loam / Chalky Soil", "name_te": "ఎర్ర నేలలు / చెల్క నేలలు", "water_retention": "Medium-Low (5-7 days)", "characteristics_en": "Well-drained, light texture, prone to leaching. Slightly acidic to neutral. High Iron oxide.", "characteristics_te": "నీరు త్వరగా ఇంకిపోయే గుణం. తేలికపాటి నేలలు. సేంద్రీయ పదార్థం తక్కువగా ఉంటుంది. 5-7 రోజులకు ఒకసారి నీటి తడి అవసరం."},
    {"id": "alluvial", "name_en": "Alluvial Loam", "name_te": "ఒండ్రు నేలలు", "water_retention": "High-Medium (7-10 days)", "characteristics_en": "Highly fertile, formed by river deposits. Balanced texture, suitable for most crops.", "characteristics_te": "అత్యంత సారవంతమైన నేలలు. దాదాపు అన్ని రకాల పంటలకు అనుకూలం."},
    {"id": "clay_loam", "name_en": "Clay Loam", "name_te": "బంకమట్టి నేలలు", "water_retention": "High (8-12 days)", "characteristics_en": "Good nutrient retention, suitable for wetland rice and deep-rooted commercial crops.", "characteristics_te": "సారవంతమైనది, వరి మరియు వాణిజ్య పంటలకు చాలా అనుకూలమైనది."},
    {"id": "sandy_soil", "name_en": "Light Sandy Soil", "name_te": "ఇసుక నేలలు", "water_retention": "Low (3-5 days)", "characteristics_en": "Low fertility and low water holding. Frequent light irrigations and split fertilizer applications required.", "characteristics_te": "తేమ నిల్వ సామర్థ్యం చాలా తక్కువ. తరచూ తేలికపాటి నీటి తడులు, తక్కువ మోతాదులో విడతలవారీగా ఎరువులు వేయాలి."},
]

GROWTH_STAGES = [
    {"id": "seedling", "name_en": "Sowing & Seedling Stage (0–20 DAS)", "name_te": "విత్తన మొలక / నారు దశ (0-20 రోజులు)"},
    {"id": "vegetative", "name_en": "Active Vegetative Growth (20–45 DAS)", "name_te": "శాకీయ ఎదుగుదల దశ (20-45 రోజులు)"},
    {"id": "flowering", "name_en": "Flowering & Panicle/Square Initiation (45–75 DAS)", "name_te": "పూత మరియు అంకురం దశ (45-75 రోజులు)"},
    {"id": "fruit_pod", "name_en": "Fruit / Pod / Grain Development (75–105 DAS)", "name_te": "గింజ / కాయ / కాయ ఊరే దశ (75-105 రోజులు)"},
    {"id": "maturity", "name_en": "Maturity & Harvesting (105+ DAS)", "name_te": "పక్వత మరియు కోత దశ (105+ రోజులు)"},
]

STATES = [
    "Andhra Pradesh", "Telangana", "Maharashtra", "Karnataka", "Tamil Nadu",
    "Uttar Pradesh", "Madhya Pradesh", "Gujarat", "Rajasthan", "Punjab", "Haryana", "Bihar", "West Bengal"
]

CROPS_DATA: dict[str, Any] = {
    "Paddy (Rice)": {
        "id": "paddy",
        "name_en": "Paddy (Rice)",
        "name_te": "వరి (Paddy / Rice)",
        "category": "Cereals",
        "varieties": {
            "en": "BPT 5204 (Samba Mahsuri), MTU 1010, MTU 1061 (Indra), RNR 15048 (Telangana Sona - Low GI), IR 64, Swarna (MTU 7029), NLR 34449.",
            "te": "బి.పి.టి 5204 (సాంబ మసూరి), ఎం.టి.యు 1010, ఎం.టి.యు 1061 (ఇంద్ర), ఆర్.ఎన్.ఆర్ 15048 (తెలంగాణ సోనా), ఐ.ఆర్ 64, స్వర్ణ (ఎం.టి.యు 7029), ఎన్.ఎల్.ఆర్ 34449."
        },
        "advisory": {
            "soil_suitability_en": "Clayey loams and alluvial soils with pH 5.5 to 7.0 that retain water are ideal.",
            "soil_suitability_te": "నీరు నిల్వ ఉండే బంకమట్టి మరియు ఒండ్రు నేలలు (pH 5.5 - 7.0) అత్యంత అనుకూలం.",
            "seed_rate_en": "Transplanting: 20-25 kg/acre; Direct seeded rice (DSR): 12-15 kg/acre; Drum seeder: 10-12 kg/acre.",
            "seed_rate_te": "నాటు పద్ధతి: ఎకరాకు 20-25 కిలోలు; వెదజల్లే పద్ధతి (DSR): 12-15 కిలోలు; డ్రమ్ సీడర్: 10-12 కిలోలు.",
            "seed_treatment_en": "Soak seed in Carbendazim 2g or Tricyclazole 1g per kg seed for 24 hours to prevent seed-borne blast. For bacterial leaf blight, treat with Streptocycline 100 mg per liter of water.",
            "seed_treatment_te": "కిలో విత్తనానికి కార్బండైజిమ్ 2 గ్రా. లేదా ట్రైసైక్లజోల్ 1 గ్రా. కలిపి 24 గంటలు నానబెట్టాలి. బాక్టీరియా ఆకు ఎండు తెగులు నివారణకు స్ట్రెప్టోసైక్లిన్ 100 మి.గ్రా. లీటరు నీటికి కలపాలి.",
            "spacing_en": "15 cm x 10 cm (66 hills/sq.m) for early duration; 20 cm x 15 cm (33 hills/sq.m) for medium/long duration varieties.",
            "spacing_te": "స్వల్పకాలిక రకాలకు: 15 సెం.మీ x 10 సెం.మీ; మధ్యస్థ, దీర్ఘకాలిక రకాలకు: 20 సెం.మీ x 15 సెం.మీ.",
            "cultivation_tips_en": "Form ally pathways (alleyways of 20 cm every 2 meters) to allow sunlight and reduce Brown Planthopper (BPH) buildup.",
            "cultivation_tips_te": "ఎలుకలు, సుడిదోమ ఉధృతి తగ్గించడానికి మరియు గాలి వెలుతురు కొరకు ప్రతి 2 మీటర్లకు 20 సెం.మీ పైరు బాటలు తీయాలి."
        },
        "fertilizer": {
            "recommended_npk_kg_per_acre": "N: 48–60 kg, P2O5: 24–30 kg, K2O: 24–30 kg",
            "commercial_fertilizers_per_acre_en": "Urea: 100–120 kg, DAP: 50–60 kg, MOP: 40–50 kg, Zinc Sulphate (21%): 20 kg (basal every 3 seasons).",
            "commercial_fertilizers_per_acre_te": "యూరియా: 100–120 కిలోలు, డి.ఎ.పి: 50–60 కిలోలు, ఎం.ఓ.పి (పొటాష్): 40–50 కిలోలు, జింక్ సల్ఫేట్: 20 కిలోలు (ఆఖరి దుక్కిలో).",
            "split_schedule": [
                {"stage_en": "Basal Application (Final Puddling)", "stage_te": "ఆఖరి దుక్కిలో (బాసల్ డోస్)", "detail_en": "Full dose of DAP (50 kg) + 1/3rd MOP (15 kg) + 1/4th Urea (25 kg) + 20 kg Zinc Sulphate. Do not mix Zinc with DAP.", "detail_te": "మొత్తం DAP (50 కిలోలు) + 15 కిలోల పొటాష్ + 25 కిలోల యూరియా + 20 కిలోల జింక్ సల్ఫేట్. జింక్ మరియు డి.ఎ.పి ఎప్పుడూ కలిపి వేయకూడదు."},
                {"stage_en": "Active Tillering (20-25 DAS)", "stage_te": "పిలకల దశ (20-25 రోజులు)", "detail_en": "Apply 1/3rd Urea (35-40 kg) after weeding. Maintain shallow water.", "detail_te": "కలుపు తీసిన తర్వాత 35-40 కిలోల యూరియా వేయాలి. పొలంలో పలుచగా నీరుండాలి."},
                {"stage_en": "Panicle Initiation (40-45 DAS)", "stage_te": "చిరుపొట్ట / అంకురం దశ (40-45 రోజులు)", "detail_en": "Apply remaining Urea (35 kg) + remaining MOP (25 kg). Critical for grain number and weight.", "detail_te": "మిగిలిన యూరియా (35 కిలోలు) + మిగిలిన పొటాష్ (25 కిలోలు) వేయాలి. గింజల సంఖ్య, బరువు పెరగడానికి ఇది ముఖ్యం."},
                {"stage_en": "Heading / Grain Filling", "stage_te": "ఈనె దశ / గింజ పాలుపోసుకునే దశ", "detail_en": "If nitrogen deficiency appears, foliar spray 13-0-45 (Multi-K) @ 10 g/L or 2% Urea solution.", "detail_te": "ఆకులు పసుపు రంగుకు మారితే 13-0-45 ఎరువును లీటరు నీటికి 10 గ్రాములు లేదా 2% యూరియా ద్రావణాన్ని పిచికారీ చేయాలి."}
            ],
            "biofertilizer_en": "Apply Azospirillum and Phosphobacteria (PSB) @ 2 kg/acre mixed with 100 kg FYM before transplanting.",
            "biofertilizer_te": "ఎకరాకు 2 కిలోల అజోస్పైరిల్లమ్ మరియు 2 కిలోల పి.ఎస్.బి లను 100 కిలోల పశువుల ఎరువుతో కలిపి నాటుకు ముందు వేయాలి."
        },
        "irrigation": {
            "critical_stages_en": [
                "Transplanting & Establishment (first 7-10 days: 2-3 cm shallow water)",
                "Tillering stage (20-35 DAS: 2-3 cm water)",
                "Panicle initiation (40-55 DAS: 3-5 cm water - MOST CRITICAL)",
                "Flowering & Milk stage (60-80 DAS: continuous shallow moisture)"
            ],
            "critical_stages_te": [
                "నాట్లు నాటిన తర్వాత మొదటి 10 రోజులు (2-3 సెం.మీ పలుచటి నీరు)",
                "పిలకలు వేసే దశ (20-35 రోజులు - పలుచని తడి)",
                "చిరుపొట్ట / అంకురం దశ (40-55 రోజులు - అత్యంత కీలకమైన దశ)",
                "పూత మరియు పాలుపోసుకునే దశ (60-80 రోజులు - తేమ తగ్గకూడదు)"
            ],
            "drainage_guideline_en": "Adopt Alternate Wetting and Drying (AWD) to save 25-30% water and reduce methane emissions. Drain field completely 10-12 days before harvest.",
            "drainage_guideline_te": "ఆరుతడి (Alternate Wetting and Drying) విధానం పాటిస్తే 25-30% నీరు ఆదా అవుతుంది. కోతకు 10-12 రోజుల ముందు పొలంలో నీటిని పూర్తిగా తీసివేయాలి."
        },
        "pests": [
            {
                "name_en": "Yellow Stem Borer",
                "name_te": "కాండం తొలుచు పురుగు (Stem Borer)",
                "symptoms_en": "Central shoot dries up causing 'Dead Heart' during vegetative stage, or empty whitish panicles called 'White Ears' at reproductive stage.",
                "symptoms_te": "మొలక/పిలక దశలో మొవ్వు ఎండిపోయి 'చచ్చిన మొవ్వు' ఏర్పడుతుంది. ఈనిన తర్వాత గింజలు లేకుండా తెల్లటి వెన్నులు (తెల్లకంకులు) కనిపిస్తాయి.",
                "affected_part": "Stem / Shoot",
                "etl_en": "2 egg masses/sq.m or 5% dead heart in vegetative stage, 1 moth/sq.m at heading.",
                "etl_te": "చదరపు మీటరుకు 2 గుడ్ల గుంపులు లేదా 5% చచ్చిన మొవ్వులు.",
                "ipm_cultural_en": "Clip seedling tips before transplanting to destroy egg masses. Install 4 pheromone traps/acre.",
                "ipm_cultural_te": "నాటేటప్పుడు నారు కొసలను తుంచి వేయాలి (గుడ్లు నశిస్తాయి). ఎకరాకు 4 లింగాకర్షక బుట్టలు అమర్చాలి.",
                "biological_en": "Release Trichogramma japonicum egg parasitoid @ 40,000/acre at weekly intervals.",
                "biological_te": "ట్రైకోగ్రామా జపోనికమ్ గుడ్డు పరాన్నజీవులను ఎకరాకు 40,000 చొప్పున వారం వ్యవధిలో వదలాలి.",
                "chemical_en": "Chlorantraniliprole 0.4% G (Ferterra) @ 4 kg/acre in standing water OR spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L (60 ml/acre) OR Cartap Hydrochloride 50% SP @ 2 g/L.",
                "chemical_te": "క్లోరంత్రానిలిప్రోల్ 0.4% జి (ఫెర్టెర్రా) ఎకరాకు 4 కిలోలు ఇసుకలో కలిపి చల్లాలి లేదా క్లోరంత్రానిలిప్రోల్ 18.5% SC 0.3 మి.లీ లీటరు నీటికి (ఎకరాకు 60 మి.లీ) లేదా కార్టాప్ హైడ్రోక్లోరైడ్ 50% SP 2 గ్రా./లీటరు పిచికారీ చేయాలి."
            },
            {
                "name_en": "Brown Planthopper (BPH)",
                "name_te": "సుడిదోమ (Brown Planthopper - BPH)",
                "symptoms_en": "Circular patches of dry, burnt-looking plants known as 'Hopper Burn' starting from base. Nymphs and brown adults congregated at base of tillers above water line.",
                "symptoms_te": "పైరు మొదళ్ళ వద్ద వలయాకారంలో ఎండిపోయి 'సుడి' పడినట్లు కనిపిస్తుంది (హాపర్ బర్న్). నీటి మట్టానికి పైనున్న మొదళ్ల వద్ద గోధుమ రంగు పురుగులు గుంపులుగా ఉంటాయి.",
                "affected_part": "Stem Base / Leaves",
                "etl_en": "10-15 hoppers per hill during vegetative stage; 20-25 hoppers per hill after heading.",
                "etl_te": "పిలక దశలో దుబ్బుకు 10-15 దోమలు; ఈనే దశలో దుబ్బుకు 20-25 దోమలు.",
                "ipm_cultural_en": "Form alleyways (20 cm gap every 2 m). Avoid excessive nitrogen. Drain standing water for 3-4 days.",
                "ipm_cultural_te": "ప్రతి 2 మీటర్లకు బాటలు తీయాలి. నత్రజని అధికంగా వేయరాదు. పొలంలోని నీటిని 3-4 రోజులు పూర్తిగా తీసి ఆరబెట్టాలి.",
                "biological_en": "Conserve spiders and mirid bugs. Spray Neem oil (Azadirachtin 10,000 ppm) @ 2 ml/L at initial stage.",
                "biological_te": "సాలీళ్ళు, మిరిడ్ నల్లులను సంరక్షించాలి. ప్రారంభ దశలో వేప నూనె (10,000 ppm) లీటరుకు 2 మి.లీ పిచికారీ చేయాలి.",
                "chemical_en": "Spray directed at the BASE of plants: Pymetrozine 50% WDG @ 0.6 g/L (120 g/acre) OR Triflumuron 40% + Dinotefuran @ 0.5 g/L OR Dinotefuran 20% SG @ 0.4 g/L (80 g/acre).",
                "chemical_te": "మందును పిలకల మొదళ్ళపై పడేలా పిచికారీ చేయాలి: పైమెట్రోజైన్ 50% WDG 0.6 గ్రా./లీ (ఎకరాకు 120 గ్రా.) లేదా డైనోటెఫ్యూరాన్ 20% SG 0.4 గ్రా./లీ (ఎకరాకు 80 గ్రా.)."
            },
            {
                "name_en": "Rice Blast (Pyricularia oryzae)",
                "name_te": "అగ్గితెగులు (Rice Blast)",
                "symptoms_en": "Spindle-shaped elliptical spots on leaves with brown/reddish margin and grey-white center. Neck rot causes blackening of panicle node causing panicles to fall over.",
                "symptoms_te": "ఆకులపై నూలు కండె ఆకారపు మచ్చలు ఏర్పడి, మచ్చ అంచులు ముదురు గోధుమ రంగులో, మధ్య భాగం బూడిద రంగులో ఉంటాయి. మెడ విరుపు తెగులు వల్ల వెన్ను మొదలు నల్లబడి విరిగిపోతుంది.",
                "affected_part": "Leaves / Panicle Neck",
                "etl_en": "2-5% leaf area affected or initiation of neck blast lesions.",
                "etl_te": "ఆకులపై 2-5% మచ్చలు లేదా మెడపై మచ్చలు కనిపించిన వెంటనే.",
                "ipm_cultural_en": "Avoid excess urea top-dressing. Grow resistant varieties like RNR 15048 or MTU 1061.",
                "ipm_cultural_te": "యూరియా మోతాదు మించరాదు. తెగులును తట్టుకునే ఆర్.ఎన్.ఆర్ 15048 లేదా ఎం.టి.యు 1061 రకాలను ఎంచుకోవాలి.",
                "biological_en": "Seed treatment with Pseudomonas fluorescens @ 10 g/kg seed.",
                "biological_te": "సూడోమోనాస్ ఫ్లోరోసెన్స్ 10 గ్రా./కిలో విత్తనానికి పట్టించి విత్తుకోవాలి.",
                "chemical_en": "Spray Tricyclazole 75% WP @ 0.6 g/L (120 g/acre) OR Isoprothiolane 40% EC @ 1.5 ml/L OR Kasugamycin 3% SL @ 2.5 ml/L.",
                "chemical_te": "ట్రైసైక్లజోల్ 75% WP 0.6 గ్రా./లీటరు (ఎకరాకు 120 గ్రా.) లేదా ఐసోప్రోథియోలేన్ 40% EC 1.5 మి.లీ/లీ లేదా కాసుగామైసిన్ 3% SL 2.5 మి.లీ/లీ పిచికారీ చేయాలి."
            }
        ],
        "calendar": [
            {"day_range": "DAS 0–25", "stage_en": "Nursery Preparation & Sowing", "stage_te": "నారుమడి యాజమాన్యం మరియు విత్తడం", "actions_en": "Seed treatment with Tricyclazole; nursery raised bed prep; nursery weeding at 10 DAS; pull seedlings at 25 DAS.", "actions_te": "విత్తన శుద్ధి; ఎత్తైన నారుమడి తయారీ; 10వ రోజు కలుపు మందు; 25వ రోజు నారు నాటడానికి సిద్ధం చేయాలి."},
            {"day_range": "DAS 25–45", "stage_en": "Transplanting & Early Vegetative", "stage_te": "నాట్లు వేయడం & ప్రారంభ దశ", "actions_en": "Transplant 2-3 seedlings/hill; apply basal DAP + MOP; apply pre-emergence herbicide Pretilachlor within 3-5 days.", "actions_te": "దుబ్బుకు 2-3 నారు మొక్కలు నాటాలి; ఆఖరి దుక్కిలో DAP+పొటాష్ వేయాలి; నాటిన 3-5 రోజుల్లో ప్రిటిలాక్లోర్ కలుపు మందు చల్లాలి."},
            {"day_range": "DAS 45–70", "stage_en": "Maximum Tillering to Panicle Initiation", "stage_te": "అధిక పిలకల నుండి అంకురం దశ", "actions_en": "Top dress Urea + MOP at 45 DAS; maintain 2-3 cm water; monitor for stem borer and blast; remove alleyways.", "actions_te": "45వ రోజు యూరియా + పొటాష్ వేయాలి; 2-3 సెం.మీ నీటి మట్టం ఉంచాలి; కాండం తొలుచు పురుగు, అగ్గితెగులు గమనించాలి."},
            {"day_range": "DAS 70–95", "stage_en": "Flowering & Grain Filling", "stage_te": "పూత & గింజ పాలుపోసుకునే దశ", "actions_en": "Maintain consistent moisture; spray multi-K 13-0-45 if flag leaves pale; watch for BPH at plant base.", "actions_te": "తేమ తగ్గకుండా చూడాలి; ఆకులు పాలిపోతే 13-0-45 పిచికారీ చేయాలి; మొదళ్లలో సుడిదోమ ఉధృతిని గమనించాలి."},
            {"day_range": "DAS 95–125", "stage_en": "Maturity & Harvesting", "stage_te": "పక్వత & పంట కోత దశ", "actions_en": "Stop irrigation 10-12 days before harvest; harvest when 85% grains turn golden yellow; dry grains to 12-14% moisture before storage.", "actions_te": "కోతకు 10-12 రోజుల ముందు నీరు నిలిపివేయాలి; 85% గింజలు బంగారు రంగుకు మారినప్పుడు కోయాలి; 12-14% తేమ వచ్చే వరకు ఆరబెట్టాలి."}
        ]
    },

    "Cotton": {
        "id": "cotton",
        "name_en": "Cotton",
        "name_te": "పత్తి (Cotton)",
        "category": "Commercial",
        "varieties": {
            "en": "Bt Cotton hybrids (Bollgard II approved), Jaadoo, First Class, RCH 659, Bunny Bt, Mallika.",
            "te": "బిటి కాటన్ హైబ్రిడ్లు (బాల్‌గార్డ్ II), జాదూ, ఫస్ట్ క్లాస్, ఆర్.సి.హెచ్ 659, బన్నీ బిటి, మల్లిక."
        },
        "advisory": {
            "soil_suitability_en": "Deep black cotton soils (Vertisols) with good drainage and depth >90 cm are best.",
            "soil_suitability_te": "లోతైన నల్లరేగడి నేలలు (>90 సెం.మీ లోతు) మరియు మంచి నీటి పారుదల గల నేలలు శ్రేష్టం.",
            "seed_rate_en": "Bt Cotton: 850–900 g per acre (2 packets of 450g each including non-Bt refuge).",
            "seed_rate_te": "బిటి పత్తి: ఎకరాకు 2 ప్యాకెట్లు (సుమారు 900 గ్రాములు, రిఫ్యూజ్ విత్తనాలతో సహా).",
            "seed_treatment_en": "Seeds are generally pre-treated. If non-treated, treat with Imidacloprid 70 WS @ 5 g/kg seed against sucking pests.",
            "seed_treatment_te": "సాధారణంగా కంపెనీ విత్తనాలు శుద్ధి చేసి ఉంటాయి. లేనిచో ఇమిడాక్లోప్రిడ్ 70 WS 5 గ్రా./కిలో విత్తనానికి కలపాలి.",
            "spacing_en": "90 cm x 60 cm (7,400 plants/acre) or 120 cm x 45 cm for rich black soils; 90 cm x 45 cm for red chalka soils.",
            "spacing_te": "నల్లరేగడి నేలల్లో: 90 సెం.మీ x 60 సెం.మీ లేదా 120 x 45 సెం.మీ; ఎర్ర నేలల్లో: 90 సెం.మీ x 45 సెం.మీ.",
            "cultivation_tips_en": "Sow refuge non-Bt seeds in 5 boundary rows around the field to delay bollworm resistance.",
            "cultivation_tips_te": "గులాబీ రంగు పురుగు నిరోధకతను నివారించడానికి పొలం చుట్టూ 5 వరుసల నాన్-బిటి (రిఫ్యూజ్) మొక్కలను నాటాలి."
        },
        "fertilizer": {
            "recommended_npk_kg_per_acre": "N: 48–60 kg, P2O5: 24 kg, K2O: 24 kg",
            "commercial_fertilizers_per_acre_en": "Urea: 110–130 kg, DAP: 50 kg, MOP: 40 kg, Magnesium Sulphate: 10 kg/acre at 45 DAS.",
            "commercial_fertilizers_per_acre_te": "యూరియా: 110–130 కిలోలు, డి.ఎ.పి: 50 కిలోలు, పొటాష్: 40 కిలోలు, మెగ్నీషియం సల్ఫేట్: 10 కిలోలు (45వ రోజు).",
            "split_schedule": [
                {"stage_en": "Basal Application", "stage_te": "ఆఖరి దుక్కిలో", "detail_en": "Apply entire DAP (50 kg) + 1/4th MOP (10 kg) in plough furrows.", "detail_te": "మొత్తం DAP (50 కిలోలు) + 10 కిలోల పొటాష్ ఆఖరి దుక్కిలో వేయాలి."},
                {"stage_en": "Square Formation (30-35 DAS)", "stage_te": "కాత/మొగ్గ దశ (30-35 రోజులు)", "detail_en": "Apply 1/3rd Urea (35 kg) + 10 kg MOP 7-10 cm away from plant base.", "detail_te": "మొక్క మొదలుకు 7-10 సెం.మీ దూరంలో 35 కిలోల యూరియా + 10 కిలోల పొటాష్ వేసి మట్టి ఎక్కించాలి."},
                {"stage_en": "Peak Flowering (60 DAS)", "stage_te": "పూత దశ (60 రోజులు)", "detail_en": "Apply 1/3rd Urea (40 kg) + 10 kg MOP + 10 kg Magnesium Sulphate.", "detail_te": "40 కిలోల యూరియా + 10 కిలోల పొటాష్ + 10 కిలోల మెగ్నీషియం సల్ఫేట్ వేయాలి."},
                {"stage_en": "Boll Development (80-90 DAS)", "stage_te": "కాయ పెరుగుదల దశ (80-90 రోజులు)", "detail_en": "Apply remaining Urea (35 kg) + remaining MOP (10 kg). Spray 1% Potassium Nitrate (13-0-45) + 0.1% Boron to prevent boll dropping.", "detail_te": "మిగిలిన యూరియా (35 కిలోలు) + 10 కిలోల పొటాష్ వేయాలి. కాయ రాలకుండా 13-0-45 (10 గ్రా./లీ) + బోరాన్ (1 గ్రా./లీ) పిచికారీ చేయాలి."}
            ],
            "biofertilizer_en": "Azospirillum and PSB @ 2 kg/acre each with FYM. Spray 19-19-19 @ 5 g/L during active growth.",
            "biofertilizer_te": "ఎకరాకు 2 కిలోల అజోస్పైరిల్లమ్, పి.ఎస్.బి వేయాలి. శాఖీయ దశలో 19-19-19 ను లీటరుకు 5 గ్రాములు పిచికారీ చేయాలి."
        },
        "irrigation": {
            "critical_stages_en": [
                "Square initiation (35-45 DAS)",
                "Peak flowering (60-70 DAS - HIGH WATER NEED)",
                "Boll development (80-110 DAS - prevent moisture stress to stop boll shedding)"
            ],
            "critical_stages_te": [
                "మొగ్గ ఏర్పడే దశ (35-45 రోజులు)",
                "పూత దశ (60-70 రోజులు - నీరు చాలా అవసరం)",
                "కాయ తయారయ్యే దశ (80-110 రోజులు - తేమ తగ్గితే కాయలు రాలిపోతాయి)"
            ],
            "drainage_guideline_en": "Cotton is extremely sensitive to waterlogging. Provide drainage furrows every 4-6 rows. Never allow water to stand for more than 24 hours.",
            "drainage_guideline_te": "పత్తి నీటి నిల్వను తట్టుకోలేదు. ప్రతి 4-6 వరుసలకు ఒక మురుగు కాలువ తీయాలి. 24 గంటలకు మించి నీరు నిలవ ఉండరాదు."
        },
        "pests": [
            {
                "name_en": "Pink Bollworm (Pectinophora gossypiella)",
                "name_te": "గులాబీ రంగు పురుగు (Pink Bollworm)",
                "symptoms_en": "'Rosetted flowers' (petals twisted and closed like a rosette). Premature boll opening with stained lint and bored seeds.",
                "symptoms_te": "విచ్చుకోని రోజెట్ పువ్వులు (ముడుచుకుపోయిన పూలు). కాయలపై రంధ్రాలు, లోపల గింజలు తినేసి దూది పాడైపోవడం, కాయలు ముందే పగలడం.",
                "affected_part": "Flowers & Bolls",
                "etl_en": "8 moths/trap/day for 3 consecutive days or 10% damaged flowers/bolls with larvae.",
                "etl_te": "వరుసగా 3 రోజులు ఎకరాకు బుట్టలో 8 రెక్కల పురుగులు లేదా 10% రోజెట్ పూలు/కాయలు దెబ్బతినడం.",
                "ipm_cultural_en": "Install 4-5 pheromone traps/acre from 45 DAS. Hand-pick and destroy rosetted flowers.",
                "ipm_cultural_te": "45వ రోజు నుంచి ఎకరాకు 4-5 లింగాకర్షక బుట్టలు పెట్టాలి. రోజెట్ పూలను చేత్తో ఏరి నాశనం చేయాలి.",
                "biological_en": "Release Trichogrammatoidea bactrae @ 40,000/acre. Spray NSKE 5% at early square stage.",
                "biological_te": "ట్రైకోగ్రామాటోయిడియా బాక్ట్రే ఎకరాకు 40,000 వదలాలి. మొగ్గ దశలో వేప గింజల కషాయం 5% పిచికారీ చేయాలి.",
                "chemical_en": "Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L (60 ml/acre) OR Emamectin Benzoate 5% SG @ 0.4 g/L (80 g/acre) OR Spinetoram 11.7% SC @ 0.8 ml/L.",
                "chemical_te": "క్లోరంత్రానిలిప్రోల్ 18.5% SC 0.3 మి.లీ/లీ (ఎకరాకు 60 మి.లీ) లేదా ఇమామెక్టిన్ బెంజోయేట్ 5% SG 0.4 గ్రా./లీ (ఎకరాకు 80 గ్రా.) లేదా స్పైనటోరం 11.7% SC 0.8 మి.లీ/లీ పిచికారీ చేయాలి."
            },
            {
                "name_en": "Sucking Pests (Aphids, Jassids, Thrips, Whiteflies)",
                "name_te": "రసం పీల్చే పురుగులు (తామర పురుగులు, పచ్చదోమ, తెల్లదోమ)",
                "symptoms_en": "Leaves curl upwards (thrips) or downwards (aphids/jassids). Yellow margins ('hopper burn') and honeydew sooty mold.",
                "symptoms_te": "ఆకులు పైకి ముడుచుకోవడం (తామర పురుగులు) లేదా కిందికి ముడుచుకోవడం (పేనుబంక/దోమ). ఆకుల అంచులు పసుపుగా మారి ఎండిపోవడం.",
                "affected_part": "Leaves & Tender Shoots",
                "etl_en": "Jassids: 1-2 nymphs/leaf; Whitefly: 6-8 adults/leaf.",
                "etl_te": "పచ్చదోమ: ఆకుకు 1-2 పిల్లలు; తెల్లదోమ: ఆకుకు 6-8 పెద్ద పురుగులు.",
                "ipm_cultural_en": "Set up 10 yellow and blue sticky traps per acre at canopy height.",
                "ipm_cultural_te": "ఎకరాకు 10 పసుపు, 10 నీలి రంగు జిగురు అట్టలను పైరు ఎత్తులో అమర్చాలి.",
                "biological_en": "Spray Neem oil 1500 ppm @ 5 ml/L. Conserve ladybird beetles and chrysoperla.",
                "biological_te": "వేప నూనె 1500 ppm 5 మి.లీ/లీ పిచికారీ చేయాలి. అక్షింతల పురుగులను సంరక్షించాలి.",
                "chemical_en": "Spray Flonicamid 50% WDG @ 0.3 g/L (60 g/acre) OR Diafenthiuron 50% WP @ 1.25 g/L (250 g/acre) OR Acetamiprid 20% SP @ 0.2 g/L.",
                "chemical_te": "ఫ్లోనికామిడ్ 50% WDG 0.3 గ్రా./లీ (ఎకరాకు 60 గ్రా.) లేదా డయాఫెంతియురాన్ 50% WP 1.25 గ్రా./లీ (ఎకరాకు 250 గ్రా.) లేదా ఎసిటామైప్రిడ్ 20% SP 0.2 గ్రా./లీ పిచికారీ చేయాలి."
            }
        ],
        "calendar": [
            {"day_range": "DAS 0–20", "stage_en": "Sowing & Germination", "stage_te": "విత్తడం & మొలక దశ", "actions_en": "Deep ploughing, ridge-furrow making; sow 1 seed/hill; gap filling at 10 DAS; spray Pendimethalin pre-emergence within 48h.", "actions_te": "లోతు దుక్కి, బోదెలు చేయాలి; గుంతకు ఒక గింజ విత్తాలి; 48 గంటల్లో పెండిమిథాలిన్ కలుపు మందు చల్లాలి; 10వ రోజు ఖాళీలను పూరించాలి."},
            {"day_range": "DAS 20–45", "stage_en": "Vegetative & Squaring", "stage_te": "శాకీయ & మొగ్గ దశ", "actions_en": "First intercultivation; apply 1st split Urea+Potash; install yellow sticky traps and pheromone traps.", "actions_te": "మొదటి అంతరకృషి; మొదటి విడత యూరియా+పొటాష్; పసుపు అట్టలు మరియు లింగాకర్షక బుట్టలు అమర్చాలి."},
            {"day_range": "DAS 45–80", "stage_en": "Peak Flowering", "stage_te": "పూత దశ", "actions_en": "Second top dressing; monitor pink bollworm in rosetted flowers; spray 19-19-19 + Micronutrients.", "actions_te": "రెండవ విడత ఎరువులు; గులాబీ రంగు పురుగును గమనించాలి; 19-19-19 మరియు సూక్ష్మ పోషకాలు పిచికారీ చేయాలి."},
            {"day_range": "DAS 80–120", "stage_en": "Boll Formation & Maturation", "stage_te": "కాయ పెరుగుదల & పక్వత", "actions_en": "Spray 13-0-45 (Multi-K) + Boron; avoid water stagnation; control pink bollworm and mealybug.", "actions_te": "13-0-45 + బోరాన్ పిచికారీ; నీరు నిలవకుండా చూడాలి; పిండినల్లి, గులాబీ పురుగు నివారణ చర్యలు చేపట్టాలి."},
            {"day_range": "DAS 120–160+", "stage_en": "Picking & Post-Harvest", "stage_te": "పత్తి తీత & నిల్వ", "actions_en": "Pick clean cotton after morning dew dries; store in dry aerated rooms; terminate crop by December/January to break pest cycle.", "actions_te": "మంచు ఆరిన తర్వాత శుభ్రమైన పత్తిని తీయాలి; పొడి ప్రదేశంలో నిల్వ చేయాలి; తెగుళ్ళ చక్రం తెగడానికి డిసెంబర్/జనవరిలో పైరును తొలగించాలి."}
        ]
    },

    "Chilli": {
        "id": "chilli",
        "name_en": "Chilli (Mirchi)",
        "name_te": "మిరప (Chilli / Mirchi)",
        "category": "Spices / Commercial",
        "varieties": {
            "en": "Teja, Guntur Hope, LCA 334, LCA 206, Byadagi, Armoor, US 341, Syngenta 5531.",
            "te": "తేజ, గుంటూరు హోప్, ఎల్.సి.ఎ 334, ఎల్.సి.ఎ 206, బ్యాడగి, ఆర్మూర్, యు.ఎస్ 341."
        },
        "advisory": {
            "soil_suitability_en": "Well-drained light loams, delta alluvials, and red sandy loams with pH 6.5–7.5 are ideal.",
            "soil_suitability_te": "మంచి నీటి పారుదల గల ఇసుక నేలలు, ఎర్ర నేలలు మరియు ఒండ్రు నేలలు (pH 6.5 - 7.5) అనుకూలం.",
            "seed_rate_en": "Direct seeding: 1 kg/acre; Transplanting: 200–250 g/acre in raised nursery beds or pro-trays.",
            "seed_rate_te": "నాటు పద్ధతి: ఎకరాకు 200-250 గ్రాముల హైబ్రిడ్ విత్తనాలు ప్రొ-ట్రేలలో నారు పోయాలి.",
            "seed_treatment_en": "Treat seeds with Thiram 3g + Trichoderma viride 10g per kg seed to prevent damping-off.",
            "seed_treatment_te": "నారు కుళ్లు తెగులు రాకుండా కిలో విత్తనానికి థైరమ్ 3 గ్రా. + ట్రైకోడెర్మా విరిడే 10 గ్రా. కలపాలి.",
            "spacing_en": "Single row: 60 cm x 60 cm (11,000 plants/acre); Paired row: 90-60 cm x 45 cm for drip.",
            "spacing_te": "వరుసల మధ్య 60 సెం.మీ, మొక్కల మధ్య 60 సెం.మీ లేదా డ్రిప్ పద్ధతిలో 90 x 45 సెం.మీ.",
            "cultivation_tips_en": "Transplant 35-40 days old healthy seedlings in evening hours. Mulching with silver-black polythene reduces weed and thrips attack by 60%.",
            "cultivation_tips_te": "35-40 రోజుల వయసున్న నారును సాయంత్రం వేళ నాటాలి. సిల్వర్-బ్లాక్ ప్లాస్టిక్ మల్చింగ్ వాడితే తామర పురుగులు, కలుపు 60% తగ్గుతాయి."
        },
        "fertilizer": {
            "recommended_npk_kg_per_acre": "N: 60–80 kg, P2O5: 30–40 kg, K2O: 40–50 kg",
            "commercial_fertilizers_per_acre_en": "Urea: 140 kg, DAP: 75 kg, MOP: 70 kg, Zinc Sulphate: 10 kg, Boron: 2 kg/acre.",
            "commercial_fertilizers_per_acre_te": "యూరియా: 140 కిలోలు, డి.ఎ.పి: 75 కిలోలు, పొటాష్: 70 కిలోలు, జింక్ సల్ఫేట్: 10 కిలోలు, బోరాన్: 2 కిలోలు.",
            "split_schedule": [
                {"stage_en": "Basal Application", "stage_te": "ఆఖరి దుక్కిలో", "detail_en": "Full DAP (75 kg) + 20 kg MOP + 10 kg Zinc Sulphate + 5 tonnes FYM.", "detail_te": "మొత్తం DAP (75 కిలోలు) + 20 కిలోల పొటాష్ + 10 కిలోల జింక్ + 5 టన్నుల పశువుల ఎరువు."},
                {"stage_en": "20–25 Days After Transplanting (DAT)", "stage_te": "నాటిన 20-25 రోజులకు", "detail_en": "Apply 30 kg Urea + 15 kg MOP around plants.", "detail_te": "30 కిలోల యూరియా + 15 కిలోల పొటాష్ మొక్కల చుట్టూ వేసి మట్టి కప్పాలి."},
                {"stage_en": "45–50 DAT (Flowering)", "stage_te": "నాటిన 45-50 రోజులకు (పూత దశ)", "detail_en": "Apply 35 kg Urea + 15 kg MOP + spray Micronutrient mixture 2.5 g/L.", "detail_te": "35 కిలోల యూరియా + 15 కిలోల పొటాష్ వేసి, సూక్ష్మ పోషకాల మిశ్రమం 2.5 గ్రా./లీ పిచికారీ చేయాలి."},
                {"stage_en": "70–75 DAT (First Picking)", "stage_te": "నాటిన 70-75 రోజులకు (మొదటి కోత)", "detail_en": "Apply 35 kg Urea + 20 kg MOP to maintain continuous flush.", "detail_te": "35 కిలోల యూరియా + 20 కిలోల పొటాష్ వేయాలి. తదుపరి కాత బాగా రావడానికి ఇది తోడ్పడుతుంది."}
            ],
            "biofertilizer_en": "Root dip in Pseudomonas fluorescens (10 g/L) for 20 mins before transplanting.",
            "biofertilizer_te": "నాటే ముందు నారు వేళ్లను సూడోమోనాస్ ద్రావణంలో (10 గ్రా./లీ) 20 నిమిషాలు ఉంచాలి."
        },
        "irrigation": {
            "critical_stages_en": [
                "Establishment stage (first 10 days: light frequent irrigation)",
                "Branching and flowering stage (35-50 DAT)",
                "Fruit development and ripening stage (regular uniform moisture)"
            ],
            "critical_stages_te": [
                "నాటిన మొదటి 10 రోజులు (తేలికపాటి తడులు)",
                "కొమ్మలు తొడిగే దశ & పూత దశ (35-50 రోజులు)",
                "కాయ తయారయ్యే దశ మరియు పండే దశ"
            ],
            "drainage_guideline_en": "Chilli cannot tolerate standing water even for 12 hours. Severe blossom drop occurs with excess moisture.",
            "drainage_guideline_te": "మిరప పొలంలో 12 గంటలు కూడా నీరు నిలవ ఉండరాదు. ఎక్కువ నీరుంటే పూత, పిందె రాలిపోతుంది."
        },
        "pests": [
            {
                "name_en": "Chilli Leaf Curl & Black Thrips (Thrips parvispinus)",
                "name_te": "నల్ల తామర పురుగు మరియు ఆకుముడత (Black Thrips)",
                "symptoms_en": "Leaves curl upwards, turn boat-shaped, brittle and small. Flowers drop profusely. Stunted plant growth with roughened fruit surface.",
                "symptoms_te": "ఆకుల అంచులు పైకి దోనెలా ముడుచుకుంటాయి. పూత రాలిపోతుంది. నల్లటి సూది లాంటి పురుగులు పూలలో ఉంటాయి. కాయలు గరుగ్గా మారి ఎదుగుదల ఆగిపోతుంది.",
                "affected_part": "Leaves & Flowers",
                "etl_en": "2-3 thrips per leaf or flower.",
                "etl_te": "ఆకు లేదా పువ్వుకు 2-3 తామర పురుగులు.",
                "ipm_cultural_en": "Install 30-40 blue sticky traps per acre. Grow 3 rows of Maize or Sorghum as border barrier crop.",
                "ipm_cultural_te": "ఎకరాకు 30-40 నీలి రంగు జిగురు అట్టలు పెట్టాలి. పొలం చుట్టూ 3 వరుసల జొన్న లేదా మొక్కజొన్న రక్షణ పంటగా వేయాలి.",
                "biological_en": "Spray Beauveria bassiana @ 5 g/L or Lecanicillium lecanii @ 5 g/L + Neem oil 5 ml/L.",
                "biological_te": "బవేరియా బాసియానా 5 గ్రా./లీ లేదా లెకానిసిలియం 5 గ్రా./లీ + వేప నూనె 5 మి.లీ/లీ పిచికారీ చేయాలి.",
                "chemical_en": "Spray Spinetoram 11.7% SC @ 1 ml/L OR Fipronil 5% SC @ 2 ml/L OR Cyantraniliprole 10.26% OD @ 1.2 ml/L. Alternate chemicals every 10 days.",
                "chemical_te": "స్పైనటోరం 11.7% SC 1 మి.లీ/లీ లేదా ఫిప్రోనిల్ 5% SC 2 మి.లీ/లీ లేదా సయాంట్రానిలిప్రోల్ 10.26% OD 1.2 మి.లీ/లీ మార్చి మార్చి పిచికారీ చేయాలి."
            },
            {
                "name_en": "Dieback and Fruit Rot (Anthracnose)",
                "name_te": "కొమ్మ ఎండు మరియు కాయకుళ్లు తెగులు (Anthracnose)",
                "symptoms_en": "Drying of tender twigs starting from top downwards ('Dieback'). Circular sunken spots on fruits with black concentric rings.",
                "symptoms_te": "కొమ్మల పైనుంచి కిందికి ఎండిపోవడం (డైబ్యాక్). పండిన కాయలపై గుండ్రటి గుంటపడిన మచ్చలు ఏర్పడి బూజు వచ్చి కాయలు కుళ్లిపోతాయి.",
                "affected_part": "Twigs & Ripe Fruits",
                "etl_en": "Appearance of initial lesions on twigs or fruits.",
                "etl_te": "కొమ్మలపై లేదా కాయలపై మొదటి మచ్చలు కనిపించిన వెంటనే.",
                "ipm_cultural_en": "Collect and burn diseased twigs. Avoid overhead sprinkler irrigation during fruiting.",
                "ipm_cultural_te": "తెగులు సోకిన కొమ్మలను తుంచి కాల్చివేయాలి. కాయ దశలో స్ప్రింక్లర్లతో నీరు పెట్టరాదు.",
                "biological_en": "Foliar spray Trichoderma harzianum @ 5 g/L.",
                "biological_te": "ట్రైకోడెర్మా హర్జియానమ్ 5 గ్రా./లీ పిచికారీ చేయాలి.",
                "chemical_en": "Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L OR Tebuconazole 25.9% EC @ 1 ml/L OR Copper Oxychloride (COC) @ 3 g/L.",
                "chemical_te": "అజాక్సిస్ట్రోబిన్ + డైఫెనోకొనజోల్ 1 మి.లీ/లీ లేదా టెబుకొనజోల్ 25.9% EC 1 మి.లీ/లీ లేదా కాపర్ ఆక్సిక్లోరైడ్ 3 గ్రా./లీ పిచికారీ చేయాలి."
            }
        ],
        "calendar": [
            {"day_range": "DAS 0–35", "stage_en": "Nursery Management", "stage_te": "నారుమడి దశ", "actions_en": "Sow in pro-trays with sterilized cocopeat; protect with 40-mesh insect net; drench with Copper Oxychloride at 15 DAS.", "actions_te": "ప్రొ-ట్రేలలో కోకోపీట్‌తో విత్తాలి; 40 మెష్ దోమతెర కింద ఉంచాలి; 15వ రోజు కాపర్ ఆక్సిక్లోరైడ్ ద్రావణం పోయాలి."},
            {"day_range": "DAT 0–30", "stage_en": "Transplanting & Establishment", "stage_te": "నాట్లు వేయడం & వేరు నాటుకోవడం", "actions_en": "Transplant on raised beds with mulch; basal fertilizer; gap filling at 7 DAT; install blue traps.", "actions_te": "మల్చింగ్ బెడ్లపై నాటాలి; ఆఖరి దుక్కి ఎరువులు; 7వ రోజు గ్యాప్ ఫిల్లింగ్; నీలి రంగు అట్టలు పెట్టాలి."},
            {"day_range": "DAT 30–60", "stage_en": "Branching & Early Flowering", "stage_te": "కొమ్మలు తొడగడం & పూత", "actions_en": "First top dressing; spray Spinetoram against thrips; spray Planofix (0.25 ml/L) to prevent flower drop.", "actions_te": "మొదటి విడత ఎరువులు; తామర పురుగుల నివారణ; పూత రాలకుండా ప్లానోఫిక్స్ 0.25 మి.లీ/లీ పిచికారీ చేయాలి."},
            {"day_range": "DAT 60–100", "stage_en": "Fruit Set & Pickings", "stage_te": "కాయ పెరుగుదల & కోతలు", "actions_en": "Harvest green chillies every 7-10 days; top dress Urea+MOP after pickings; spray Tebuconazole against dieback.", "actions_te": "ప్రతి 7-10 రోజులకు పచ్చిమిర్చి కోయాలి; కోత తర్వాత ఎరువులు వేయాలి; కొమ్మ ఎండు రాకుండా టెబుకొనజోల్ పిచికారీ."},
            {"day_range": "DAT 100–150+", "stage_en": "Ripe Pod Pickings & Drying", "stage_te": "పండు మిర్చి కోత & ఆరబెట్టడం", "actions_en": "Pick completely red ripe chillies; dry on clean polythene tarpaulins for 8-10 days to 10% moisture.", "actions_te": "బాగా పండిన ఎర్ర మిర్చిని కోసి టార్పాలిన్లపై 8-10 రోజులు 10% తేమ వచ్చే వరకు శుభ్రంగా ఆరబెట్టాలి."}
        ]
    },

    "Tomato": {
        "id": "tomato",
        "name_en": "Tomato",
        "name_te": "టమాట (Tomato)",
        "category": "Vegetables",
        "varieties": {
            "en": "Arka Rakshak (Triple disease resistant), Arka Vikas, US 440, Saaho, Abhinav, Pusa Ruby, PKM-1.",
            "te": "అర్క రక్షక్ (మూడు తెగుళ్లను తట్టుకునే రకం), అర్క వికాస్, యు.ఎస్ 440, సాహో, అభినవ్, పూసా రూబీ."
        },
        "advisory": {
            "soil_suitability_en": "Well-drained sandy loam or clay loam with high organic matter, pH 6.0–7.0.",
            "soil_suitability_te": "సేంద్రీయ పదార్థం పుష్కలంగా ఉన్న ఇసుక నేలలు, ఎర్ర నేలలు (pH 6.0 - 7.0) అనుకూలం.",
            "seed_rate_en": "Hybrids: 50–60 g/acre; Open-pollinated varieties: 150–200 g/acre.",
            "seed_rate_te": "హైబ్రిడ్ రకాలు: ఎకరాకు 50-60 గ్రాములు; సాధారణ రకాలు: 150-200 గ్రాములు.",
            "seed_treatment_en": "Treat seeds with Trichoderma viride 10 g/kg or Captan 2 g/kg.",
            "seed_treatment_te": "విత్తనాలకు ట్రైకోడెర్మా విరిడే 10 గ్రా./కిలో లేదా కాప్టాన్ 2 గ్రా./కిలో పట్టించాలి.",
            "spacing_en": "Staked: 90 cm x 45 cm (9,800 plants/acre); Unstaked: 75 cm x 60 cm.",
            "spacing_te": "కట్టెలు కట్టే పద్ధతి: 90 సెం.మీ x 45 సెం.మీ; నేలపై పాకే పద్ధతి: 75 సెం.మీ x 60 సెం.మీ.",
            "cultivation_tips_en": "Staking with bamboo poles improves fruit quality, reduces soil-borne rot by 70%, and extends harvest duration.",
            "cultivation_tips_te": "వెదురు బొంగులతో కర్రలు కడితే (Staking) కాయలకు నేల తగలకుండా తెగుళ్లు 70% తగ్గి మంచి నాణ్యత లభిస్తుంది."
        },
        "fertilizer": {
            "recommended_npk_kg_per_acre": "N: 60 kg, P2O5: 40 kg, K2O: 50 kg",
            "commercial_fertilizers_per_acre_en": "Urea: 100 kg, DAP: 85 kg, MOP: 80 kg, Micronutrient mix (Zinc, Boron, Calcium).",
            "commercial_fertilizers_per_acre_te": "యూరియా: 100 కిలోలు, డి.ఎ.పి: 85 కిలోలు, పొటాష్: 80 కిలోలు.",
            "split_schedule": [
                {"stage_en": "Basal Application", "stage_te": "ఆఖరి దుక్కిలో", "detail_en": "Entire DAP (85 kg) + 25 kg MOP + 10 kg Zinc Sulphate + 5 tonnes FYM.", "detail_te": "మొత్తం DAP (85 కిలోలు) + 25 కిలోల పొటాష్ + 10 కిలోల జింక్ + 5 టన్నుల పశువుల ఎరువు."},
                {"stage_en": "20–25 DAT", "stage_te": "నాటిన 20-25 రోజులకు", "detail_en": "Top dress 35 kg Urea + 25 kg MOP.", "detail_te": "35 కిలోల యూరియా + 25 కిలోల పొటాష్ వేసి మట్టి ఎక్కించాలి."},
                {"stage_en": "45 DAT (Flowering/Fruiting)", "stage_te": "45వ రోజు (పూత, పిందె దశ)", "detail_en": "Top dress 35 kg Urea + 30 kg MOP + spray Calcium Nitrate @ 5 g/L (prevents Blossom End Rot).", "detail_te": "35 కిలోల యూరియా + 30 కిలోల పొటాష్ వేయాలి. కాయ కింది భాగం నల్లబడకుండా కాల్షియం నైట్రేట్ (5 గ్రా./లీ) పిచికారీ చేయాలి."}
            ],
            "biofertilizer_en": "Apply Azotobacter and PSB @ 2 kg/acre each with vermicompost.",
            "biofertilizer_te": "ఎకరాకు 2 కిలోల అజోటోబాక్టర్, పి.ఎస్.బి లను వర్మీకంపోస్టుతో కలిపి వేయాలి."
        },
        "irrigation": {
            "critical_stages_en": [
                "Establishment after transplanting",
                "Flowering initiation",
                "Fruit enlargement (uniform moisture prevents fruit cracking)"
            ],
            "critical_stages_te": [
                "నాటిన వెంటనే వేళ్ళు నాటుకునే దశ",
                "మొదటి పూత దశ",
                "కాయ పరిమాణం పెరిగే దశ (తేమ హెచ్చుతగ్గులైతే కాయలు పగులుతాయి)"
            ],
            "drainage_guideline_en": "Drip irrigation with 2-3 liters/plant/day is optimal. Never allow water stress followed by heavy flooding as it causes fruit splitting.",
            "drainage_guideline_te": "డ్రిప్ ద్వారా రోజుకు మొక్కకు 2-3 లీటర్లు ఇవ్వాలి. ఎండబెట్టి ఒక్కసారిగా ఎక్కువ నీరిస్తే కాయలు పగులుతాయి."
        },
        "pests": [
            {
                "name_en": "Early Blight & Late Blight",
                "name_te": "ఆకుమాడు తెగులు & లేట్ బ్లైట్ (Early / Late Blight)",
                "symptoms_en": "Target-board concentric ring spots on lower leaves with yellow halo. In late blight, water-soaked dark patches that rapidly rot leaves and green fruits.",
                "symptoms_te": "కింది ఆకులపై వలయాకారపు నల్లటి మచ్చలు (టార్గెట్ బోర్డ్). లేట్ బ్లైట్‌లో ఆకులు, కాయలపై నల్లటి తడి మచ్చలు ఏర్పడి రాత్రికి రాత్రే కుళ్లిపోతాయి.",
                "affected_part": "Leaves, Stems & Fruits",
                "etl_en": "Initial leaf spot symptoms.",
                "etl_te": "ఆకులపై మొదటి మచ్చలు కనిపించిన వెంటనే.",
                "ipm_cultural_en": "Remove and burn lower infected leaves up to 20 cm from ground. Ensure staking.",
                "ipm_cultural_te": "కింది భాగంలోని తెగులు సోకిన ఆకులను తీసివేయాలి. కర్రలు కట్టడం తప్పనిసరి.",
                "biological_en": "Spray Pseudomonas fluorescens @ 10 g/L.",
                "biological_te": "సూడోమోనాస్ ఫ్లోరోసెన్స్ 10 గ్రా./లీ పిచికారీ చేయాలి.",
                "chemical_en": "Early Blight: Mancozeb 75% WP @ 2.5 g/L OR Azoxystrobin @ 1 ml/L. Late Blight: Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ) @ 2.5 g/L OR Dimethomorph 50% WP @ 1 g/L.",
                "chemical_te": "ఆకుమాడుకు: మాంకోజెబ్ 2.5 గ్రా./లీ లేదా అజాక్సిస్ట్రోబిన్ 1 మి.లీ/లీ. లేట్ బ్లైట్ కు: రిడోమిల్ MZ 2.5 గ్రా./లీ లేదా డైమెథోమార్ఫ్ 1 గ్రా./లీ పిచికారీ చేయాలి."
            },
            {
                "name_en": "Tomato Fruit Borer (Helicoverpa armigera)",
                "name_te": "కాయ తొలుచు పురుగు (Fruit Borer)",
                "symptoms_en": "Circular entry holes on fruits with larval head inside and body outside. Dropped fruits with rotting cavities.",
                "symptoms_te": "కాయలపై గుండ్రటి రంధ్రాలు చేసి లోపలి గుజ్జును తినివేస్తుంది. పురుగు తల కాయ లోపల, శరీరం బయట ఉంటుంది.",
                "affected_part": "Fruits",
                "etl_en": "1 larva per plant or 5% damaged fruit.",
                "etl_te": "మొక్కకు 1 లార్వా లేదా 5% కాయలు దెబ్బతినడం.",
                "ipm_cultural_en": "Plant Marigold as a trap crop (1 row Marigold for every 16 rows Tomato). Install 4 pheromone traps/acre.",
                "ipm_cultural_te": "ప్రతి 16 వరుసల టమాటకు 1 వరుస బంతిని ఎరపంటగా వేయాలి. ఎకరాకు 4 లింగాకర్షక బుట్టలు పెట్టాలి.",
                "biological_en": "Spray HaNPV @ 250 LE/acre OR Bacillus thuringiensis (Bt) @ 2 g/L.",
                "biological_te": "HaNPV 250 LE/ఎకరాకు లేదా బిటి (Bt) 2 గ్రా./లీ పిచికారీ చేయాలి.",
                "chemical_en": "Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L (60 ml/acre) OR Flubendiamide 39.35% SC @ 0.3 ml/L (60 ml/acre). Waiting period: 3 days.",
                "chemical_te": "క్లోరంత్రానిలిప్రోల్ 18.5% SC 0.3 మి.లీ/లీ లేదా ఫ్లూబెండియమైడ్ 0.3 మి.లీ/లీ పిచికారీ చేయాలి. మందు కొట్టిన 3 రోజుల వరకు కాయలు కోయరాదు."
            }
        ],
        "calendar": [
            {"day_range": "DAS 0–25", "stage_en": "Nursery Stage", "stage_te": "నారుమడి దశ", "actions_en": "Raise healthy nursery in shade net; drench with Trichoderma; spray Imidacloprid against whitefly at 18 DAS.", "actions_te": "షేడ్‌నెట్ కింద నారు పెంచాలి; ట్రైకోడెర్మా ద్రావణం పోయాలి; 18వ రోజు తెల్లదోమ నివారణకు ఇమిడాక్లోప్రిడ్ పిచికారీ."},
            {"day_range": "DAT 0–25", "stage_en": "Transplanting & Staking", "stage_te": "నాట్లు & కర్రలు కట్టడం", "actions_en": "Transplant in evening; basal fertilization; erect bamboo stakes and tie plants with twine at 20 DAT.", "actions_te": "సాయంత్రం నాటాలి; ఆఖరి దుక్కి ఎరువులు; 20వ రోజు వెదురు కర్రలు నాటి మొక్కలను తాళ్లతో కట్టాలి."},
            {"day_range": "DAT 25–50", "stage_en": "Flowering & Fruit Set", "stage_te": "పూత & కాయలు కాయడం", "actions_en": "Top dress Urea + Potash; spray 13-0-45 + Calcium Nitrate; install fruit borer pheromone traps.", "actions_te": "యూరియా + పొటాష్ వేయాలి; కాల్షియం నైట్రేట్ పిచికారీ; కాయ తొలుచు పురుగు బుట్టలు అమర్చాలి."},
            {"day_range": "DAT 50–90+", "stage_en": "Harvesting", "stage_te": "పంట కోత దశ", "actions_en": "Harvest fruits at breaker/turning stage for distant transport, or red-ripe for local market; harvest every 3-4 days.", "actions_te": "దూర ప్రాంత మార్కెట్లకు దోరగా ఉన్నప్పుడు, స్థానిక మార్కెట్లకు ఎర్రగా పండినప్పుడు ప్రతి 3-4 రోజులకు కోయాలి."}
        ]
    },

    "Maize": {
        "id": "maize",
        "name_en": "Maize (Corn)",
        "name_te": "మొక్కజొన్న (Maize / Corn)",
        "category": "Cereals",
        "varieties": {
            "en": "DHM 117, DHM 121, Pioneer 3396, DKC 9108, NK 6240, Bio 9681, Ganga 11.",
            "te": "డి.హెచ్.ఎం 117, డి.హెచ్.ఎం 121, పయనీర్ 3396, డెకాల్బ్ 9108, ఎన్.కె 6240, బయో 9681."
        },
        "advisory": {
            "soil_suitability_en": "Deep, well-drained fertile loamy or alluvial soils with pH 6.5–7.5. Avoid saline or waterlogged soils.",
            "soil_suitability_te": "లోతైన ఒండ్రు మరియు ఎర్ర నేలలు (pH 6.5 - 7.5) శ్రేష్టం. చౌడు, నీరు నిలిచే నేలలు పనికిరావు.",
            "seed_rate_en": "7–8 kg per acre (Single seed per hill).",
            "seed_rate_te": "ఎకరాకు 7-8 కిలోల విత్తనాలు (గుంతకు ఒక గింజ).",
            "seed_treatment_en": "Treat seed with Cyantraniliprole 19.8% + Thiamethoxam 19.8% FS (Fortenza Duo) @ 6 ml/kg seed against Fall Armyworm.",
            "seed_treatment_te": "కత్తెర పురుగు రాకుండా కిలో విత్తనానికి ఫోర్టెంజా డ్యూయో 6 మి.లీ పట్టించి విత్తుకోవాలి.",
            "spacing_en": "60 cm between rows x 20 cm between plants (33,000 plants/acre).",
            "spacing_te": "వరుసల మధ్య 60 సెం.మీ, మొక్కల మధ్య 20 సెం.మీ (ఎకరాకు 33,000 మొక్కలు).",
            "cultivation_tips_en": "Ensure proper ridge-furrow planting. Sowing on ridges prevents water stagnation and facilitates furrow irrigation.",
            "cultivation_tips_te": "బోదెలు-కాలువల పద్ధతిలో బోదెలపై విత్తడం వల్ల నీరు నిలవకుండా వేరుకు గాలి అందుతుంది."
        },
        "fertilizer": {
            "recommended_npk_kg_per_acre": "N: 80 kg, P2O5: 32 kg, K2O: 32 kg",
            "commercial_fertilizers_per_acre_en": "Urea: 150 kg, DAP: 70 kg, MOP: 50 kg, Zinc Sulphate: 20 kg (basal).",
            "commercial_fertilizers_per_acre_te": "యూరియా: 150 కిలోలు, డి.ఎ.పి: 70 కిలోలు, పొటాష్: 50 కిలోలు, జింక్ సల్ఫేట్: 20 కిలోలు.",
            "split_schedule": [
                {"stage_en": "Basal Application", "stage_te": "ఆఖరి దుక్కిలో", "detail_en": "Entire DAP (70 kg) + 1/3rd MOP (15 kg) + 20 kg Zinc Sulphate.", "detail_te": "మొత్తం DAP (70 కిలోలు) + 15 కిలోల పొటాష్ + 20 కిలోల జింక్ సల్ఫేట్."},
                {"stage_en": "Knee-High Stage (25-30 DAS)", "stage_te": "మోకాలు లోతు ఎత్తు దశ (25-30 రోజులు)", "detail_en": "Apply 1/3rd Urea (50 kg) after weeding.", "detail_te": "కలుపు తీసిన తర్వాత 50 కిలోల యూరియా వేసి మట్టి ఎక్కించాలి."},
                {"stage_en": "Tasseling Stage (45-50 DAS)", "stage_te": "మగ పూత (జెండ దశ - 45-50 రోజులు)", "detail_en": "Apply 1/3rd Urea (50 kg) + remaining MOP (20 kg).", "detail_te": "50 కిలోల యూరియా + 20 కిలోల పొటాష్ వేయాలి."},
                {"stage_en": "Silking to Grain Fill (60-65 DAS)", "stage_te": "ఆడ పూత / పొత్తు దశ (60-65 రోజులు)", "detail_en": "Apply remaining Urea (50 kg) + remaining MOP (15 kg).", "detail_te": "మిగిలిన 50 కిలోల యూరియా + 15 కిలోల పొటాష్ వేయాలి."}
            ],
            "biofertilizer_en": "Seed inoculation with Azospirillum and PSB @ 200 g/kg seed.",
            "biofertilizer_te": "విత్తనాలకు అజోస్పైరిల్లమ్, పి.ఎస్.బి 200 గ్రాములు కలపాలి."
        },
        "irrigation": {
            "critical_stages_en": [
                "Knee-high vegetative stage (25-30 DAS)",
                "Tasseling stage (45-55 DAS - EXTREMELY CRITICAL)",
                "Silking & Cob formation (55-65 DAS)",
                "Grain filling / Dough stage (70-85 DAS)"
            ],
            "critical_stages_te": [
                "మోకాలు లోతు ఎత్తు దశ (25-30 రోజులు)",
                "జెండ పూత దశ (45-55 రోజులు - అత్యంత ప్రధానం)",
                "పొత్తు దశ (55-65 రోజులు)",
                "గింజ పాలుపోసుకునే దశ (70-85 రోజులు)"
            ],
            "drainage_guideline_en": "Maize is highly sensitive to waterlogging. Even 24 hours of standing water reduces yield by 40%.",
            "drainage_guideline_te": "మొక్కజొన్న నీటి నిల్వను అస్సలు తట్టుకోదు. 24 గంటలు నీరు నిలిస్తే 40% దిగుబడి తగ్గుతుంది."
        },
        "pests": [
            {
                "name_en": "Fall Armyworm (Spodoptera frugiperda)",
                "name_te": "కత్తెర పురుగు (Fall Armyworm - FAW)",
                "symptoms_en": "Papery windows on leaves caused by young larvae. Large ragged holes and extensive sawdust-like frass inside the central whorl.",
                "symptoms_te": "ఆకులపై జల్లెడ లాంటి కిటికీలు. సుడులలో పెద్ద పెద్ద రంధ్రాలు చేసి, రంపపు పొట్టు లాంటి మల పదార్థం నింపి ఆకులను తినేస్తుంది.",
                "affected_part": "Central Leaf Whorl & Cobs",
                "etl_en": "5% damaged whorls in seedling stage, 10-20% damaged plants in knee-high stage.",
                "etl_te": "చిన్న పైరులో 5% మొక్కలు, మోకాలు ఎత్తు దశలో 10% మొక్కలు దెబ్బతినడం.",
                "ipm_cultural_en": "Install 4 pheromone traps/acre. Drop sand + lime (9:1) into whorls to kill early instar larvae.",
                "ipm_cultural_te": "ఎకరాకు 4 లింగాకర్షక బుట్టలు పెట్టాలి. మొవ్వులలో ఇసుక + సున్నం (9:1) మిశ్రమాన్ని వేయాలి.",
                "biological_en": "Apply Metarhizium rileyi @ 5 g/L or Bt @ 2 g/L into the whorl.",
                "biological_te": "మెటారైజియం లేదా బిటి (Bt) 2 గ్రా./లీ మొవ్వులలో పడేలా పిచికారీ చేయాలి.",
                "chemical_en": "Direct spray into WHORLS: Chlorantraniliprole 18.5% SC @ 0.4 ml/L (80 ml/acre) OR Emamectin Benzoate 5% SG @ 0.4 g/L (80 g/acre) OR Spinetoram 11.7% SC @ 0.5 ml/L.",
                "chemical_te": "మందును ఖచ్చితంగా మొవ్వులలో (Whorl) పడేలా పిచికారీ చేయాలి: క్లోరంత్రానిలిప్రోల్ 0.4 మి.లీ/లీ (ఎకరాకు 80 మి.లీ) లేదా ఇమామెక్టిన్ బెంజోయేట్ 0.4 గ్రా./లీ (ఎకరాకు 80 గ్రా.)."
            }
        ],
        "calendar": [
            {"day_range": "DAS 0–15", "stage_en": "Sowing & Emergence", "stage_te": "విత్తడం & మొలక దశ", "actions_en": "Seed treatment with Fortenza Duo; sow on ridges; spray Atrazine pre-emergence within 48h.", "actions_te": "విత్తన శుద్ధి; బోదెలపై విత్తడం; 48 గంటల్లో అట్రాజిన్ కలుపు మందు చల్లాలి."},
            {"day_range": "DAS 15–35", "stage_en": "Knee-High Stage", "stage_te": "మోకాలు ఎత్తు దశ", "actions_en": "Intercultivation and earthing up; first top dressing of Urea; scout for Fall Armyworm whorl damage.", "actions_te": "అంతరకృషి, మట్టి ఎక్కించడం; మొదటి విడత యూరియా; కత్తెర పురుగు ఆనవాళ్లను గమనించాలి."},
            {"day_range": "DAS 35–60", "stage_en": "Tasseling & Silking", "stage_te": "మగ పూత & ఆడ పూత దశ", "actions_en": "Second top dressing; ensure adequate soil moisture; protect developing cobs from armyworm.", "actions_te": "రెండవ విడత ఎరువులు; తేమ తగ్గకుండా చూడాలి; పొత్తులలోకి పురుగు చేరకుండా చూడాలి."},
            {"day_range": "DAS 60–90", "stage_en": "Grain Hardening & Maturity", "stage_te": "గింజ పక్వత దశ", "actions_en": "Cob sheath turns papery straw yellow; black layer forms at grain tip indicating physiological maturity.", "actions_te": "పొత్తు పైపొర ఎండుగడ్డి రంగుకు మారుతుంది; గింజ కొన భాగంలో నల్లటి చుక్క ఏర్పడితే పంట పక్వానికి వచ్చినట్లు."},
            {"day_range": "DAS 90–110", "stage_en": "Harvesting & Shelling", "stage_te": "కోత & గింజలు వేరుచేయడం", "actions_en": "Harvest cobs, sun-dry for 3-4 days; shell using mechanical sheller; dry grain to 12% moisture.", "actions_te": "కంకులు కోసి 3-4 రోజులు ఎండబెట్టాలి; షెల్లర్ తో గింజలు తీసి 12% తేమ వచ్చే వరకు ఆరబెట్టాలి."}
        ]
    },

    "Groundnut": {
        "id": "groundnut",
        "name_en": "Groundnut (Peanut)",
        "name_te": "వేరుశనగ (Groundnut / Peanut)",
        "category": "Oilseeds",
        "varieties": {
            "en": "Kadiri 6, Kadiri 9, Kadiri Lepakshi (K 1812), TAG 24, Dharani, JL 24, Greeshma.",
            "te": "కదిరి 6, కదిరి 9, కదిరి లేపాక్షి (కె 1812), టి.ఎ.జి 24, ధరణి, జె.ఎల్ 24."
        },
        "advisory": {
            "soil_suitability_en": "Well-drained red sandy loams and light alluvial soils with good calcium content and pH 6.0–7.0.",
            "soil_suitability_te": "మంచి మురుగు నీటి వసతి గల ఎర్ర నేలలు, ఇసుక నేలలు శ్రేష్టం. సున్నపు శాతం బాగుండాలి.",
            "seed_rate_en": "Bunch varieties: 40–45 kg kernels/acre; Spreading varieties: 35–40 kg kernels/acre.",
            "seed_rate_te": "గుత్తి రకాలు: ఎకరాకు 40-45 కిలోల పప్పు; అల్లే రకాలు: 35-40 కిలోల పప్పు.",
            "seed_treatment_en": "Treat kernels with Imidacloprid 600 FS @ 2 ml/kg seed against collar rot and sucking pests, followed by Rhizobium culture @ 200 g/10 kg seed.",
            "seed_treatment_te": "కిలో పప్పుకు ఇమిడాక్లోప్రిడ్ 2 మి.లీ + మ్యాంకోజెబ్ 3 గ్రా. పట్టించాలి. ఆరిన తర్వాత రైజోబియం కల్చర్ పట్టించాలి.",
            "spacing_en": "30 cm between rows x 10 cm between plants (1,33,000 plants/acre).",
            "spacing_te": "వరుసల మధ్య 30 సెం.మీ, మొక్కల మధ్య 10 సెం.మీ.",
            "cultivation_tips_en": "Apply Gypsum @ 200 kg/acre at 40-45 DAS along the rows. Calcium is essential for pod filling (prevents 'pops' or empty shells).",
            "cultivation_tips_te": "40-45 రోజుల వద్ద ఊడలు దిగే దశలో ఎకరాకు 200 కిలోల జిప్సం తప్పనిసరిగా వేసి మట్టి ఎక్కించాలి (తాలు కాయలు రాకుండా ఉంటాయి)."
        },
        "fertilizer": {
            "recommended_npk_kg_per_acre": "N: 12 kg, P2O5: 24 kg, K2O: 20 kg",
            "commercial_fertilizers_per_acre_en": "DAP: 50 kg, MOP: 35 kg, Urea: 10 kg, Gypsum: 200 kg (in 2 splits: 100 kg basal + 100 kg at flowering).",
            "commercial_fertilizers_per_acre_te": "డి.ఎ.పి: 50 కిలోలు, పొటాష్: 35 కిలోలు, యూరియా: 10 కిలోలు, జిప్సం: 200 కిలోలు (ఆఖరి దుక్కిలో 100 కిలోలు, ఊడ దిగేటప్పుడు 100 కిలోలు).",
            "split_schedule": [
                {"stage_en": "Basal Application", "stage_te": "ఆఖరి దుక్కిలో", "detail_en": "Entire DAP (50 kg) + entire MOP (35 kg) + 100 kg Gypsum + 10 kg Zinc Sulphate.", "detail_te": "మొత్తం DAP (50 కిలోలు) + 35 కిలోల పొటాష్ + 100 కిలోల జిప్సం + 10 కిలోల జింక్ సల్ఫేట్."},
                {"stage_en": "Pegging Stage (40-45 DAS)", "stage_te": "ఊడలు దిగే దశ (40-45 రోజులు)", "detail_en": "Apply remaining 100 kg Gypsum along rows followed by light earthing up. Critical for pod shell hardening.", "detail_te": "మిగిలిన 100 కిలోల జిప్సం మొక్కల మొదళ్లలో వేసి మట్టి ఎక్కించాలి. దీనివల్ల కాయలకు పుష్టి వస్తుంది."}
            ],
            "biofertilizer_en": "Rhizobium and Phosphobacteria (PSB) seed treatment increases nodulation by 35%.",
            "biofertilizer_te": "రైజోబియం మరియు పి.ఎస్.బి వాడకం వల్ల వేర్లలో బుడిపెల సంఖ్య పెరిగి నత్రజని స్థిరీకరణ జరుగుతుంది."
        },
        "irrigation": {
            "critical_stages_en": [
                "Flowering stage (25-35 DAS)",
                "Pegging / Peg penetration (40-50 DAS - SOIL MUST BE LOOSE AND MOIST)",
                "Pod development stage (60-80 DAS)"
            ],
            "critical_stages_te": [
                "పూత దశ (25-35 రోజులు)",
                "ఊడలు నేలలోకి దిగే దశ (40-50 రోజులు - నేల గుల్లగా, తేమగా ఉండాలి)",
                "కాయ ఊరే దశ (60-80 రోజులు)"
            ],
            "drainage_guideline_en": "Sprinkler irrigation is most suitable for groundnut. Avoid flood irrigation as it compacts red soils.",
            "drainage_guideline_te": "వేరుశనగకు స్ప్రింక్లర్ పద్ధతి అత్యంత అనుకూలం. నేల గట్టిపడకుండా కాయలు బాగా దిగుతాయి."
        },
        "pests": [
            {
                "name_en": "Tikka Leaf Spot (Cercospora arachidicola)",
                "name_te": "తిక్కా ఆకుమచ్చ తెగులు (Tikka Disease)",
                "symptoms_en": "Dark brown to black spots on leaves surrounded by a bright yellow halo. Premature leaf shedding leaving bare stems.",
                "symptoms_te": "ఆకులపై నల్లటి గుండ్రని మచ్చలు ఏర్పడి చుట్టూ పసుపు రంగు వలయం ఉంటుంది. తెగులు తీవ్రమైతే ఆకులన్నీ రాలిపోయి కొమ్మలు మాత్రమే మిగులుతాయి.",
                "affected_part": "Leaves & Petioles",
                "etl_en": "5% leaf infection at pegging stage.",
                "etl_te": "ఊడ దశలో ఆకులపై మచ్చలు కనిపించిన వెంటనే.",
                "ipm_cultural_en": "Crop rotation with Cereals. Destroy previous crop stubbles.",
                "ipm_cultural_te": "ధాన్యపు పంటలతో పంట మార్పిడి చేయాలి.",
                "biological_en": "Spray Pseudomonas fluorescens @ 10 g/L.",
                "biological_te": "సూడోమోనాస్ ఫ్లోరోసెన్స్ 10 గ్రా./లీ పిచికారీ చేయాలి.",
                "chemical_en": "Spray Tebuconazole 25.9% EC @ 1 ml/L OR Hexaconazole 5% SC @ 2 ml/L OR Mancozeb 75% WP @ 2.5 g/L.",
                "chemical_te": "టెబుకొనజోల్ 1 మి.లీ/లీ లేదా హెక్సాకొనజోల్ 2 మి.లీ/లీ లేదా మాంకోజెబ్ 2.5 గ్రా./లీ పిచికారీ చేయాలి."
            }
        ],
        "calendar": [
            {"day_range": "DAS 0–20", "stage_en": "Sowing & Germination", "stage_te": "విత్తడం & మొలక దశ", "actions_en": "Seed treatment with Imidacloprid+Mancozeb; sow in moist soil; pre-emergence weed control with Pendimethalin.", "actions_te": "విత్తన శుద్ధి; తేమ ఉన్నప్పుడు విత్తడం; పెండిమిథాలిన్ కలుపు మందు చల్లాలి."},
            {"day_range": "DAS 20–40", "stage_en": "Vegetative & Flowering", "stage_te": "శాకీయ & పూత దశ", "actions_en": "Intercultivation at 25 DAS; stop hoeing once pegs start entering soil.", "actions_te": "25వ రోజు గొర్రు తిప్పాలి; ఊడలు నేలలోకి దిగడం ప్రారంభమయ్యాక అంతరకృషి ఆపివేయాలి."},
            {"day_range": "DAS 40–70", "stage_en": "Pegging & Pod Formation", "stage_te": "ఊడలు దిగడం & కాయ ఏర్పడటం", "actions_en": "Apply 100 kg Gypsum and earth up; maintain soil moisture through sprinkler; watch for Tikka leaf spot.", "actions_te": "100 కిలోల జిప్సం వేసి మట్టి ఎక్కించాలి; తేమ ఆరకుండా చూడాలి; తిక్కా తెగులు రాకుండా మందు కొట్టాలి."},
            {"day_range": "DAS 70–105", "stage_en": "Pod Filling & Maturity", "stage_te": "కాయ ఊరడం & పక్వత", "actions_en": "Stop watering 5-7 days before harvest; pull out test plant: inside shell turns brown-black when mature.", "actions_te": "కోతకు 5-7 రోజుల ముందు నీరు ఆపాలి; కాయ లోపలి పొర నలుపు/గోధుమ రంగుకు మారితే పంట పక్వానికి వచ్చినట్లు."},
            {"day_range": "DAS 105–115", "stage_en": "Harvesting & Drying", "stage_te": "కోత & ఆరబెట్టడం", "actions_en": "Pull plants; strip pods; dry pods in sun for 5-7 days until pods rattle with 8-9% kernel moisture.", "actions_te": "మొక్కలను పీకి కాయలు వేరుచేయాలి; ఎండలో 5-7 రోజులు కాయలు గలగలలాడే వరకు (8-9% తేమ) ఆరబెట్టాలి."}
        ]
    },

    "Onion": {
        "id": "onion",
        "name_en": "Onion",
        "name_te": "ఉల్లి (Onion)",
        "category": "Vegetables",
        "varieties": {
            "en": "Bhima Super, Bhima Dark Red, Agrifound Dark Red, Pusa Red, Arka Kalyan, Bellary Red.",
            "te": "భీమా సూపర్, భీమా డార్క్ రెడ్, అగ్రిఫౌండ్ డార్క్ రెడ్, పూసా రెడ్, అర్క కళ్యాణ్, బళ్లారి రెడ్."
        },
        "advisory": {
            "soil_suitability_en": "Deep, loose friable sandy loam or rich alluvial soil rich in organic matter with pH 6.0–7.0. Heavy sticky clay soils impede bulb expansion.",
            "soil_suitability_te": "సేంద్రీయ పదార్థం గల తేలికపాటి ఇసుక నేలలు మరియు ఒండ్రు నేలలు శ్రేష్టం. బంకమట్టి నేలల్లో ఉల్లిపాయ సరిగ్గా ఊరదు.",
            "seed_rate_en": "Transplanting: 4–5 kg seeds/acre (nursery raised for 40-45 days); Direct bulb sets: 400-500 kg/acre.",
            "seed_rate_te": "నారు నాటే పద్ధతి: ఎకరాకు 4-5 కిలోల విత్తనాలు (40-45 రోజుల నారు); చిన్న ఉల్లిగడ్డలతో: 400-500 కిలోలు.",
            "seed_treatment_en": "Treat seeds with Thiram or Captan @ 3 g/kg seed. Seedling root dip in Carbendazim (1 g/L) before transplanting.",
            "seed_treatment_te": "విత్తనానికి థైరమ్ 3 గ్రా./కిలో పట్టించాలి. నాటే ముందు నారు వేళ్లను కార్బండైజిమ్ (1 గ్రా./లీ) ద్రావణంలో ముంచాలి.",
            "spacing_en": "15 cm between rows x 10 cm between plants on flat beds or raised broad beds (BBF).",
            "spacing_te": "వరుసల మధ్య 15 సెం.మీ, మొక్కల మధ్య 10 సెం.మీ.",
            "cultivation_tips_en": "Adopt Broad Bed Furrow (BBF) method (1.2 m wide bed) with drip irrigation to produce 25-30% higher bulb yields with uniform size.",
            "cultivation_tips_te": "ఎత్తైన బోదెలపై (BBF) డ్రిప్ ద్వారా సాగు చేస్తే గడ్డలు సమాన పరిమాణంలో వచ్చి 25-30% అధిక దిగుబడి వస్తుంది."
        },
        "fertilizer": {
            "recommended_npk_kg_per_acre": "N: 40 kg, P2O5: 24 kg, K2O: 32 kg, Sulphur: 15 kg",
            "commercial_fertilizers_per_acre_en": "Urea: 85 kg, DAP: 50 kg, MOP: 55 kg, Bentonite Sulphate: 15 kg/acre (essential for pungency and storage life).",
            "commercial_fertilizers_per_acre_te": "యూరియా: 85 కిలోలు, డి.ఎ.పి: 50 కిలోలు, పొటాష్: 55 కిలోలు, సల్ఫర్ (గంధకం): 15 కిలోలు (ఘాటు మరియు నిల్వ సామర్థ్యానికి ముఖ్యం).",
            "split_schedule": [
                {"stage_en": "Basal Application", "stage_te": "ఆఖరి దుక్కిలో", "detail_en": "Entire DAP (50 kg) + 20 kg MOP + 15 kg Sulphur + 20 kg Urea.", "detail_te": "మొత్తం DAP (50 కిలోలు) + 20 కిలోల పొటాష్ + 15 కిలోల సల్ఫర్ + 20 కిలోల యూరియా."},
                {"stage_en": "30 DAT (Vegetative)", "stage_te": "నాటిన 30 రోజులకు", "detail_en": "Top dress 35 kg Urea + 15 kg MOP.", "detail_te": "35 కిలోల యూరియా + 15 కిలోల పొటాష్ వేసి కలుపు తీయాలి."},
                {"stage_en": "45–50 DAT (Bulb Initiation)", "stage_te": "నాటిన 45-50 రోజులకు (గడ్డ ఊరే దశ)", "detail_en": "Top dress remaining 30 kg Urea + remaining 20 kg MOP. Avoid excess Nitrogen late in season as it causes thick neck bulbs.", "detail_te": "మిగిలిన 30 కిలోల యూరియా + 20 కిలోల పొటాష్ వేయాలి. ఆఖరి దశలో యూరియా ఎక్కువ వేస్తే గడ్డ సరిగ్గా నిల్వ ఉండదు."}
            ],
            "biofertilizer_en": "Azospirillum and PSB @ 2 kg/acre each with FYM.",
            "biofertilizer_te": "ఎకరాకు 2 కిలోల అజోస్పైరిల్లమ్, పి.ఎస్.బి పశువుల ఎరువుతో కలిపి వేయాలి."
        },
        "irrigation": {
            "critical_stages_en": [
                "Establishment stage after transplanting (every 3-4 days)",
                "Vegetative growth stage (every 5-7 days)",
                "Bulb development stage (regular light moisture - moisture stress causes split bulbs)"
            ],
            "critical_stages_te": [
                "నాటిన వెంటనే వేళ్ళు నాటుకునే దశ (3-4 రోజులకు ఒకసారి)",
                "శాకీయ ఎదుగుదల దశ (5-7 రోజులకు ఒకసారి)",
                "గడ్డ ఊరే దశ (తేమ తగ్గితే గడ్డలు చీలడం జరుగుతుంది)"
            ],
            "drainage_guideline_en": "Stop irrigation completely 10-15 days before harvest to allow neck drying. This prevents post-harvest storage rots.",
            "drainage_guideline_te": "కోతకు 10-15 రోజుల ముందు నీరు పూర్తిగా ఆపివేయాలి. దీనివల్ల నిల్వలో ఉల్లిపాయ కుళ్లిపోకుండా ఉంటుంది."
        },
        "pests": [
            {
                "name_en": "Onion Thrips (Thrips tabaci)",
                "name_te": "ఉల్లి తామర పురుగులు (Thrips)",
                "symptoms_en": "Silvery-white patches on leaves that dry up from tip downwards. Tips curl and dry up, reducing bulb development.",
                "symptoms_te": "ఆకులపై వెండి రంగు చారలు/మచ్చలు ఏర్పడి చివర్ల నుంచి ఎండిపోతాయి. తామర పురుగుల వల్ల ఆకులు మాడి గడ్డ పరిమాణం తగ్గిపోతుంది.",
                "affected_part": "Leaves",
                "etl_en": "10-15 thrips per plant.",
                "etl_te": "మొక్కకు 10-15 తామర పురుగులు.",
                "ipm_cultural_en": "Install blue sticky traps (20/acre). Sprinkle water overhead in mornings to wash away nymphs.",
                "ipm_cultural_te": "ఎకరాకు 20 నీలి రంగు అట్టలు పెట్టాలి. స్ప్రింక్లర్లతో నీరు చిలకరిస్తే పురుగులు కొట్టుకుపోతాయి.",
                "biological_en": "Spray Neem oil 1500 ppm @ 4 ml/L or Beauveria bassiana @ 5 g/L.",
                "biological_te": "వేప నూనె 4 మి.లీ/లీ లేదా బవేరియా బాసియానా 5 గ్రా./లీ పిచికారీ చేయాలి.",
                "chemical_en": "Spray Fipronil 5% SC @ 1.5 ml/L OR Spinetoram 11.7% SC @ 0.8 ml/L OR Profenophos 50% EC @ 2 ml/L.",
                "chemical_te": "ఫిప్రోనిల్ 5% SC 1.5 మి.లీ/లీ లేదా స్పైనటోరం 0.8 మి.లీ/లీ లేదా ప్రొఫెనోఫాస్ 2 మి.లీ/లీ పిచికారీ చేయాలి."
            },
            {
                "name_en": "Purple Blotch (Alternaria porri)",
                "name_te": "ఊదా రంగు మచ్చ తెగులు (Purple Blotch)",
                "symptoms_en": "Small sunken whitish spots turning dark purple with yellow border on leaves. Leaves break and collapse from infected point.",
                "symptoms_te": "ఆకులపై మొదట తెల్లటి మచ్చలు ఏర్పడి క్రమంగా ఊదా రంగుగా మారి పెద్దవవుతాయి. మచ్చ ఉన్న చోట ఆకులు విరిగి పడిపోతాయి.",
                "affected_part": "Leaves & Flower Stalks",
                "etl_en": "Onset of initial spots on 5% of plants.",
                "etl_te": "ఆకులపై మొదటి మచ్చలు కనిపించిన వెంటనే.",
                "ipm_cultural_en": "Avoid excess nitrogen. Follow crop rotation with non-allium crops.",
                "ipm_cultural_te": "యూరియా తగ్గించాలి. ఉల్లి జాతి కాకుండా ఇతర పంటలతో మార్పిడి చేయాలి.",
                "biological_en": "Spray Trichoderma viride @ 5 g/L.",
                "biological_te": "ట్రైకోడెర్మా విరిడే 5 గ్రా./లీ పిచికారీ చేయాలి.",
                "chemical_en": "Spray Difenoconazole 25% EC @ 1 ml/L OR Tebuconazole 25.9% EC @ 1 ml/L OR Mancozeb 75% WP @ 2.5 g/L with sticker.",
                "chemical_te": "డైఫెనోకొనజోల్ 1 మి.లీ/లీ లేదా టెబుకొనజోల్ 1 మి.లీ/లీ లేదా మాంకోజెబ్ 2.5 గ్రా./లీ జిగురు మందు కలిపి పిచికారీ చేయాలి."
            }
        ],
        "calendar": [
            {"day_range": "DAS 0–45", "stage_en": "Nursery Stage", "stage_te": "నారుమడి దశ", "actions_en": "Raise nursery on raised beds; drench with Captan; protect from thrips; trim seedling top 1/3rd before transplanting.", "actions_te": "ఎత్తైన నారుమడులపై నారు పెంచాలి; కాప్టాన్ పిచికారీ; నాటే ముందు నారు పైభాగాన్ని 1/3 వంతు కత్తిరించాలి."},
            {"day_range": "DAT 0–30", "stage_en": "Transplanting & Establishment", "stage_te": "నాట్లు & నాటుకోవడం", "actions_en": "Transplant seedlings in shallow depth (2-3 cm); apply Oxyfluorfen pre-emergence; first top dressing at 30 DAT.", "actions_te": "2-3 సెం.మీ లోతులో నాటాలి; ఆక్సిఫ్లోర్ఫెన్ కలుపు మందు చల్లాలి; 30వ రోజు మొదటి విడత ఎరువులు."},
            {"day_range": "DAT 30–65", "stage_en": "Active Bulb Development", "stage_te": "గడ్డ ఊరే దశ", "actions_en": "Second top dressing; spray against thrips and purple blotch; maintain regular irrigation.", "actions_te": "రెండవ విడత ఎరువులు; తామర పురుగు, ఊదా మచ్చ నివారణ మందులు; క్రమం తప్పకుండా నీటి తడులు."},
            {"day_range": "DAT 65–100", "stage_en": "Maturity & Harvesting", "stage_te": "పక్వత & కోత", "actions_en": "50-70% tops fall naturally (neck fall); stop irrigation 12 days before harvest; pull bulbs and field-cure under shade for 4-5 days.", "actions_te": "50-70% పైరు సహజంగా నేలవాలినప్పుడు (నెక్‌ఫాల్) కోత కోయాలి; కోసిన తర్వాత నీడలో 4-5 రోజులు ఆరబెట్టి తాళు కత్తిరించాలి."}
        ]
    },

    "Redgram (Pigeonpea)": {
        "id": "redgram",
        "name_en": "Redgram (Pigeonpea / Tur)",
        "name_te": "కంది (Redgram / Pigeonpea)",
        "category": "Pulses",
        "varieties": {
            "en": "PRG 176 (Ujwala), Asha (ICPL 87119), WRG 65, LRG 41, Maruthi (ICP 8863), TS 3R.",
            "te": "పి.ఆర్.జి 176 (ఉజ్వల), ఆశ (ఐ.సి.పి.ఎల్ 87119), డబ్ల్యు.ఆర్.జి 65, ఎల్.ఆర్.జి 41, మారుతి, టి.ఎస్ 3ఆర్."
        },
        "advisory": {
            "soil_suitability_en": "Deep, well-drained loams and black cotton soils with pH 6.5–7.5. Sensitive to water stagnation and saline conditions.",
            "soil_suitability_te": "లోతైన నల్లరేగడి నేలలు, ఎర్ర నేలలు అనుకూలం. నీరు నిలిచే నేలలు అస్సలు పనికిరావు.",
            "seed_rate_en": "Sole crop: 4–5 kg/acre; Intercrop (Cotton:Redgram 4:1 or 6:1 or Maize:Redgram 3:1): 2–3 kg/acre.",
            "seed_rate_te": "ప్రత్యేక పంటగా: ఎకరాకు 4-5 కిలోలు; పత్తి లేదా మొక్కజొన్నలో అంతరపంటగా: 2-3 కిలోలు.",
            "seed_treatment_en": "Treat seed with Trichoderma viride @ 10 g/kg seed to prevent Fusarium wilt, then Rhizobium culture @ 200 g/10 kg seed.",
            "seed_treatment_te": "ఎండు తెగులు రాకుండా ట్రైకోడెర్మా విరిడే 10 గ్రా./కిలో పట్టించాలి, తర్వాత రైజోబియం కల్చర్ పట్టించాలి.",
            "spacing_en": "Medium duration (150-180 days): 150 cm x 30 cm or 180 cm x 20 cm.",
            "spacing_te": "వరుసల మధ్య 150-180 సెం.మీ, మొక్కల మధ్య 30 సెం.మీ.",
            "cultivation_tips_en": "Nipper the terminal shoots (nipping) at 45 DAS and 60 DAS. This encourages profuse lateral branching and increases pod yield by 30%.",
            "cultivation_tips_te": "45వ రోజు మరియు 60వ రోజు చివర్లను తుంచడం (నిప్పింగ్) వల్ల పక్క కొమ్మలు ఎక్కువగా వచ్చి 30% అధిక దిగుబడి వస్తుంది."
        },
        "fertilizer": {
            "recommended_npk_kg_per_acre": "N: 8 kg, P2O5: 20 kg, K2O: 10 kg, Sulphur: 10 kg",
            "commercial_fertilizers_per_acre_en": "DAP: 45 kg, MOP: 15 kg, Urea: 5 kg, Zinc Sulphate: 10 kg (all applied as basal dose).",
            "commercial_fertilizers_per_acre_te": "డి.ఎ.పి: 45 కిలోలు, పొటాష్: 15 కిలోలు, యూరియా: 5 కిలోలు, జింక్ సల్ఫేట్: 10 కిలోలు (అన్నీ ఆఖరి దుక్కిలోనే వేయాలి).",
            "split_schedule": [
                {"stage_en": "Basal Application", "stage_te": "ఆఖరి దుక్కిలో", "detail_en": "Entire DAP (45 kg) + MOP (15 kg) + 10 kg Gypsum/Sulphur.", "detail_te": "మొత్తం డి.ఎ.పి (45 కిలోలు) + 15 కిలోల పొటాష్ + 10 కిలోల జిప్సం ఆఖరి దుక్కిలో వేయాలి."},
                {"stage_en": "Peak Flowering (90-100 DAS)", "stage_te": "పూత దశ (90-100 రోజులు)", "detail_en": "Foliar spray 19-19-19 @ 5 g/L or 2% Urea solution + 0.1% Boron to prevent flower drop.", "detail_te": "పూత రాలకుండా 19-19-19 (5 గ్రా./లీ) లేదా 2% యూరియా ద్రావణం + బోరాన్ 1 గ్రా./లీ పిచికారీ చేయాలి."}
            ],
            "biofertilizer_en": "Rhizobium and PSB seed treatment is mandatory for rainfed pulse crops.",
            "biofertilizer_te": "విత్తనాలకు రైజోబియం మరియు పి.ఎస్.బి పట్టించడం వల్ల ఎరువుల ఖర్చు తగ్గుతుంది."
        },
        "irrigation": {
            "critical_stages_en": [
                "Flower bud initiation stage (80-90 DAS)",
                "Pod development stage (110-125 DAS)"
            ],
            "critical_stages_te": [
                "పూత మొగ్గ దశ (80-90 రోజులు - నీటి ఎద్దడి రాకూడదు)",
                "కాయ గింజ కట్టే దశ (110-125 రోజులు)"
            ],
            "drainage_guideline_en": "Provide drainage channels every 6 rows. Water stagnation for 48 hours causes Phytophthora stem rot.",
            "drainage_guideline_te": "పొలంలో నీరు నిల్వ ఉంటే ఎండు తెగులు/కాండం కుళ్లు తెగులు వస్తుంది. మురుగు కాలువలు తప్పనిసరి."
        },
        "pests": [
            {
                "name_en": "Pod Borer Complex (Helicoverpa & Maruca)",
                "name_te": "శనగపచ్చ పురుగు & మరుక మచ్చల పురుగు (Pod Borers)",
                "symptoms_en": "Webbing of flowers and tender leaves with frass (Maruca). Larva feeds inside pods by boring holes (Helicoverpa). Heavy flower drop.",
                "symptoms_te": "పూతను, ఆకులను కలిపి గూడు కట్టి లోపల ఉండి తినడం (మరుక). కాయలకు గుండ్రటి రంధ్రాలు చేసి గింజలను తినడం (శనగపచ్చ పురుగు).",
                "affected_part": "Flowers & Developing Pods",
                "etl_en": "1 larva/plant or 5-10% damaged flowers/pods.",
                "etl_te": "మొక్కకు 1 పురుగు లేదా 5-10% పూత/కాయలు దెబ్బతినడం.",
                "ipm_cultural_en": "Install 4 pheromone traps/acre. Plant Jowar or Maize on borders.",
                "ipm_cultural_te": "ఎకరాకు 4 లింగాకర్షక బుట్టలు పెట్టాలి. సరిహద్దుల్లో జొన్న లేదా మొక్కజొన్న వేయాలి.",
                "biological_en": "Spray HaNPV @ 200 LE/acre or Bacillus thuringiensis (Bt) @ 2 g/L.",
                "biological_te": "HaNPV 200 LE లేదా బిటి 2 గ్రా./లీ పిచికారీ చేయాలి.",
                "chemical_en": "First spray at flower initiation: Chlorantraniliprole 18.5% SC @ 0.3 ml/L (60 ml/acre). Second spray at pod set: Spinetoram 11.7% SC @ 0.8 ml/L OR Emamectin Benzoate 5% SG @ 0.4 g/L.",
                "chemical_te": "మొగ్గ దశలో: క్లోరంత్రానిలిప్రోల్ 0.3 మి.లీ/లీ (ఎకరాకు 60 మి.లీ). కాయ దశలో: స్పైనటోరం 0.8 మి.లీ/లీ లేదా ఇమామెక్టిన్ బెంజోయేట్ 0.4 గ్రా./లీ పిచికారీ చేయాలి."
            }
        ],
        "calendar": [
            {"day_range": "DAS 0–25", "stage_en": "Sowing & Early Vegetative", "stage_te": "విత్తడం & మొలక దశ", "actions_en": "Seed treatment; sow in furrows; spray Imazethapyr pre-emergence within 48h.", "actions_te": "విత్తన శుద్ధి; బోదెలలో విత్తాలి; కలుపు నివారణకు ఇమాజెథాపిర్ చల్లాలి."},
            {"day_range": "DAS 25–60", "stage_en": "Vegetative & Nipping", "stage_te": "శాకీయ దశ & చివర్లు తుంచడం", "actions_en": "Intercultivation; terminal shoot nipping at 45 DAS and 60 DAS; watch for leaf webber.", "actions_te": "అంతరకృషి; 45 మరియు 60వ రోజున చివర్లను తుంచాలి; ఆకు ముడత పురుగును గమనించాలి."},
            {"day_range": "DAS 60–120", "stage_en": "Flowering to Pod Set", "stage_te": "పూత నుండి కాయ దశ", "actions_en": "Pheromone traps for Helicoverpa; spray Chlorantraniliprole against pod borer; protective irrigation at flowering.", "actions_te": "లింగాకర్షక బుట్టలు; కాయ తొలుచు పురుగు నివారణ మందులు; పూత దశలో నీటి తడి ఇవ్వాలి."},
            {"day_range": "DAS 120–165+", "stage_en": "Pod Maturity & Harvesting", "stage_te": "పక్వత & కోత", "actions_en": "80% pods turn brown/black; cut plants at base, bundle and sun-cure for 5 days; thresh and winnow.", "actions_te": "80% కాయలు నలుపు/గోధుమ రంగుకు మారినప్పుడు మొక్కలను కోసి ఎండబెట్టి నూర్చాలి."}
        ]
    },

    "Bengalgram (Chickpea)": {
        "id": "bengalgram",
        "name_en": "Bengalgram (Chickpea / Chana)",
        "name_te": "శనగ (Bengalgram / Chickpea)",
        "category": "Pulses",
        "varieties": {
            "en": "JG 11, JAKI 9218, KAK 2 (Kabuli), NBeG 3, NBeG 47, Vijay, Digvijay.",
            "te": "జె.జి 11, జాకి 9218, కాక్ 2 (కాబూలి), ఎన్.బి.ఇ.జి 3, విజయ్, దిగ్విజయ్."
        },
        "advisory": {
            "soil_suitability_en": "Medium to deep black soils with good moisture retention capacity (Rabi season). pH 6.0–7.5.",
            "soil_suitability_te": "తేమను నిలుపుకునే నల్లరేగడి నేలలు రబీ శనగ సాగుకు అత్యంత అనుకూలం.",
            "seed_rate_en": "Desi varieties (JG 11): 25–30 kg/acre; Kabuli varieties (KAK 2): 45–50 kg/acre.",
            "seed_rate_te": "దేశవాళీ రకాలు (JG 11): ఎకరాకు 25-30 కిలోలు; కాబూలి రకాలు: 45-50 కిలోలు.",
            "seed_treatment_en": "Treat seed with Trichoderma viride @ 10 g/kg seed to prevent wilt, followed by Rhizobium culture.",
            "seed_treatment_te": "విత్తనానికి ట్రైకోడెర్మా విరిడే 10 గ్రా./కిలో మరియు రైజోబియం కల్చర్ పట్టించాలి.",
            "spacing_en": "30 cm x 10 cm (Desi); 30 cm x 15 cm (Kabuli).",
            "spacing_te": "వరుసల మధ్య 30 సెం.మీ, మొక్కల మధ్య 10 సెం.మీ.",
            "cultivation_tips_en": "Nipping (plucking top growing shoots) at 30-35 DAS increases branching and pod load by 25%.",
            "cultivation_tips_te": "30-35 రోజుల వయసులో పై చివర్లను తుంచడం వల్ల కొమ్మలు ఎక్కువగా వచ్చి 25% దిగుబడి పెరుగుతుంది."
        },
        "fertilizer": {
            "recommended_npk_kg_per_acre": "N: 8 kg, P2O5: 20 kg, K2O: 0 kg (soil dependent)",
            "commercial_fertilizers_per_acre_en": "DAP: 45 kg/acre basal. Foliar spray 2% Urea at flowering and pod development.",
            "commercial_fertilizers_per_acre_te": "ఆఖరి దుక్కిలో డి.ఎ.పి 45 కిలోలు. పూత మరియు కాయ దశలలో 2% యూరియా లేదా 19-19-19 పిచికారీ.",
            "split_schedule": [
                {"stage_en": "Basal Application", "stage_te": "ఆఖరి దుక్కిలో", "detail_en": "Entire DAP (45 kg) applied in seed furrows.", "detail_te": "మొత్తం డి.ఎ.పి 45 కిలోలు ఆఖరి దుక్కిలో వేయాలి."},
                {"stage_en": "Flowering & Pod Fill (45-55 DAS)", "stage_te": "పూత మరియు కాయ దశ", "detail_en": "Foliar spray 13-0-45 (10 g/L) + Boron (1 g/L) to prevent flower drop.", "detail_te": "13-0-45 (10 గ్రా./లీ) + బోరాన్ (1 గ్రా./లీ) పిచికారీ చేయాలి."}
            ],
            "biofertilizer_en": "Rhizobium and PSB seed inoculation improves nodulation in black soils.",
            "biofertilizer_te": "రైజోబియం మరియు పి.ఎస్.బి వాడటం వల్ల వేర్లలో బుడిపెలు వృద్ధి చెందుతాయి."
        },
        "irrigation": {
            "critical_stages_en": [
                "Pre-flowering stage (30-35 DAS)",
                "Pod development stage (55-65 DAS)"
            ],
            "critical_stages_te": [
                "పూతకు ముందు దశ (30-35 రోజులు)",
                "కాయ గింజ కట్టే దశ (55-65 రోజులు)"
            ],
            "drainage_guideline_en": "Excess moisture causes collar rot and excessive vegetative growth. Avoid flood irrigation.",
            "drainage_guideline_te": "నీరు ఎక్కువైతే మొక్కలు ఏపుగా పెరిగి కాత రాదు, వేరుకుళ్లు వస్తుంది. తేలికపాటి తడి మాత్రమే ఇవ్వాలి."
        },
        "pests": [
            {
                "name_en": "Gram Pod Borer (Helicoverpa armigera)",
                "name_te": "శనగపచ్చ పురుగు (Helicoverpa)",
                "symptoms_en": "Defoliation of tender leaves, skeletonized leaves, circular bore holes on developing pods with larvae feeding inside.",
                "symptoms_te": "ఆకులను తినడం, కాయలకు గుండ్రటి రంధ్రాలు చేసి లోపలి గింజలను పూర్తిగా తినేయడం.",
                "affected_part": "Leaves & Pods",
                "etl_en": "1 larva/meter row or 2% damaged pods.",
                "etl_te": "మీటరు వరుసకు 1 పురుగు కనిపించినప్పుడు.",
                "ipm_cultural_en": "Erect bird perches (T-shaped sticks, 20/acre) to encourage insectivorous birds.",
                "ipm_cultural_te": "ఎకరాకు 20 పక్షి స్థావరాలు (T ఆకారపు కర్రలు) ఏర్పాటు చేయాలి.",
                "biological_en": "Spray HaNPV @ 200 LE/acre at early instar stage.",
                "biological_te": "చిన్న పురుగులపై HaNPV 200 LE పిచికారీ చేయాలి.",
                "chemical_en": "Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L (60 ml/acre) OR Emamectin Benzoate 5% SG @ 0.4 g/L.",
                "chemical_te": "క్లోరంత్రానిలిప్రోల్ 0.3 మి.లీ/లీ లేదా ఇమామెక్టిన్ బెంజోయేట్ 0.4 గ్రా./లీ పిచికారీ చేయాలి."
            }
        ],
        "calendar": [
            {"day_range": "DAS 0–20", "stage_en": "Sowing & Germination", "stage_te": "విత్తడం & మొలక దశ", "actions_en": "Sow in residual moisture after Kharif crop; seed treatment with Trichoderma.", "actions_te": "రబీలో తేమ చూసి విత్తాలి; ట్రైకోడెర్మాతో విత్తన శుద్ధి."},
            {"day_range": "DAS 20–45", "stage_en": "Vegetative & Nipping", "stage_te": "శాకీయ దశ & చివర్లు తుంచడం", "actions_en": "Weeding at 25 DAS; nip terminal shoots at 35 DAS; install bird perches and pheromone traps.", "actions_te": "25వ రోజు కలుపు తీత; 35వ రోజు చివర్లు తుంచడం; పక్షి స్థావరాలు పెట్టాలి."},
            {"day_range": "DAS 45–75", "stage_en": "Flowering & Pod Set", "stage_te": "పూత & కాయ దశ", "actions_en": "Monitor pod borer; spray Chlorantraniliprole if ETL crossed; give one protective irrigation if soil dries.", "actions_te": "పురుగు ఉధృతిని గమనించి మందు కొట్టాలి; నేల నెర్రలు విడిస్తే తేలికపాటి తడి ఇవ్వాలి."},
            {"day_range": "DAS 75–100", "stage_en": "Maturity & Harvesting", "stage_te": "పక్వత & కోత", "actions_en": "Leaves turn yellow-brown and shed; pods rattle when shaken; pull plants in morning and sun-cure.", "actions_te": "ఆకులు ఎండి రాలిపోతాయి; కాయలు గలగలలాడతాయి; ఉదయం వేళ కోసి ఎండబెట్టాలి."}
        ]
    },

    "Wheat": {
        "id": "wheat",
        "name_en": "Wheat",
        "name_te": "గోధుమ (Wheat)",
        "category": "Cereals",
        "varieties": {
            "en": "HD 2967, HD 3086 (Pusa Gautami), PBW 343, PBW 550, DBW 187 (Karan Vandana), GW 322, Sharbati.",
            "te": "హెచ్.డి 2967, హెచ్.డి 3086, పి.బి.డబ్ల్యు 343, డి.బి.డబ్ల్యు 187, జి.డబ్ల్యు 322."
        },
        "advisory": {
            "soil_suitability_en": "Fertile alluvial loams and clay loams with neutral pH (6.5–7.5). Avoid poor drainage and extreme acidity.",
            "soil_suitability_te": "ఒండ్రు మరియు గోధుమ రంగు నేలలు (pH 6.5 - 7.5) అనుకూలం.",
            "seed_rate_en": "40 kg per acre for timely sowing; 50 kg per acre for late sowing.",
            "seed_rate_te": "సకాలంలో విత్తితే ఎకరాకు 40 కిలోలు; ఆలస్యంగా విత్తితే 50 కిలోలు.",
            "seed_treatment_en": "Treat seed with Carbendazim 2 g/kg seed or Tebuconazole (Raxil) @ 1 g/kg against loose smut.",
            "seed_treatment_te": "కాటుక తెగులు నివారణకు కార్బండైజిమ్ 2 గ్రా./కిలో లేదా టెబుకొనజోల్ 1 గ్రా./కిలో పట్టించాలి.",
            "spacing_en": "20–22.5 cm between rows x 5 cm between plants.",
            "spacing_te": "వరుసల మధ్య 20-22.5 సెం.మీ, మొక్కల మధ్య 5 సెం.మీ.",
            "cultivation_tips_en": "Optimum sowing window: November 1st to 20th in North/Central India. Late sowing reduces grain filling duration due to terminal heat stress.",
            "cultivation_tips_te": "నవంబర్ మొదటి పక్షం విత్తుకోవడానికి అత్యంత అనుకూలం. ఆలస్యమైతే మార్చిలో ఎండల తీవ్రతకు గింజ తాలుగా మారుతుంది."
        },
        "fertilizer": {
            "recommended_npk_kg_per_acre": "N: 48–60 kg, P2O5: 24 kg, K2O: 16 kg",
            "commercial_fertilizers_per_acre_en": "Urea: 100–120 kg, DAP: 50 kg, MOP: 25 kg, Zinc Sulphate: 10 kg/acre.",
            "commercial_fertilizers_per_acre_te": "యూరియా: 100-120 కిలోలు, డి.ఎ.పి: 50 కిలోలు, పొటాష్: 25 కిలోలు, జింక్: 10 కిలోలు.",
            "split_schedule": [
                {"stage_en": "Basal Application", "stage_te": "ఆఖరి దుక్కిలో", "detail_en": "Entire DAP (50 kg) + 25 kg MOP + 1/3rd Urea (35 kg) + 10 kg Zinc Sulphate.", "detail_te": "మొత్తం DAP (50 కిలోలు) + 25 కిలోల పొటాష్ + 35 కిలోల యూరియా + 10 కిలోల జింక్."},
                {"stage_en": "CRI Stage (20-25 DAS)", "stage_te": "మొదటి నీటి తడి దశ (CRI - 21 రోజులు)", "detail_en": "Top dress 1/3rd Urea (40 kg) after 1st irrigation.", "detail_te": "మొదటి తడి ఇచ్చిన తర్వాత 40 కిలోల యూరియా వేయాలి."},
                {"stage_en": "Booting / Heading (45-50 DAS)", "stage_te": "కంకి దశ (45-50 రోజులు)", "detail_en": "Top dress remaining Urea (35 kg). Spray 13-0-45 (10 g/L) if terminal heat expected.", "detail_te": "మిగిలిన 35 కిలోల యూరియా వేయాలి. ఎండల తీవ్రత ఉంటే 13-0-45 పిచికారీ చేయాలి."}
            ],
            "biofertilizer_en": "Azotobacter and PSB seed treatment @ 200 g/10 kg seed.",
            "biofertilizer_te": "అజోటోబాక్టర్, పి.ఎస్.బి కల్చర్లతో విత్తన శుద్ధి చేయాలి."
        },
        "irrigation": {
            "critical_stages_en": [
                "Crown Root Initiation (CRI at 21 DAS - MOST CRITICAL, NEVER SKIP)",
                "Tillering stage (40-45 DAS)",
                "Jointing / Booting stage (60-65 DAS)",
                "Flowering stage (80-85 DAS)",
                "Milking / Grain filling stage (100-105 DAS)"
            ],
            "critical_stages_te": [
                "శిఖర వేర్లు ఏర్పడే దశ (CRI - 21వ రోజు - అత్యంత ప్రధానమైన తడి)",
                "పిలకలు వేసే దశ (40-45 రోజులు)",
                "మోకాలి కణుపుల దశ (60-65 రోజులు)",
                "పూత దశ (80-85 రోజులు)",
                "గింజ పాలుపోసుకునే దశ (100-105 రోజులు)"
            ],
            "drainage_guideline_en": "Avoid lodging caused by irrigating during strong windy days at grain filling stage.",
            "drainage_guideline_te": "గింజ బరువుగా ఉన్నప్పుడు ఈదురు గాలులు వీచే వేళల్లో నీరు పెడితే పైరు నేలవాలుతుంది."
        },
        "pests": [
            {
                "name_en": "Yellow Rust & Brown Rust (Puccinia spp.)",
                "name_te": "పసుపు / గోధుమ రంగు తుప్పు తెగులు (Rust)",
                "symptoms_en": "Bright yellow pustules arranged in linear stripes along leaf veins (Yellow Rust), or small round orange-brown pustules scattered across leaf surface (Brown Rust).",
                "symptoms_te": "ఆకుల నరాల వెంట పసుపు రంగు చారలలో పొక్కులు (పసుపు తుప్పు) లేదా ఆకులపై గుండ్రటి నారింజ-గోధుమ రంగు పొక్కులు (గోధుమ తుప్పు). తాకితే చేతికి పసుపు రంగు అంటుతుంది.",
                "affected_part": "Leaves",
                "etl_en": "First appearance of yellow rust stripes in field.",
                "etl_te": "పొలంలో మొదటి పసుపు చారలు కనిపించిన వెంటనే.",
                "ipm_cultural_en": "Grow resistant varieties like HD 3086 or DBW 187.",
                "ipm_cultural_te": "తుప్పును తట్టుకునే హెచ్.డి 3086 లేదా డి.బి.డబ్ల్యు 187 రకాలను వాడాలి.",
                "biological_en": "Conserve beneficial phyllosphere microbes.",
                "biological_te": "సేంద్రీయ సూక్ష్మజీవులను ప్రోత్సహించాలి.",
                "chemical_en": "Spray Propiconazole 25% EC (Tilt) @ 1 ml/L (200 ml/acre) OR Tebuconazole 25.9% EC @ 1 ml/L. Repeat after 15 days if necessary.",
                "chemical_te": "ప్రొపికొనజోల్ 25% EC (టిల్ట్) 1 మి.లీ/లీ (ఎకరాకు 200 మి.లీ) లేదా టెబుకొనజోల్ 1 మి.లీ/లీ పిచికారీ చేయాలి."
            }
        ],
        "calendar": [
            {"day_range": "DAS 0–21", "stage_en": "Sowing to CRI", "stage_te": "విత్తడం నుండి CRI దశ", "actions_en": "Sow behind plough; ensure 1st irrigation at exactly 21 DAS (Crown Root Initiation).", "actions_te": "సాలులో విత్తాలి; ఖచ్చితంగా 21వ రోజున మొదటి తడి (CRI) ఇవ్వాలి."},
            {"day_range": "DAS 21–45", "stage_en": "Tillering Stage", "stage_te": "పిలకల దశ", "actions_en": "Top dress Urea; spray Sulfosulfuron or Clodinafop for weed control at 30 DAS.", "actions_te": "యూరియా వేయాలి; 30వ రోజు కలుపు మందు చల్లాలి."},
            {"day_range": "DAS 45–80", "stage_en": "Jointing to Booting", "stage_te": "కణుపు నుండి కంకి దశ", "actions_en": "2nd & 3rd irrigation; monitor yellow rust; spray Propiconazole if rust spotted.", "actions_te": "2వ మరియు 3వ తడి; పసుపు తుప్పును గమనించాలి; తెగులు కనిపిస్తే ప్రొపికొనజోల్ పిచికారీ."},
            {"day_range": "DAS 80–120", "stage_en": "Grain Filling & Ripening", "stage_te": "గింజ పాలుపోసుకోవడం & పక్వత", "actions_en": "Ensure moisture during milk stage; harvest when straw turns golden yellow and grain moisture drops to 12%.", "actions_te": "పాలుపోసుకునే దశలో తేమ ఇవ్వాలి; గడ్డి బంగారు రంగుకు మారి గింజ గట్టిపడినప్పుడు కోయాలి."}
        ]
    }
}



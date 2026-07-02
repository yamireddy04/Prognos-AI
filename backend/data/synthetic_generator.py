import math
import random
import numpy as np
import pandas as pd
from pathlib import Path

random.seed(42)
np.random.seed(42)

CARDIOLOGY_TEMPLATES = [
    "Patient is a {age}-year-old {gender} with a history of {cardiac_hx} presenting with {cardiac_sx}. "
    "Vitals on admission: BP {bp}, HR {hr} bpm, RR {rr}, SpO2 {spo2}%. "
    "ECG showed {ecg_finding}. Troponin {troponin}. BNP {bnp}. "
    "Echocardiogram demonstrated {echo}. "
    "Patient was started on {cardiac_meds}. "
    "Hospital course was {course}. Discharged in {condition} condition.",
]

NEUROLOGY_TEMPLATES = [
    "Patient is a {age}-year-old {gender} presenting with {neuro_sx} of {duration} duration. "
    "PMH significant for {neuro_hx}. "
    "Vitals on admission: BP {bp}, HR {hr} bpm, RR {rr}, SpO2 {spo2}%. "
    "Neurological exam: {neuro_exam}. "
    "MRI brain {mri}. CT head {ct}. LP {lp}. "
    "EEG {eeg}. "
    "Neurology was consulted. Patient started on {neuro_meds}. "
    "Functional status at discharge: {functional}.",
]

ORTHOPEDICS_TEMPLATES = [
    "Patient is a {age}-year-old {gender} admitted after {ortho_event}. "
    "Vitals on admission: BP {bp}, HR {hr} bpm, RR {rr}, SpO2 {spo2}%. "
    "Imaging revealed {ortho_imaging}. "
    "Orthopedic surgery performed {procedure} without complications. "
    "Pain management with {pain_meds}. PT/OT consulted. "
    "Wound {wound}. Ambulation {ambulation}. "
    "Discharged to {discharge_dest} with follow-up in {followup} weeks.",
]

ONCOLOGY_TEMPLATES = [
    "Patient is a {age}-year-old {gender} with {cancer_type} cancer, stage {stage}, presenting for {onco_reason}. "
    "Vitals on admission: BP {bp}, HR {hr} bpm, RR {rr}, SpO2 {spo2}%, T {temp}F. "
    "Performance status ECOG {ecog}. "
    "Labs: WBC {wbc}, Hgb {hgb}, Plt {plt}. LFTs {lfts}. Creatinine {cr}. "
    "Imaging {onco_imaging}. "
    "Cycle {cycle} of {chemo_regimen} administered. Toxicity: {toxicity}. "
    "Antiemetics and supportive care provided. Discharged in {condition} condition.",
]

GENERAL_TEMPLATES = [
    "Patient is a {age}-year-old {gender} presenting with {general_sx}. "
    "PMH: {pmh}. Medications: {meds_list}. Allergies: {allergies}. "
    "Vitals: T {temp}F, BP {bp}, HR {hr} bpm, RR {rr}, SpO2 {spo2}%. "
    "Physical exam: {exam_findings}. "
    "Labs notable for {labs}. "
    "Assessment: {assessment}. "
    "Hospital course: {course}. "
    "Discharged with {dc_meds} and instructions for follow-up.",
]

FILLERS = {
    "age": lambda: str(random.randint(18, 92)),
    "gender": lambda: random.choice(["male", "female"]),
    "bp": lambda: f"{random.randint(90,180)}/{random.randint(60,110)}",
    "hr": lambda: str(random.randint(50, 130)),
    "rr": lambda: str(random.randint(12, 30)),
    "spo2": lambda: str(random.randint(88, 100)),
    "temp": lambda: f"{random.uniform(97.0, 103.5):.1f}",
    "duration": lambda: random.choice(["2 hours", "1 day", "3 days", "acute onset"]),
    "cardiac_hx": lambda: random.choice(["hypertension, hyperlipidemia", "atrial fibrillation", "prior MI", "CHF with EF 35%", "CAD s/p CABG"]),
    "cardiac_sx": lambda: random.choice(["chest pain and dyspnea", "acute-onset palpitations", "syncope", "worsening exertional dyspnea", "orthopnea and PND"]),
    "ecg_finding": lambda: random.choice(["normal sinus rhythm", "ST-elevation in V1-V4", "new LBBB", "atrial fibrillation with RVR", "sinus tachycardia"]),
    "troponin": lambda: random.choice(["was elevated at 2.3", "trended down from 1.1 to 0.4", "was negative x2", "peaked at 45.2"]),
    "bnp": lambda: f"{random.randint(100, 8000)} pg/mL",
    "echo": lambda: random.choice(["EF 25%, global hypokinesis", "EF 55%, mild MR", "EF 40%, anterior wall hypokinesis", "normal function"]),
    "cardiac_meds": lambda: random.choice(["metoprolol, lisinopril, aspirin", "heparin drip, dual antiplatelet therapy", "IV furosemide, nitrates", "amiodarone, anticoagulation"]),
    "neuro_sx": lambda: random.choice(["sudden-onset left-sided weakness", "new-onset seizures", "severe headache", "word-finding difficulty", "gait instability"]),
    "neuro_hx": lambda: random.choice(["hypertension and diabetes", "prior stroke", "epilepsy on valproate", "migraine disorder", "MS diagnosed 10 years ago"]),
    "neuro_exam": lambda: random.choice(["left hemiplegia, facial droop", "normal cranial nerves, cerebellar ataxia", "aphasia, right-sided neglect", "intact strength, hyperreflexia"]),
    "mri": lambda: random.choice(["showed acute ischemic stroke in MCA territory", "demonstrated new T2 lesions", "was unremarkable", "showed mass effect"]),
    "ct": lambda: random.choice(["was negative for hemorrhage", "showed subarachnoid blood", "demonstrated hyperdense MCA sign"]),
    "lp": lambda: random.choice(["not performed", "showed xanthochromia", "was clear with normal pressure"]),
    "eeg": lambda: random.choice(["showed focal slowing", "was normal", "demonstrated epileptiform discharges"]),
    "neuro_meds": lambda: random.choice(["tPA, aspirin, statin", "levetiracetam 1000mg BID", "dexamethasone, mannitol", "IV methylprednisolone"]),
    "functional": lambda: random.choice(["returned to baseline", "required assist of one for ADLs", "discharged to inpatient rehab", "discharged with home PT"]),
    "ortho_event": lambda: random.choice(["ground-level fall", "motor vehicle accident", "sports injury", "pathologic fracture"]),
    "ortho_imaging": lambda: random.choice(["right hip fracture", "comminuted tibial plateau fracture", "L2-L3 compression fracture", "left femoral neck fracture"]),
    "procedure": lambda: random.choice(["ORIF", "total hip arthroplasty", "hemiarthroplasty", "kyphoplasty"]),
    "pain_meds": lambda: random.choice(["scheduled acetaminophen and oxycodone PRN", "IV ketorolac and PO tramadol", "multimodal analgesia protocol"]),
    "wound": lambda: random.choice(["healing well, no signs of infection", "with mild serous drainage", "staples intact"]),
    "ambulation": lambda: random.choice(["with walker, weight-bearing as tolerated", "non-weight-bearing per surgeon", "with physical therapy assistance"]),
    "discharge_dest": lambda: random.choice(["skilled nursing facility", "home with home health", "acute rehab"]),
    "followup": lambda: str(random.randint(2, 6)),
    "cancer_type": lambda: random.choice(["non-small cell lung", "colorectal", "breast", "pancreatic", "lymphoma"]),
    "stage": lambda: random.choice(["II", "IIIA", "IIIB", "IV"]),
    "onco_reason": lambda: random.choice(["cycle 3 of chemotherapy", "febrile neutropenia management", "pain crisis", "bowel obstruction"]),
    "ecog": lambda: str(random.randint(1, 3)),
    "wbc": lambda: f"{random.uniform(0.8, 15.0):.1f}",
    "hgb": lambda: f"{random.uniform(6.5, 14.5):.1f}",
    "plt": lambda: str(random.randint(20, 450)),
    "lfts": lambda: random.choice(["within normal limits", "mildly elevated ALT/AST", "elevated bili 3.2"]),
    "cr": lambda: f"{random.uniform(0.7, 3.5):.1f}",
    "onco_imaging": lambda: random.choice(["CT chest/abdomen/pelvis with stable disease", "PET scan showing partial response", "MRI brain with new metastases"]),
    "cycle": lambda: str(random.randint(1, 8)),
    "chemo_regimen": lambda: random.choice(["FOLFOX", "carboplatin/paclitaxel", "R-CHOP", "gemcitabine/nab-paclitaxel", "AC-T"]),
    "toxicity": lambda: random.choice(["grade 1 nausea and fatigue", "grade 2 peripheral neuropathy", "grade 3 neutropenia", "minimal"]),
    "general_sx": lambda: random.choice(["fever, cough, and shortness of breath", "nausea, vomiting, and abdominal pain", "cellulitis of the right lower extremity", "altered mental status"]),
    "pmh": lambda: random.choice(["type 2 diabetes, hypertension, obesity", "COPD, tobacco use", "CKD stage 3, anemia", "hypothyroidism, depression"]),
    "meds_list": lambda: random.choice(["metformin, lisinopril, atorvastatin", "albuterol, tiotropium, prednisone", "levothyroxine, sertraline", "insulin glargine, metoprolol, furosemide"]),
    "allergies": lambda: random.choice(["NKDA", "penicillin (rash)", "sulfa drugs", "aspirin (GI upset)"]),
    "exam_findings": lambda: random.choice(["decreased breath sounds bilaterally", "tender abdomen with voluntary guarding", "erythema and warmth of right leg", "confused, not oriented to place"]),
    "labs": lambda: random.choice(["leukocytosis 18K, left shift", "metabolic acidosis, lactate 4.2", "AKI with Cr 2.8 from baseline 1.0", "hyponatremia Na 124"]),
    "assessment": lambda: random.choice(["community-acquired pneumonia", "small bowel obstruction", "sepsis from urinary source", "COPD exacerbation"]),
    "course": lambda: random.choice(["complicated by hypotension requiring vasopressors", "uncomplicated", "slow but steady improvement", "required ICU transfer for close monitoring"]),
    "dc_meds": lambda: random.choice(["oral antibiotics for 7-day course", "new beta-blocker and diuretic", "modified insulin regimen", "anticoagulation and close follow-up"]),
    "condition": lambda: random.choice(["stable", "improved", "guarded"]),
}

VITALS_FILLER_KEYS = {"age", "bp", "hr", "rr", "spo2", "temp"}

SPECIALTY_MAP = {
    "Cardiology": CARDIOLOGY_TEMPLATES,
    "Neurology": NEUROLOGY_TEMPLATES,
    "Orthopedics": ORTHOPEDICS_TEMPLATES,
    "Oncology": ONCOLOGY_TEMPLATES,
    "General Medicine": GENERAL_TEMPLATES,
}

LOS_WEIGHTS = {
    "Cardiology": [0.2, 0.5, 0.3],
    "Neurology": [0.15, 0.45, 0.4],
    "Orthopedics": [0.1, 0.5, 0.4],
    "Oncology": [0.2, 0.35, 0.45],
    "General Medicine": [0.35, 0.4, 0.25],
}

READMISSION_BASE = {
    "Cardiology": 0.35,
    "Neurology": 0.28,
    "Orthopedics": 0.15,
    "Oncology": 0.38,
    "General Medicine": 0.22,
}

SEVERITY_WEIGHTS = {
    "tachycardia": 1.0,
    "hypotension": 1.2,
    "hypoxia": 1.4,
    "tachypnea": 0.8,
    "fever": 0.6,
    "comorbidities": 0.35,
    "prior_admissions": 0.45,
}


def generate_vitals() -> dict:
    hr = random.randint(50, 130)
    sbp = random.randint(85, 190)
    dbp = random.randint(50, 115)
    rr = random.randint(12, 32)
    spo2 = random.randint(87, 100)
    temp = round(random.uniform(97.0, 104.0), 1)
    age = random.randint(18, 92)
    gender = random.choice([0, 1])
    n_comorbidities = random.randint(0, 6)
    n_meds = random.randint(1, 12)
    prior_admissions = random.randint(0, 5)

    return {
        "age": age,
        "gender": gender,
        "hr": hr,
        "sbp": sbp,
        "dbp": dbp,
        "rr": rr,
        "spo2": spo2,
        "temp": temp,
        "n_comorbidities": n_comorbidities,
        "n_meds": n_meds,
        "prior_admissions": prior_admissions,
    }


def _vitals_filler_value(key: str, vitals: dict) -> str:
    if key == "age":
        return str(vitals["age"])
    if key == "bp":
        return f"{vitals['sbp']}/{vitals['dbp']}"
    if key == "hr":
        return str(vitals["hr"])
    if key == "rr":
        return str(vitals["rr"])
    if key == "spo2":
        return str(vitals["spo2"])
    if key == "temp":
        return f"{vitals['temp']:.1f}"
    raise KeyError(f"Unknown vitals filler key: {key}")


def _fill_template(template: str, vitals: dict) -> str:
    result = template
    for key, fn in FILLERS.items():
        placeholder = "{" + key + "}"
        while placeholder in result:
            if key in VITALS_FILLER_KEYS:
                value = _vitals_filler_value(key, vitals)
            elif key == "gender":
                value = "male" if vitals["gender"] == 0 else "female"
            else:
                value = fn()
            result = result.replace(placeholder, value, 1)
    return result


def generate_note(specialty: str, vitals: dict) -> str:
    template = random.choice(SPECIALTY_MAP[specialty])
    return _fill_template(template, vitals)


def compute_severity_score(vitals: dict, n_comorbidities: int, prior_admissions: int) -> float:
    hr = vitals.get("hr", 80)
    sbp = vitals.get("sbp", 120)
    spo2 = vitals.get("spo2", 98)
    rr = vitals.get("rr", 16)
    temp = vitals.get("temp", 98.6)

    n_comorbidities = max(0, min(n_comorbidities, 20))
    prior_admissions = max(0, min(prior_admissions, 20))

    tachycardia = max(0.0, (hr - 100) / 30.0) if hr > 100 else 0.0
    hypotension = max(0.0, (90 - sbp) / 20.0) if sbp < 90 else 0.0
    hypoxia = max(0.0, (92 - spo2) / 10.0) if spo2 < 92 else 0.0
    tachypnea = max(0.0, (rr - 22) / 10.0) if rr > 22 else 0.0
    fever = max(0.0, (temp - 100.4) / 4.0) if temp > 100.4 else 0.0

    tachycardia = min(tachycardia, 1.0)
    hypotension = min(hypotension, 1.0)
    hypoxia = min(hypoxia, 1.0)
    tachypnea = min(tachypnea, 1.0)
    fever = min(fever, 1.0)

    comorbidity_component = min(n_comorbidities / 6.0, 1.0)
    prior_admission_component = min(prior_admissions / 5.0, 1.0)

    raw_score = (
        SEVERITY_WEIGHTS["tachycardia"] * tachycardia
        + SEVERITY_WEIGHTS["hypotension"] * hypotension
        + SEVERITY_WEIGHTS["hypoxia"] * hypoxia
        + SEVERITY_WEIGHTS["tachypnea"] * tachypnea
        + SEVERITY_WEIGHTS["fever"] * fever
        + SEVERITY_WEIGHTS["comorbidities"] * comorbidity_component
        + SEVERITY_WEIGHTS["prior_admissions"] * prior_admission_component
    )

    max_possible = sum(SEVERITY_WEIGHTS.values())
    normalized = raw_score / max_possible if max_possible > 0 else 0.0

    stretched = normalized / 0.55
    try:
        severity_score = 1.0 / (1.0 + math.exp(-6.0 * (stretched - 0.5)))
    except OverflowError:
        severity_score = 0.0 if stretched < 0.5 else 1.0

    return max(0.0, min(severity_score, 1.0))


def assign_los_band(specialty: str, severity_score: float) -> int:
    prior_weights = LOS_WEIGHTS[specialty]
    severity_score = max(0.0, min(severity_score, 1.0))

    short_shift = severity_score * prior_weights[0] * 0.9
    mid_shift = severity_score * prior_weights[1] * 0.6

    adjusted = [
        max(prior_weights[0] - short_shift, 0.02),
        max(prior_weights[1] - mid_shift, 0.02),
        prior_weights[2] + short_shift + mid_shift,
    ]

    total = sum(adjusted)
    normalized_weights = [w / total for w in adjusted]
    return random.choices([0, 1, 2], weights=normalized_weights)[0]


def assign_readmission(specialty: str, los_band: int, severity_score: float) -> int:
    base = READMISSION_BASE[specialty]
    severity_score = max(0.0, min(severity_score, 1.0))

    high_risk_ceiling = 0.85
    blended = base * (1.0 - severity_score) + high_risk_ceiling * severity_score
    blended = min(blended, 0.95)

    if los_band == 2:
        blended = min(blended + 0.15, 0.95)

    return int(random.random() < blended)


def generate_dataset(n_samples: int = 1200) -> pd.DataFrame:
    records = []
    specialties = list(SPECIALTY_MAP.keys())
    specialty_indices = {s: i for i, s in enumerate(specialties)}

    for _ in range(n_samples):
        specialty = random.choice(specialties)
        vitals = generate_vitals()
        note = generate_note(specialty, vitals)

        severity_score = compute_severity_score(
            vitals, vitals["n_comorbidities"], vitals["prior_admissions"]
        )
        los_band = assign_los_band(specialty, severity_score)
        readmission = assign_readmission(specialty, los_band, severity_score)

        records.append({
            "note": note,
            "specialty": specialty,
            "specialty_id": specialty_indices[specialty],
            "readmission_30d": readmission,
            "los_band": los_band,
            "age": vitals["age"],
            "gender": vitals["gender"],
            "hr": vitals["hr"],
            "sbp": vitals["sbp"],
            "dbp": vitals["dbp"],
            "rr": vitals["rr"],
            "spo2": vitals["spo2"],
            "temp": vitals["temp"],
            "n_comorbidities": vitals["n_comorbidities"],
            "n_meds": vitals["n_meds"],
            "prior_admissions": vitals["prior_admissions"],
        })

    return pd.DataFrame(records)


if __name__ == "__main__":
    output_dir = Path(__file__).resolve().parent.parent / "data"
    output_dir.mkdir(exist_ok=True)
    df = generate_dataset(1200)
    df.to_csv(output_dir / "clinical_notes.csv", index=False)
    print(f"Generated {len(df)} records -> {output_dir / 'clinical_notes.csv'}")
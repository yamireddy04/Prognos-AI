import os
import json
import re
import numpy as np
from groq import Groq
from typing import List, Tuple, Optional
from config import TASK_LABELS, GROQ_MODEL, settings


TASK_PROMPTS = {
    "readmission": {
        "system": (
            "You are a clinical NLP expert specializing in hospital readmission prediction. "
            "Analyze the clinical note and predict whether the patient will be readmitted within 30 days. "
            "Consider: discharge complexity, comorbidity burden, medication complexity, prior admissions, "
            "and clinical trajectory. "
            "Respond ONLY with valid JSON in this exact format: "
            '{"prediction": 0_or_1, "confidence": float_0_to_1, "reasoning": "brief clinical rationale", '
            '"risk_factors": ["factor1","factor2","factor3"], "protective_factors": ["factor1","factor2"]}'
        ),
        "labels": ["No Readmission", "30-Day Readmission"],
    },
    "los_band": {
        "system": (
            "You are a clinical NLP expert predicting hospital length of stay. "
            "Analyze the clinical note and classify into: 0=Short (<3 days), 1=Medium (3-7 days), 2=Long (>7 days). "
            "Consider: diagnosis severity, procedures required, complications, and comorbidities. "
            "Respond ONLY with valid JSON in this exact format: "
            '{"prediction": 0_1_or_2, "confidence": float_0_to_1, "reasoning": "brief clinical rationale", '
            '"key_determinants": ["determinant1","determinant2","determinant3"]}'
        ),
        "labels": ["Short (<3d)", "Medium (3-7d)", "Long (>7d)"],
    },
    "specialty": {
        "system": (
            "You are a clinical NLP expert identifying medical specialties from clinical notes. "
            "Classify into: 0=Cardiology, 1=Neurology, 2=Orthopedics, 3=Oncology, 4=General Medicine. "
            "Base your decision on diagnoses, procedures, medications, and clinical content. "
            "Respond ONLY with valid JSON in this exact format: "
            '{"prediction": 0_1_2_3_or_4, "confidence": float_0_to_1, "reasoning": "brief clinical rationale", '
            '"supporting_evidence": ["evidence1","evidence2","evidence3"]}'
        ),
        "labels": ["Cardiology", "Neurology", "Orthopedics", "Oncology", "General Medicine"],
    },
}


class GroqAdvancedModel:
    def __init__(self, task: str):
        self.task = task
        self.labels = TASK_LABELS.get(task, [])
        self._task_config = TASK_PROMPTS[task]
        self._client: Optional[Groq] = None

    def _get_client(self) -> Groq:
        if self._client is None:
            api_key = settings.groq_api_key or os.environ.get("GROQ_API_KEY", "")
            if not api_key:
                raise ValueError("GROQ_API_KEY not set. Add it to .env file.")
            self._client = Groq(api_key=api_key)
        return self._client

    def _parse_response(self, content: str) -> dict:
        content = content.strip()
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        raise ValueError(f"Could not parse JSON from response: {content[:200]}")

    def predict(self, text: str) -> Tuple[int, List[float], dict]:
        client = self._get_client()
        n_classes = len(self._task_config["labels"])
        truncated_text = text[:3000] if len(text) > 3000 else text

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": self._task_config["system"]},
                {"role": "user", "content": f"Clinical Note:\n\n{truncated_text}"},
            ],
            temperature=0.1,
            max_tokens=512,
        )

        raw = response.choices[0].message.content
        parsed = self._parse_response(raw)

        prediction = int(parsed.get("prediction", 0))
        confidence = float(parsed.get("confidence", 0.5))
        confidence = max(0.0, min(1.0, confidence))

        proba = np.full(n_classes, (1 - confidence) / max(n_classes - 1, 1))
        proba[prediction] = confidence
        proba = (proba / proba.sum()).tolist()

        metadata = {
            "reasoning": parsed.get("reasoning", ""),
            "risk_factors": parsed.get("risk_factors", parsed.get("key_determinants", parsed.get("supporting_evidence", []))),
            "protective_factors": parsed.get("protective_factors", []),
            "raw_confidence": confidence,
        }

        return prediction, proba, metadata

    def explain(self, text: str) -> dict:
        client = self._get_client()
        truncated_text = text[:2500] if len(text) > 2500 else text

        system = (
            "You are a clinical NLP explainability expert. "
            "Given a clinical note, identify the most clinically significant phrases and explain their importance. "
            "Return ONLY valid JSON: "
            '{"important_phrases": [{"phrase": "text", "importance": float_0_to_1, "explanation": "why important"}], '
            '"overall_summary": "one sentence summary"}'
        )

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": f"Analyze this clinical note for the task '{self.task}':\n\n{truncated_text}"},
            ],
            temperature=0.1,
            max_tokens=800,
        )

        raw = response.choices[0].message.content
        parsed = self._parse_response(raw)
        return parsed

    @property
    def is_trained(self) -> bool:
        return True
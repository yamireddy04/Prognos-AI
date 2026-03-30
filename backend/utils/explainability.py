import numpy as np
import re
from typing import List, Tuple, Optional


def highlight_text_spans(text: str, important_phrases: List[dict]) -> List[dict]:
    tokens = text.split()
    token_scores = {}

    for phrase_info in important_phrases:
        phrase = phrase_info.get("phrase", "")
        score = float(phrase_info.get("importance", 0.5))
        phrase_tokens = phrase.lower().split()

        text_lower = text.lower()
        phrase_lower = phrase.lower()
        start = 0
        while True:
            idx = text_lower.find(phrase_lower, start)
            if idx == -1:
                break
            char_count = len(text[:idx].split())
            for j in range(char_count, char_count + len(phrase_tokens)):
                if j < len(tokens):
                    token_scores[j] = max(token_scores.get(j, 0), score)
            start = idx + 1

    spans = []
    for i, token in enumerate(tokens):
        score = token_scores.get(i, 0.0)
        spans.append({
            "token": token,
            "score": round(score, 3),
            "highlighted": score > 0.3,
        })

    return spans


def extract_tfidf_highlights(text: str, top_features: List[Tuple[str, float]]) -> List[dict]:
    if not top_features:
        return []

    max_score = max(abs(s) for _, s in top_features) if top_features else 1.0
    if max_score == 0:
        max_score = 1.0

    feature_map = {feat: abs(score) / max_score for feat, score in top_features}
    feature_signs = {feat: score >= 0 for feat, score in top_features}

    words = text.split()
    spans = []

    for word in words:
        clean = re.sub(r"[^\w]", "", word.lower())
        score = 0.0
        direction = "neutral"

        if clean in feature_map:
            score = feature_map[clean]
            direction = "positive" if feature_signs.get(clean, True) else "negative"
        else:
            for feat in feature_map:
                if " " not in feat and len(feat) > 3 and clean.startswith(feat[:4]):
                    score = feature_map[feat] * 0.6
                    direction = "positive" if feature_signs.get(feat, True) else "negative"
                    break

        spans.append({
            "token": word,
            "score": round(score, 3),
            "highlighted": score > 0.25,
            "direction": direction,
        })

    return spans


def build_explanation_payload(
    text: str,
    model_type: str,
    top_features: Optional[List[Tuple[str, float]]] = None,
    groq_phrases: Optional[List[dict]] = None,
    metadata: Optional[dict] = None,
) -> dict:
    if model_type == "groq" and groq_phrases:
        token_spans = highlight_text_spans(text, groq_phrases)
        key_phrases = [
            {
                "phrase": p.get("phrase", ""),
                "score": float(p.get("importance", 0.5)),
                "explanation": p.get("explanation", ""),
            }
            for p in groq_phrases[:8]
        ]
    elif top_features:
        token_spans = extract_tfidf_highlights(text, top_features)
        max_s = max(abs(s) for _, s in top_features) if top_features else 1.0
        key_phrases = [
            {
                "phrase": feat,
                "score": min(abs(score) / max(max_s, 0.0001), 1.0),
                "explanation": "High TF-IDF weight in this prediction context",
            }
            for feat, score in top_features[:8]
        ]
    else:
        token_spans = [{"token": w, "score": 0.0, "highlighted": False} for w in text.split()]
        key_phrases = []

    return {
        "token_spans": token_spans,
        "key_phrases": key_phrases,
        "summary": metadata.get("reasoning", "") if metadata else "",
        "risk_factors": metadata.get("risk_factors", []) if metadata else [],
        "protective_factors": metadata.get("protective_factors", []) if metadata else [],
    }
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from typing import List


def _ensure_nltk():
    for pkg in ["punkt", "stopwords", "wordnet", "punkt_tab"]:
        try:
            nltk.data.find(f"tokenizers/{pkg}" if "punkt" in pkg else f"corpora/{pkg}")
        except LookupError:
            nltk.download(pkg, quiet=True)


_ensure_nltk()

_LEMMATIZER = WordNetLemmatizer()
_STOPWORDS = set(stopwords.words("english"))

CLINICAL_STOPWORDS = {
    "patient", "hospital", "admitted", "admission", "discharge", "discharged",
    "history", "diagnosis", "presenting", "presented", "treatment", "treated",
    "follow", "followup", "noted", "significant", "without", "within",
}

_ALL_STOPWORDS = _STOPWORDS | CLINICAL_STOPWORDS

_UNIT_RE = re.compile(r"\b\d+\.?\d*\s*(mg|mcg|mEq|mmol|mmhg|bpm|kg|lb|cm|mm|l|ml|dl|iu)\b", re.I)
_NUM_RE = re.compile(r"\b\d+[\d.,/]*\b")
_PUNCT_RE = re.compile(r"[^\w\s]")
_WHITESPACE_RE = re.compile(r"\s+")


def clean_text(text: str, remove_numbers: bool = False, lemmatize: bool = True) -> str:
    text = text.lower()
    text = _UNIT_RE.sub(" NUMERIC_MEASURE ", text)
    if remove_numbers:
        text = _NUM_RE.sub(" ", text)
    text = _PUNCT_RE.sub(" ", text)
    text = _WHITESPACE_RE.sub(" ", text).strip()

    tokens = word_tokenize(text)
    tokens = [t for t in tokens if t not in _ALL_STOPWORDS and len(t) > 2]
    if lemmatize:
        tokens = [_LEMMATIZER.lemmatize(t) for t in tokens]

    return " ".join(tokens)


def tokenize_raw(text: str) -> List[str]:
    text = text.lower()
    text = _PUNCT_RE.sub(" ", text)
    return [t for t in text.split() if len(t) > 1]


def preprocess_batch(texts: List[str], **kwargs) -> List[str]:
    return [clean_text(t, **kwargs) for t in texts]


def extract_clinical_features(text: str) -> dict:
    text_lower = text.lower()
    features = {
        "has_chest_pain": int(bool(re.search(r"chest\s*pain|angina|cp\b", text_lower))),
        "has_dyspnea": int(bool(re.search(r"dyspnea|shortness\s*of\s*breath|sob\b", text_lower))),
        "has_fever": int(bool(re.search(r"fever|febrile", text_lower))),
        "has_altered_ms": int(bool(re.search(r"altered\s*mental|confusion|disoriented|encephalopathy", text_lower))),
        "has_cardiac": int(bool(re.search(r"cardiac|heart|ecg|ekg|troponin|stemi|nstemi", text_lower))),
        "has_neuro": int(bool(re.search(r"stroke|seizure|neuro|mri\s*brain|ct\s*head", text_lower))),
        "has_icu": int(bool(re.search(r"icu|intensive\s*care|vasopressor|intubat", text_lower))),
        "has_surgery": int(bool(re.search(r"surgery|surgical|operation|procedure|orif|arthroplasty", text_lower))),
        "has_cancer": int(bool(re.search(r"cancer|oncology|chemotherapy|tumor|malignancy", text_lower))),
        "note_length": len(text.split()),
    }
    return features
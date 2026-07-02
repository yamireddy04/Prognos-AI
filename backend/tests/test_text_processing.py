import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from utils.text_processing import clean_text, preprocess_batch


def test_clean_text_lowercases_and_removes_stopwords():
    text = "The Patient was ADMITTED with FEVER and chest pain"
    result = clean_text(text)
    assert result == "fever chest pain"


def test_clean_text_substitutes_numeric_measures():
    text = "Administered 50mg of medication for the symptoms"
    result = clean_text(text)
    tokens = result.split()
    assert "NUMERIC_MEASURE" in tokens
    assert "50mg" not in result


def test_clean_text_lemmatize_true_reduces_plurals():
    text = "Multiple symptoms conditions procedures were noted"
    result = clean_text(text, lemmatize=True)
    assert result == "multiple symptom condition procedure"


def test_clean_text_lemmatize_false_preserves_plurals():
    text = "Multiple symptoms conditions procedures were noted"
    result = clean_text(text, lemmatize=False)
    assert result == "multiple symptoms conditions procedures"


def test_clean_text_removes_short_tokens():
    text = "He is a a b of it"
    result = clean_text(text)
    for token in result.split():
        assert len(token) > 2


def test_preprocess_batch_matches_individual_clean_text_calls():
    texts = [
        "The Patient was ADMITTED with FEVER and chest pain",
        "Administered 50mg of medication for the symptoms",
        "Multiple symptoms conditions procedures were noted",
    ]
    batch_result = preprocess_batch(texts, lemmatize=True)
    individual_result = [clean_text(t, lemmatize=True) for t in texts]
    assert batch_result == individual_result


def test_preprocess_batch_forwards_kwargs():
    texts = ["Multiple symptoms conditions procedures were noted"]
    batch_result = preprocess_batch(texts, lemmatize=False)
    assert batch_result == [clean_text(texts[0], lemmatize=False)]
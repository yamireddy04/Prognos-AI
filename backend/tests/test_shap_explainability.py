import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import TASKS


def test_baseline_get_shap_values_returns_nonempty_string_float_tuples(trained_models):
    dataframe = trained_models["dataframe"]

    for task in TASKS:
        model = trained_models["baseline"][task]
        note = dataframe["note"].iloc[0]

        top_features = model.get_shap_values(note, n=15)

        assert isinstance(top_features, list)
        assert len(top_features) > 0
        for feature, score in top_features:
            assert isinstance(feature, str)
            assert isinstance(score, float)


def test_hybrid_get_shap_values_returns_nonempty_string_float_tuples(trained_models):
    dataframe = trained_models["dataframe"]

    for task in TASKS:
        model = trained_models["hybrid"][task]
        note = dataframe["note"].iloc[0]

        top_features = model.get_shap_values(note, n=12)

        assert isinstance(top_features, list)
        assert len(top_features) > 0
        for feature, score in top_features:
            assert isinstance(feature, str)
            assert isinstance(score, float)


def test_hybrid_get_shap_values_accepts_tabular_input(trained_models):
    dataframe = trained_models["dataframe"]
    task = TASKS[0]
    model = trained_models["hybrid"][task]
    note = dataframe["note"].iloc[0]

    tabular = {
        "age": 67, "gender": 1, "hr": 92, "sbp": 118, "dbp": 76,
        "rr": 18, "spo2": 96, "temp": 98.9, "n_comorbidities": 3,
        "n_meds": 5, "prior_admissions": 1,
    }

    top_features = model.get_shap_values(note, tabular=tabular, n=12)

    assert isinstance(top_features, list)
    assert len(top_features) > 0
    for feature, score in top_features:
        assert isinstance(feature, str)
        assert isinstance(score, float)
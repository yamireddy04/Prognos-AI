import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import TASKS


def test_predict_returns_valid_class_index_and_probability_vector(trained_models):
    dataframe = trained_models["dataframe"]

    for task in TASKS:
        model = trained_models["baseline"][task]
        note = dataframe["note"].iloc[0]

        pred, proba = model.predict(note)

        assert isinstance(pred, int)
        assert 0 <= pred < len(model.labels)
        assert abs(sum(proba) - 1.0) < 1e-3
        assert all(0.0 <= p <= 1.0 for p in proba)


def test_get_top_features_returns_nonempty_string_float_tuples(trained_models):
    dataframe = trained_models["dataframe"]

    for task in TASKS:
        model = trained_models["baseline"][task]
        note = dataframe["note"].iloc[0]

        top_features = model.get_top_features(note, n=15)

        assert isinstance(top_features, list)
        assert len(top_features) > 0
        for feature, score in top_features:
            assert isinstance(feature, str)
            assert isinstance(score, float)


def test_is_trained_reflects_saved_model_file(trained_models):
    for task in TASKS:
        model = trained_models["baseline"][task]
        assert model.is_trained is True
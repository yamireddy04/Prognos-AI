import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import TASKS
from utils.feature_engineering import TABULAR_FEATURES


def test_predict_returns_valid_class_index_and_probability_vector(trained_models):
    dataframe = trained_models["dataframe"]

    for task in TASKS:
        model = trained_models["hybrid"][task]
        note = dataframe["note"].iloc[0]

        pred, proba = model.predict(note)

        assert isinstance(pred, int)
        assert 0 <= pred < len(model.labels)
        assert abs(sum(proba) - 1.0) < 1e-3
        assert all(0.0 <= p <= 1.0 for p in proba)


def test_get_feature_importances_returns_nonempty_string_float_tuples(trained_models):
    dataframe = trained_models["dataframe"]

    for task in TASKS:
        model = trained_models["hybrid"][task]
        note = dataframe["note"].iloc[0]

        top_features = model.get_feature_importances(note, n=12)

        assert isinstance(top_features, list)
        assert len(top_features) > 0
        for feature, score in top_features:
            assert isinstance(feature, str)
            assert isinstance(score, float)


def test_is_trained_reflects_saved_model_file(trained_models):
    for task in TASKS:
        model = trained_models["hybrid"][task]
        assert model.is_trained is True


def test_predict_then_feature_importances_without_tabular(trained_models):
    dataframe = trained_models["dataframe"]
    model = trained_models["hybrid"]["readmission"]
    note = dataframe["note"].iloc[0]

    pred, proba = model.predict(note)
    assert 0 <= pred < len(model.labels)
    assert abs(sum(proba) - 1.0) < 1e-3

    result = model.get_feature_importances(note, n=10)
    assert isinstance(result, list)
    assert len(result) <= 10
    for feature, score in result:
        assert isinstance(feature, str)
        assert isinstance(score, float)


def test_predict_then_feature_importances_with_tabular(trained_models):
    dataframe = trained_models["dataframe"]
    model = trained_models["hybrid"]["readmission"]
    row = dataframe.iloc[0]
    note = row["note"]
    tabular = {col: row[col] for col in TABULAR_FEATURES}

    pred, proba = model.predict(note, tabular=tabular)
    assert 0 <= pred < len(model.labels)
    assert abs(sum(proba) - 1.0) < 1e-3

    result = model.get_feature_importances(note, n=10, tabular=tabular)
    assert isinstance(result, list)
    assert len(result) <= 10
    for feature, score in result:
        assert isinstance(feature, str)
        assert isinstance(score, float)


def test_feature_importances_with_and_without_tabular_do_not_raise_dimension_mismatch(trained_models):
    dataframe = trained_models["dataframe"]

    for task in TASKS:
        model = trained_models["hybrid"][task]
        row = dataframe.iloc[1]
        note = row["note"]
        tabular = {col: row[col] for col in TABULAR_FEATURES}

        without_tabular = model.get_feature_importances(note, n=8)
        with_tabular = model.get_feature_importances(note, n=8, tabular=tabular)

        assert isinstance(without_tabular, list)
        assert isinstance(with_tabular, list)
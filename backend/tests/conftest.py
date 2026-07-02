import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from _pytest.monkeypatch import MonkeyPatch
from fastapi.testclient import TestClient

import config
from config import TASKS
from data.synthetic_generator import generate_dataset
from utils.feature_engineering import TABULAR_FEATURES
import models.baseline_model as baseline_model_module
import models.hybrid_model as hybrid_model_module
from models.baseline_model import BaselineModel
from models.hybrid_model import HybridModel

TEST_N_SAMPLES = 150


@pytest.fixture(scope="session")
def _session_monkeypatch():
    mp = MonkeyPatch()
    yield mp
    mp.undo()


@pytest.fixture(scope="session")
def test_model_dir(tmp_path_factory, _session_monkeypatch):
    model_dir = tmp_path_factory.mktemp("saved_models")
    _session_monkeypatch.setattr(config, "MODEL_DIR", model_dir)
    _session_monkeypatch.setattr(baseline_model_module, "MODEL_DIR", model_dir)
    _session_monkeypatch.setattr(hybrid_model_module, "MODEL_DIR", model_dir)
    return model_dir


@pytest.fixture(scope="session")
def trained_models(test_model_dir, _session_monkeypatch):
    _session_monkeypatch.setattr(config.settings, "groq_api_key", "")
    _session_monkeypatch.delenv("GROQ_API_KEY", raising=False)

    dataframe = generate_dataset(TEST_N_SAMPLES)
    texts = dataframe["note"].tolist()
    tabular_df = dataframe[TABULAR_FEATURES]

    label_columns = {
        "readmission": "readmission_30d",
        "los_band": "los_band",
        "specialty": "specialty_id",
    }

    baselines = {}
    hybrids = {}

    for task in TASKS:
        labels = dataframe[label_columns[task]].values

        baseline = BaselineModel(task)
        baseline.train(texts, labels)
        baselines[task] = baseline

        hybrid = HybridModel(task)
        hybrid.train(texts, tabular_df, labels)
        hybrids[task] = hybrid

    import models as model_registry
    model_registry._registry.clear()

    return {
        "dataframe": dataframe,
        "baseline": baselines,
        "hybrid": hybrids,
        "model_dir": test_model_dir,
    }


@pytest.fixture
def client(trained_models):
    from main import app

    with TestClient(app) as test_client:
        yield test_client
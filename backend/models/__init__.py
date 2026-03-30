from models.baseline_model import BaselineModel
from models.groq_model import GroqAdvancedModel
from models.hybrid_model import HybridModel
from config import TASKS

_registry: dict = {}


def get_baseline(task: str) -> BaselineModel:
    key = f"baseline_{task}"
    if key not in _registry:
        _registry[key] = BaselineModel(task)
    return _registry[key]


def get_groq_model(task: str) -> GroqAdvancedModel:
    key = f"groq_{task}"
    if key not in _registry:
        _registry[key] = GroqAdvancedModel(task)
    return _registry[key]


def get_hybrid(task: str) -> HybridModel:
    key = f"hybrid_{task}"
    if key not in _registry:
        _registry[key] = HybridModel(task)
    return _registry[key]


def model_status() -> dict:
    status = {}
    for task in TASKS:
        status[task] = {
            "baseline": get_baseline(task).is_trained,
            "groq": True,
            "hybrid": get_hybrid(task).is_trained,
        }
    return status
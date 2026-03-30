from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    groq_api_key: str = ""
    model_dir: str = "./saved_models"
    data_dir: str = "./data"
    env: str = "development"

    model_config = {"env_file": ".env", "extra": "ignore", "protected_namespaces": ("settings_",)}


settings = Settings()

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "saved_models"
DATA_DIR = BASE_DIR / "data"

MODEL_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

TASKS = ["readmission", "los_band", "specialty"]

TASK_LABELS = {
    "readmission": ["No Readmission", "30-Day Readmission"],
    "los_band": ["Short (<3d)", "Medium (3-7d)", "Long (>7d)"],
    "specialty": ["Cardiology", "Neurology", "Orthopedics", "Oncology", "General Medicine"],
}

GROQ_MODEL = "llama-3.3-70b-versatile"
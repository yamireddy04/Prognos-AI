import logging
from pydantic_settings import BaseSettings
from pathlib import Path

logger = logging.getLogger("prognosai.config")


class Settings(BaseSettings):
    groq_api_key: str = ""
    model_dir: str = "./saved_models"
    data_dir: str = "./data"
    env: str = "development"
    allowed_origins: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "extra": "ignore", "protected_namespaces": ("settings_",)}

    @property
    def groq_key_configured(self) -> bool:
        return bool(self.groq_api_key.strip())

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


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


def warn_if_groq_key_missing() -> None:
    if settings.env.lower() == "test":
        return
    if not settings.groq_key_configured:
        logger.warning(
            "GROQ_API_KEY is not set. Copy backend/.env.example to backend/.env and add your key. "
            "Baseline and hybrid predictions will still work; groq model_type requests will fail."
        )
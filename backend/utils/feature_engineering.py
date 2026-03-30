import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from typing import List, Optional


TABULAR_FEATURES = [
    "age", "gender", "hr", "sbp", "dbp", "rr", "spo2", "temp",
    "n_comorbidities", "n_meds", "prior_admissions",
]

DERIVED_FEATURES = [
    "pulse_pressure", "shock_index", "age_group_elderly",
    "tachycardic", "hypotensive", "hypoxic", "tachypneic",
]


def engineer_tabular_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["pulse_pressure"] = df["sbp"] - df["dbp"]
    df["shock_index"] = df["hr"] / df["sbp"].clip(lower=1)
    df["age_group_elderly"] = (df["age"] >= 65).astype(int)
    df["tachycardic"] = (df["hr"] > 100).astype(int)
    df["hypotensive"] = (df["sbp"] < 90).astype(int)
    df["hypoxic"] = (df["spo2"] < 92).astype(int)
    df["tachypneic"] = (df["rr"] > 22).astype(int)
    return df


def get_tabular_feature_names() -> List[str]:
    return TABULAR_FEATURES + DERIVED_FEATURES


def build_tabular_matrix(df: pd.DataFrame, scaler: Optional[StandardScaler] = None, fit: bool = False):
    df = engineer_tabular_features(df)
    all_cols = get_tabular_feature_names()
    available = [c for c in all_cols if c in df.columns]
    X = df[available].values.astype(np.float32)

    if fit:
        scaler = StandardScaler()
        X = scaler.fit_transform(X)
        return X, scaler
    elif scaler is not None:
        X = scaler.transform(X)
    return X, scaler


def build_single_tabular(sample: dict, scaler: Optional[StandardScaler] = None) -> np.ndarray:
    row = {
        "age": sample.get("age", 50),
        "gender": sample.get("gender", 0),
        "hr": sample.get("hr", 80),
        "sbp": sample.get("sbp", 120),
        "dbp": sample.get("dbp", 80),
        "rr": sample.get("rr", 16),
        "spo2": sample.get("spo2", 98),
        "temp": sample.get("temp", 98.6),
        "n_comorbidities": sample.get("n_comorbidities", 2),
        "n_meds": sample.get("n_meds", 3),
        "prior_admissions": sample.get("prior_admissions", 0),
    }
    df = pd.DataFrame([row])
    X, _ = build_tabular_matrix(df, scaler=scaler, fit=False)
    return X
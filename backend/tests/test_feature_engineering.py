import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd

from utils.feature_engineering import engineer_tabular_features, build_single_tabular


def test_engineer_tabular_features_normal_row():
    normal_row = pd.DataFrame([{
        "age": 45, "gender": 0, "hr": 80, "sbp": 120, "dbp": 80, "rr": 16,
        "spo2": 98, "temp": 98.6, "n_comorbidities": 1, "n_meds": 2, "prior_admissions": 0,
    }])

    result = engineer_tabular_features(normal_row).iloc[0]

    assert result["pulse_pressure"] == 40
    assert abs(result["shock_index"] - (80 / 120)) < 1e-9
    assert result["age_group_elderly"] == 0
    assert result["tachycardic"] == 0
    assert result["hypotensive"] == 0
    assert result["hypoxic"] == 0
    assert result["tachypneic"] == 0


def test_engineer_tabular_features_abnormal_row():
    abnormal_row = pd.DataFrame([{
        "age": 78, "gender": 1, "hr": 130, "sbp": 80, "dbp": 50, "rr": 30,
        "spo2": 85, "temp": 102.0, "n_comorbidities": 5, "n_meds": 8, "prior_admissions": 3,
    }])

    result = engineer_tabular_features(abnormal_row).iloc[0]

    assert result["pulse_pressure"] == 30
    assert abs(result["shock_index"] - (130 / 80)) < 1e-9
    assert result["age_group_elderly"] == 1
    assert result["tachycardic"] == 1
    assert result["hypotensive"] == 1
    assert result["hypoxic"] == 1
    assert result["tachypneic"] == 1


def test_engineer_tabular_features_shock_index_clips_zero_sbp():
    zero_sbp_row = pd.DataFrame([{
        "age": 60, "gender": 0, "hr": 90, "sbp": 0, "dbp": 0, "rr": 18,
        "spo2": 97, "temp": 98.0, "n_comorbidities": 0, "n_meds": 0, "prior_admissions": 0,
    }])

    result = engineer_tabular_features(zero_sbp_row).iloc[0]

    assert result["shock_index"] == 90


def test_build_single_tabular_uses_documented_defaults_for_missing_keys():
    X = build_single_tabular({})

    assert X.shape == (1, 18)
    age, gender, hr, sbp, dbp, rr, spo2, temp, n_com, n_meds, prior_adm = X[0][:11]
    assert age == 50
    assert gender == 0
    assert hr == 80
    assert sbp == 120
    assert dbp == 80
    assert rr == 16
    assert spo2 == 98
    assert temp == 98.6
    assert n_com == 2
    assert n_meds == 3
    assert prior_adm == 0


def test_build_single_tabular_uses_provided_values_over_defaults():
    sample = {"age": 30, "hr": 140, "sbp": 100, "dbp": 60}
    X = build_single_tabular(sample)

    assert X[0][0] == 30
    assert X[0][2] == 140
    assert X[0][3] == 100
    assert X[0][4] == 60
    assert X[0][5] == 16
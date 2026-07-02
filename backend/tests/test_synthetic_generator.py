import random
import re
import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from data.synthetic_generator import generate_dataset


def _reseed():
    random.seed(42)
    np.random.seed(42)


def test_generate_dataset_is_deterministic():
    _reseed()
    df1 = generate_dataset(50)
    _reseed()
    df2 = generate_dataset(50)
    assert df1.equals(df2)


def test_note_vitals_match_structured_columns():
    _reseed()
    df = generate_dataset(200)

    hr_pattern = re.compile(r"HR (\d+) bpm")
    spo2_pattern = re.compile(r"SpO2 (\d+)%")

    for _, row in df.iterrows():
        hr_match = hr_pattern.search(row["note"])
        spo2_match = spo2_pattern.search(row["note"])
        assert hr_match is not None
        assert spo2_match is not None
        assert int(hr_match.group(1)) == row["hr"]
        assert int(spo2_match.group(1)) == row["spo2"]


def test_abnormal_vitals_have_higher_readmission_rate():
    _reseed()
    df = generate_dataset(2000)

    abnormal = df[(df["hr"] > 120) & (df["spo2"] < 90)]
    normal = df[(df["hr"] <= 100) & (df["spo2"] >= 95)]

    assert len(abnormal) > 0
    assert len(normal) > 0
    assert abnormal["readmission_30d"].mean() > normal["readmission_30d"].mean()


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))
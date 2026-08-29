import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset

FEATURE_NAMES = [
    "doses_scheduled",
    "doses_taken",
    "doses_missed",
    "adherence_pct",
    "consecutive_missed_doses",
    "avg_delay_minutes",
    "morning_adherence_rate",
    "afternoon_adherence_rate",
    "evening_adherence_rate",
    "weekday_adherence_rate",
    "weekend_adherence_rate",
    "recent_7d_adherence",
    "recent_30d_adherence",
    "num_reminders",
    "avg_response_time_min",
    "medicine_frequency"
]

class AdherenceDataset(Dataset):
    """
    PyTorch Dataset for Adherence Risk Classification.
    """
    def __init__(self, X: np.ndarray, y: np.ndarray):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.long)

    def __len__(self):
        return len(self.y)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]


def generate_synthetic_adherence_data(num_samples: int = 1500, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates a structured, realistic synthetic dataset representing historical adherence behaviors.
    Classes:
      0 = LOW ADHERENCE RISK
      1 = MEDIUM ADHERENCE RISK
      2 = HIGH ADHERENCE RISK
    """
    np.random.seed(random_seed)
    data = []

    samples_per_class = num_samples // 3

    for target_class in [0, 1, 2]:
        for _ in range(samples_per_class):
            if target_class == 0:  # Low Risk
                adherence_pct = np.random.uniform(85.0, 100.0)
                consecutive_missed = np.random.choice([0, 1], p=[0.9, 0.1])
                avg_delay = np.random.uniform(2.0, 15.0)
                morning = np.random.uniform(0.85, 1.0)
                afternoon = np.random.uniform(0.80, 1.0)
                evening = np.random.uniform(0.80, 1.0)
                weekday = np.random.uniform(0.85, 1.0)
                weekend = np.random.uniform(0.80, 1.0)
                recent_7d = np.random.uniform(85.0, 100.0)
                recent_30d = np.random.uniform(85.0, 100.0)
                avg_resp_time = np.random.uniform(1.0, 10.0)
            elif target_class == 1:  # Medium Risk
                adherence_pct = np.random.uniform(60.0, 84.9)
                consecutive_missed = np.random.choice([0, 1, 2], p=[0.4, 0.4, 0.2])
                avg_delay = np.random.uniform(15.0, 45.0)
                morning = np.random.uniform(0.60, 0.85)
                afternoon = np.random.uniform(0.55, 0.80)
                evening = np.random.uniform(0.50, 0.75)
                weekday = np.random.uniform(0.65, 0.85)
                weekend = np.random.uniform(0.50, 0.75)
                recent_7d = np.random.uniform(55.0, 85.0)
                recent_30d = np.random.uniform(60.0, 85.0)
                avg_resp_time = np.random.uniform(10.0, 30.0)
            else:  # High Risk
                adherence_pct = np.random.uniform(20.0, 59.9)
                consecutive_missed = np.random.choice([2, 3, 4, 5], p=[0.3, 0.3, 0.2, 0.2])
                avg_delay = np.random.uniform(45.0, 150.0)
                morning = np.random.uniform(0.20, 0.60)
                afternoon = np.random.uniform(0.20, 0.55)
                evening = np.random.uniform(0.15, 0.50)
                weekday = np.random.uniform(0.25, 0.60)
                weekend = np.random.uniform(0.10, 0.45)
                recent_7d = np.random.uniform(15.0, 55.0)
                recent_30d = np.random.uniform(20.0, 60.0)
                avg_resp_time = np.random.uniform(30.0, 120.0)

            med_freq = float(np.random.choice([1, 2, 3]))
            num_reminders = float(np.random.randint(14, 90))
            doses_scheduled = float(num_reminders * med_freq)
            doses_taken = float(round(doses_scheduled * (adherence_pct / 100.0)))
            doses_missed = float(max(0, doses_scheduled - doses_taken))

            row = {
                "doses_scheduled": doses_scheduled,
                "doses_taken": doses_taken,
                "doses_missed": doses_missed,
                "adherence_pct": float(adherence_pct),
                "consecutive_missed_doses": float(consecutive_missed),
                "avg_delay_minutes": float(avg_delay),
                "morning_adherence_rate": float(morning),
                "afternoon_adherence_rate": float(afternoon),
                "evening_adherence_rate": float(evening),
                "weekday_adherence_rate": float(weekday),
                "weekend_adherence_rate": float(weekend),
                "recent_7d_adherence": float(recent_7d),
                "recent_30d_adherence": float(recent_30d),
                "num_reminders": float(num_reminders),
                "avg_response_time_min": float(avg_resp_time),
                "medicine_frequency": float(med_freq),
                "risk_class": int(target_class)
            }
            data.append(row)

    df = pd.DataFrame(data)
    df = df.sample(frac=1.0, random_state=random_seed).reset_index(drop=True)
    return df

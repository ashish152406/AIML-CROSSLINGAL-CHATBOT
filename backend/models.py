# backend/models.py
import joblib
from pathlib import Path

# FIX: Always save/load inside the models/ folder
MODEL_DIR = Path(__file__).parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

def save_model(obj, name: str):
    path = MODEL_DIR / name
    joblib.dump(obj, path)
    print(f"[MODEL SAVED] {path}")
    return str(path)

def load_model(name: str):
    path = MODEL_DIR / name
    print(f"[LOADING MODEL] {path}")
    return joblib.load(path)

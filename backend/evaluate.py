# backend/evaluate.py
import pandas as pd
from sklearn.metrics import confusion_matrix, classification_report
from joblib import load
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns

MODEL_DIR = Path(__file__).parent / "models"
DATA_DIR = Path(__file__).parent / "data"

def evaluate_lang():
    df = pd.read_csv(DATA_DIR / "lang_dataset.csv")
    clf = load(MODEL_DIR / "lang_detector.pkl")
    X = df['text'].astype(str)
    y = df['lang'].astype(str)
    preds = clf.predict(X)
    print("Language classification report")
    print(classification_report(y, preds))
    cm = confusion_matrix(y, preds)
    plt.figure(figsize=(6,5))
    sns.heatmap(cm, annot=True, fmt='d')
    plt.title("Language Confusion Matrix")
    plt.savefig(MODEL_DIR / "lang_confusion.png")
    print("Saved lang_confusion.png")

def evaluate_intent():
    df = pd.read_csv(DATA_DIR / "intent_dataset.csv")
    clf = load(MODEL_DIR / "intent_classifier.pkl")
    X = df['text'].astype(str)
    y = df['intent'].astype(str)
    preds = clf.predict(X)
    print("Intent classification report")
    print(classification_report(y, preds))
    cm = confusion_matrix(y, preds)
    plt.figure(figsize=(8,6))
    sns.heatmap(cm, annot=True, fmt='d')
    plt.title("Intent Confusion Matrix")
    plt.savefig(MODEL_DIR / "intent_confusion.png")
    print("Saved intent_confusion.png")

if __name__ == "__main__":
    evaluate_lang()
    evaluate_intent()

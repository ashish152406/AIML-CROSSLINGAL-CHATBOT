# backend/train_intent_model.py
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from models import save_model
from pathlib import Path

DATA_PATH = Path(__file__).parent / "data" / "intent_dataset.csv"

def load_data():
    df = pd.read_csv(DATA_PATH)
    df = df.dropna(subset=['text','intent','lang'])
    return df

def train():
    df = load_data()
    # We'll train a single multilingual intent classifier.
    X = df['text'].astype(str)
    y = df['intent'].astype(str)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1,2))),
        ('clf', SVC(kernel='rbf', probability=True))
    ])

    pipeline.fit(X_train, y_train)
    preds = pipeline.predict(X_test)

    print("=== Intent Classification Report ===")
    print(classification_report(y_test, preds))
    cm = confusion_matrix(y_test, preds)
    print("Confusion Matrix:\n", cm)

    save_model(pipeline, "intent_classifier.pkl")
    print("Saved intent classifier to models/intent_classifier.pkl")

if __name__ == "__main__":
    train()

import random
import json
from pathlib import Path
from models import load_model
from dialogpt_engine import dialogpt_generate

BASE = Path(__file__).parent

# Load models
lang_clf = load_model("lang_detector.pkl")
intent_clf = load_model("intent_classifier.pkl")

# Load responses
with open(BASE / "responses.json", "r", encoding="utf-8") as f:
    RESPONSES = json.load(f)

def get_intent_reply(intent, lang):
    """Return one random reply from responses.json"""

    if intent not in RESPONSES:
        return None

    lang_bucket = RESPONSES[intent].get(lang)
    if lang_bucket is None:
        lang_bucket = RESPONSES[intent].get("en")  # fallback

    if isinstance(lang_bucket, list):
        return random.choice(lang_bucket)
    return lang_bucket

def chat_reply(text, user_lang="en"):
    """Main decision logic"""

    # 1. Detect language
    predicted_lang = lang_clf.predict([text])[0]

    # 2. Predict intent + probability
    intent_pred = intent_clf.predict([text])[0]
    proba = max(intent_clf.predict_proba([text])[0])

    print("Predicted:", intent_pred, "Confidence:", proba)

    # 3. If confidence too low → switch to DialoGPT casual chat
    if proba < 0.60:
        print("Using DialoGPT...")
        return dialogpt_generate(text, predicted_lang)

    # 4. Else → use intent response
    reply = get_intent_reply(intent_pred, predicted_lang)
    if reply:
        return reply

    # 5. If STILL nothing → fallback to DialoGPT
    print("Fallback to DialoGPT...")
    return dialogpt_generate(text, predicted_lang)

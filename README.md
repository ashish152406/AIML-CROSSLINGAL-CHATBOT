# AIML-CROSSLINGAL-CHATBOT
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

python train_language_model.py
python train_intent_model.py

python app.py

cd frontend
python -m http.server 5500
http://127.0.0.1:5500

🧠 System Architecture

Frontend (HTML/CSS/JS) → FastAPI Backend → Language Model → Intent Model → Hybrid Logic → Intent Reply / DialoGPT Reply

📂 Project Structure

backend/
• app.py
• inference.py
• dialogpt_engine.py
• models.py
• models/ (saved .pkl files)
• data/ (datasets)

frontend/
• index.html
• style.css
• app.js

responses.json
README.md

⚙️ Installation & Running

Backend Setup:

cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python app.py

Backend runs at: http://127.0.0.1:8000

Frontend Setup:

cd frontend

python -m http.server 5500

Open http://127.0.0.1:5500

🧪 Model Training

Train language detection:
python train_language_model.py

Train intent classification:
python train_intent_model.py

Models are saved automatically in backend/models/.

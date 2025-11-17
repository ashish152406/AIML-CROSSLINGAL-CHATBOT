# backend/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from inference import chat_reply
import uvicorn

app = FastAPI(title="Cross-Lingual Chatbot API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatIn(BaseModel):
    text: str
    lang: str   # frontend selected language

@app.post("/chat")
async def chat(data: ChatIn):
    """
    text: user message
    lang: language selected in frontend (en/hi/mr)
    """
    reply = chat_reply(data.text, data.lang)
    return {"reply": reply}

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

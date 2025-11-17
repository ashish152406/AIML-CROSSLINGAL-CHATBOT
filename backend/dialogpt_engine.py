# dialogpt_engine.py
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from deep_translator import GoogleTranslator

device = "cpu"

print("[DialoGPT] Loading model...")
tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
model.to(device)
print("[DialoGPT] Model loaded successfully!")

chat_history = {}

def safe_translate(text, target):
    """Stable translation using deep_translator."""
    try:
        return GoogleTranslator(source='auto', target=target).translate(text)
    except:
        return text  # fallback

def dialogpt_generate(user_text, lang="en", user_id="default"):
    """Generate reply with natural casual tone"""

    # NO translation before generation → DialoGPT handles Hinglish well
    raw_text = user_text

    # Encode
    new_input_ids = tokenizer.encode(raw_text + tokenizer.eos_token, return_tensors='pt').to(device)

    # Get history
    past = chat_history.get(user_id)

    # Generate response
    output = model.generate(
        torch.cat([past, new_input_ids], dim=-1) if past is not None else new_input_ids,
        max_length=200,
        do_sample=True,
        top_k=50,
        top_p=0.9,
        temperature=0.8,
        pad_token_id=tokenizer.eos_token_id,
    )

    chat_history[user_id] = output

    # Decode DialoGPT output
    reply_en = tokenizer.decode(output[:, new_input_ids.shape[-1]:][0], skip_special_tokens=True)

    # Only translate final answer if lang == "hi"
    if lang == "hi":
        reply_hi = safe_translate(reply_en, "hi")
        return reply_hi

    return reply_en  # English/Hinglish return as is

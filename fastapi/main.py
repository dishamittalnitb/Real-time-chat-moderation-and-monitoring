# For the llama-3.1-8b-instant model on Groq's current free tier, the published limits are approximately:

# 30 requests per minute (RPM)
# 14,400 requests per day (RPD)
# 6,000 tokens per minute (TPM)
# 500,000 tokens per day (TPD)

# lib-imports
import os
import torch
import json
import re

#llm-model imports
from pydantic import BaseModel
from detoxify import Detoxify
from groq import Groq
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

#fast-api imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

#.env imports
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # On Render, environment variables are already available
    pass


#groq api key
api_key = os.getenv("MY_API_KEY")

app = FastAPI(title="Reliable Hinglish Moderation API")

#middleware that allows requests from the react frontend to be sent here.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
    "https://my-chat-app-moderator.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------ Device & Client ------------------
device = "cuda" if torch.cuda.is_available() else "cpu"
client = Groq(api_key=api_key)

# ------------------ Models (Loaded for Fallback) ------------------
try:
    with open("slurs.json", "r") as f:
        slur_dict = json.load(f)
except FileNotFoundError:
    # Manual fallback list if file is missing
    slur_dict = [""]


tox_model = None
tokenizer = None
legacy_rephrase_model = None

REPHRASE_MODEL_NAME = "google/flan-t5-base"

class MessageRequest(BaseModel):
    text: str

# ------------------ Helper Functions ------------------

def check_local_slurs(text: str) -> bool:
    """Checks the text against the local slur dictionary."""
    text_clean = text.lower()
    for slur in slur_dict:
        if re.search(rf"\b{re.escape(slur)}\b", text_clean):
            return True
    return False

def get_groq_analysis(text: str):
    """Primary detection and rephrasing using LLM."""
    system_prompt = """
    ### ROLE
You are an Indian chat moderation AI specializing in English, Hindi, and Hinglish.

### ABSOLUTE RULES (MANDATORY)
1. NEVER translate the message into another language.
2. The output language MUST EXACTLY MATCH the input language style:
   - Hinglish → Hinglish
   - Hindi → Hindi (Devanagari or Hinglish-style Hindi)
   - English → English
3. If input is mixed (Hinglish), keep it mixed.

### TOXICITY LEVELS
- HARD ABUSE: sexual slurs, caste slurs, extreme profanity → BLOCK
- MILD / CASUAL INSULT (kam abusive): bewakoof, pagal, idiot, saala (non-sexual)
- NON-ABUSIVE CONTEXT: sale (discount), jokes between friends

### ACTION LOGIC
- Score ≥ 0.95 → BLOCK (do NOT rephrase)
- 0.4 ≤ Score < 0.95 → REPHRASE
- Score < 0.4 → APPROVE

### REPHRASING RULES (IMPORTANT)
If rephrasing:
- REMOVE insult
- KEEP original tone (friendly / casual)
- DO NOT become overly polite
- DO NOT moralize
- DO NOT add explanations

### EXAMPLES
Input: "bhai tu pagal hai kya"
Output: "bhai tu thoda confused lag raha hai"

Input: "you are an idiot"
Output: "you are being unreasonable"

Input: "yeh bilkul bakwaas hai"
Output: "yeh bilkul theek nahi lag raha"

### OUTPUT FORMAT (STRICT JSON ONLY)
{
  "status": "blocked" | "rephrased" | "approved",
  "original": "string",
  "rephrased": "string",
  "score": float,
  "reason": "string",
  "language": "English | Hindi | Hinglish"
}

    """
    # response_format ensures the LLM returns valid JSON
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": text}],
        temperature=0,
        response_format={"type": "json_object"}
    )
    return json.loads(completion.choices[0].message.content)

def load_fallback_models():
    """
    Load Detoxify and FLAN-T5 only when required.
    """
    global tox_model
    global tokenizer
    global legacy_rephrase_model

    if tox_model is None:
        print("Loading Detoxify...")
        tox_model = Detoxify("original", device=device)

    if tokenizer is None:
        print("Loading Tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(REPHRASE_MODEL_NAME)

    if legacy_rephrase_model is None:
        print("Loading FLAN-T5...")
        legacy_rephrase_model = AutoModelForSeq2SeqLM.from_pretrained(
            REPHRASE_MODEL_NAME
        ).to(device)

def get_local_fallback_rephrase(text: str) -> str:
    """
    Rephrase toxic text using FLAN-T5.
    Assumes load_fallback_models() has already been called.
    """
    inputs = tokenizer(
        f"rewrite politely: {text}",
        return_tensors="pt"
    ).to(device)

    outputs = legacy_rephrase_model.generate(
        **inputs,
        max_length=128
    )

    return tokenizer.decode(outputs[0], skip_special_tokens=True)

# ------------------ Main API Endpoint ------------------

@app.post("/moderate")
async def moderate_message(request: MessageRequest):
    text = request.text
    
    # PHASE 1: Hard Slur Check (Local)
    if check_local_slurs(text):
        return {
            "status": "blocked",
            "original": text,
            "rephrased": "",
            "score": 1.0,
            "reason": "Slur detected in local dictionary",
            "language": "Hinglish/English"
        }

    # PHASE 2: LLM Detection (English & Hinglish)
    try:
        result = get_groq_analysis(text)

        
        result.setdefault("rephrased", "")
        result.setdefault("reason", "Processed by LLM")

        if result.get("status") == "approved":
            result["rephrased"] = ""

        if result.get("status") == "blocked":
            result["rephrased"] = ""

        return result
     # ---------------- PHASE 3: FALLBACK ----------------
    except Exception as e:
        print(f"Groq failed, using Fallback Models: {e}")
        
        # PHASE 3: Fallback (Detoxify + Flan-T5)
        load_fallback_models()
        scores = tox_model.predict(text)
        fallback_score = max(float(v) for v in scores.values())
        
        status = "approved"
        rephrased_text = ""
        reason = "No toxicity detected (Fallback)"

        if fallback_score >= 0.95:
            status = "blocked"
            reason = "High toxicity (Fallback detection)"
        elif fallback_score >= 0.4:
            status = "rephrased"
            rephrased_text = get_local_fallback_rephrase(text)
            reason = "Moderate toxicity (Fallback rephrase)"

        return {
            "status": status,
            "original": text,
            "rephrased": rephrased_text,
            "score": round(fallback_score, 4),
            "reason": reason,
            "language": "Detected by local model"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
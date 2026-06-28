import os
import json
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from openai import AsyncOpenAI
import openai
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Initialize Groq client using OpenAI SDK
client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    patient_context: Optional[Dict[str, Any]] = None
    chat_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    tokens_used: int

SYSTEM_PROMPT = """You are SmartVital AI, a clinical assistant integrated into a medical risk
prediction platform.

STRICT RULES:
1. ONLY deliver medications, precautions, and direct actionable advice for the condition happening to the user.
2. DO NOT explain "why" or "how" the condition happens. Skip the medical theory, background explanations, or mechanism of action.
3. Be direct, concise, and straight to the point.
4. Always recommend consulting a licensed doctor for formal diagnosis or treatment.
5. If patient_context is provided, personalize the precautions/medications using their data.
6. Tone: professional, ultra-concise, and highly actionable."""

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(status_code=500, detail="Groq API key not configured")

    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        if request.patient_context:
            context_str = f"Patient context: {json.dumps(request.patient_context)}"
            messages.append({"role": "system", "content": context_str})
            
        for msg in request.chat_history:
            messages.append({"role": msg.role, "content": msg.content})
            
        messages.append({"role": "user", "content": request.message})
        
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
        )
        
        reply = response.choices[0].message.content
        tokens = response.usage.total_tokens
        
        return ChatResponse(reply=reply, tokens_used=tokens)
        
    except openai.RateLimitError:
        raise HTTPException(
            status_code=429, 
            detail="AI assistant is temporarily unavailable due to rate limits. Please try again in a moment."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

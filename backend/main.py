from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
import os
import json
import re

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str

@app.get("/")
def root():
    return {"status": "Resume ATS Checker API is running"}

@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    if not request.resume_text.strip() or not request.job_description.strip():
        raise HTTPException(status_code=400, detail="Resume and job description cannot be empty")

    prompt = f"""
You are an expert ATS (Applicant Tracking System) analyzer.

Analyze the resume against the job description and return ONLY a valid JSON object with no extra text, no markdown, no code blocks.

Resume:
{request.resume_text}

Job Description:
{request.job_description}

Return exactly this JSON structure:
{{
  "ats_score": <integer 0-100>,
  "matched_keywords": [<list of keywords found in both resume and JD>],
  "missing_keywords": [<list of important keywords from JD missing in resume>],
  "strengths": [<2-3 short strings about what the resume does well>],
  "improvements": [<3-4 short actionable suggestions to improve the resume>],
  "summary": "<2 sentence overall assessment>"
}}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        raw = response.text.strip()

        raw = re.sub(r"^```json\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        result = json.loads(raw)
        return result

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Gemini returned invalid JSON. Try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
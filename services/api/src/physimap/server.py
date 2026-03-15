"""
FastAPI server for PhysiMap V0.
Run with: python -m physimap.server
"""

import json

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from physimap.bias_engine import analyze
from physimap.llm_explainer import (
    build_messages,
    build_clarify_messages,
    build_analysis_messages,
    build_clarify_v2_messages,
)
from physimap.llm_client import call_llm, call_llm_json

app = FastAPI(title="PhysiMap V0", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    goal: str = "broader_shoulders"
    self_assessment: str
    preferences: str | None = None

    @field_validator("self_assessment")
    @classmethod
    def self_assessment_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("self_assessment must not be empty")
        return v


class AnalyzeResponse(BaseModel):
    analysis: dict
    response_text: str


class ClarifyResponse(BaseModel):
    response_text: str


@app.post("/v0/analyze", response_model=AnalyzeResponse)
def post_analyze(req: AnalyzeRequest):
    analysis = analyze(
        req.goal,
        req.self_assessment,
        preferences=req.preferences,
    )

    messages = build_messages(analysis, req.self_assessment, req.preferences)

    try:
        response_text = call_llm(messages)
    except Exception as exc:
        # Log the real error so it appears in the server console
        import traceback
        traceback.print_exc()
        # Return a fallback that includes the error so the client can see it
        questions = analysis.get("clarifying_questions", [])
        if questions:
            response_text = (
                "Before I can give detailed advice, I need to ask:\n"
                + "\n".join(f"- {q}" for q in questions)
            )
        else:
            response_text = f"[LLM unavailable: {exc}] Please review the analysis data directly."

    return AnalyzeResponse(analysis=analysis, response_text=response_text)


# ---------------------------------------------------------------------------
# New GPT-wrapper endpoints (no bias engine)
# ---------------------------------------------------------------------------

class SurveyAnalyzeRequest(BaseModel):
    survey_data: dict


@app.post("/analyze", response_model=AnalyzeResponse)
def post_analyze_gpt(req: SurveyAnalyzeRequest):
    messages = build_analysis_messages(req.survey_data)

    try:
        raw = call_llm_json(messages, max_output_tokens=900)
        data = json.loads(raw)
    except Exception as exc:
        import traceback
        traceback.print_exc()
        return AnalyzeResponse(
            analysis={
                "targeted": [], "underemphasized": [], "overemphasized": [],
                "do_more": [], "do_less": [], "common_mistakes": [],
                "clarifying_questions": [],
            },
            response_text=f"[LLM error: {exc}]",
        )

    analysis = {
        "targeted":             data.get("targeted", []),
        "underemphasized":      data.get("underemphasized", []),
        "overemphasized":       data.get("overemphasized", []),
        "do_more":              data.get("do_more", []),
        "do_less":              data.get("do_less", []),
        "common_mistakes":      data.get("common_mistakes", []),
        "clarifying_questions": data.get("clarifying_questions", []),
    }
    response_text = data.get("response_text", "")
    return AnalyzeResponse(analysis=analysis, response_text=response_text)


class ClarifyV2Request(BaseModel):
    survey_payload: dict
    clarifying_question: str
    user_answer: str

    @field_validator("user_answer")
    @classmethod
    def answer_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("user_answer must not be empty")
        return v


@app.post("/clarify", response_model=ClarifyResponse)
def post_clarify_v2(req: ClarifyV2Request):
    messages = build_clarify_v2_messages(
        survey_data=req.survey_payload,
        clarifying_question=req.clarifying_question,
        user_answer=req.user_answer,
    )

    try:
        response_text = call_llm(messages, max_output_tokens=700)
    except Exception as exc:
        import traceback
        traceback.print_exc()
        response_text = f"[LLM unavailable: {exc}] Please try again later."

    return ClarifyResponse(response_text=response_text)


# ---------------------------------------------------------------------------
# Legacy v0 endpoints (kept for reference)
# ---------------------------------------------------------------------------

class ClarifyRequest(BaseModel):
    analysis: dict
    self_assessment: str
    clarifying_question: str
    user_answer: str
    preferences: str | None = None

    @field_validator("user_answer")
    @classmethod
    def user_answer_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("user_answer must not be empty")
        return v


@app.post("/v0/clarify", response_model=ClarifyResponse)
def post_clarify(req: ClarifyRequest):
    messages = build_clarify_messages(
        analysis=req.analysis,
        self_assessment=req.self_assessment,
        clarifying_question=req.clarifying_question,
        user_answer=req.user_answer,
        preferences=req.preferences,
    )

    try:
        response_text = call_llm(messages, max_output_tokens=700)
    except Exception as exc:
        import traceback
        traceback.print_exc()
        response_text = f"[LLM unavailable: {exc}] Please try again later."

    return ClarifyResponse(response_text=response_text)


if __name__ == "__main__":
    uvicorn.run("physimap.server:app", host="0.0.0.0", port=8000, reload=True)

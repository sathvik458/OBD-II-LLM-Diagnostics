import json
from fastapi import FastAPI, HTTPException
from app.models import DiagnosticRequest, DiagnosticResponse
from app.prompt_builder import build_diagnostic_prompt
from app.llm.factory import get_llm_provider

app = FastAPI()

@app.get("/")
def root():
    return {"status": "running"}


@app.post("/diagnose", response_model=DiagnosticResponse)
async def diagnose(request: DiagnosticRequest):
    provider = get_llm_provider()

    prompt = build_diagnostic_prompt(
        request.obd_code,
        request.symptoms
    )

    raw_output = await provider.generate(prompt)
    try:
        raw_output = await provider.generate(prompt)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM provider error: {str(e)}")

    try:
        parsed = json.loads(raw_output)
    except Exception as e:
        snippet = raw_output[:1000] if isinstance(raw_output, str) else str(raw_output)
        raise HTTPException(status_code=500, detail=f"Invalid LLM output JSON: {str(e)}. Raw output snippet: {snippet}")

    return DiagnosticResponse(**parsed)
import json
from fastapi import FastAPI, HTTPException

from app.models import DiagnosticRequest, DiagnosticResponse
from app.prompt_builder import build_diagnostic_prompt
from app.llm.factory import get_llm_provider
from app.diagnostic_processor import process_diagnostic_output # make sure this file exists

app = FastAPI()


@app.get("/")
def root():
    return {"status": "running"}


@app.post("/diagnose", response_model=DiagnosticResponse)
async def diagnose(request: DiagnosticRequest):
    provider = get_llm_provider()

    # Build prompt
    prompt = build_diagnostic_prompt(
        request.obd_code,
        request.symptoms
    )

    # Call LLM safely
    try:
        raw_output = await provider.generate(prompt)
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"LLM provider error: {str(e)}"
        )

    # Parse JSON output
    try:
        parsed = json.loads(raw_output)
    except Exception as e:
        snippet = raw_output[:1000] if isinstance(raw_output, str) else str(raw_output)
        raise HTTPException(
            status_code=500,
            detail=f"Invalid LLM output JSON: {str(e)}. Raw output snippet: {snippet}"
        )

    # Deterministic post-processing (sorting + confidence)
    processed = process_diagnostic_output(parsed)

    # Return validated response
    return DiagnosticResponse(**processed)
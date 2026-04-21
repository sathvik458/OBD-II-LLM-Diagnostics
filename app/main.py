import asyncio
import json
import logging

from fastapi import FastAPI, HTTPException

from app.models import DiagnosticRequest, DiagnosticResponse, VehicleInfo
from app.prompt_builder import build_diagnostic_prompt
from app.llm.factory import get_llm_provider
from app.diagnostic_processor import process_diagnostic_output
from app.vin_decoder import decode_vin
from app.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("obd-llm")

app = FastAPI(title="OBD-II LLM Diagnostics")


def _strip_code_fences(raw: str) -> str:
    """Tolerate the occasional ```json ... ``` wrapper an LLM emits."""
    raw = raw.strip()
    if raw.startswith("```"):
        lines = raw.splitlines()
        lines = lines[1:]  # drop opening fence line
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        raw = "\n".join(lines).strip()
    return raw


async def _resolve_vehicle(req: DiagnosticRequest) -> VehicleInfo:
    """
    Figure out which vehicle we're diagnosing.

    Logic, in order:
      1. If a VIN was sent, try to decode it via NHTSA.
      2. If the VIN decode fails AND the user also sent the manual fields,
         use the manual fields as a fallback. This is a nice safety net for
         non-US VINs or NHTSA outages.
      3. If only the manual fields were sent (no VIN), just use them.
    """
    # Are make/model/year/engine all present? (Used as a possible fallback.)
    has_manual_fields = all([req.make, req.model, req.year, req.engine])

    if req.vin:
        try:
            return await decode_vin(req.vin)
        except Exception as e:
            # VIN failed. If we have manual fields, fall back silently.
            if has_manual_fields:
                logger.warning(
                    "VIN decode failed (%s); falling back to manual fields.", e
                )
                return VehicleInfo(
                    make=req.make,
                    model=req.model,
                    year=req.year,
                    engine=req.engine,
                )
            # No fallback possible — tell the caller what went wrong.
            logger.warning("VIN decode failed for %s: %s", req.vin, e)
            raise HTTPException(
                status_code=422,
                detail=(
                    f"VIN decode failed: {e}. "
                    "Send make/model/year/engine instead, or include them "
                    "alongside the VIN as a fallback."
                ),
            )

    # No VIN was sent. The request validator already guaranteed all four
    # manual fields are present, so we can use them directly.
    return VehicleInfo(
        make=req.make,
        model=req.model,
        year=req.year,
        engine=req.engine,
    )


@app.get("/")
def root():
    return {"status": "running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/diagnose", response_model=DiagnosticResponse)
async def diagnose(request: DiagnosticRequest):
    vehicle = await _resolve_vehicle(request)
    logger.info(
        "diagnose vehicle=%s obd_code=%s symptoms_len=%s",
        vehicle.model_dump(),
        request.obd_code,
        len(request.symptoms) if request.symptoms else 0,
    )

    provider = get_llm_provider()
    prompt = build_diagnostic_prompt(vehicle, request.obd_code, request.symptoms)

    try:
        raw_output = await asyncio.wait_for(
            provider.generate(prompt),
            timeout=settings.LLM_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        logger.error("LLM call timed out after %ss", settings.LLM_TIMEOUT_SECONDS)
        raise HTTPException(status_code=504, detail="LLM request timed out.")
    except Exception as e:
        logger.exception("LLM provider error")
        raise HTTPException(status_code=502, detail=f"LLM provider error: {e}")

    try:
        parsed = json.loads(_strip_code_fences(raw_output))
    except Exception:
        logger.error("Invalid JSON from LLM: %r", raw_output[:500])
        raise HTTPException(status_code=502, detail="LLM returned invalid JSON.")

    processed = process_diagnostic_output(parsed)
    # Attach resolved vehicle so the client sees exactly what we diagnosed against.
    processed["vehicle"] = vehicle.model_dump()

    try:
        return DiagnosticResponse(**processed)
    except Exception as e:
        logger.error("Response validation failed. parsed=%s", parsed)
        raise HTTPException(
            status_code=502,
            detail=f"LLM output failed validation: {e}",
        )

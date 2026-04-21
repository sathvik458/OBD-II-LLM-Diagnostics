from app.models import VehicleInfo


SYSTEM_INSTRUCTION = (
    "You are an expert automotive diagnostic technician. "
    "Reason carefully, but respond with a SINGLE JSON object only — "
    "no prose, no markdown, no code fences. "
    "When ranking probable causes, weight BOTH:\n"
    "  (a) probability the cause is the true root issue, given the OBD code, "
    "      symptoms, and the specific vehicle platform;\n"
    "  (b) ease_of_check — how hard it is for an owner or DIYer to verify.\n"
    "Prefer causes that are likely AND easy to check near the top of the list. "
    "Do not invent data. If inputs are vague, reduce diagnostic_certainty_percent."
)


OUTPUT_SCHEMA_HINT = """{
  "diagnostic_summary": "string, under 40 words",
  "probable_causes": [
    {
      "cause": "short description of the failing component or condition",
      "probability_percent": 0-100,
      "ease_of_check": "Easy | Moderate | Hard",
      "confidence_level": "low | medium | high",
      "recommended_check": "one-sentence diagnostic step"
    }
  ],
  "severity": "low | medium | high | critical",
  "safe_to_drive": true | false,
  "estimated_repair_cost_usd": { "min": 0, "max": 0 },
  "recommended_actions": ["string", "string"],
  "diagnostic_certainty_percent": 0-100
}"""


def build_diagnostic_prompt(
    vehicle: VehicleInfo,
    obd_code: str | None,
    symptoms: str | None,
) -> str:
    return f"""{SYSTEM_INSTRUCTION}

VEHICLE:
  Year:   {vehicle.year}
  Make:   {vehicle.make}
  Model:  {vehicle.model}
  Engine: {vehicle.engine}

DIAGNOSTIC INPUT:
  OBD_CODE: {obd_code or "none"}
  SYMPTOMS: {symptoms or "none"}

REQUIRED OUTPUT SHAPE:
{OUTPUT_SCHEMA_HINT}

RULES:
- Return 2–4 probable causes.
- Sum of probability_percent across causes must be <= 100.
- diagnostic_summary must be under 40 words.
- If severity is "critical", safe_to_drive MUST be false.
- If inputs are vague or the OBD code is missing, lower diagnostic_certainty_percent below 50.
- Tailor cause probabilities to the SPECIFIC vehicle year/make/model/engine.
  Known TSBs, recalls, and platform-specific failure patterns should raise the
  relevant cause's probability_percent.
- Every cause MUST include all fields: cause, probability_percent, ease_of_check,
  confidence_level, recommended_check.
"""

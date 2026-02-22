from typing import List, Optional, Literal
from pydantic import BaseModel, Field, conint, model_validator


class DiagnosticRequest(BaseModel):
    obd_code: Optional[str] = Field(default=None)
    symptoms: Optional[str] = Field(default=None)

    @model_validator(mode="after")
    def at_least_one_field(self):
        if not self.obd_code and not self.symptoms:
            raise ValueError("At least one of obd_code or symptoms must be provided.")
        return self


class ProbableCause(BaseModel):
    cause: str
    probability_percent: conint(ge=0, le=100)
    confidence_level: Literal["low", "medium", "high"]


class RepairCost(BaseModel):
    min: conint(ge=0)
    max: conint(ge=0)

    @model_validator(mode="after")
    def min_less_than_max(self):
        if self.min > self.max:
            raise ValueError("min repair cost cannot exceed max repair cost.")
        return self


class DiagnosticResponse(BaseModel):
    diagnostic_summary: str
    probable_causes: List[ProbableCause]
    severity: Literal["low", "medium", "high", "critical"]
    safe_to_drive: bool
    estimated_repair_cost_usd: RepairCost
    recommended_actions: List[str]
    diagnostic_certainty_percent: conint(ge=0, le=100)

    @model_validator(mode="after")
    def enforce_rules(self):
        # 1) summary under 40 words
        if len(self.diagnostic_summary.split()) > 40:
            raise ValueError("diagnostic_summary must be under 40 words.")

        # 2) 2–4 probable causes
        if not (2 <= len(self.probable_causes) <= 4):
            raise ValueError("probable_causes must contain 2–4 items.")

        # 3) probability sum <= 100
        total_probability = sum(pc.probability_percent for pc in self.probable_causes)
        if total_probability > 100:
            raise ValueError("Total probability_percent cannot exceed 100.")

        # 4) severity vs safe_to_drive rule
        if self.severity == "critical" and self.safe_to_drive:
            raise ValueError("If severity is critical, safe_to_drive must be false.")

        return self
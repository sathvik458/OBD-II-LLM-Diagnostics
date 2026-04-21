"""
Deterministic post-processing on the LLM output.

We:
  1. Normalize each cause's fields (clamp ranges, fix capitalization).
  2. Sort causes with a blended score: probability_percent + ease_of_check.
     This surfaces causes that are BOTH likely AND easy to check first —
     the ideal starting point for a user trying to triage the issue.
"""
from typing import List, Dict


EASE_RANK = {"Easy": 3, "Moderate": 2, "Hard": 1}
VALID_EASE = {"Easy", "Moderate", "Hard"}
VALID_CONFIDENCE = {"low", "medium", "high"}

# Blend weights (must sum to 1.0). Tune after observing real outputs.
# Probability-dominant: still orders "likely + hard" above "unlikely + easy".
PROBABILITY_WEIGHT = 0.70
EASE_WEIGHT = 0.30


def _normalize_cause(cause: Dict) -> Dict:
    # ease_of_check
    ease = (cause.get("ease_of_check") or "Hard").strip().capitalize()
    if ease not in VALID_EASE:
        ease = "Hard"
    cause["ease_of_check"] = ease

    # confidence_level
    conf = (cause.get("confidence_level") or "low").strip().lower()
    if conf not in VALID_CONFIDENCE:
        conf = "low"
    cause["confidence_level"] = conf

    # probability_percent (clamp to 0-100)
    try:
        prob = int(cause.get("probability_percent", 0))
    except (TypeError, ValueError):
        prob = 0
    cause["probability_percent"] = max(0, min(100, prob))

    return cause


def normalize_causes(causes: List[Dict]) -> List[Dict]:
    return [_normalize_cause(c) for c in causes]


def sort_causes(causes: List[Dict]) -> List[Dict]:
    """Blended sort: the ideal 'try this first' item rises to the top."""

    def score(c: Dict) -> float:
        prob = c.get("probability_percent", 0)              # 0-100
        ease_rank = EASE_RANK.get(c.get("ease_of_check", "Hard"), 1)  # 1-3
        ease_scaled = (ease_rank - 1) * 50                  # 0 | 50 | 100
        return PROBABILITY_WEIGHT * prob + EASE_WEIGHT * ease_scaled

    return sorted(causes, key=score, reverse=True)


def process_diagnostic_output(llm_output: Dict) -> Dict:
    causes = llm_output.get("probable_causes", [])
    causes = normalize_causes(causes)
    llm_output["probable_causes"] = sort_causes(causes)
    return llm_output

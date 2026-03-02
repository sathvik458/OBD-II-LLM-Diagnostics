from typing import List, Dict


LIKELIHOOD_WEIGHT = {
    "High": 3,
    "Medium": 2,
    "Low": 1
}

EASE_WEIGHT = {
    "Easy": 3,
    "Moderate": 2,
    "Hard": 1
}


def sort_causes(causes: List[Dict]) -> List[Dict]:
    return sorted(
        causes,
        key=lambda c: (
            LIKELIHOOD_WEIGHT.get(c.get("likelihood", "Low"), 1),
            EASE_WEIGHT.get(c.get("ease_of_check", "Hard"), 1)
        ),
        reverse=True
    )


def compute_confidence(causes: List[Dict]) -> str:
    high_count = sum(1 for c in causes if c.get("likelihood") == "High")
    medium_count = sum(1 for c in causes if c.get("likelihood") == "Medium")

    if high_count == 1 and medium_count == 0:
        return "High"

    if high_count >= 2:
        return "Medium"

    if medium_count >= 2:
        return "Low"

    return "Low"


def process_diagnostic_output(llm_output: Dict) -> Dict:
    causes = llm_output.get("probable_causes", [])

    sorted_causes = sort_causes(causes)
    confidence = compute_confidence(sorted_causes)

    llm_output["probable_causes"] = sorted_causes
    llm_output["diagnostic_confidence"] = confidence

    return llm_output

VALID_LIKELIHOODS = {"High", "Medium", "Low"}
VALID_EASE = {"Easy", "Moderate", "Hard"}


def normalize_cause_fields(causes):
    for cause in causes:
        likelihood = cause.get("likelihood", "Low")
        ease = cause.get("ease_of_check", "Hard")

        # Normalize capitalization
        likelihood = likelihood.capitalize()
        ease = ease.capitalize()

        # Validate values
        if likelihood not in VALID_LIKELIHOODS:
            likelihood = "Low"

        if ease not in VALID_EASE:
            ease = "Hard"

        cause["likelihood"] = likelihood
        cause["ease_of_check"] = ease

    return causes

def process_diagnostic_output(llm_output: Dict) -> Dict:
    causes = llm_output.get("probable_causes", [])

    causes = normalize_cause_fields(causes)
    sorted_causes = sort_causes(causes)
    confidence = compute_confidence(sorted_causes)

    llm_output["probable_causes"] = sorted_causes
    llm_output["diagnostic_confidence"] = confidence

    return llm_output
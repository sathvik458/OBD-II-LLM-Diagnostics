"""
VIN decoder using NHTSA vPIC.

NHTSA vPIC is a free, public US government service. No API key required.
We give it a 17-character VIN and it gives us back details about the car.

This file does three jobs:
  1. Calls the NHTSA API and parses the response into a VehicleInfo.
  2. Caches successful results in memory so repeat lookups are instant.
  3. Retries one time if NHTSA is slow or temporarily fails.
"""
import asyncio
import logging
from typing import Dict

import httpx

from app.models import VehicleInfo

logger = logging.getLogger(__name__)

# The NHTSA endpoint. {vin} gets replaced with the actual VIN at call time.
NHTSA_URL = (
    "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{vin}?format=json"
)

# How long to wait on a single NHTSA call before giving up.
TIMEOUT_SECONDS = 10.0

# How long to pause between the first attempt and the retry.
RETRY_DELAY_SECONDS = 2.0

# In-memory cache. Key = VIN string, value = VehicleInfo.
# This is just a regular Python dictionary — nothing fancy.
# It lives only while the server is running. Restarting clears it.
# That's fine for now; if we ever scale to multiple servers we'd swap in Redis.
_VIN_CACHE: Dict[str, VehicleInfo] = {}


def _build_engine_string(row: dict) -> str:
    """
    NHTSA returns engine details in separate fields.
    We combine them into one easy-to-read string like "2.5L I4" or "5.0L V8 Hybrid".
    """
    displacement = (row.get("DisplacementL") or "").strip()
    cylinders = (row.get("EngineCylinders") or "").strip()
    config = (row.get("EngineConfiguration") or "").strip()  # "V", "Inline", "Flat"
    fuel = (row.get("FuelTypePrimary") or "").strip()
    electrification = (row.get("ElectrificationLevel") or "").strip()

    parts = []

    # Step 1: displacement, e.g. "2.5" -> "2.5L"
    if displacement:
        try:
            parts.append(f"{float(displacement):.1f}L")
        except ValueError:
            parts.append(f"{displacement}L")

    # Step 2: cylinder count + layout
    # "4" + "Inline" -> "I4"
    # "8" + "V"      -> "V8"
    # "6" + "Flat"   -> "F6"
    if cylinders:
        cfg_lower = config.lower()
        if cfg_lower.startswith("v"):
            prefix = "V"
        elif cfg_lower.startswith("in"):
            prefix = "I"
        elif cfg_lower.startswith("flat"):
            prefix = "F"
        else:
            prefix = ""
        parts.append(f"{prefix}{cylinders}" if prefix else f"{cylinders}-cyl")

    # Step 3: fuel type — only mention if it's something other than plain gasoline
    if fuel and fuel.lower() != "gasoline":
        parts.append(fuel)

    # Step 4: electrification — only mention if it's a hybrid/PHEV/EV
    if electrification and electrification.lower() != "none":
        parts.append(electrification)

    return " ".join(parts) or "unknown"


async def _fetch_from_nhtsa(vin: str) -> VehicleInfo:
    """
    Make ONE HTTP call to NHTSA and turn the response into a VehicleInfo.
    Raises an exception if the call fails or the response is missing key fields.
    """
    url = NHTSA_URL.format(vin=vin)

    # httpx.AsyncClient is the standard way to make async HTTP calls in Python.
    async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
        response = await client.get(url)
        response.raise_for_status()  # raises if HTTP status >= 400
        data = response.json()

    # NHTSA always wraps results in a list under the "Results" key.
    results = data.get("Results") or []
    if not results:
        raise ValueError("NHTSA returned no results for this VIN.")

    row = results[0]

    make = (row.get("Make") or "").strip().title()
    model = (row.get("Model") or "").strip().title()
    year_raw = (row.get("ModelYear") or "").strip()

    # If any of these core fields is missing, the VIN probably isn't a US-market
    # vehicle, or it's malformed. The caller can fall back to manual fields.
    if not (make and model and year_raw):
        raise ValueError(
            f"NHTSA returned partial data "
            f"(make={make!r}, model={model!r}, year={year_raw!r}). "
            f"Try the manual path instead."
        )

    return VehicleInfo(
        make=make,
        model=model,
        year=int(year_raw),
        engine=_build_engine_string(row),
    )


async def decode_vin(vin: str) -> VehicleInfo:
    """
    The main function other parts of the app call.

    Steps:
      1. Look in the cache. If we've seen this VIN before, return it immediately.
      2. Otherwise, call NHTSA. If the call fails, wait 2 seconds and try once more.
      3. If both attempts fail, raise an error so the caller can react.
    """
    vin = vin.strip().upper()

    # --- 1. Check cache ---
    if vin in _VIN_CACHE:
        logger.info("VIN cache hit: %s", vin)
        return _VIN_CACHE[vin]

    # --- 2. Try NHTSA up to 2 times ---
    last_error = None
    for attempt in (1, 2):
        try:
            vehicle = await _fetch_from_nhtsa(vin)
            # Save for next time so we don't call NHTSA again for the same VIN.
            _VIN_CACHE[vin] = vehicle
            logger.info(
                "VIN decoded (attempt %d): %s -> %d %s %s (%s)",
                attempt, vin, vehicle.year, vehicle.make, vehicle.model, vehicle.engine,
            )
            return vehicle
        except Exception as e:
            last_error = e
            logger.warning("NHTSA attempt %d failed for %s: %s", attempt, vin, e)
            if attempt == 1:
                await asyncio.sleep(RETRY_DELAY_SECONDS)

    # --- 3. Both attempts failed ---
    raise RuntimeError(
        f"NHTSA could not decode VIN {vin} after 2 attempts. Last error: {last_error}"
    )

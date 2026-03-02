# OBD-II-LLM-Diagnostics
# 🚧 Work in progress.
Vehicle Diagnostic LLM
This is a diagnostic platform which assists in diagnosing automotive issues and problems with the help of Large language models.

This project combines:
 OBD-II fault code reasoning

Interactive vehicle intake

VIN decoding (US support)

Mileage-aware fault weighting

Deterministic post-processing

🧠 Architecture Overview

High-level flow:

User
→ Vehicle Selection (Brand/Model/Year)
→ Engine Clarification (LLM-assisted)
→ Mileage Input
→ OBD Code + Symptoms
→ LLM Diagnostic
→ Deterministic Post-Processing
→ Structured Response

The system is layered:

API Layer (FastAPI)

Service Layer (Intake + Diagnostic Orchestration)

Domain Layer (Weighting + Post-Processing)

LLM Abstraction Layer

Vehicle Metadata Repository (JSON → DB migration later)

⚙️ Getting Started
1️⃣ Clone Repository
git clone https://github.com/yourusername/vehicle-diagnostics-llm.git
cd vehicle-diagnostics-llm
2️⃣ Create Virtual Environment
python -m venv .venv
.venv\Scripts\activate
3️⃣ Install Dependencies
pip install -r requirements.txt
4️⃣ Create .env File
GEMINI_API_KEY=your_key_here
LLM_PROVIDER=gemini
5️⃣ Run Server
uvicorn app.main:app --reload

Open:

http://127.0.0.1:8000/docs

🛣️ Roadmap

Phase 1 – Interactive Intake Flow
Phase 2 – Expanded Vehicle Metadata
Phase 3 – Scraper-Based Data Ingestion
Phase 4 – PostgreSQL Migration
Phase 5 – Diagnostic Analytics Dashboard

🤝 Contributing

We welcome contributions in:

Vehicle metadata expansion

Prompt engineering improvements

Diagnostic weighting logic

Frontend UX design

Testing and validation

See CONTRIBUTING.md for details.
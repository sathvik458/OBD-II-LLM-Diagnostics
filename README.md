# OBD-II-LLM-Diagnostics
# 🚧 Work in progress.
Vehicle Diagnostic LLM: This is a diagnostic platform which assists in diagnosing automotive issues and problems with the help of Large Language Models (LLMs).

### 🚀 Key Features
This project combines:
* **OBD-II fault code reasoning**
* **Interactive vehicle intake**
* **VIN decoding** (US support)
* **Mileage-aware fault weighting**
* **Deterministic post-processing**

---

### 🧠 Architecture Overview
**High-level flow:**
`User` -> `Vehicle Selection (Brand/Model/Year)` -> `Engine Clarification (LLM-assisted)` -> `Mileage Input` -> `OBD Code + Symptoms` -> `LLM Diagnostic` -> `Deterministic Post-Processing` -> `Structured Response`

**The system is layered:**
1. **API Layer:** FastAPI
2. **Service Layer:** Intake + Diagnostic Orchestration
3. **Domain Layer:** Weighting + Post Processing
4. **LLM Abstraction Layer**
5. **Vehicle Metadata Repository:** JSON (DB migration later)

---

### ⚙️ Getting Started

1. **Clone Repository**
   ```bash
   git clone [https://github.com/sathvik458/OBD-II-LLM-Diagnostics.git](https://github.com/sathvik458/OBD-II-LLM-Diagnostics.git)
   cd OBD-II-LLM-Diagnostics
Create Virtual Environment

Bash
python -m venv .venv
.venv\Scripts\activate
Install Dependencies

Bash
pip install -r requirements.txt
Setup Environment Variables
Create a .env file in the root directory:

Code snippet
GEMINI_API_KEY=your_key_here
LLM_PROVIDER=gemini
Run Server

Bash
uvicorn app.main:app --reload
Open API Documentation: http://127.0.0.1:8000/docs

🗺️ Roadmap
Phase 1: Interactive Intake Flow

Phase 2: Expanded Vehicle Metadata

Phase 3: Scraper-Based Data Ingestion

Phase 4: PostgreSQL Migration

Phase 5: Diagnostic Analytics Dashboard

🤝 Contributing
We welcome contributions in:

Vehicle metadata expansion

Prompt engineering improvements

Diagnostic weighting logic

Frontend UX design

Testing and validation

See CONTRIBUTING.md for details.
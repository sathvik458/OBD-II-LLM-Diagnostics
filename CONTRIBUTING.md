Contributing to Vehicle Diagnostics LLM

Thank you for your interest in contributing.

This project aims to build a structured, explainable AI-assisted vehicle diagnostic system. Contributions are welcome in architecture, backend, frontend, testing, and automotive domain logic.

🚀 Project Philosophy

We prioritize:

Clean architecture

Deterministic logic layered over LLM reasoning

Modularity and maintainability

Clear documentation

Production-ready structure

Please read this guide before submitting changes.

🛠 Development Setup
1️⃣ Clone the repository
git clone https://github.com/yourusername/vehicle-diagnostics-llm.git
cd vehicle-diagnostics-llm
2️⃣ Create virtual environment

Windows:

python -m venv .venv
.venv\Scripts\activate

Mac/Linux:

python3 -m venv .venv
source .venv/bin/activate
3️⃣ Install dependencies
pip install -r requirements.txt
4️⃣ Configure environment variables

Create a .env file:

GEMINI_API_KEY=your_key_here
LLM_PROVIDER=gemini
🌿 Branching Strategy

We use the following branch structure:

main → stable production-ready code

dev → active development

feature/* → new features

fix/* → bug fixes

docs/* → documentation changes

refactor/* → structural improvements

Example:

feature/intake-state-machine
feature/mileage-weighting
docs/architecture-update

Do NOT commit directly to main.

🧾 Commit Message Style

We follow Conventional Commits:

feat: add mileage-based weighting logic
fix: correct diagnostic confidence calculation
refactor: extract intake service layer
docs: update architecture diagram
test: add unit tests for engine weighting

Keep commits focused and atomic.

📌 Pull Request Guidelines

Before submitting a PR:

Ensure the code runs locally

Keep changes scoped to a single issue

Add or update tests when applicable

Update documentation if needed

Ensure no API keys are committed

PR description should include:

What changed

Why it changed

Any architectural impact

🏷 Issue Guidelines

When opening a new issue, include:

Clear description

Reproduction steps (if bug)

Expected behavior

Relevant logs or screenshots

Good issue examples:

Improve turbo engine weighting logic

Add support for hybrid diagnostic adjustments

Refactor vehicle repository abstraction

🧠 Areas Where Contributions Are Welcome

Vehicle metadata expansion

Engine clarification prompt refinement

Diagnostic probability modeling

Mileage-based adjustment logic

Frontend multi-step intake UI

Testing & validation

Performance optimization

Documentation improvements

🧪 Testing

When adding logic:

Add unit tests in tests/

Ensure deterministic post-processing is tested

Avoid introducing LLM-dependent randomness in core logic

🔐 Security

Never commit .env

Never commit API keys

Do not expose external service credentials

🛣 Roadmap Alignment

Before implementing large features, check:

README roadmap

Open milestones

Existing architecture direction

Major architectural changes should be discussed via issue first.

💬 Questions?

Open a GitHub discussion or issue.

We aim to build this into a structured, scalable, automotive-grade AI diagnostic system.

Thank you for contributing.
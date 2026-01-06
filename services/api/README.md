# PhysiMap API (FastAPI)

FastAPI backend for PhysiMap.

Responsibilities:
- Stateless API
- Deterministic muscle-bias engine (source of truth)
- Optional server-side LLM explanation & personalization only (never overrides deterministic output)

Primary dev workflow:
- Backend runs locally
- Android Emulator calls the API via `http://10.0.2.2:<PORT>`

Docs: `../../docs/dev-setup.md`

---

## Prerequisites
- Python 3.11+ recommended

---

## Environment variables
Create a local `.env` file from the example:

```bash
cp .env.example .env

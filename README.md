# PhysiMap (V0)

AI-assisted physique analysis that identifies over-/under-emphasized muscle groups and recommends training bias adjustments using **deterministic, explainable logic**. An LLM is used **only** to explain and personalize the output (never to decide it).

> Status: V0 — intentionally minimal, testable, and credibility-first.

---

## Why this exists
Most fitness tools either:
- provide generic advice with no transparency, or
- rely on “AI” without showing the logic.

PhysiMap V0 prioritizes:
- **explainable sports-science logic**
- **responsible, bounded LLM usage**
- **clarity over hype**

---

## What PhysiMap V0 does
- Supports **one goal module**: **Broader shoulders**
- Runs a **deterministic bias engine** to flag over-/under-emphasized areas
- Produces an **explainable** recommendation (signals + reasoning)
- Optionally generates a **user-friendly explanation** using an LLM (tone + clarity)

## What PhysiMap V0 does NOT do (by design)
- No workout logging
- No full program generation or periodization
- No “coach replacement” claims
- No medical / injury advice

---

## How it works (at a glance)
1. User selects a goal and provides basic inputs (V0: non-image, observation-based inputs)
2. **Deterministic engine** maps inputs → muscle emphasis signals
3. Engine outputs bias guidance (what to emphasize / de-emphasize + why)
4. **(Optional)** LLM converts the engine output into clearer explanations and personalized wording

> Source of truth = deterministic engine. The LLM does not change decisions.

---

## Architecture
- **React Native mobile app**: UI only (inputs + results display)
- **Python + FastAPI backend**: logic + API + explanation layer
- **Deterministic bias engine**: transparent rules + explicit data structures
- **LLM layer**: explanation/personalization only, with guardrails

---

## Repository layout
> Keep this in sync as the repo evolves.

apps/
mobile/ # React Native app (UI)
services/
api/ # FastAPI backend
physimap/ # core package
core/ # deterministic bias engine
goals/ # goal modules (V0: broader shoulders)
llm/ # explanation layer + prompts + guards
routes/ # API endpoints
schemas/ # Pydantic models
tests/ # backend tests
docs/
architecture.md
bias-engine.md
llm-guardrails.md

---

## Quickstart

### Prerequisites
- Python 3.11+ (backend)
- Node.js 18+ (mobile)
- (Optional) LLM API key (only needed for explanation endpoints)

### Run backend (FastAPI)
See: `services/api/README.md`

### Run mobile app (React Native)
See: `apps/mobile/README.md`

---

## API overview (V0)
Typical endpoints:
- `POST /v0/analyze` — deterministic analysis output (no LLM)
- `POST /v0/explain` — explanation layer output (LLM optional)

> Once schemas stabilize, add a small request/response example here.

---

## Deterministic bias engine (explainable core)
PhysiMap’s recommendations come from explicit rules:
- Inputs → signals per muscle group
- Goal module defines target aesthetic bias (V0: broader shoulders)
- Output is traceable (which signals triggered and why)

Docs:
- `docs/bias-engine.md`

---

## Responsible LLM integration
LLM is used only to:
- explain the deterministic output in plain language
- adjust tone/detail level based on user preference

LLM is not allowed to:
- override deterministic outputs
- invent measurements or pretend it “saw” data it didn’t
- provide medical advice

Docs:
- `docs/llm-guardrails.md`

---

## Testing & quality
Backend tests live in: `services/api/tests`

Code principles:
- deterministic first, AI second
- small functions + explicit data structures
- recommendations must be traceable to rules/signals

---

## Privacy & safety notes
PhysiMap V0 is designed to minimize sensitive data handling.
If image inputs are introduced later, the repo will document storage, retention, and consent.

PhysiMap is an educational tool and does not replace professional coaching or medical guidance.

---

## Roadmap (small, credible steps)
- V0.x: stabilize schemas, increase rule coverage, add tests, improve UI copy
- V1: additional goal modules (deterministic-first)
- Future: consider image-based inputs only if privacy + explainability standards are met

---

## Contributing
This is currently a solo-developer, learning-driven project.
Please open an Issue before making major changes.

---

## License
TBD (MIT / Apache-2.0 / GPL-3.0)

---

## Acknowledgements
Built with FastAPI and React Native. Supporting docs live in `docs/`.

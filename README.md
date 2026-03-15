# PhysiMap

PhysiMap is an AI-assisted physique analysis tool that helps lifters identify over- and under-emphasized muscle groups and adjust training bias to align with aesthetic goals.

## Why this exists
Most fitness tools either:
- provide generic advice with no transparency

PhysiMap V0 prioritizes:
- **explainable sports-science logic**
- **responsible, bounded LLM usage**

---

## What PhysiMap does
- Tailored for ONE specific desired outcomes, e.g: **Broader shoulders**
- Runs a **deterministic bias engine** to flag over-/under-emphasized areas
- Produces an **explainable** recommendation and generates a **user-friendly explanation** via OpenAI API


## How it works 
1. User provides inputs in the mobile app (MCQ Survey)
2. Backend deterministic engine produces:
   - muscle emphasis signals
   - bias recommendation (what to emphasize / de-emphasize)
   - traceable reasoning

---

## Architecture
- **Expo React Native mobile app**: UI only (inputs + results display)
- **Python + FastAPI backend**: logic + API + explanation layer
- **Deterministic bias engine**: transparent rules + explicit data structures
- **LLM layer**: explanation/personalization only, with guardrails

---

## Repository layout
> Keep this in sync as the repo evolves.

physimap/
  README.md
  LICENSE
  .gitignore
  .editorconfig
  .gitattributes
  apps/
  mobile/ # Expo React Native app (UI only)
  services/
  api/ # FastAPI backend (logic + API + explanation layer)
  docs/ # Architecture, bias engine notes, LLM guardrails, dev setup
  .github/ # CI + templates

---

## Quickstart (local dev)
See subproject READMEs for exact steps:
- Mobile: `apps/mobile/README.md`
- API: `services/api/README.md`

Key networking note for Android Emulator:
- Emulator cannot reach your host API via `localhost`
- Use `http://10.0.2.2:<PORT>` instead  
Docs: `docs/dev-setup.md`

## Documentation index
- `docs/architecture.md` — architecture and boundaries
- `docs/bias-engine.md` — deterministic engine rules/signals (traceability)
- `docs/llm-guardrails.md` — LLM constraints and safety
- `docs/dev-setup.md` — Android Emulator ↔ local API networking

---

## Purpose
This is currently a solo-developer, learning-driven project.

---

## License
MIT

---

## Acknowledgements
Built with FastAPI and React Native. Supporting docs live in `docs/`.

# PhysiMap (V0)

PhysiMap is an AI-assisted physique analysis tool that helps lifters identify over- and under-emphasized muscle groups and adjust training bias to align with aesthetic goals.

V0 is intentionally minimal and credibility-first:
- Deterministic, explainable bias engine is the source of truth
- LLM is server-side only and used only for explanation/personalization (never for decisions)
- No hype, no coach-replacement claims

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

## How it works (high-level)
1. User provides inputs in the mobile app (V0: simple observation-based inputs)
2. Backend deterministic engine produces:
   - muscle emphasis signals
   - bias recommendation (what to emphasize / de-emphasize)
   - traceable reasoning
3. Optional LLM layer turns the deterministic result into clearer, personalized language

Deterministic engine remains the source of truth.

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

## Contributing
This is currently a solo-developer, learning-driven project.
- Keep PRs small and scoped
- Do not add features that change the locked architecture or V0 scope without an Issue first
- Never commit secrets (use `.env` locally and commit `.env.example` only)

---

## License
TBD (MIT / Apache-2.0 / GPL-3.0)

---

## Acknowledgements
Built with FastAPI and React Native. Supporting docs live in `docs/`.

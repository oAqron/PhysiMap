# Product Requirements Document (PRD)

## 1. Product Overview

**Product name:** PhysiMap

**Product type:** AI-assisted fitness analysis application

**Stage:** Early-stage / V0–V1

### One-line description

PhysiMap helps lifters understand and correct physique imbalances by identifying over- and under-emphasized muscle groups and translating aesthetic goals into clear, explainable training adjustments.

---

## 2. Problem Statement

Most gym and fitness apps focus on **tracking** (sets, reps, weight, calories), but fail to answer the question lifters actually care about:

> “What should I change in my training to look the way I want?”
> 

Lifters often:

- train consistently but feel their physique is unbalanced
- unintentionally overemphasize certain muscles (e.g., chest/front delts)
- undertrain muscles that drive visual aesthetics (e.g., lateral delts, upper back)
- rely on generic or contradictory advice online

The problem is not lack of effort — it is **misaligned training bias**.

---

## 3. Target User

### Primary user

- Consistent gym-goer (≈6+ months experience)
- Aesthetically motivated (balance, proportions, shape)
- Wants clarity and reasoning, not just workouts
- Not looking for a full personal trainer replacement

### Non-target users (for now)

- Absolute beginners
- Competitive bodybuilders
- Medical/rehab populations

---

## 4. Product Vision

PhysiMap is not a workout logger and not a black-box AI coach.

It is a **physique bias interpreter** that:

- analyzes how a user’s training emphasis aligns with their aesthetic goals
- explains what’s likely over- or under-developed
- recommends *how to adjust*, not *what exact workout to follow*
- builds user understanding over blind compliance

---

## 5. Core Value Proposition

> Outcome clarity over activity tracking.
> 

PhysiMap helps users:

- understand *why* their physique looks the way it does
- identify leverage points for improvement
- adjust training focus intentionally instead of adding random volume

---

## 6. Scope Definition

### In scope (V0–V1)

- Physique goal–based analysis
- Muscle over-/under-emphasis identification
- High-level training adjustment guidance
- Clear explanations (human-readable)
- Interactive visualization of muscle emphasis (UI)
- Optional local history (device-level)

### Explicitly out of scope (V0–V1)

- Workout logging (sets/reps/weights)
- Full workout or program generation
- Nutrition planning
- Injury diagnosis or medical advice
- Social features
- Wearable integration

---

## 7. Core Functional Requirements

### FR-1: Physique Goal Input

- User selects a primary physique goal (e.g., broader shoulders)
- System supports one goal in V0

### FR-2: User Self-Assessment Input

- Free-text qualitative input describing perceived physique and training habits
- Optional preferences (equipment, style, schedule)

### FR-3: Deterministic Bias Analysis

- Backend analyzes likely muscle over- and under-emphasis
- Output is structured, explainable, and testable
- This analysis is deterministic (rule-based)

### FR-4: Explanation & Personalization (LLM-Assisted)

- LLM converts structured analysis into:
    - clear explanation
    - tailored guidance
    - clarifying questions if needed
- LLM must not invent new training principles

### FR-5: Visualization

- Body map UI highlights muscle emphasis
- Over-/under-emphasized areas visually differentiated
- Visualization reflects current analysis (not stored truth)

### FR-6: Results Presentation

- Results broken into sections:
    - what’s under-emphasized
    - what’s over-emphasized
    - why this is happening
    - what to adjust
- Language is educational, not authoritative

---

## 8. Non-Functional Requirements

### Explainability

- Every recommendation must have a clear reason
- No black-box “AI says so” outputs

### Safety & Boundaries

- No medical claims
- Conservative language
- Ask questions instead of assuming when ambiguous

### Performance

- API responses should feel fast (< a few seconds)
- Graceful handling of slow or failed LLM calls

### Reliability

- App should not crash due to backend failure
- Clear error states and retry options

---

## 9. AI / LLM Role & Constraints

### Role of LLM

- Interpret user language
- Explain structured analysis
- Personalize phrasing and options
- Ask clarifying questions

### Hard constraints

- LLM cannot override bias engine
- LLM cannot generate full programs
- LLM cannot make medical or injury claims
- LLM is backend-only (API key never in app)

---

## 10. Technical Architecture (Summary)

- **Frontend:** React Native + Expo
- **Primary UI testing:** Android Emulator
- **Backend:** Python + FastAPI
- **Core logic:** Deterministic muscle-bias engine
- **LLM:** Server-side explanation layer
- **State:** Stateless in V0; optional local storage later

---

## 11. Data & Persistence Strategy

### V0–V1

- No backend database required
- Optional on-device storage for:
    - last analysis
    - short history

### Future

- Supabase or similar when:
    - user accounts
    - cross-device sync
    - subscriptions
        
        become necessary
        

---

## 12. Success Metrics (Early)

### Qualitative

- Does the explanation “click” for users?
- Do users feel the recommendations are reasonable?
- Would the user change training behavior based on it?

### Quantitative (later)

- Completion of analysis flow
- Repeat usage
- Engagement with visualization

---

## 13. Risks & Mitigations

### Risk: Overbuilding too early

- Mitigation: strict V0 scope, PRD as gatekeeper

### Risk: LLM hallucination

- Mitigation: deterministic engine + constrained prompts

### Risk: Feature creep into logging app

- Mitigation: clear positioning and scope boundaries

---

## 14. Phased Development Plan (High-Level)

- **Phase 1:** Bias engine + CLI/API
- **Phase 2:** LLM explanation layer
- **Phase 3:** Mobile UI + visualization
- **Phase 4:** Polish + stability
- **Phase 5:** App Store launch
- **Phase 6+:** Expansion (only if justified)

---

## 15. Definition of “Done” (V0)

PhysiMap V0 is complete when:

- One physique goal works end-to-end
- Output is explainable and trustworthy
- UI clearly visualizes results
- The founder would personally use it

---

## Final note (important)

This PRD is meant to **guide execution**, not lock creativity.

If something feels valuable but out-of-scope, it goes into a *future backlog*, not into V0.
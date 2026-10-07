# LabelFit

[![LabelFit CI](https://github.com/MichaelWave369/LabelFit/actions/workflows/ci.yml/badge.svg)](https://github.com/MichaelWave369/LabelFit/actions/workflows/ci.yml)

**v0.3 — Real Input + Rule Foundations**

> **Food that fits you.**
>
> **LabelFit evaluates fit, not food morality.**

LabelFit is a local-first personalized food-label reasoning engine. The same product can legitimately produce different verdicts for different people based on allergies, goals, preferences, evidence completeness, and configured strictness.

## Core rules

- User-facing verdicts are **GOOD FIT / CAUTION / DOESN'T FIT / CAN'T CONFIRM**.
- Missing critical information yields **CAN'T CONFIRM**, never unjustified confidence.
- Deterministic rules decide. Explanations explain.
- Authored prose or AI output cannot override safety-critical verdicts.
- Formulations change. The physical label remains authoritative.
- No universal health score or food-morality meter.

## Architecture

```text
INPUT
  ↓
PRODUCT NORMALIZATION + INGREDIENT MATCHING
  ↓
INGREDIENT / NUTRIENT MODEL
  ↓
EVIDENCE + PROVENANCE
  ↓
PROFILE RULES
  ↓
DETERMINISTIC VERDICT ENGINE
  ↓
EXPLANATION + DECISION TRACE
  ↓
UI + BETTER-FIT RANKING
```

## v0.3 capabilities

- Personalized profiles and household fit
- Allergy severity preserved as mild / moderate / severe
- Real pasted-ingredient parsing against the bundled matcher
- Ingredient deep dives with evidence strength
- Explainable decision traces
- Product comparison
- Category-aware **Find a Better Fit**
- Formulation history
- Local-first storage
- Mobile-first UI

The verified v0.3 source snapshot contains **159 ingredient knowledge entries, 2,008 aliases, 226 ingredient/additive codes, 26 demo products, and 8 demo profiles**.

## Build

```bash
python3 scripts/build_data.py
python3 scripts/run_tests.py
```

## Safety

LabelFit assists with food decisions. It is not medical diagnosis and must not promise that a product is “100% safe.” Prefer language such as:

> No peanut conflict detected in the available product information.

## Status

This repository is being initialized from the verified LabelFit v0.3 source bundle. CI and Pages scaffolding are included in PR #1; the application source bundle is preserved separately until the GitHub connector can ingest the local file tree without truncation.

## Disclaimer

Demo data is fictional and not reviewed by a dietitian. Not medical advice.

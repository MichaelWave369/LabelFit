# LabelFit

[![LabelFit CI](https://github.com/MichaelWave369/LabelFit/actions/workflows/ci.yml/badge.svg)](https://github.com/MichaelWave369/LabelFit/actions/workflows/ci.yml)

**v0.4 — Modular Rule Engine**

> **Food that fits you.**
>
> **LabelFit evaluates fit, not food morality.**

LabelFit is a local-first personalized food-label reasoning engine. The same food can legitimately produce different verdicts for different people because profiles, evidence, thresholds, and uncertainty differ.

## Core contract

- Verdict vocabulary: **GOOD FIT / CAUTION / DOESN'T FIT / CAN'T CONFIRM**
- Deterministic rule modules decide; explanation code cannot override them
- Missing critical evidence stays visible instead of becoming an unjustified green result
- Product facts carry provenance and decision receipts
- Household mode preserves each person's result before computing an aggregate
- Better Fit requires actual outcome improvement plus category relevance
- Profile settings that are not implemented are explicitly reported as **not evaluated**
- Formulations change; the physical label remains authoritative

## v0.4 rule modules

- `allergy.v1`
- `added-sugar.v1`
- `sodium.v1`
- `caffeine.v1`
- `avoid-flags.v1`
- `completeness.v1`

The registry is extensible without turning the verdict orchestrator into one giant conditional block.

## Current capabilities

- personalized profiles
- strict and standard allergy handling
- runtime ingredient parsing with guarded look-alikes
- raw pasted-label input
- added sugar, sodium, caffeine, and avoid-list rules
- provenance-aware Why chains
- machine-readable decision receipts
- household aggregation
- category-aware Better Fit
- explicit evaluation coverage
- mobile-friendly static UI
- deterministic CI regression suite

## Development

No bundler is required. Open `index.html` directly or serve the repository with any static server.

Run the regression suites with Node:

```bash
node tests/core.test.js
node tests/matcher.test.js
node tests/evidence.test.js
node tests/household.test.js
node tests/rules.test.js
```

## Safety

LabelFit assists with food decisions. It is not medical diagnosis and must not promise that a product is “100% safe.” Prefer language such as:

> No peanut conflict detected in the available product information.

Demo data is fictional and not reviewed by a dietitian. Not medical advice.

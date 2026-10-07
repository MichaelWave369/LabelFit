# LabelFit provenance model

LabelFit separates **what was observed** from **how that observation was interpreted**.

That means every decision can carry two different references:

1. **Observation source** — where the product fact came from, such as a package ingredient panel, nutrition panel, catalog record, OCR capture, or user-pasted text.
2. **Decision basis** — the deterministic rule, profile threshold, preference, or uncertainty policy used to interpret that fact.

A package label can establish what the package says. It does not, by itself, establish every conclusion derived from that statement.

## Field-level provenance

Products may provide:

```js
provenance: {
  sources: {
    "src.example.ingredients": {
      id: "src.example.ingredients",
      title: "Example ingredient panel",
      type: "package_observation",
      authority: "PRIMARY PRODUCT OBSERVATION",
      observedAt: "2026-10-06"
    }
  },
  fields: {
    "ingredients": "src.example.ingredients",
    "contains": "src.example.ingredients",
    "mayContain": "src.example.ingredients"
  }
}
```

## Decision receipt v1

A computed result can be reduced to an auditable receipt:

```json
{
  "schema": "labelfit.decision-receipt.v1",
  "engineVersion": "0.3",
  "product": { "id": "…", "name": "…" },
  "profile": { "id": "…", "name": "…" },
  "verdict": "DOESN'T FIT",
  "confidence": "HIGH",
  "rules": [
    {
      "ruleId": "allergy.may.strict",
      "verdict": "DOESN'T FIT",
      "fact": "May contain: Peanuts",
      "fieldPath": "mayContain",
      "sourceId": "src.example.ingredients",
      "basisId": "basis.allergy.may.strict.v1"
    }
  ]
}
```

The receipt records provenance. It does not replace the original product record, profile, or rule registry.

## Authority rule

Explanation code may display, summarize, or reorganize a receipt. It may not alter the verdict that produced the receipt.

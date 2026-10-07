# LabelFit architecture

```text
INPUT
  -> NORMALIZE + MATCH
  -> PRODUCT MODEL
  -> EVIDENCE
  -> PROFILE RULES
  -> VERDICT ENGINE
  -> EXPLANATION
  -> UI + BETTER-FIT RANKING
```

The verdict engine is deterministic. Explanation happens after the result is computed. Product data, profile settings, evidence completeness, and rules are kept as separate layers so later barcode and OCR providers can plug into the input side without replacing the decision engine.

# LabelFit input provider contract

LabelFit input providers are **evidence adapters**, not decision makers.

A provider may capture or retrieve:

- raw recognized text
- barcode identifiers
- product fields
- ingredient text
- allergen declarations
- nutrition facts
- structured dietary/intolerance/processing attributes
- confidence and provenance notes

A provider may **not** assert:

- `verdict`
- `decision`
- `rules`
- `fit`
- `recommendation`

Those fields are rejected at the provider boundary.

## Pipeline

```text
CAMERA / OCR / BARCODE / PASTE
          ↓
   INPUT PROVIDER
     EVIDENCE_ONLY
          ↓
 labelfit.observation.v1
          ↓
  PRODUCT NORMALIZATION
          ↓
 DETERMINISTIC RULE ENGINE
          ↓
       VERDICT
```

## Observation schema

Providers return an observation shaped like:

```js
{
  schema: "labelfit.observation.v1",
  confidence: "HIGH",
  fields: {
    name: "Example product",
    ingredients_text: "Oats, peanut butter, salt",
    facts: { sodium_mg: 90 }
  },
  raw: {
    barcode: "..."
  },
  note: "..."
}
```

The registry adds:

```js
providerId
providerKind
authority: "EVIDENCE_ONLY"
```

before the observation is accepted.

## Built-in v0.4 providers

| Provider | Kind | Status |
| --- | --- | --- |
| `paste.local.v1` | paste | local |
| `barcode.demo.v1` | barcode | simulated fixture |
| `ocr.demo.v1` | OCR | simulated fixture |

The barcode and OCR adapters are intentionally simulated in v0.4. Their purpose is to freeze the integration boundary before any external database, camera API, or model is connected.

## Authority rule

Provider confidence describes confidence in the **observation**, not confidence in a food-fit verdict.

Even a HIGH-confidence barcode record still passes through the deterministic LabelFit rule engine. Provider code has no verdict authority.

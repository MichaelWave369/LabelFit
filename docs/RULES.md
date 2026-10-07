# LabelFit rule engine

LabelFit v0.4 uses a registry of deterministic rule modules.

Each module declares:

- a stable module ID
- the profile fields it evaluates
- a pure evaluation function that returns zero or more structured rule events

A rule event has this shape:

```js
{
  moduleId: "caffeine.v1",
  ruleId: "caffeine.limit",
  verdict: "DOESN'T FIT",
  text: "180 mg caffeine exceeds this profile's 150 mg per-serving limit.",
  fact: "180 mg caffeine",
  kind: "caffeine"
}
```

The verdict orchestrator does not contain domain-specific food logic. It:

1. normalizes the product
2. asks the registry to run all modules
3. selects the strongest emitted verdict
4. attaches a deterministic trace
5. reports profile-field evaluation coverage

## Registered modules

| Module | Profile settings |
| --- | --- |
| `allergy.v1` | `allergies`, `strictnessLevel`, `strict` |
| `added-sugar.v1` | `addedSugarGoal` |
| `sodium.v1` | `sodiumLimitPerServing` |
| `caffeine.v1` | `caffeineLimitMg` |
| `avoid-flags.v1` | `avoidFlags` |
| `completeness.v1` | none |

## Coverage rule

Configured profile fields that do not map to a registered rule module are returned under:

```js
result.coverage.notEvaluated
```

They do not silently alter or imply a verdict.

For example, if a profile contains `dietaryRestrictions: ["vegan"]` before a dietary-restriction module exists, LabelFit may still compute other rules, but the result explicitly says that `dietaryRestrictions` was **not evaluated**.

This boundary is intentional: unsupported settings must remain visible rather than being treated as implemented.

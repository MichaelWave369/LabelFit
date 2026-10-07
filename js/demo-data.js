/* LabelFit v0.3 — deterministic demo fixture */
(function (root) {
  "use strict";
  var LF = root.LabelFit = root.LabelFit || {};
  LF.demo = {
    product: {
      id: "oat-honey-bars",
      brand: "Northfield",
      name: "Oat & Honey Chewy Bars",
      category: "snack-bar",
      ingredients: [
        { text: "Whole grain oats", groups: [] },
        { text: "Honey", groups: [] },
        { text: "Soy lecithin", groups: ["soy"] }
      ],
      contains: { status: "declared", items: [{ group: "soy", label: "Soy" }] },
      mayContain: { status: "declared", items: [{ group: "peanut", label: "Peanuts" }] },
      facts: { added_sugar_g: 7, sodium_mg: 120 },
      incomplete: false,
      confidence: "HIGH",
      source: "Fictional demo package label",
      lastVerified: "2026-10-06"
    },
    profiles: [
      {
        id: "jordan", name: "Jordan", detail: "Severe peanut allergy",
        allergies: [{ allergen: "peanut", severity: "severe" }],
        strictnessLevel: "strict"
      },
      {
        id: "taylor", name: "Taylor", detail: "Added-sugar goal",
        allergies: [], addedSugarGoal: 30
      },
      {
        id: "morgan", name: "Morgan", detail: "Sodium target",
        allergies: [], sodiumLimitPerServing: 400
      }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);

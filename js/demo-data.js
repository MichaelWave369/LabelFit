/* LabelFit v0.3 — demo data with field-level provenance */
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
      lastVerified: "2026-10-06",
      provenance: {
        sources: {
          "src.demo.front": {
            id: "src.demo.front",
            title: "Northfield demo package front",
            type: "package_observation",
            authority: "PRIMARY PRODUCT OBSERVATION",
            observedAt: "2026-10-06",
            note: "Fictional demo packaging used only to exercise provenance."
          },
          "src.demo.ingredients": {
            id: "src.demo.ingredients",
            title: "Northfield demo ingredient panel",
            type: "package_observation",
            authority: "PRIMARY PRODUCT OBSERVATION",
            observedAt: "2026-10-06",
            note: "Fictional ingredient and allergen panel."
          },
          "src.demo.nutrition": {
            id: "src.demo.nutrition",
            title: "Northfield demo nutrition panel",
            type: "package_observation",
            authority: "PRIMARY PRODUCT OBSERVATION",
            observedAt: "2026-10-06",
            note: "Fictional nutrition facts panel."
          }
        },
        fields: {
          "product": "src.demo.front",
          "ingredients": "src.demo.ingredients",
          "contains": "src.demo.ingredients",
          "mayContain": "src.demo.ingredients",
          "facts.added_sugar_g": "src.demo.nutrition",
          "facts.sodium_mg": "src.demo.nutrition",
          "completeness": "src.demo.front"
        }
      }
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

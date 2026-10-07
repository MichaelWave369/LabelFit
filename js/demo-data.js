/* LabelFit v0.3 — demo data with household catalog + provenance */
(function (root) {
  "use strict";
  var LF = root.LabelFit = root.LabelFit || {};

  function prov(prefix, title) {
    var ing = prefix + ".ingredients";
    var nut = prefix + ".nutrition";
    return {
      sources: {
        [ing]: {
          id: ing,
          title: title + " ingredient panel",
          type: "package_observation",
          authority: "PRIMARY PRODUCT OBSERVATION",
          observedAt: "2026-10-06",
          note: "Fictional demo label used to exercise LabelFit."
        },
        [nut]: {
          id: nut,
          title: title + " nutrition panel",
          type: "package_observation",
          authority: "PRIMARY PRODUCT OBSERVATION",
          observedAt: "2026-10-06",
          note: "Fictional demo nutrition panel."
        }
      },
      fields: {
        product: ing,
        ingredients: ing,
        contains: ing,
        mayContain: ing,
        "facts.added_sugar_g": nut,
        "facts.sodium_mg": nut,
        "attributes.dietary": ing,
        "attributes.intolerances": ing,
        "attributes.processingLevel": ing,
        completeness: ing
      }
    };
  }

  var products = [
    {
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
      attributes: {
        dietary: { vegan: false, vegetarian: true },
        intolerances: { lactose: false, gluten: false },
        processingLevel: "moderate"
      },
      incomplete: false,
      confidence: "HIGH",
      source: "Fictional demo package label",
      lastVerified: "2026-10-06",
      provenance: prov("src.oat-honey", "Northfield Oat & Honey")
    },
    {
      id: "orchard-oat-bars",
      brand: "Orchard Trail",
      name: "Apple Cinnamon Oat Bars",
      category: "snack-bar",
      ingredients: [
        { text: "Whole grain oats", groups: [] },
        { text: "Dried apple", groups: [] },
        { text: "Cinnamon", groups: [] }
      ],
      contains: { status: "declared", items: [] },
      mayContain: { status: "declared", items: [] },
      facts: { added_sugar_g: 4, sodium_mg: 85 },
      attributes: {
        dietary: { vegan: true, vegetarian: true },
        intolerances: { lactose: false, gluten: false },
        processingLevel: "minimal"
      },
      incomplete: false,
      confidence: "HIGH",
      source: "Fictional demo package label",
      lastVerified: "2026-10-06",
      provenance: prov("src.orchard", "Orchard Trail Apple Cinnamon")
    },
    {
      id: "berry-crunch-bars",
      brand: "Meadow Path",
      name: "Berry Crunch Breakfast Bars",
      category: "granola-bar",
      ingredients: [
        { text: "Whole grain oats", groups: [] },
        { text: "Dried berries", groups: [] }
      ],
      contains: { status: "declared", items: [] },
      mayContain: { status: "declared", items: [] },
      facts: { added_sugar_g: 8, sodium_mg: 95 },
      attributes: {
        dietary: { vegan: true, vegetarian: true },
        intolerances: { lactose: false, gluten: false },
        processingLevel: "moderate"
      },
      incomplete: false,
      confidence: "HIGH",
      source: "Fictional demo package label",
      lastVerified: "2026-10-06",
      provenance: prov("src.berry", "Meadow Path Berry Crunch")
    },
    {
      id: "plain-rice-cakes",
      brand: "River Bend",
      name: "Plain Brown Rice Cakes",
      category: "snack",
      ingredients: [{ text: "Brown rice", groups: [] }],
      contains: { status: "declared", items: [] },
      mayContain: { status: "declared", items: [] },
      facts: { added_sugar_g: 0, sodium_mg: 15 },
      attributes: {
        dietary: { vegan: true, vegetarian: true },
        intolerances: { lactose: false, gluten: false },
        processingLevel: "minimal"
      },
      incomplete: false,
      confidence: "HIGH",
      source: "Fictional demo package label",
      lastVerified: "2026-10-06",
      provenance: prov("src.rice-cakes", "River Bend Rice Cakes")
    },
    {
      id: "tomato-soup",
      brand: "Hearthside",
      name: "Tomato Basil Soup",
      category: "soup",
      ingredients: [
        { text: "Tomatoes", groups: [] },
        { text: "Basil", groups: [] }
      ],
      contains: { status: "declared", items: [] },
      mayContain: { status: "declared", items: [] },
      facts: { added_sugar_g: 2, sodium_mg: 280 },
      attributes: {
        dietary: { vegan: true, vegetarian: true },
        intolerances: { lactose: false, gluten: false },
        processingLevel: "minimal"
      },
      incomplete: false,
      confidence: "HIGH",
      source: "Fictional demo package label",
      lastVerified: "2026-10-06",
      provenance: prov("src.soup", "Hearthside Tomato Basil")
    }
  ];

  LF.demo = {
    product: products[0],
    catalog: products,
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
    ],
    household: {
      id: "demo-household",
      name: "Demo household",
      memberIds: ["jordan", "taylor", "morgan"]
    }
  };
})(typeof window !== "undefined" ? window : globalThis);

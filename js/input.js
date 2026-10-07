/* LabelFit v0.3 — raw input adapters */
(function (root) {
  "use strict";
  var LF = root.LabelFit = root.LabelFit || {};

  function fromIngredientText(text) {
    var raw = String(text || "").trim();
    var ingredients = LF.ingredients.parse(raw);
    return {
      id: "paste-" + Date.now(),
      brand: "Pasted label",
      name: "Custom ingredient list",
      category: "custom",
      ingredients: ingredients,
      contains: { status: "unknown", items: [] },
      mayContain: { status: "unknown", items: [] },
      facts: {},
      flags: [],
      incomplete: true,
      confidence: "LIMITED",
      source: "User-pasted ingredient text",
      lastVerified: null,
      inputSource: "paste",
      rawIngredientText: raw
    };
  }

  LF.input = { fromIngredientText: fromIngredientText };
})(typeof window !== "undefined" ? window : globalThis);

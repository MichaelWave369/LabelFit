/* LabelFit v0.3 — product normalization */
(function (root) {
  "use strict";
  var LF = root.LabelFit = root.LabelFit || {};

  function normalizeProduct(p) {
    p = p || {};
    return {
      id: p.id || "unknown",
      brand: p.brand || "",
      name: p.name || "Unknown product",
      category: p.category || "other",
      ingredients: p.ingredients || [],
      contains: p.contains || { status: "unknown", items: [] },
      mayContain: p.mayContain || p.may_contain || { status: "unknown", items: [] },
      facts: p.facts || {},
      flags: p.flags || [],
      incomplete: !!p.incomplete,
      confidence: p.confidence || (p.incomplete ? "LIMITED" : "HIGH"),
      source: p.source || "Demo catalog",
      lastVerified: p.lastVerified || null
    };
  }

  function ingredientGroups(product) {
    var groups = {};
    (product.ingredients || []).forEach(function (it) {
      (it.groups || []).forEach(function (g) {
        if (!groups[g]) groups[g] = [];
        groups[g].push(it.text || g);
      });
    });
    return groups;
  }

  LF.normalize = { product: normalizeProduct, ingredientGroups: ingredientGroups };
})(typeof window !== "undefined" ? window : globalThis);

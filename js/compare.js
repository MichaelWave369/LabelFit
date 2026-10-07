/* LabelFit v0.3 — category-aware Better Fit ranking */
(function (root) {
  "use strict";
  var LF = root.LabelFit = root.LabelFit || {};
  var RELATED = {
    "snack-bar": ["snack-bar", "granola-bar", "protein-bar"],
    "cereal": ["cereal", "breakfast"],
    "soup": ["soup", "broth"],
    "beverage": ["beverage", "milk-alternative"]
  };

  function householdBurden(product, profiles) {
    var h = LF.household.evaluate(product, profiles);
    var rank = { "GOOD FIT":0, "CAUTION":1, "CAN'T CONFIRM":2, "DOESN'T FIT":3 };
    var total = h.members.reduce(function (sum, m) { return sum + rank[m.result.verdict]; }, 0);
    var worst = h.members.reduce(function (n, m) { return Math.max(n, rank[m.result.verdict]); }, 0);
    return { household:h, total:total, worst:worst };
  }

  function relevance(source, candidate) {
    if (candidate.category === source.category) return 0;
    var related = RELATED[source.category] || [source.category];
    return related.indexOf(candidate.category) >= 0 ? 1 : 2;
  }

  function confidencePenalty(product) {
    return product.incomplete || product.confidence === "LIMITED" ? 1 : 0;
  }

  function betterFit(source, profiles, catalog, limit) {
    var baseline = householdBurden(source, profiles);
    return (catalog || [])
      .filter(function (p) { return p.id !== source.id; })
      .map(function (p) {
        var burden = householdBurden(p, profiles);
        return {
          product: p,
          household: burden.household,
          burden: burden.total,
          worst: burden.worst,
          relevance: relevance(source, p),
          confidencePenalty: confidencePenalty(p),
          improvement: baseline.total - burden.total
        };
      })
      .filter(function (x) {
        return x.improvement > 0 && x.worst <= baseline.worst;
      })
      .sort(function (a, b) {
        return a.relevance - b.relevance ||
          a.worst - b.worst ||
          a.burden - b.burden ||
          a.confidencePenalty - b.confidencePenalty ||
          a.product.name.localeCompare(b.product.name);
      })
      .slice(0, limit || 3)
      .map(function (x) {
        x.reason = x.relevance === 0
          ? "Same category with a better household fit."
          : x.relevance === 1
            ? "Related use with a better household fit."
            : "Broader catalog fallback with a better household fit.";
        return x;
      });
  }

  LF.compare = { betterFit: betterFit, householdBurden: householdBurden, relevance: relevance };
})(typeof window !== "undefined" ? window : globalThis);

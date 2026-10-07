/* LabelFit v0.4 — deterministic verdict orchestrator */
(function (root) {
  "use strict";
  var LF = root.LabelFit = root.LabelFit || {};
  var RANK = { "GOOD FIT": 0, "CAUTION": 1, "CAN'T CONFIRM": 2, "DOESN'T FIT": 3 };

  function evaluate(rawProduct, profile) {
    var product = LF.normalize.product(rawProduct);
    var groups = LF.normalize.ingredientGroups(product);
    var rules = LF.rules.run(product, profile || {}, groups);
    var verdict = "GOOD FIT";

    rules.forEach(function (r) {
      if (RANK[r.verdict] > RANK[verdict]) verdict = r.verdict;
    });

    var primary = rules.filter(function (r) { return r.verdict === verdict; })[0];
    return {
      verdict: verdict,
      primaryReason: primary ? primary.text : "No conflicts detected in the available product information.",
      rules: rules,
      trace: rules.map(function (r, i) {
        return {
          step: i + 1,
          moduleId: r.moduleId,
          ruleId: r.ruleId,
          verdict: r.verdict,
          fact: r.fact
        };
      }),
      confidence: product.confidence,
      coverage: LF.profiles.coverage(profile || {}, LF.rules.supportedProfileFields())
    };
  }

  LF.verdict = { evaluate: evaluate, RANK: RANK };
})(typeof window !== "undefined" ? window : globalThis);

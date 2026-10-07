/* LabelFit v0.3 — explanation layer, never verdict authority */
(function (root) {
  "use strict";
  var LF = root.LabelFit = root.LabelFit || {};

  function why(result, rawProduct, profile) {
    var product = LF.normalize.product(rawProduct);
    var top = (result.rules || []).filter(function (r) {
      return r.verdict === result.verdict;
    })[0];

    var chain = [
      { layer: "VERDICT", value: result.verdict, detail: result.primaryReason }
    ];
    if (top) {
      chain.push({ layer: "RULE", value: top.ruleId, detail: top.text });
      chain.push({ layer: "PRODUCT FACT", value: top.fact || "—", detail: top.kind });
    }
    chain.push({
      layer: "SOURCE",
      value: product.source,
      detail: product.lastVerified ? "Last verified " + product.lastVerified : "Demo source"
    });
    chain.push({
      layer: "UNCERTAINTY",
      value: result.confidence,
      detail: "Formulations change. Check the physical label."
    });
    return chain;
  }

  LF.explain = { why: why };
})(typeof window !== "undefined" ? window : globalThis);

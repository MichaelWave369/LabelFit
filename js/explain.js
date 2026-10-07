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
      var prov = LF.evidence.provenanceForRule(product, top);
      chain.push({ layer: "RULE", value: top.ruleId, detail: top.text });
      chain.push({ layer: "OBSERVED FACT", value: top.fact || "—", detail: prov.fieldPath });
      chain.push({
        layer: "SOURCE",
        value: prov.source.title,
        detail: prov.source.authority + (prov.source.observedAt ? " · " + prov.source.observedAt : "")
      });
      chain.push({
        layer: "DECISION BASIS",
        value: prov.basis.title,
        detail: prov.basis.strength + " · " + prov.basis.note
      });
    }

    chain.push({
      layer: "UNCERTAINTY",
      value: result.confidence,
      detail: "Formulations change. Check the physical label."
    });
    return chain;
  }

  LF.explain = { why: why };
})(typeof window !== "undefined" ? window : globalThis);

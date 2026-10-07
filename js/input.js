/* LabelFit v0.4 — provider observations → normalized product evidence */
(function (root) {
  "use strict";
  var LF = root.LabelFit = root.LabelFit || {};

  function sourceId(obs) {
    return "src.provider." + String(obs.providerId || "unknown").replace(/[^a-z0-9_.-]/gi, "_");
  }

  function observationToProduct(obs) {
    var fields = obs.fields || {};
    var sid = sourceId(obs);
    var ingredients = LF.ingredients.parse(fields.ingredients_text || "");
    var contains = Array.isArray(fields.contains)
      ? { status: "declared", items: fields.contains }
      : { status: fields.contains_status || "unknown", items: [] };
    var mayContain = Array.isArray(fields.may_contain)
      ? { status: "declared", items: fields.may_contain }
      : { status: fields.may_contain_status || "unknown", items: [] };

    var hasIngredients = !!fields.ingredients_text;
    var hasNutrition = !!fields.facts && Object.keys(fields.facts).length > 0;
    var hasAllergenDeclaration = contains.status !== "unknown" || mayContain.status !== "unknown";
    var incomplete = !(hasIngredients && hasNutrition && hasAllergenDeclaration);

    var provenanceFields = {
      product: sid,
      ingredients: sid,
      contains: sid,
      mayContain: sid,
      completeness: sid
    };
    Object.keys(fields.facts || {}).forEach(function (k) {
      provenanceFields["facts." + k] = sid;
    });
    if (fields.attributes) {
      provenanceFields["attributes.dietary"] = sid;
      provenanceFields["attributes.intolerances"] = sid;
      provenanceFields["attributes.processingLevel"] = sid;
    }

    var sources = {};
    sources[sid] = {
      id: sid,
      title: obs.providerId + " observation",
      type: obs.providerKind || "provider",
      authority: "EVIDENCE-ONLY PROVIDER",
      observedAt: null,
      note: obs.note || "Input provider observation."
    };

    return {
      id: (obs.providerKind || "input") + "-" + Date.now(),
      barcode: fields.barcode || null,
      brand: fields.brand || "",
      name: fields.name || "Captured product",
      category: fields.category || "custom",
      ingredients: ingredients,
      contains: contains,
      mayContain: mayContain,
      facts: fields.facts || {},
      flags: fields.flags || [],
      attributes: fields.attributes || {},
      incomplete: incomplete,
      confidence: obs.confidence || "LIMITED",
      source: obs.providerId + " observation",
      lastVerified: null,
      inputSource: obs.providerKind || "provider",
      rawObservation: obs,
      provenance: {
        sources: sources,
        fields: provenanceFields
      }
    };
  }

  function capture(providerId, payload) {
    var obs = LF.providers.capture(providerId, payload || {});
    return observationToProduct(obs);
  }

  function fromIngredientText(text) {
    return capture("paste.local.v1", { text: text });
  }

  LF.input = {
    capture: capture,
    observationToProduct: observationToProduct,
    fromIngredientText: fromIngredientText
  };
})(typeof window !== "undefined" ? window : globalThis);

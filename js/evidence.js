/* LabelFit v0.3 — provenance and rule-basis registry */
(function (root) {
  "use strict";
  var LF = root.LabelFit = root.LabelFit || {};

  var RULE_BASIS = {
    "allergy.contains": {
      id: "basis.allergy.contains.v1",
      title: "Declared-allergen conflict rule",
      type: "deterministic_policy",
      strength: "EXPLICIT PROFILE RULE",
      note: "A declared allergen matching a profile allergy is treated as a conflict."
    },
    "allergy.ingredient": {
      id: "basis.allergy.ingredient.v1",
      title: "Ingredient-allergen conflict rule",
      type: "deterministic_policy",
      strength: "EXPLICIT PROFILE RULE",
      note: "A normalized ingredient mapped to a profile allergen is treated as a conflict."
    },
    "allergy.may.strict": {
      id: "basis.allergy.may.strict.v1",
      title: "Strict precautionary-label rule",
      type: "deterministic_policy",
      strength: "PROFILE-CONFIGURED RULE",
      note: "Strict mode treats a matching precautionary may-contain statement as a conflict."
    },
    "allergy.may.standard": {
      id: "basis.allergy.may.standard.v1",
      title: "Standard precautionary-label rule",
      type: "deterministic_policy",
      strength: "PROFILE-CONFIGURED RULE",
      note: "Standard mode surfaces matching precautionary statements as caution."
    },
    "allergy.missing": {
      id: "basis.allergy.missing.v1",
      title: "Missing-allergen-data uncertainty rule",
      type: "uncertainty_policy",
      strength: "CONSERVATIVE UNCERTAINTY RULE",
      note: "Missing critical allergen information prevents a confirmed fit."
    },
    "sugar.high": {
      id: "basis.sugar.high.v1",
      title: "Added-sugar goal threshold",
      type: "profile_threshold",
      strength: "USER-CONFIGURED THRESHOLD",
      note: "Compares per-serving added sugar with the profile's configured daily goal."
    },
    "sugar.moderate": {
      id: "basis.sugar.moderate.v1",
      title: "Added-sugar caution threshold",
      type: "profile_threshold",
      strength: "USER-CONFIGURED THRESHOLD",
      note: "Surfaces a caution when one serving uses at least 20% of the configured daily goal."
    },
    "sugar.missing": {
      id: "basis.sugar.missing.v1",
      title: "Missing added-sugar uncertainty rule",
      type: "uncertainty_policy",
      strength: "CONSERVATIVE UNCERTAINTY RULE",
      note: "A sugar-goal profile cannot be fully evaluated when added-sugar data is missing."
    },
    "sodium.limit": {
      id: "basis.sodium.limit.v1",
      title: "Sodium per-serving limit",
      type: "profile_threshold",
      strength: "USER-CONFIGURED THRESHOLD",
      note: "Compares product sodium with the profile's configured per-serving limit."
    },
    "sodium.missing": {
      id: "basis.sodium.missing.v1",
      title: "Missing sodium uncertainty rule",
      type: "uncertainty_policy",
      strength: "CONSERVATIVE UNCERTAINTY RULE",
      note: "A sodium-limit profile cannot be fully evaluated when sodium data is missing."
    },
    "caffeine.limit": {
      id: "basis.caffeine.limit.v1",
      title: "Caffeine per-serving limit",
      type: "profile_threshold",
      strength: "USER-CONFIGURED THRESHOLD",
      note: "Compares product caffeine with the profile's configured per-serving limit."
    },
    "caffeine.near_limit": {
      id: "basis.caffeine.near_limit.v1",
      title: "Caffeine near-limit caution",
      type: "profile_threshold",
      strength: "USER-CONFIGURED THRESHOLD",
      note: "Surfaces a caution when caffeine reaches at least 75% of the configured per-serving limit."
    },
    "caffeine.missing": {
      id: "basis.caffeine.missing.v1",
      title: "Missing caffeine uncertainty rule",
      type: "uncertainty_policy",
      strength: "CONSERVATIVE UNCERTAINTY RULE",
      note: "A caffeine-limit profile cannot be fully evaluated when caffeine data is missing."
    },
    "avoid.flag": {
      id: "basis.avoid.flag.v1",
      title: "Profile avoid-list rule",
      type: "profile_preference",
      strength: "USER-CONFIGURED PREFERENCE",
      note: "A product flag matching the profile avoid list is treated as a conflict."
    },
    "product.incomplete": {
      id: "basis.product.incomplete.v1",
      title: "Incomplete-product uncertainty cap",
      type: "uncertainty_policy",
      strength: "CONSERVATIVE UNCERTAINTY RULE",
      note: "Incomplete critical product data cannot produce an unqualified GOOD FIT."
    }
  };

  function defaultSource(product) {
    return {
      id: "source.product.default",
      title: product.source || "Product data",
      type: product.inputSource === "paste" ? "user_input" : "product_record",
      authority: product.inputSource === "paste" ? "USER-PROVIDED" : "PRIMARY PRODUCT RECORD",
      observedAt: product.lastVerified || null,
      note: product.inputSource === "paste"
        ? "Text pasted by the user in this session."
        : "Product information supplied by the active catalog record."
    };
  }

  function sourceFor(product, path) {
    var prov = product.provenance || {};
    var sourceId = prov.fields && prov.fields[path];
    if (sourceId && prov.sources && prov.sources[sourceId]) return prov.sources[sourceId];
    return defaultSource(product);
  }

  function pathForRule(ruleId) {
    if (ruleId === "allergy.contains") return "contains";
    if (ruleId === "allergy.ingredient") return "ingredients";
    if (ruleId.indexOf("allergy.may.") === 0) return "mayContain";
    if (ruleId === "allergy.missing") return "contains";
    if (ruleId.indexOf("sugar.") === 0) return "facts.added_sugar_g";
    if (ruleId.indexOf("sodium.") === 0) return "facts.sodium_mg";
    if (ruleId.indexOf("caffeine.") === 0) return "facts.caffeine_mg";
    if (ruleId === "avoid.flag") return "flags";
    if (ruleId === "product.incomplete") return "completeness";
    return "product";
  }

  function provenanceForRule(product, rule) {
    var path = pathForRule(rule.ruleId);
    return {
      fieldPath: path,
      source: sourceFor(product, path),
      basis: RULE_BASIS[rule.ruleId] || {
        id: "basis.unknown",
        title: rule.ruleId,
        type: "unknown",
        strength: "UNCLASSIFIED",
        note: "No rule-basis record is registered."
      }
    };
  }

  function receipt(result, rawProduct, profile) {
    var product = LF.normalize.product(rawProduct);
    return {
      schema: "labelfit.decision-receipt.v1",
      engineVersion: "0.4",
      product: { id: product.id, name: product.name },
      profile: { id: profile.id || "unknown", name: profile.name || "Unknown" },
      verdict: result.verdict,
      confidence: result.confidence,
      coverage: result.coverage || { evaluated: [], notEvaluated: [], complete: true },
      rules: (result.rules || []).map(function (rule) {
        var prov = provenanceForRule(product, rule);
        return {
          moduleId: rule.moduleId || "legacy",
          ruleId: rule.ruleId,
          verdict: rule.verdict,
          fact: rule.fact,
          fieldPath: prov.fieldPath,
          sourceId: prov.source.id,
          basisId: prov.basis.id
        };
      })
    };
  }

  LF.evidence = {
    ruleBasis: RULE_BASIS,
    sourceFor: sourceFor,
    provenanceForRule: provenanceForRule,
    receipt: receipt
  };
})(typeof window !== "undefined" ? window : globalThis);

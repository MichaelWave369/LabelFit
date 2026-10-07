/* LabelFit v0.3 — deterministic verdict authority */
(function (root) {
  "use strict";
  var LF = root.LabelFit = root.LabelFit || {};
  var RANK = { "GOOD FIT": 0, "CAUTION": 1, "CAN'T CONFIRM": 2, "DOESN'T FIT": 3 };

  function add(rules, ruleId, verdict, text, fact, kind) {
    rules.push({
      ruleId: ruleId,
      verdict: verdict,
      text: text,
      fact: fact || "",
      kind: kind || "general"
    });
  }

  function evaluate(rawProduct, profile) {
    var product = LF.normalize.product(rawProduct);
    var groups = LF.normalize.ingredientGroups(product);
    var rules = [];
    var allergies = LF.profiles.allergyGroups(profile);
    var strict = LF.profiles.isStrict(profile);

    allergies.forEach(function (group) {
      var declared = (product.contains.items || []).filter(function (x) { return x.group === group; });
      var may = (product.mayContain.items || []).filter(function (x) { return x.group === group; });
      var ingredientHits = groups[group] || [];
      var severity = LF.profiles.allergySeverity(profile, group) || "moderate";

      if (declared.length) {
        add(rules, "allergy.contains", "DOESN'T FIT",
          "Declared allergen conflicts with this profile.",
          "Contains: " + declared.map(function (x) { return x.label || group; }).join(", "),
          "allergen");
      } else if (ingredientHits.length) {
        add(rules, "allergy.ingredient", "DOESN'T FIT",
          "Ingredient list contains " + ingredientHits.join(", ") + ".",
          "Detected " + group + " ingredient; severity=" + severity,
          "allergen");
      } else if (product.contains.status === "unknown") {
        add(rules, "allergy.missing", "CAN'T CONFIRM",
          "Allergen statement was not captured, so this profile cannot be confirmed.",
          "Allergen statement status: unknown",
          "missing");
      } else if (may.length && strict) {
        add(rules, "allergy.may.strict", "DOESN'T FIT",
          "A may-contain statement conflicts with strict allergy mode.",
          "May contain: " + may.map(function (x) { return x.label || group; }).join(", "),
          "allergen");
      } else if (may.length) {
        add(rules, "allergy.may.standard", "CAUTION",
          "The label has a may-contain statement for this profile.",
          "May contain: " + may.map(function (x) { return x.label || group; }).join(", "),
          "allergen");
      }
    });

    if (profile.addedSugarGoal != null) {
      var sugar = product.facts.added_sugar_g;
      if (sugar == null) {
        add(rules, "sugar.missing", "CAN'T CONFIRM",
          "Added-sugar data is missing.", "added_sugar_g missing", "missing");
      } else {
        var pct = Math.round((sugar / profile.addedSugarGoal) * 100);
        if (pct >= 50) add(rules, "sugar.high", "DOESN'T FIT",
          sugar + " g added sugar is " + pct + "% of this profile's daily goal.",
          sugar + " g / " + profile.addedSugarGoal + " g", "sugar");
        else if (pct >= 20) add(rules, "sugar.moderate", "CAUTION",
          sugar + " g added sugar is " + pct + "% of this profile's daily goal.",
          sugar + " g / " + profile.addedSugarGoal + " g", "sugar");
      }
    }

    if (profile.sodiumLimitPerServing != null) {
      var sodium = product.facts.sodium_mg;
      if (sodium == null) {
        add(rules, "sodium.missing", "CAN'T CONFIRM",
          "Sodium data is missing.", "sodium_mg missing", "missing");
      } else if (sodium > profile.sodiumLimitPerServing) {
        add(rules, "sodium.limit", "DOESN'T FIT",
          sodium + " mg sodium exceeds this profile's " + profile.sodiumLimitPerServing + " mg per-serving limit.",
          sodium + " mg sodium", "sodium");
      }
    }

    (profile.avoidFlags || []).forEach(function (flag) {
      if ((product.flags || []).indexOf(flag) >= 0) {
        add(rules, "avoid.flag", "DOESN'T FIT",
          "Product matches an avoid preference: " + flag.replace(/_/g, " ") + ".",
          "flag=" + flag, "avoid");
      }
    });

    var verdict = "GOOD FIT";
    rules.forEach(function (r) {
      if (RANK[r.verdict] > RANK[verdict]) verdict = r.verdict;
    });
    if (!rules.length && product.incomplete) {
      add(rules, "product.incomplete", "CAN'T CONFIRM",
        "Critical product information is incomplete.", "incomplete=true", "missing");
      verdict = "CAN'T CONFIRM";
    }

    var primary = rules.filter(function (r) { return r.verdict === verdict; })[0];
    return {
      verdict: verdict,
      primaryReason: primary ? primary.text : "No conflicts detected in the available product information.",
      rules: rules,
      trace: rules.map(function (r, i) {
        return { step: i + 1, ruleId: r.ruleId, verdict: r.verdict, fact: r.fact };
      }),
      confidence: product.confidence
    };
  }

  LF.verdict = { evaluate: evaluate, RANK: RANK };
})(typeof window !== "undefined" ? window : globalThis);

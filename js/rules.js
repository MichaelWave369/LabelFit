/* LabelFit v0.4 — modular deterministic rule registry */
(function (root) {
  "use strict";
  var LF = root.LabelFit = root.LabelFit || {};

  function event(moduleId, ruleId, verdict, text, fact, kind) {
    return {
      moduleId: moduleId,
      ruleId: ruleId,
      verdict: verdict,
      text: text,
      fact: fact || "",
      kind: kind || "general"
    };
  }

  function key(v) {
    return String(v || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  }

  var modules = [];

  function register(module) {
    if (!module || !module.id || typeof module.evaluate !== "function") {
      throw new Error("Invalid LabelFit rule module");
    }
    if (modules.some(function (m) { return m.id === module.id; })) {
      throw new Error("Duplicate LabelFit rule module: " + module.id);
    }
    modules.push(module);
  }

  register({
    id: "allergy.v1",
    profileFields: ["allergies", "strictnessLevel", "strict"],
    evaluate: function (ctx) {
      var out = [], product = ctx.product, groups = ctx.ingredientGroups, profile = ctx.profile;
      var allergies = LF.profiles.allergyGroups(profile);
      var strict = LF.profiles.isStrict(profile);

      allergies.forEach(function (group) {
        var declared = (product.contains.items || []).filter(function (x) { return x.group === group; });
        var may = (product.mayContain.items || []).filter(function (x) { return x.group === group; });
        var ingredientHits = groups[group] || [];
        var severity = LF.profiles.allergySeverity(profile, group) || "moderate";

        if (declared.length) {
          out.push(event("allergy.v1", "allergy.contains", "DOESN'T FIT",
            "Declared allergen conflicts with this profile.",
            "Contains: " + declared.map(function (x) { return x.label || group; }).join(", "), "allergen"));
        } else if (ingredientHits.length) {
          out.push(event("allergy.v1", "allergy.ingredient", "DOESN'T FIT",
            "Ingredient list contains " + ingredientHits.join(", ") + ".",
            "Detected " + group + " ingredient; severity=" + severity, "allergen"));
        } else if (may.length && strict) {
          out.push(event("allergy.v1", "allergy.may.strict", "DOESN'T FIT",
            "A may-contain statement conflicts with strict allergy mode.",
            "May contain: " + may.map(function (x) { return x.label || group; }).join(", "), "allergen"));
        } else if (may.length) {
          out.push(event("allergy.v1", "allergy.may.standard", "CAUTION",
            "The label has a may-contain statement for this profile.",
            "May contain: " + may.map(function (x) { return x.label || group; }).join(", "), "allergen"));
        } else if (product.contains.status === "unknown") {
          out.push(event("allergy.v1", "allergy.missing", "CAN'T CONFIRM",
            "Allergen statement was not captured, so this profile cannot be confirmed.",
            "Allergen statement status: unknown", "missing"));
        }
      });
      return out;
    }
  });

  register({
    id: "added-sugar.v1",
    profileFields: ["addedSugarGoal"],
    evaluate: function (ctx) {
      var goal = ctx.profile.addedSugarGoal;
      if (goal == null) return [];
      var sugar = ctx.product.facts.added_sugar_g;
      if (sugar == null) return [event("added-sugar.v1", "sugar.missing", "CAN'T CONFIRM",
        "Added-sugar data is missing.", "added_sugar_g missing", "missing")];
      var pct = Math.round((sugar / goal) * 100);
      if (pct >= 50) return [event("added-sugar.v1", "sugar.high", "DOESN'T FIT",
        sugar + " g added sugar is " + pct + "% of this profile's daily goal.",
        sugar + " g / " + goal + " g", "sugar")];
      if (pct >= 20) return [event("added-sugar.v1", "sugar.moderate", "CAUTION",
        sugar + " g added sugar is " + pct + "% of this profile's daily goal.",
        sugar + " g / " + goal + " g", "sugar")];
      return [];
    }
  });

  register({
    id: "sodium.v1",
    profileFields: ["sodiumLimitPerServing"],
    evaluate: function (ctx) {
      var limit = ctx.profile.sodiumLimitPerServing;
      if (limit == null) return [];
      var sodium = ctx.product.facts.sodium_mg;
      if (sodium == null) return [event("sodium.v1", "sodium.missing", "CAN'T CONFIRM",
        "Sodium data is missing.", "sodium_mg missing", "missing")];
      if (sodium > limit) return [event("sodium.v1", "sodium.limit", "DOESN'T FIT",
        sodium + " mg sodium exceeds this profile's " + limit + " mg per-serving limit.",
        sodium + " mg sodium", "sodium")];
      return [];
    }
  });

  register({
    id: "caffeine.v1",
    profileFields: ["caffeineLimitMg"],
    evaluate: function (ctx) {
      var limit = ctx.profile.caffeineLimitMg;
      if (limit == null) return [];
      var caffeine = ctx.product.facts.caffeine_mg;
      if (caffeine == null) return [event("caffeine.v1", "caffeine.missing", "CAN'T CONFIRM",
        "Caffeine data is missing.", "caffeine_mg missing", "missing")];
      if (caffeine > limit) return [event("caffeine.v1", "caffeine.limit", "DOESN'T FIT",
        caffeine + " mg caffeine exceeds this profile's " + limit + " mg per-serving limit.",
        caffeine + " mg caffeine", "caffeine")];
      if (caffeine >= limit * 0.75) return [event("caffeine.v1", "caffeine.near_limit", "CAUTION",
        caffeine + " mg caffeine is close to this profile's " + limit + " mg per-serving limit.",
        caffeine + " mg / " + limit + " mg", "caffeine")];
      return [];
    }
  });

  register({
    id: "dietary-restrictions.v1",
    profileFields: ["dietaryRestrictions"],
    supportedValues: { dietaryRestrictions: ["vegan", "vegetarian"] },
    evaluate: function (ctx) {
      var out = [], dietary = (ctx.product.attributes && ctx.product.attributes.dietary) || {};
      (ctx.profile.dietaryRestrictions || []).forEach(function (raw) {
        var restriction = key(raw);
        if (restriction !== "vegan" && restriction !== "vegetarian") return;
        var value = dietary[restriction];
        if (value === false) {
          out.push(event("dietary-restrictions.v1", "dietary.conflict", "DOESN'T FIT",
            "Product does not meet this profile's " + restriction + " restriction.",
            restriction + "=false", "dietary"));
        } else if (value == null) {
          out.push(event("dietary-restrictions.v1", "dietary.unknown", "CAN'T CONFIRM",
            "The product's " + restriction + " status is not confirmed.",
            restriction + "=unknown", "missing"));
        }
      });
      return out;
    }
  });

  register({
    id: "intolerances.v1",
    profileFields: ["intolerances"],
    supportedValues: { intolerances: ["lactose", "gluten"] },
    evaluate: function (ctx) {
      var out = [], data = (ctx.product.attributes && ctx.product.attributes.intolerances) || {};
      (ctx.profile.intolerances || []).forEach(function (raw) {
        var intolerance = key(raw);
        if (intolerance !== "lactose" && intolerance !== "gluten") return;
        var value = data[intolerance];
        if (value === true) {
          out.push(event("intolerances.v1", "intolerance.present", "DOESN'T FIT",
            "Product is marked as containing " + intolerance + ".",
            intolerance + "=present", "intolerance"));
        } else if (value == null) {
          out.push(event("intolerances.v1", "intolerance.unknown", "CAN'T CONFIRM",
            "The product's " + intolerance + " status is not confirmed.",
            intolerance + "=unknown", "missing"));
        }
      });
      return out;
    }
  });

  register({
    id: "ingredient-avoid.v1",
    profileFields: ["ingredientAvoids"],
    evaluate: function (ctx) {
      var out = [];
      (ctx.profile.ingredientAvoids || []).forEach(function (raw) {
        var needle = key(raw);
        var hits = (ctx.product.ingredients || []).filter(function (ingredient) {
          return key(ingredient.text).indexOf(needle) >= 0;
        });
        if (needle && hits.length) {
          out.push(event("ingredient-avoid.v1", "ingredient.avoid", "DOESN'T FIT",
            "Ingredient list matches an ingredient this profile avoids.",
            "Avoid " + raw + "; found " + hits.map(function (x) { return x.text; }).join(", "), "avoid"));
        }
      });
      return out;
    }
  });

  register({
    id: "processing-preference.v1",
    profileFields: ["processingPreferences"],
    supportedValues: { processingPreferences: ["minimal"] },
    evaluate: function (ctx) {
      var prefs = (ctx.profile.processingPreferences || []).map(key);
      if (prefs.indexOf("minimal") < 0) return [];
      var level = ctx.product.attributes && ctx.product.attributes.processingLevel;
      if (level == null) return [event("processing-preference.v1", "processing.unknown", "CAN'T CONFIRM",
        "Processing level is not confirmed for this product.",
        "processingLevel=unknown", "missing")];
      if (level === "high") return [event("processing-preference.v1", "processing.high", "CAUTION",
        "Product is marked as highly processed while this profile prefers minimal processing.",
        "processingLevel=high", "processing")];
      return [];
    }
  });

  register({
    id: "avoid-flags.v1",
    profileFields: ["avoidFlags"],
    evaluate: function (ctx) {
      var out = [];
      (ctx.profile.avoidFlags || []).forEach(function (flag) {
        if ((ctx.product.flags || []).indexOf(flag) >= 0) {
          out.push(event("avoid-flags.v1", "avoid.flag", "DOESN'T FIT",
            "Product matches an avoid preference: " + flag.replace(/_/g, " ") + ".",
            "flag=" + flag, "avoid"));
        }
      });
      return out;
    }
  });

  register({
    id: "completeness.v1",
    profileFields: [],
    evaluate: function (ctx) {
      if (!ctx.product.incomplete || ctx.events.length) return [];
      return [event("completeness.v1", "product.incomplete", "CAN'T CONFIRM",
        "Critical product information is incomplete.", "incomplete=true", "missing")];
    }
  });

  function run(product, profile, ingredientGroups) {
    var ctx = {
      product: product,
      profile: profile || {},
      ingredientGroups: ingredientGroups || {},
      events: []
    };
    modules.forEach(function (module) {
      var produced = module.evaluate(ctx) || [];
      produced.forEach(function (e) { ctx.events.push(e); });
    });
    return ctx.events;
  }

  function supportedProfileFields() {
    var fields = [];
    modules.forEach(function (m) {
      (m.profileFields || []).forEach(function (f) {
        if (fields.indexOf(f) < 0) fields.push(f);
      });
    });
    return fields.sort();
  }

  function supportedProfileValues() {
    var values = {};
    modules.forEach(function (m) {
      Object.keys(m.supportedValues || {}).forEach(function (field) {
        values[field] = values[field] || [];
        m.supportedValues[field].forEach(function (value) {
          if (values[field].indexOf(value) < 0) values[field].push(value);
        });
      });
    });
    Object.keys(values).forEach(function (field) { values[field].sort(); });
    return values;
  }

  LF.rules = {
    register: register,
    run: run,
    list: function () { return modules.slice(); },
    supportedProfileFields: supportedProfileFields,
    supportedProfileValues: supportedProfileValues
  };
})(typeof window !== "undefined" ? window : globalThis);

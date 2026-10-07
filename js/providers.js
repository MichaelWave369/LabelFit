/* LabelFit v0.4 — evidence-only input provider registry */
(function (root) {
  "use strict";
  var LF = root.LabelFit = root.LabelFit || {};
  var registry = {};
  var FORBIDDEN = ["verdict", "decision", "rules", "fit", "recommendation"];

  function assertObservation(obs, provider) {
    if (!obs || typeof obs !== "object") throw new Error("Provider returned no observation");
    FORBIDDEN.forEach(function (field) {
      if (Object.prototype.hasOwnProperty.call(obs, field)) {
        throw new Error("Input provider may not assert decision field: " + field);
      }
      if (obs.fields && Object.prototype.hasOwnProperty.call(obs.fields, field)) {
        throw new Error("Input provider fields may not assert decision field: " + field);
      }
    });
    if (!obs.schema) obs.schema = "labelfit.observation.v1";
    if (obs.schema !== "labelfit.observation.v1") throw new Error("Unsupported observation schema");
    obs.providerId = provider.id;
    obs.providerKind = provider.kind;
    obs.authority = "EVIDENCE_ONLY";
    obs.confidence = obs.confidence || "LIMITED";
    obs.fields = obs.fields || {};
    obs.raw = obs.raw || {};
    return obs;
  }

  function register(provider) {
    if (!provider || !provider.id || !provider.kind || typeof provider.observe !== "function") {
      throw new Error("Invalid LabelFit input provider");
    }
    if (registry[provider.id]) throw new Error("Duplicate input provider: " + provider.id);
    registry[provider.id] = provider;
  }

  function capture(id, payload) {
    var provider = registry[id];
    if (!provider) throw new Error("Unknown input provider: " + id);
    return assertObservation(provider.observe(payload || {}), provider);
  }

  function list() {
    return Object.keys(registry).sort().map(function (id) {
      var p = registry[id];
      return {
        id: p.id,
        kind: p.kind,
        title: p.title || p.id,
        authority: "EVIDENCE_ONLY",
        simulated: !!p.simulated
      };
    });
  }

  register({
    id: "paste.local.v1",
    kind: "paste",
    title: "Local ingredient paste",
    simulated: false,
    observe: function (payload) {
      var text = String(payload.text || "").trim();
      return {
        confidence: text ? "LIMITED" : "LOW",
        fields: { ingredients_text: text },
        raw: { text: text },
        note: "User-pasted ingredient text captured locally."
      };
    }
  });

  register({
    id: "barcode.demo.v1",
    kind: "barcode",
    title: "Demo barcode lookup",
    simulated: true,
    observe: function (payload) {
      var code = String(payload.code || "");
      if (code !== "000000000401") {
        return {
          confidence: "LOW",
          fields: { barcode: code },
          raw: { barcode: code },
          note: "No demo catalog record matched this barcode."
        };
      }
      return {
        confidence: "HIGH",
        fields: {
          barcode: code,
          brand: "Signal Trail",
          name: "Peanut Oat Energy Bar",
          category: "snack-bar",
          ingredients_text: "Oats, peanut butter, dates, soy lecithin, salt",
          contains: [{ group: "peanut", label: "Peanuts" }, { group: "soy", label: "Soy" }],
          may_contain: [],
          facts: { added_sugar_g: 3, sodium_mg: 90, caffeine_mg: 0 },
          attributes: {
            dietary: { vegan: true, vegetarian: true },
            intolerances: { lactose: false, gluten: false },
            processingLevel: "moderate"
          }
        },
        raw: { barcode: code },
        note: "Fictional barcode record for provider-boundary testing."
      };
    }
  });

  register({
    id: "ocr.demo.v1",
    kind: "ocr",
    title: "Demo label OCR",
    simulated: true,
    observe: function (payload) {
      var text = String(payload.text || "").trim();
      return {
        confidence: text ? "LIMITED" : "LOW",
        fields: {
          name: "OCR-captured product",
          ingredients_text: text,
          contains_status: "unknown",
          may_contain_status: "unknown"
        },
        raw: { recognized_text: text },
        note: "Simulated OCR observation. Recognition output is evidence, never a verdict."
      };
    }
  });

  LF.providers = {
    register: register,
    capture: capture,
    list: list,
    forbiddenDecisionFields: FORBIDDEN.slice()
  };
})(typeof window !== "undefined" ? window : globalThis);

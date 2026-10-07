/* LabelFit v0.4 — profile helpers + evaluation coverage */
(function (root) {
  "use strict";
  var LF = root.LabelFit = root.LabelFit || {};

  function allergyGroups(profile) {
    return (profile.allergies || []).map(function (a) {
      return typeof a === "string" ? a : a.allergen;
    });
  }

  function allergySeverity(profile, group) {
    var hit = (profile.allergies || []).find(function (a) {
      return (typeof a === "string" ? a : a.allergen) === group;
    });
    return hit ? (typeof hit === "string" ? "moderate" : (hit.severity || "moderate")) : null;
  }

  function isStrict(profile) {
    return profile.strictnessLevel === "strict" || profile.strict === true;
  }

  var META_FIELDS = ["id", "name", "detail", "age", "group", "notes"];

  function isConfigured(value) {
    if (value == null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return value !== "";
  }

  function coverage(profile, supportedFields) {
    var supported = {};
    (supportedFields || []).forEach(function (f) { supported[f] = true; });
    var evaluated = [], notEvaluated = [];

    Object.keys(profile || {}).forEach(function (field) {
      if (META_FIELDS.indexOf(field) >= 0 || !isConfigured(profile[field])) return;
      if (supported[field]) evaluated.push(field);
      else notEvaluated.push(field);
    });

    return {
      evaluated: evaluated.sort(),
      notEvaluated: notEvaluated.sort(),
      complete: notEvaluated.length === 0
    };
  }

  LF.profiles = {
    allergyGroups: allergyGroups,
    allergySeverity: allergySeverity,
    isStrict: isStrict,
    coverage: coverage
  };
})(typeof window !== "undefined" ? window : globalThis);

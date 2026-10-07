/* LabelFit v0.3 — profile helpers */
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

  LF.profiles = {
    allergyGroups: allergyGroups,
    allergySeverity: allergySeverity,
    isStrict: isStrict
  };
})(typeof window !== "undefined" ? window : globalThis);

/* LabelFit v0.3 — household aggregation */
(function (root) {
  "use strict";
  var LF = root.LabelFit = root.LabelFit || {};

  function evaluate(product, profiles) {
    var members = (profiles || []).map(function (profile) {
      return {
        profile: profile,
        result: LF.verdict.evaluate(product, profile)
      };
    });

    var hasNo = members.some(function (m) { return m.result.verdict === "DOESN'T FIT"; });
    var hasReview = members.some(function (m) {
      return m.result.verdict === "CAUTION" || m.result.verdict === "CAN'T CONFIRM";
    });
    var status = hasNo ? "NOT FOR EVERYONE" : (hasReview ? "NEEDS CHECK" : "FITS EVERYONE");

    return {
      status: status,
      members: members,
      counts: members.reduce(function (acc, m) {
        acc[m.result.verdict] = (acc[m.result.verdict] || 0) + 1;
        return acc;
      }, {})
    };
  }

  LF.household = { evaluate: evaluate };
})(typeof window !== "undefined" ? window : globalThis);

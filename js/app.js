/* LabelFit v0.3 — interactive deterministic demo */
(function (root) {
  "use strict";
  var LF = root.LabelFit;
  if (!LF || !LF.demo) return;

  var select = document.getElementById("profile-select");
  var panel = document.getElementById("computed-result");
  var why = document.getElementById("why-chain");
  if (!select || !panel || !why) return;

  LF.demo.profiles.forEach(function (p) {
    var option = document.createElement("option");
    option.value = p.id;
    option.textContent = p.name + " — " + p.detail;
    select.appendChild(option);
  });

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c];
    });
  }

  function render() {
    var profile = LF.demo.profiles.filter(function (p) { return p.id === select.value; })[0] || LF.demo.profiles[0];
    var result = LF.verdict.evaluate(LF.demo.product, profile);
    var klass = result.verdict === "DOESN'T FIT" ? "danger" :
      result.verdict === "GOOD FIT" ? "good" : "caution";

    panel.className = "result computed " + klass;
    panel.innerHTML =
      '<span class="avatar">' + esc(profile.name.charAt(0)) + '</span>' +
      '<div><strong>' + esc(profile.name) + '</strong><small>' + esc(result.primaryReason) + '</small></div>' +
      '<b>' + esc(result.verdict) + '</b>';

    why.innerHTML = LF.explain.why(result, LF.demo.product, profile).map(function (step) {
      return '<li><span>' + esc(step.layer) + '</span><strong>' + esc(step.value) +
        '</strong><small>' + esc(step.detail) + '</small></li>';
    }).join("");
  }

  select.addEventListener("change", render);
  select.value = LF.demo.profiles[0].id;
  render();
})(typeof window !== "undefined" ? window : globalThis);

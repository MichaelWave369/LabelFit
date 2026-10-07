/* LabelFit v0.3 — interactive deterministic demo + paste lab */
(function (root) {
  "use strict";
  var LF = root.LabelFit;
  if (!LF || !LF.demo) return;

  var select = document.getElementById("profile-select");
  var panel = document.getElementById("computed-result");
  var why = document.getElementById("why-chain");
  var coverage = document.getElementById("profile-coverage");
  var receipt = document.getElementById("decision-receipt");
  var paste = document.getElementById("ingredient-paste");
  var pasteButton = document.getElementById("check-paste");
  var pasteResult = document.getElementById("paste-result");
  var parsed = document.getElementById("parsed-ingredients");
  var householdStatus = document.getElementById("household-status");
  var householdMembers = document.getElementById("household-members");
  var betterFitResults = document.getElementById("better-fit-results");
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

  function profile() {
    return LF.demo.profiles.filter(function (p) { return p.id === select.value; })[0] || LF.demo.profiles[0];
  }

  function klass(verdict) {
    return verdict === "DOESN'T FIT" ? "danger" : verdict === "GOOD FIT" ? "good" : "caution";
  }

  function render() {
    var p = profile();
    var result = LF.verdict.evaluate(LF.demo.product, p);
    panel.className = "result computed " + klass(result.verdict);
    panel.innerHTML =
      '<span class="avatar">' + esc(p.name.charAt(0)) + '</span>' +
      '<div><strong>' + esc(p.name) + '</strong><small>' + esc(result.primaryReason) + '</small></div>' +
      '<b>' + esc(result.verdict) + '</b>';

    why.innerHTML = LF.explain.why(result, LF.demo.product, p).map(function (step) {
      return '<li><span>' + esc(step.layer) + '</span><strong>' + esc(step.value) +
        '</strong><small>' + esc(step.detail) + '</small></li>';
    }).join("");
    if (coverage) {
      coverage.className = "coverage " + (result.coverage.complete ? "coverage-ok" : "coverage-warn");
      coverage.innerHTML = result.coverage.complete
        ? '<strong>Profile coverage: complete</strong><span>All configured settings shown here are evaluated.</span>'
        : '<strong>Profile coverage: incomplete</strong><span>Not evaluated: ' +
          result.coverage.notEvaluated.map(esc).join(", ") + '</span>';
    }
    if (receipt) {
      receipt.textContent = JSON.stringify(LF.evidence.receipt(result, LF.demo.product, p), null, 2);
    }
  }

  function renderHousehold() {
    if (!householdStatus || !householdMembers || !betterFitResults || !LF.household || !LF.compare) return;
    var h = LF.household.evaluate(LF.demo.product, LF.demo.profiles);
    householdStatus.textContent = h.status;
    householdStatus.className = h.status === "FITS EVERYONE" ? "good-text" :
      h.status === "NOT FOR EVERYONE" ? "danger-text" : "caution-text";

    householdMembers.innerHTML = h.members.map(function (m) {
      return '<div class="member-row ' + klass(m.result.verdict) + '">' +
        '<span class="avatar">' + esc(m.profile.name.charAt(0)) + '</span>' +
        '<div><strong>' + esc(m.profile.name) + '</strong><small>' + esc(m.result.primaryReason) + '</small></div>' +
        '<b>' + esc(m.result.verdict) + '</b></div>';
    }).join("");

    var recs = LF.compare.betterFit(LF.demo.product, LF.demo.profiles, LF.demo.catalog, 2);
    betterFitResults.innerHTML = recs.map(function (r, i) {
      return '<article class="better-card">' +
        '<span class="rank">#' + (i + 1) + '</span>' +
        '<div><strong>' + esc(r.product.name) + '</strong><small>' + esc(r.reason) +
        ' Household: ' + esc(r.household.status) + '.</small></div>' +
        '<b>' + esc(r.household.status) + '</b></article>';
    }).join("");
  }

  function renderPaste() {
    if (!paste || !pasteResult || !parsed) return;
    var p = profile();
    var product = LF.input.fromIngredientText(paste.value);
    var result = LF.verdict.evaluate(product, p);
    pasteResult.className = "paste-verdict " + klass(result.verdict);
    pasteResult.innerHTML =
      '<strong>' + esc(result.verdict) + ' for ' + esc(p.name) + '</strong>' +
      '<span>' + esc(result.primaryReason) + '</span>';
    parsed.innerHTML = product.ingredients.map(function (it) {
      var groups = it.groups.length ? " · " + it.groups.join(", ") : "";
      return '<span class="token">' + esc(it.text) + '<small>' + esc(groups) + '</small></span>';
    }).join("");
  }

  select.addEventListener("change", function () {
    render();
    if (pasteResult && pasteResult.innerHTML) renderPaste();
  });
  if (pasteButton) pasteButton.addEventListener("click", renderPaste);

  select.value = LF.demo.profiles[0].id;
  render();
  renderHousehold();
})(typeof window !== "undefined" ? window : globalThis);

/* LabelFit v0.3 — runtime ingredient matcher + paste parser */
(function (root) {
  "use strict";
  var LF = root.LabelFit = root.LabelFit || {};

  var PLANT = ["almond","cashew","peanut","oat","rice","soy","soya","coconut","pea","hemp","flax","hazelnut","pistachio","macadamia","walnut","plant","vegan","dairy free","non dairy","nondairy","cocoa","cacao"];
  var GROUPS = {
    peanut: ["peanut","peanuts","groundnut"],
    tree_nut: ["almond","almonds","cashew","cashews","walnut","walnuts","hazelnut","hazelnuts","pistachio","pistachios","macadamia","pecan","pecans","brazil nut","brazil nuts"],
    soy: ["soy","soya"],
    wheat: ["wheat"],
    egg: ["egg","eggs","albumen"],
    sesame: ["sesame","tahini"],
    fish: ["anchovy","anchovies","salmon","tuna","cod"],
    crustacean_shellfish: ["shrimp","prawn","prawns","crab","lobster"],
    milk: ["milk","butter","cream","cheese","yogurt","yoghurt","whey","casein","caseinate"]
  };

  function norm(s) {
    return String(s || "").toLowerCase()
      .replace(/\u2019/g, "'")
      .replace(/colour/g, "color")
      .replace(/flavour/g, "flavor")
      .replace(/[-_/]+/g, " ")
      .replace(/[^a-z0-9&'().\s]/g, " ")
      .replace(/\s+/g, " ").trim();
  }

  function hasTerm(text, term) {
    return (" " + text + " ").indexOf(" " + term + " ") >= 0;
  }

  function dairyGuard(text, term) {
    if (text.indexOf("cream of tartar") >= 0) return "plant-based look-alike, not dairy";
    if (text.indexOf("dairy free") >= 0 || text.indexOf("non dairy") >= 0 || text.indexOf("nondairy") >= 0) return "plant-based look-alike, not dairy";
    if (term === "butter" && (text.indexOf("cocoa butter") >= 0 || text.indexOf("cacao butter") >= 0 || text.indexOf("peanut butter") >= 0)) return "plant-based look-alike, not dairy";
    for (var i = 0; i < PLANT.length; i++) {
      var p = PLANT[i];
      if (text.indexOf(p + " " + term) >= 0) return "plant-based look-alike, not dairy";
    }
    return null;
  }

  function unique(xs) {
    var seen = {};
    return xs.filter(function (x) { if (seen[x]) return false; seen[x] = true; return true; });
  }

  function matchIngredient(raw) {
    var text = norm(raw);
    var groups = [], notes = [], ids = [], how = [];

    Object.keys(GROUPS).forEach(function (group) {
      GROUPS[group].forEach(function (term) {
        if (!hasTerm(text, term)) return;
        if (group === "milk") {
          var why = dairyGuard(text, term);
          if (why) { notes.push(why); return; }
        }
        groups.push(group);
        ids.push(term.replace(/\s+/g, "_"));
        how.push(term);
      });
    });

    if (text.indexOf("coconut") >= 0) notes.push("coconut isn't flagged as a tree nut (allergist decision pending)");
    if (text.indexOf("oyster mushroom") >= 0) notes.push("oyster mushroom is a mushroom");
    if (text.indexOf("rice malt") >= 0) notes.push("rice malt is made from rice");

    var primary = null;
    if (text === "oat milk" || text.indexOf("oats") >= 0) primary = "oats";
    else if (text.indexOf("soy lecithin") >= 0) primary = "lecithins";
    else if (text.indexOf("wheat maltodextrin") >= 0) primary = "maltodextrin";
    else if (text.indexOf("cocoa butter") >= 0) primary = "cocoa_butter";
    else if (text.indexOf("cream of tartar") >= 0) primary = "baking_powder";
    else if (ids.length) primary = ids[0];

    return {
      text: String(raw || "").trim(),
      normalized: text,
      groups: unique(groups).sort(),
      ids: unique(ids).sort(),
      primary: primary,
      notes: unique(notes),
      how: how.length ? "contains:" + how[0] : null
    };
  }

  function splitTop(text) {
    var out = [], cur = "", depth = 0;
    String(text || "").split("").forEach(function (ch) {
      if (ch === "(" || ch === "[") depth += 1;
      if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
      if ((ch === "," || ch === ";") && depth === 0) { if (cur.trim()) out.push(cur.trim()); cur = ""; }
      else cur += ch;
    });
    if (cur.trim()) out.push(cur.trim());
    return out;
  }

  function parseIngredientList(text) {
    return splitTop(String(text || "").replace(/^ingredients\s*:\s*/i, "")).map(function (part) {
      var outer = part.match(/^(.*?)\s*\((.*)\)\s*$/);
      var head = outer ? outer[1].trim() : part.trim();
      var base = matchIngredient(head);
      var children = outer ? splitTop(outer[2]).map(matchIngredient) : [];
      var childGroups = [];
      children.forEach(function (c) { childGroups = childGroups.concat(c.groups); });
      return {
        text: head,
        groups: unique(base.groups.concat(childGroups)).sort(),
        ids: unique(base.ids.concat([].concat.apply([], children.map(function (c) { return c.ids; })))).sort(),
        primary: base.primary,
        notes: unique(base.notes.concat([].concat.apply([], children.map(function (c) { return c.notes; })))),
        how: base.how,
        children: children
      };
    }).filter(function (x) { return x.text; });
  }

  LF.ingredients = { normalize: norm, match: matchIngredient, parse: parseIngredientList, splitTop: splitTop };
})(typeof window !== "undefined" ? window : globalThis);

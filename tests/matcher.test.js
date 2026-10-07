const assert = require("assert");

global.LabelFit = {};
require("../js/ingredient-matcher.js");
require("../js/providers.js");
require("../js/input.js");
require("../js/normalize.js");
require("../js/profiles.js");
require("../js/rules.js");
require("../js/verdict.js");

const LF = global.LabelFit;

const cases = [
  ["rice milk", { milk:false }],
  ["soy yogurt", { milk:false, soy:true }],
  ["almond flavoring", { tree_nut:true }],
  ["coconut milk", { tree_nut:false, milk:false }],
  ["oat milk", { milk:false }],
  ["peanut butter", { peanut:true, milk:false }],
  ["cocoa butter", { milk:false }],
  ["butter flavor", { milk:true }],
  ["nonfat yogurt powder", { milk:true }],
  ["wheat maltodextrin", { wheat:true }],
  ["yogurt-flavored coating", { milk:true }],
  ["dairy-free cheese", { milk:false }],
  ["soy lecithin", { soy:true }],
  ["cream of tartar", { milk:false }],
  ["rice milk powder", { milk:false }],
  ["coconut cream", { tree_nut:false, milk:false }]
];

for (const [phrase, expected] of cases) {
  const hit = LF.ingredients.match(phrase);
  for (const [group, want] of Object.entries(expected)) {
    assert.equal(hit.groups.includes(group), want, phrase + " expected " + group + "=" + want);
  }
}

const parsed = LF.ingredients.parse("Oats, sugar, peanut butter, soy lecithin, salt");
assert.equal(parsed.length, 5);
assert(parsed[2].groups.includes("peanut"));
assert(parsed[3].groups.includes("soy"));

const nested = LF.ingredients.parse("Chocolate coating (sugar, cocoa butter, soy lecithin), oats");
assert.equal(nested.length, 2);
assert(nested[0].groups.includes("soy"));
assert(!nested[0].groups.includes("milk"));

const jordan = {
  id:"jordan", name:"Jordan",
  allergies:[{allergen:"peanut", severity:"severe"}],
  strictnessLevel:"strict"
};
const pasted = LF.input.fromIngredientText("Oats, sugar, peanut butter, soy lecithin, salt");
const result = LF.verdict.evaluate(pasted, jordan);
assert.equal(result.verdict, "DOESN'T FIT");
assert(result.rules.some(r => r.ruleId === "allergy.ingredient"));

const ricePaste = LF.input.fromIngredientText("rice milk, oats, cinnamon");
const riceResult = LF.verdict.evaluate(ricePaste, {
  id:"alex", name:"Alex",
  allergies:[{allergen:"milk", severity:"moderate"}]
});
assert.notEqual(riceResult.verdict, "DOESN'T FIT");

console.log("LabelFit runtime matcher: 16/16 edge cases PASS");
console.log("LabelFit pasted ingredient verdict path: PASS");

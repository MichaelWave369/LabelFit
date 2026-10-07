const assert = require("assert");

global.LabelFit = {};
require("../js/ingredient-matcher.js");
require("../js/providers.js");
require("../js/input.js");
require("../js/normalize.js");
require("../js/profiles.js");
require("../js/rules.js");
require("../js/verdict.js");
require("../js/evidence.js");
require("../js/explain.js");
require("../js/demo-data.js");

const LF = global.LabelFit;
const product = LF.demo.product;
const jordan = LF.demo.profiles.find(p => p.id === "jordan");
const taylor = LF.demo.profiles.find(p => p.id === "taylor");

const j = LF.verdict.evaluate(product, jordan);
const jTop = j.rules.find(r => r.verdict === j.verdict);
const jProv = LF.evidence.provenanceForRule(LF.normalize.product(product), jTop);

assert.equal(jTop.ruleId, "allergy.may.strict");
assert.equal(jProv.fieldPath, "mayContain");
assert.equal(jProv.source.id, "src.oat-honey.ingredients");
assert.equal(jProv.source.authority, "PRIMARY PRODUCT OBSERVATION");
assert.equal(jProv.basis.id, "basis.allergy.may.strict.v1");
assert.equal(jProv.basis.strength, "PROFILE-CONFIGURED RULE");

const t = LF.verdict.evaluate(product, taylor);
const tTop = t.rules.find(r => r.verdict === t.verdict);
const tProv = LF.evidence.provenanceForRule(LF.normalize.product(product), tTop);
assert.equal(tTop.ruleId, "sugar.moderate");
assert.equal(tProv.fieldPath, "facts.added_sugar_g");
assert.equal(tProv.source.id, "src.oat-honey.nutrition");

const receipt = LF.evidence.receipt(j, product, jordan);
assert.equal(receipt.schema, "labelfit.decision-receipt.v1");
assert.equal(receipt.verdict, "DOESN'T FIT");
assert.equal(receipt.profile.id, "jordan");
assert(receipt.rules.some(r => r.sourceId === "src.oat-honey.ingredients"));
assert(receipt.rules.some(r => r.basisId === "basis.allergy.may.strict.v1"));

const pasted = LF.input.fromIngredientText("Oats, peanut butter, salt");
const pastedResult = LF.verdict.evaluate(pasted, jordan);
const pastedReceipt = LF.evidence.receipt(pastedResult, pasted, jordan);
assert.equal(pastedResult.verdict, "DOESN'T FIT");
assert(pastedReceipt.rules.some(r => r.sourceId === "src.provider.paste.local.v1"));
assert(pastedReceipt.rules.some(r => r.basisId === "basis.allergy.ingredient.v1"));

const why = LF.explain.why(j, product, jordan);
assert(why.some(x => x.layer === "SOURCE" && x.value === "Northfield Oat & Honey ingredient panel"));
assert(why.some(x => x.layer === "DECISION BASIS" && x.value === "Strict precautionary-label rule"));

console.log("LabelFit provenance links: PASS");
console.log("LabelFit decision receipt v1: PASS");

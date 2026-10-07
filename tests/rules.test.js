const assert = require("assert");

global.LabelFit = {};
require("../js/normalize.js");
require("../js/profiles.js");
require("../js/rules.js");
require("../js/verdict.js");

const LF = global.LabelFit;

const moduleIds = LF.rules.list().map(m => m.id);
assert.deepStrictEqual(moduleIds, [
  "allergy.v1",
  "added-sugar.v1",
  "sodium.v1",
  "caffeine.v1",
  "avoid-flags.v1",
  "completeness.v1"
]);

const product = {
  id:"energy-demo",
  name:"Energy Demo",
  ingredients:[],
  contains:{status:"declared",items:[]},
  mayContain:{status:"declared",items:[]},
  facts:{added_sugar_g:5,sodium_mg:60,caffeine_mg:180},
  flags:[],
  incomplete:false,
  confidence:"HIGH"
};

let result = LF.verdict.evaluate(product, {
  id:"riley", name:"Riley", caffeineLimitMg:200
});
assert.equal(result.verdict, "CAUTION");
assert(result.rules.some(r => r.moduleId === "caffeine.v1" && r.ruleId === "caffeine.near_limit"));
assert(result.coverage.evaluated.includes("caffeineLimitMg"));
assert.equal(result.coverage.complete, true);

result = LF.verdict.evaluate(product, {
  id:"riley", name:"Riley", caffeineLimitMg:150
});
assert.equal(result.verdict, "DOESN'T FIT");
assert(result.rules.some(r => r.ruleId === "caffeine.limit"));

const missingCaffeine = JSON.parse(JSON.stringify(product));
delete missingCaffeine.facts.caffeine_mg;
result = LF.verdict.evaluate(missingCaffeine, {
  id:"riley", name:"Riley", caffeineLimitMg:200
});
assert.equal(result.verdict, "CAN'T CONFIRM");
assert(result.rules.some(r => r.ruleId === "caffeine.missing"));

result = LF.verdict.evaluate(product, {
  id:"casey",
  name:"Casey",
  dietaryRestrictions:["vegan"],
  processingPreferences:["minimal"]
});
assert.equal(result.verdict, "GOOD FIT");
assert.deepStrictEqual(result.coverage.evaluated, []);
assert.deepStrictEqual(result.coverage.notEvaluated, ["dietaryRestrictions","processingPreferences"]);
assert.equal(result.coverage.complete, false);

assert.throws(() => LF.rules.register({ id:"caffeine.v1", evaluate:() => [] }), /Duplicate/);

console.log("LabelFit modular rule registry: PASS");
console.log("LabelFit caffeine module: PASS");
console.log("LabelFit unsupported-setting transparency: PASS");

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
  "dietary-restrictions.v1",
  "intolerances.v1",
  "ingredient-avoid.v1",
  "processing-preference.v1",
  "avoid-flags.v1",
  "completeness.v1"
]);

const product = {
  id:"energy-demo",
  name:"Energy Demo",
  ingredients:[
    { text:"Honey", groups:[] },
    { text:"Milk protein", groups:["milk"] }
  ],
  contains:{status:"declared",items:[{group:"milk",label:"Milk"}]},
  mayContain:{status:"declared",items:[]},
  facts:{added_sugar_g:5,sodium_mg:60,caffeine_mg:180},
  flags:[],
  attributes:{
    dietary:{vegan:false,vegetarian:true},
    intolerances:{lactose:true,gluten:false},
    processingLevel:"high"
  },
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
  intolerances:["lactose"],
  ingredientAvoids:["honey"],
  processingPreferences:["minimal"]
});
assert.equal(result.verdict, "DOESN'T FIT");
assert(result.rules.some(r => r.moduleId === "dietary-restrictions.v1" && r.ruleId === "dietary.conflict"));
assert(result.rules.some(r => r.moduleId === "intolerances.v1" && r.ruleId === "intolerance.present"));
assert(result.rules.some(r => r.moduleId === "ingredient-avoid.v1" && r.ruleId === "ingredient.avoid"));
assert(result.rules.some(r => r.moduleId === "processing-preference.v1" && r.ruleId === "processing.high"));
assert.deepStrictEqual(result.coverage.notEvaluated, []);
assert.deepStrictEqual(result.coverage.unsupportedValues, []);
assert.equal(result.coverage.complete, true);

const unknownDiet = JSON.parse(JSON.stringify(product));
delete unknownDiet.attributes.dietary.vegan;
result = LF.verdict.evaluate(unknownDiet, {
  id:"casey", name:"Casey", dietaryRestrictions:["vegan"]
});
assert.equal(result.verdict, "CAN'T CONFIRM");
assert(result.rules.some(r => r.ruleId === "dietary.unknown"));

const unknownIntolerance = JSON.parse(JSON.stringify(product));
delete unknownIntolerance.attributes.intolerances.gluten;
result = LF.verdict.evaluate(unknownIntolerance, {
  id:"alex", name:"Alex", intolerances:["gluten"]
});
assert.equal(result.verdict, "CAN'T CONFIRM");
assert(result.rules.some(r => r.ruleId === "intolerance.unknown"));

result = LF.verdict.evaluate(product, {
  id:"casey",
  name:"Casey",
  dietaryRestrictions:["kosher"],
  processingPreferences:["whole-food-only"]
});
assert.equal(result.verdict, "GOOD FIT");
assert.deepStrictEqual(result.coverage.notEvaluated, []);
assert.deepStrictEqual(result.coverage.unsupportedValues, [
  { field:"dietaryRestrictions", value:"kosher" },
  { field:"processingPreferences", value:"whole-food-only" }
]);
assert.equal(result.coverage.complete, false);

result = LF.verdict.evaluate(product, {
  id:"casey",
  name:"Casey",
  futureSetting:["something"]
});
assert.deepStrictEqual(result.coverage.notEvaluated, ["futureSetting"]);
assert.equal(result.coverage.complete, false);

assert.throws(() => LF.rules.register({ id:"caffeine.v1", evaluate:() => [] }), /Duplicate/);

console.log("LabelFit modular rule registry: PASS");
console.log("LabelFit caffeine module: PASS");
console.log("LabelFit dietary/intolerance/preference modules: PASS");
console.log("LabelFit unsupported field/value transparency: PASS");

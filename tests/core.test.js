const assert = require("assert");

global.LabelFit = {};
require("../js/normalize.js");
require("../js/profiles.js");
require("../js/verdict.js");
require("../js/evidence.js");
require("../js/explain.js");
require("../js/demo-data.js");

const LF = global.LabelFit;
const product = LF.demo.product;
const byId = Object.fromEntries(LF.demo.profiles.map(p => [p.id, p]));

const jordan = LF.verdict.evaluate(product, byId.jordan);
assert.equal(jordan.verdict, "DOESN'T FIT");
assert.equal(jordan.rules[0].ruleId, "allergy.may.strict");

const taylor = LF.verdict.evaluate(product, byId.taylor);
assert.equal(taylor.verdict, "CAUTION");
assert.equal(taylor.rules[0].ruleId, "sugar.moderate");

const morgan = LF.verdict.evaluate(product, byId.morgan);
assert.equal(morgan.verdict, "GOOD FIT");

const missing = JSON.parse(JSON.stringify(product));
missing.contains = { status: "unknown", items: [] };
missing.mayContain = { status: "unknown", items: [] };
assert.equal(LF.verdict.evaluate(missing, byId.jordan).verdict, "CAN'T CONFIRM");

const direct = JSON.parse(JSON.stringify(missing));
direct.ingredients.push({ text: "Peanut butter", groups: ["peanut"] });
assert.equal(LF.verdict.evaluate(direct, byId.jordan).verdict, "DOESN'T FIT");

const chain = LF.explain.why(jordan, product, byId.jordan);
assert.equal(chain[0].layer, "VERDICT");
assert(chain.some(x => x.layer === "RULE"));
assert(chain.some(x => x.layer === "SOURCE"));

console.log("LabelFit deterministic core: PASS");

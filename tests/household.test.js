const assert = require("assert");

global.LabelFit = {};
require("../js/normalize.js");
require("../js/profiles.js");
require("../js/rules.js");
require("../js/verdict.js");
require("../js/household.js");
require("../js/compare.js");
require("../js/demo-data.js");

const LF = global.LabelFit;
const source = LF.demo.product;
const profiles = LF.demo.profiles;
const catalog = LF.demo.catalog;

const household = LF.household.evaluate(source, profiles);
assert.equal(household.status, "NOT FOR EVERYONE");
assert.equal(household.members.length, 3);
assert.equal(household.members.find(x => x.profile.id === "jordan").result.verdict, "DOESN'T FIT");
assert.equal(household.members.find(x => x.profile.id === "taylor").result.verdict, "CAUTION");
assert.equal(household.members.find(x => x.profile.id === "morgan").result.verdict, "GOOD FIT");

const orchard = catalog.find(p => p.id === "orchard-oat-bars");
const orchardHousehold = LF.household.evaluate(orchard, profiles);
assert.equal(orchardHousehold.status, "FITS EVERYONE");

const berry = catalog.find(p => p.id === "berry-crunch-bars");
const berryHousehold = LF.household.evaluate(berry, profiles);
assert.equal(berryHousehold.status, "NEEDS CHECK");

const recs = LF.compare.betterFit(source, profiles, catalog, 3);
assert(recs.length >= 2);
assert.equal(recs[0].product.id, "orchard-oat-bars");
assert.equal(recs[0].relevance, 0);
assert(recs[0].improvement > 0);

const sameOrRelated = recs.slice(0,2).every(x => x.relevance <= 1);
assert(sameOrRelated, "Better Fit should prefer same/related categories before broad fallback");

const soupIndex = recs.findIndex(x => x.product.id === "tomato-soup");
const orchardIndex = recs.findIndex(x => x.product.id === "orchard-oat-bars");
assert(orchardIndex >= 0);
assert(soupIndex < 0 || orchardIndex < soupIndex);

const again = LF.compare.betterFit(source, profiles, catalog, 3);
assert.deepStrictEqual(
  recs.map(x => x.product.id),
  again.map(x => x.product.id),
  "ranking must be deterministic"
);

console.log("LabelFit household aggregation: PASS");
console.log("LabelFit category-aware Better Fit: PASS");

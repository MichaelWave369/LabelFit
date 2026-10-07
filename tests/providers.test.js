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

const providers = LF.providers.list();
assert(providers.some(p => p.id === "paste.local.v1" && p.authority === "EVIDENCE_ONLY"));
assert(providers.some(p => p.id === "barcode.demo.v1" && p.simulated === true));
assert(providers.some(p => p.id === "ocr.demo.v1" && p.simulated === true));

const pasteObs = LF.providers.capture("paste.local.v1", {
  text:"Oats, peanut butter, salt"
});
assert.equal(pasteObs.authority, "EVIDENCE_ONLY");
assert.equal(pasteObs.fields.ingredients_text, "Oats, peanut butter, salt");

const pasteProduct = LF.input.capture("paste.local.v1", {
  text:"Oats, peanut butter, salt"
});
assert.equal(
  pasteProduct.provenance.sources["src.provider.paste.local.v1"].authority,
  "EVIDENCE-ONLY PROVIDER"
);
assert(pasteProduct.ingredients.some(x => x.groups.includes("peanut")));
assert.equal(pasteProduct.incomplete, true);

const barcodeProduct = LF.input.capture("barcode.demo.v1", {
  code:"000000000401"
});
assert.equal(barcodeProduct.name, "Peanut Oat Energy Bar");
assert.equal(barcodeProduct.incomplete, false);
assert.equal(barcodeProduct.facts.sodium_mg, 90);
assert(barcodeProduct.ingredients.some(x => x.groups.includes("peanut")));

const jordan = {
  id:"jordan",
  name:"Jordan",
  allergies:[{allergen:"peanut",severity:"severe"}],
  strictnessLevel:"strict"
};
const barcodeResult = LF.verdict.evaluate(barcodeProduct, jordan);
assert.equal(barcodeResult.verdict, "DOESN'T FIT");

const ocrProduct = LF.input.capture("ocr.demo.v1", {
  text:"Oats, rice milk, cinnamon"
});
assert.equal(ocrProduct.incomplete, true);
assert(!ocrProduct.ingredients.some(x => x.groups.includes("milk")));

LF.providers.register({
  id:"authority-boundary.test.v1",
  kind:"ocr",
  simulated:true,
  observe:function () {
    return {
      verdict:"GOOD FIT",
      confidence:"HIGH",
      fields:{ingredients_text:"peanut butter"}
    };
  }
});
assert.throws(
  () => LF.providers.capture("authority-boundary.test.v1", {}),
  /may not assert decision field: verdict/
);

assert.throws(
  () => LF.providers.register({
    id:"barcode.demo.v1",
    kind:"barcode",
    observe:function(){ return {}; }
  }),
  /Duplicate input provider/
);

console.log("LabelFit provider registry: PASS");
console.log("LabelFit evidence-only authority boundary: PASS");
console.log("LabelFit barcode/OCR/paste adapters: PASS");

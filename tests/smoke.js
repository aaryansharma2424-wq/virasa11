/* Dependency-free checks for the product and WhatsApp logic. Run: node tests/smoke.js */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "script.js"), "utf8");
const nodes = {
  "#product-type": { value: "single" },
  "#first-size": { value: "46" },
  "#second-size": { value: "44" },
  "#second-size-field": { hidden: true },
  "#quantity": { value: "1" },
  "#order-form": null
};
const formValues = {
  customerName: "Test Customer",
  businessName: "Sample Cafe",
  businessCategory: "Café",
  customerPhone: "+91 90000 00000",
  productType: "bundle",
  firstSize: "46",
  secondSize: "44",
  quantity: "1",
  reviewUrl: "https://maps.app.goo.gl/example",
  deliveryArea: "Kanpur",
  customisation: "",
  additionalMessage: ""
};
class MockFormData {
  constructor() {}
  get(name) { return formValues[name] ?? ""; }
}
const sandbox = {
  document: {
    querySelector: (selector) => nodes[selector] ?? null,
    querySelectorAll: () => []
  },
  window: {},
  URL,
  FormData: MockFormData,
  Date,
  console
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "script.js" });

function selection() {
  return JSON.parse(vm.runInContext("JSON.stringify(readOrderSelection())", sandbox));
}

// Verify the two single-card options use the same retail price.
nodes["#product-type"].value = "single";
nodes["#first-size"].value = "46";
nodes["#quantity"].value = "1";
assert.equal(selection().total, 599, "one 4×6 card costs ₹599");
nodes["#first-size"].value = "44";
assert.equal(selection().total, 599, "one 4×4 card costs ₹599");

// Verify same-size and mixed-size bundle selection and quantity multiplication.
nodes["#product-type"].value = "bundle";
nodes["#first-size"].value = "46";
nodes["#second-size"].value = "44";
nodes["#quantity"].value = "1";
assert.equal(selection().total, 899, "one mixed-size bundle costs ₹899");
assert.equal(selection().sizes, "4×6 + 4×4", "mixed sizes are represented in the selection");
nodes["#first-size"].value = "44";
nodes["#second-size"].value = "44";
nodes["#quantity"].value = "2";
assert.equal(selection().total, 1798, "two bundles multiply the bundle price");

// Verify generated message content and valid URL encoding for a mixed bundle.
nodes["#first-size"].value = "46";
nodes["#second-size"].value = "44";
nodes["#quantity"].value = "1";
const message = vm.runInContext("buildOrderMessage()", sandbox);
assert.match(message, /Card sizes: 4×6 \+ 4×4/);
assert.match(message, /Estimated total: ₹899/);
assert.match(message, /Google review URL: https:\/\/maps\.app\.goo\.gl\/example/);
assert.doesNotMatch(message, /Customisation requirements:|Additional message:/, "empty optional fields are omitted");
const chatUrl = vm.runInContext("whatsappUrl(buildOrderMessage())", sandbox);
const parsedChatUrl = new URL(chatUrl);
assert.equal(parsedChatUrl.origin + parsedChatUrl.pathname, "https://wa.me/918090207807");
assert.equal(parsedChatUrl.searchParams.get("text"), message, "WhatsApp text is correctly URL encoded");

function mockInput(value) {
  return {
    value,
    validityMessage: "",
    attributes: {},
    setCustomValidity(message) { this.validityMessage = message; },
    setAttribute(name, attributeValue) { this.attributes[name] = attributeValue; }
  };
}
const validUrlInput = mockInput("https://maps.app.goo.gl/example");
sandbox.validationInput = validUrlInput;
assert.equal(vm.runInContext("validateHttpsUrl(validationInput, null)", sandbox), true, "a valid HTTPS URL is accepted");
const httpUrlInput = mockInput("http://example.com/reviews");
sandbox.validationInput = httpUrlInput;
assert.equal(vm.runInContext("validateHttpsUrl(validationInput, null)", sandbox), false, "plain HTTP URLs are rejected");
assert.equal(httpUrlInput.attributes["aria-invalid"], "true");
const javascriptUrlInput = mockInput("javascript:alert(1)");
sandbox.validationInput = javascriptUrlInput;
assert.equal(vm.runInContext("validateHttpsUrl(validationInput, null)", sandbox), false, "script URLs are rejected");
const phoneInput = mockInput("+91 98765 43210");
sandbox.validationInput = phoneInput;
assert.equal(vm.runInContext("validateContactNumber(validationInput)", sandbox), true, "valid contact numbers are accepted");
phoneInput.value = "123";
assert.equal(vm.runInContext("validateContactNumber(validationInput)", sandbox), false, "short contact numbers are rejected");

// Validate that links and image assets referenced by the static pages exist.
const htmlFiles = ["index.html", "privacy-policy.html", "terms.html", "shipping-policy.html", "refund-policy.html", "404.html"];
const idsByFile = new Map();
for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const idMatches = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(idMatches).size, idMatches.length, `${file} has duplicate IDs`);
  idsByFile.set(file, new Set(idMatches));
  for (const labelMatch of html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)) {
    assert.ok(idsByFile.get(file).has(labelMatch[1]), `${file} has a label without a matching field: ${labelMatch[1]}`);
  }
  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(reference)) continue;
    const [relativePath, fragment] = reference.split("#", 2);
    const targetFile = relativePath ? path.resolve(root, path.dirname(file), relativePath) : path.join(root, file);
    assert.ok(fs.existsSync(targetFile), `${file} references a missing file: ${reference}`);
    if (fragment) {
      const targetName = path.relative(root, targetFile).replaceAll("\\", "/");
      const targetHtml = fs.readFileSync(targetFile, "utf8");
      const ids = idsByFile.get(targetName) ?? new Set([...targetHtml.matchAll(/\bid="([^"]+)"/g)].map((idMatch) => idMatch[1]));
      assert.ok(ids.has(decodeURIComponent(fragment)), `${file} references a missing anchor: ${reference}`);
    }
  }
}
const homeHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert.equal((homeHtml.match(/data-whatsapp-product=/g) ?? []).length, 3, "each catalogue option has a direct WhatsApp enquiry link");
assert.match(homeHtml, /id="order-form"[^>]*novalidate/, "the order form is present");

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git") return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}
for (const file of listFiles(root)) {
  const content = fs.readFileSync(file, "utf8");
  assert.doesNotMatch(content, /[ \t]+$/m, `${path.relative(root, file)} has trailing whitespace`);
}

console.log("PASS: one 4×6 card = ₹599");
console.log("PASS: one 4×4 card = ₹599");
console.log("PASS: one two-card bundle, including mixed sizes = ₹899");
console.log("PASS: quantity multiplication and selected sizes");
console.log("PASS: WhatsApp destination, encoded message, and optional field handling");
console.log("PASS: HTTPS URL and contact-number validation");
console.log("PASS: local page, stylesheet, script, and image references");
console.log("PASS: unique page IDs, form label targets, and product WhatsApp links");
console.log("PASS: no trailing whitespace in project files");

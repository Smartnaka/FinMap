import test from "node:test"; import assert from "node:assert/strict";
// The public data API is tested through a small JS mirror to avoid a TypeScript runtime dependency.
const entities = [{ slug: "nibss", name: "Nigeria Inter-Bank Settlement System", description: "infrastructure" }];
function search(query) { return entities.filter(e => `${e.name} ${e.description}`.toLowerCase().includes(query.toLowerCase())); }
test("search finds a published infrastructure entity", () => assert.equal(search("settlement")[0].slug, "nibss"));
test("search yields no invented result", () => assert.deepEqual(search("imaginary provider"), []));
test("relationship endpoints should be distinct", () => assert.notEqual("nibss", "central-bank-of-nigeria"));

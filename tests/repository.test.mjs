import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const repository = await readFile(new URL("../src/lib/repository.ts", import.meta.url), "utf8");

test("the runtime repository does not import development seed data", () => {
  assert.doesNotMatch(repository, /from\s+["']\.\/seed["']/);
});

test("public entity queries restrict results to PUBLISHED records", () => {
  assert.match(repository, /WHERE e\.status = 'PUBLISHED'/);
  assert.match(repository, /AND e\.slug = \$1/);
});

test("search and entity lookup use parameterized PostgreSQL values", () => {
  assert.match(repository, /\[slug\]/);
  assert.match(repository, /ILIKE \$1/);
  assert.match(repository, /\[pattern\]/);
});

test("relationship queries only return relationships between published endpoints", () => {
  assert.match(repository, /source_entity\.status = 'PUBLISHED'/);
  assert.match(repository, /target_entity\.status = 'PUBLISHED'/);
});

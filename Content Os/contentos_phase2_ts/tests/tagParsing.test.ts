import test from "node:test";
import assert from "node:assert/strict";
import { parseTags } from "../src/calendar/icsParser.js";

test("parseTags extracts tags", () => {
  const tags = parseTags("Walkthrough [ON-SITE]", "blah [FILM]");
  assert.ok(tags.includes("ON-SITE"));
  assert.ok(tags.includes("FILM"));
});

test("parseTags returns empty", () => {
  const tags = parseTags("Meeting", "no tags");
  assert.deepEqual(tags, []);
});

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { extractDealContext } from "../src/deals/extract.js";

const dealsPath = path.join("fixtures", "deals.json");

test("extractDealContext prefers description structured fields", () => {
  const description = `[ON-SITE]\ndeal_id: DEAL_123\naddress: 999 Main St\npromise: no payments`;
  const { deal } = extractDealContext(description, dealsPath);
  assert.equal(deal.deal_id, "DEAL_123");
  assert.equal(deal.address, "999 Main St");
  assert.deepEqual(deal.promise_tokens, ["no payments"]);
});

test("extractDealContext falls back to deals.json", () => {
  const description = `[ON-SITE]\ndeal_id: DEAL_123`;
  const { deal } = extractDealContext(description, dealsPath);
  assert.equal(deal.address, "123 Oak St");
  assert.ok(deal.terms.includes("0% interest"));
});

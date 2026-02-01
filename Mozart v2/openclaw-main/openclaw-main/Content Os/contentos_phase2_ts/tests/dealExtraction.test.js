import { describe, it, expect } from "vitest";
import path from "node:path";
import { extractDealContext } from "../src/deals/extract.js";
const dealsPath = path.join("fixtures", "deals.json");
describe("extractDealContext", () => {
    it("prefers description structured fields", () => {
        const description = `[ON-SITE]\ndeal_id: DEAL_123\naddress: 999 Main St\npromise: no payments`;
        const { deal } = extractDealContext(description, dealsPath);
        expect(deal.deal_id).toBe("DEAL_123");
        expect(deal.address).toBe("999 Main St");
        expect(deal.promise_tokens).toEqual(["no payments"]);
    });
    it("falls back to deals.json when missing fields", () => {
        const description = `[ON-SITE]\ndeal_id: DEAL_123`;
        const { deal } = extractDealContext(description, dealsPath);
        expect(deal.address).toBe("123 Oak St");
        expect(deal.terms).toContain("0% interest");
    });
});

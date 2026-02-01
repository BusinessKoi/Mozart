import { describe, it, expect } from "vitest";
import { parseTags } from "../src/calendar/icsParser.js";
describe("parseTags", () => {
    it("extracts tags from title and description", () => {
        const tags = parseTags("Walkthrough [ON-SITE]", "blah [FILM]");
        expect(tags).toContain("ON-SITE");
        expect(tags).toContain("FILM");
    });
    it("returns empty when no tags", () => {
        const tags = parseTags("Meeting", "no tags");
        expect(tags).toEqual([]);
    });
});

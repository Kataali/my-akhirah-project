import { describe, it, expect } from "vitest";
import { formatCurrency, progressPercent, slugify } from "../lib/utils";
import { formatDeliveredItem, parseDeliveredItems } from "../lib/report-items";

describe("Utility Functions", () => {
  describe("formatCurrency", () => {
    it("formats amounts in GHS by default", () => {
      expect(formatCurrency(100)).toBe("GH₵100.00");
      expect(formatCurrency(1500.5)).toBe("GH₵1,500.50");
    });

    it("formats zero correctly", () => {
      expect(formatCurrency(0)).toBe("GH₵0.00");
    });
  });

  describe("progressPercent", () => {
    it("calculates percentage correctly", () => {
      expect(progressPercent(50, 100)).toBe(50);
      expect(progressPercent(1, 4)).toBe(25);
    });

    it("caps percentage at 100", () => {
      expect(progressPercent(150, 100)).toBe(100);
    });

    it("handles zero target safely", () => {
      expect(progressPercent(10, 0)).toBe(0);
    });
  });

  describe("slugify", () => {
    it("converts strings to URL-friendly slugs", () => {
      expect(slugify("Hello World")).toBe("hello-world");
      expect(slugify("Campaign for Northern Ghana!")).toBe("campaign-for-northern-ghana");
    });
  });

  describe("Delivered Items formatting & parsing", () => {
    it("formats quantity + unit + name as 'quantity unit of name'", () => {
      expect(
        formatDeliveredItem({ name: "pens", quantity: 20, unit: "packs" })
      ).toBe("20 packs of pens");
    });

    it("formats quantity + name (no unit) as 'quantity name'", () => {
      expect(
        formatDeliveredItem({ name: "wall clocks", quantity: 50 })
      ).toBe("50 wall clocks");
    });

    it("formats name only when neither quantity nor unit is provided", () => {
      expect(formatDeliveredItem({ name: "Borehole rehabilitation" })).toBe(
        "Borehole rehabilitation"
      );
    });

    it("parses items with and without units cleanly", () => {
      const parsed = parseDeliveredItems(
        JSON.stringify([
          { name: "pens", quantity: 20, unit: "packs" },
          { name: "wall clocks", quantity: 50 },
        ])
      );
      expect(parsed).toEqual([
        { name: "pens", quantity: 20, unit: "packs" },
        { name: "wall clocks", quantity: 50 },
      ]);
    });
  });
});

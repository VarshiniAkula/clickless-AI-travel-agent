import { describe, it, expect } from "vitest";
import { parseIntent } from "@/lib/nlu/parser";

describe("NLU Parser", () => {
  it("parses the controlled demo query", () => {
    const intent = parseIntent(
      "Plan a 5-night Tokyo trip from Phoenix in April under $2000, I like temples and food tours."
    );
    expect(intent.destination).toBe("Tokyo");
    expect(intent.origin).toBe("Phoenix");
    expect(intent.duration).toBe(6); // 5 nights = 6 days
    expect(intent.budget).toBe(2000);
    expect(intent.activities).toContain("temples");
    expect(intent.activities).toContain("food tours");
  });

  it("parses 'from X to Y' pattern", () => {
    const intent = parseIntent("I want to fly from Phoenix to London for 7 nights");
    expect(intent.destination).toBe("London");
    expect(intent.origin).toBe("Phoenix");
    expect(intent.duration).toBe(8); // 7 nights = 8 days
  });

  it("parses destination-only queries", () => {
    const intent = parseIntent("I want to visit Paris");
    expect(intent.destination).toBe("Paris");
  });

  it("parses budget from dollar sign", () => {
    const intent = parseIntent("Trip to Cancun under $800");
    expect(intent.budget).toBe(800);
  });

  it("extracts activities", () => {
    const intent = parseIntent("Tokyo trip with hiking and museum visits");
    expect(intent.activities).toContain("hiking");
    expect(intent.activities).toContain("museums");
  });

  it("parses travelers", () => {
    const intent = parseIntent("Family trip to New York for 3 nights");
    expect(intent.travelers).toBe(4); // "family" = 4
    expect(intent.destination).toBe("New York");
    expect(intent.duration).toBe(4); // 3 nights = 4 days
  });

  it("handles dates in month format", () => {
    const intent = parseIntent("Tokyo trip in April");
    expect(intent.dates).toBeDefined();
    expect(intent.dates!.start).toContain("-04-");
  });

  it("returns Unknown for unrecognized destinations", () => {
    const intent = parseIntent("I want to go somewhere nice");
    expect(intent.destination).toBe("Unknown");
  });

  it("handles solo traveler", () => {
    const intent = parseIntent("Solo trip to Tokyo");
    expect(intent.travelers).toBe(1);
  });

  it("parses week duration", () => {
    const intent = parseIntent("2 week trip to London");
    expect(intent.duration).toBe(14);
  });
});

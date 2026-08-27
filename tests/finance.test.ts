import { describe, it, expect } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";
import { computeBalance } from "@/lib/services/finance.service";

describe("student debt calculation (system.md #29)", () => {
  it("computes remaining = total charges - total paid (PER_SESSION example from spec)", () => {
    // Session Price = 100 EGP, attended 8 sessions -> 800 EGP charged, paid 500 -> remaining 300
    const balance = computeBalance(new Decimal(800), new Decimal(500));
    expect(balance.remaining.toString()).toBe("300");
  });

  it("remaining is zero when nothing has been charged yet", () => {
    const balance = computeBalance(new Decimal(0), new Decimal(0));
    expect(balance.remaining.toString()).toBe("0");
  });

  it("remaining can go negative if a student overpays (credit balance)", () => {
    const balance = computeBalance(new Decimal(300), new Decimal(500));
    expect(balance.remaining.toString()).toBe("-200");
  });
});

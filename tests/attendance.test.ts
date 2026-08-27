import { describe, it, expect } from "vitest";
import { statusForCheckIn } from "@/lib/services/attendance.service";

describe("attendance late/present calculation (system.md #18)", () => {
  const session = { date: new Date("2026-08-09T00:00:00"), startTime: "17:00" };

  it("marks the student PRESENT when checking in exactly at session start", () => {
    const now = new Date("2026-08-09T17:00:00");
    expect(statusForCheckIn(session, 10, now)).toBe("PRESENT");
  });

  it("marks the student PRESENT when checking in inside the grace period", () => {
    const now = new Date("2026-08-09T17:09:59");
    expect(statusForCheckIn(session, 10, now)).toBe("PRESENT");
  });

  it("marks the student PRESENT exactly at the grace period boundary", () => {
    const now = new Date("2026-08-09T17:10:00");
    expect(statusForCheckIn(session, 10, now)).toBe("PRESENT");
  });

  it("marks the student LATE just after the grace period elapses", () => {
    const now = new Date("2026-08-09T17:10:01");
    expect(statusForCheckIn(session, 10, now)).toBe("LATE");
  });

  it("respects a custom grace period configured in Settings", () => {
    const now = new Date("2026-08-09T17:16:00");
    expect(statusForCheckIn(session, 20, now)).toBe("PRESENT");
    expect(statusForCheckIn(session, 15, now)).toBe("LATE");
  });
});

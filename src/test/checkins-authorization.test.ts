import { describe, expect, it } from "vitest";
import { canCreateOwnCheckIn } from "@/hooks/use-checkins";

describe("check-ins ownership authorization", () => {
  it("allows check-in when user owns associate", () => {
    expect(canCreateOwnCheckIn("user-1", "user-1")).toBe(true);
  });

  it("denies check-in for third-party associate", () => {
    expect(canCreateOwnCheckIn("user-1", "user-2")).toBe(false);
  });

  it("denies check-in when associate has no linked user", () => {
    expect(canCreateOwnCheckIn("user-1", null)).toBe(false);
  });

  it("denies check-in when current user is missing", () => {
    expect(canCreateOwnCheckIn(null, "user-1")).toBe(false);
  });
});

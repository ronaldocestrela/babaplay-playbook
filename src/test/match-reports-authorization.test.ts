import { describe, expect, it } from "vitest";
import { MATCH_REPORT_STATUS } from "@/api/api-response";
import { canEditMatchReport } from "@/hooks/use-match-reports";

describe("match-reports authorization", () => {
  it("allows editing draft reports for non-admins", () => {
    expect(canEditMatchReport(MATCH_REPORT_STATUS.Draft, ["Manager"])).toBe(true);
  });

  it("denies editing finalized reports for non-admins", () => {
    expect(canEditMatchReport(MATCH_REPORT_STATUS.Finalized, ["Manager"])).toBe(false);
  });

  it("allows editing finalized reports for admins", () => {
    expect(canEditMatchReport(MATCH_REPORT_STATUS.Finalized, ["Admin"])).toBe(true);
  });
});
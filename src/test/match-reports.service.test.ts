import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock, putMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  putMock: vi.fn(),
  postMock: vi.fn(),
}));

vi.mock("@/api/axios-instance", () => ({
  api: {
    get: getMock,
    put: putMock,
    post: postMock,
  },
}));

import {
  finalizeMatchReport,
  getMatchReportBySession,
  upsertMatchReport,
} from "@/services/match-reports.service";

describe("match-reports.service", () => {
  beforeEach(() => {
    getMock.mockReset();
    putMock.mockReset();
    postMock.mockReset();
  });

  it("getMatchReportBySession uses session endpoint", async () => {
    const expected = { id: "mr-1" };
    getMock.mockResolvedValueOnce(expected);

    const result = await getMatchReportBySession("session-1");

    expect(result).toEqual(expected);
    expect(getMock).toHaveBeenCalledWith("/api/matchreports/sessions/session-1", undefined);
  });

  it("upsertMatchReport sends payload to session endpoint", async () => {
    const expected = { id: "mr-1" };
    const payload = { notes: null, games: [] };
    putMock.mockResolvedValueOnce(expected);

    const result = await upsertMatchReport("session-1", payload);

    expect(result).toEqual(expected);
    expect(putMock).toHaveBeenCalledWith("/api/matchreports/sessions/session-1", payload);
  });

  it("finalizeMatchReport posts finalize action", async () => {
    const expected = { id: "mr-1", status: 1 };
    postMock.mockResolvedValueOnce(expected);

    const result = await finalizeMatchReport("session-1");

    expect(result).toEqual(expected);
    expect(postMock).toHaveBeenCalledWith("/api/matchreports/sessions/session-1/finalize");
  });
});
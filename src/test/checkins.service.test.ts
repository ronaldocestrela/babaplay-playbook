import { beforeEach, describe, expect, it, vi } from "vitest";

const { postMock, getMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
  getMock: vi.fn(),
}));

vi.mock("@/api/axios-instance", () => ({
  api: {
    post: postMock,
    get: getMock,
  },
}));

import {
  createCheckIn,
  createSession,
  listSessionCheckIns,
} from "@/services/checkins.service";

describe("checkins.service", () => {
  beforeEach(() => {
    postMock.mockReset();
    getMock.mockReset();
  });

  it("createSession calls sessions endpoint", async () => {
    const expected = { id: "s1" };
    postMock.mockResolvedValueOnce(expected);

    const result = await createSession();

    expect(result).toEqual(expected);
    expect(postMock).toHaveBeenCalledWith("/api/checkins/sessions");
  });

  it("createCheckIn posts session and associate ids", async () => {
    const payload = { sessionId: "s1", associateId: "a1" };
    const expected = { id: "c1" };
    postMock.mockResolvedValueOnce(expected);

    const result = await createCheckIn(payload);

    expect(result).toEqual(expected);
    expect(postMock).toHaveBeenCalledWith("/api/checkins", payload);
  });

  it("listSessionCheckIns uses session endpoint", async () => {
    const expected = [{ id: "c1" }];
    getMock.mockResolvedValueOnce(expected);

    const result = await listSessionCheckIns("session-10");

    expect(result).toEqual(expected);
    expect(getMock).toHaveBeenCalledWith("/api/checkins/sessions/session-10");
  });
});

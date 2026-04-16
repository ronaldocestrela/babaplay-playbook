import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthData, LoginPayload, RegisterPayload } from "@/api/api-response";

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
}));

vi.mock("@/api/axios-instance", () => ({
  api: {
    post: postMock,
  },
}));

import { login, register, registerWithInvitation } from "@/services/auth.service";

describe("auth.service", () => {
  const authData: AuthData = {
    accessToken: "token",
    userId: "user-1",
    roles: ["Associate"],
    permissions: ["CheckIns.Create"],
  };

  beforeEach(() => {
    postMock.mockReset();
  });

  it("login calls auth login endpoint", async () => {
    const payload: LoginPayload = { email: "user@mail.com", password: "123456" };
    postMock.mockResolvedValueOnce(authData);

    const result = await login(payload);

    expect(result).toEqual(authData);
    expect(postMock).toHaveBeenCalledWith("/api/auth/login", payload);
  });

  it("register calls auth register endpoint", async () => {
    const payload: RegisterPayload = {
      name: "User",
      email: "user@mail.com",
      password: "123456",
      userType: 2,
    };
    postMock.mockResolvedValueOnce(authData);

    const result = await register(payload);

    expect(result).toEqual(authData);
    expect(postMock).toHaveBeenCalledWith("/api/auth/register", payload);
  });

  it("registerWithInvitation skips auth header", async () => {
    const payload = {
      invitationToken: "token-abc",
      name: "User",
      email: "user@mail.com",
      password: "123456",
    };
    postMock.mockResolvedValueOnce(authData);

    const result = await registerWithInvitation(payload);

    expect(result).toEqual(authData);
    expect(postMock).toHaveBeenCalledWith("/api/auth/register-with-invitation", payload, {
      skipAuth: true,
    });
  });
});

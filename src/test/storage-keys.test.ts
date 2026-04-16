import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAuthStorage,
  clearSessionAuth,
  readJsonStorage,
  STORAGE_KEYS,
} from "@/api/storage-keys";

describe("storage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("readJsonStorage returns fallback for missing key", () => {
    const value = readJsonStorage("missing-key", { ok: true });

    expect(value).toEqual({ ok: true });
  });

  it("readJsonStorage returns fallback for invalid json", () => {
    localStorage.setItem("bad", "{invalid");

    const value = readJsonStorage("bad", [1, 2, 3]);

    expect(value).toEqual([1, 2, 3]);
  });

  it("clearSessionAuth removes credentials and keeps tenant subdomain", () => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, "token");
    localStorage.setItem(STORAGE_KEYS.USER_ID, "u1");
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(["Admin"]));
    localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(["P1"]));
    localStorage.setItem(STORAGE_KEYS.TENANT_SUBDOMAIN, "club-a");

    clearSessionAuth();

    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER_ID)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.ROLES)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.PERMISSIONS)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.TENANT_SUBDOMAIN)).toBe("club-a");
  });

  it("clearAuthStorage removes tenant subdomain too", () => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, "token");
    localStorage.setItem(STORAGE_KEYS.TENANT_SUBDOMAIN, "club-a");

    clearAuthStorage();

    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.TENANT_SUBDOMAIN)).toBeNull();
  });
});

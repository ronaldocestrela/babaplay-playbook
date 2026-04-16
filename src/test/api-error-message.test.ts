import { describe, expect, it } from "vitest";
import { extractErrorMessage } from "@/api/axios-instance";

describe("extractErrorMessage", () => {
  it("returns default message when payload is not an object", () => {
    expect(extractErrorMessage(null)).toBe("Ocorreu um erro. Tente novamente.");
    expect(extractErrorMessage("x")).toBe("Ocorreu um erro. Tente novamente.");
  });

  it("joins envelope error and errors list", () => {
    const message = extractErrorMessage({
      success: false,
      error: "Falha principal",
      errors: ["detalhe 1", "detalhe 2"],
    });

    expect(message).toBe("Falha principal — detalhe 1 — detalhe 2");
  });

  it("returns direct error property when available", () => {
    const message = extractErrorMessage({ error: "Acesso negado" });

    expect(message).toBe("Acesso negado");
  });

  it("joins string errors when error is missing", () => {
    const message = extractErrorMessage({ errors: ["campo A", 10, "campo B"] });

    expect(message).toBe("campo A, campo B");
  });
});

import type { AuthData, LoginPayload, RegisterPayload } from "@/api/api-response";
import { api } from "@/api/axios-instance";

export async function login(payload: LoginPayload): Promise<AuthData> {
  return api.post<AuthData>("/api/auth/login", payload);
}

export async function register(payload: RegisterPayload): Promise<AuthData> {
  return api.post<AuthData>("/api/auth/register", payload);
}

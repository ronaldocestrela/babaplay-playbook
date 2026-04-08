import type {
  AuthData,
  LoginPayload,
  RegisterPayload,
  RegisterWithInvitationPayload,
} from "@/api/api-response";
import { api } from "@/api/axios-instance";

export async function login(payload: LoginPayload): Promise<AuthData> {
  return api.post<AuthData>("/api/auth/login", payload);
}

export async function register(payload: RegisterPayload): Promise<AuthData> {
  return api.post<AuthData>("/api/auth/register", payload);
}

/** Registo com convite — sem JWT; tenant via `X-Tenant-Subdomain`. */
export async function registerWithInvitation(
  payload: RegisterWithInvitationPayload,
): Promise<AuthData> {
  return api.post<AuthData>("/api/auth/register-with-invitation", payload, {
    skipAuth: true,
  });
}

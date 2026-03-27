import type {
  CreateTenantPayload,
  Subscription,
  SubscriptionPayload,
  Tenant,
} from "@/api/api-response";
import { api } from "@/api/axios-instance";

export async function listTenants(): Promise<Tenant[]> {
  return api.get<Tenant[]>("/api/platform/tenants");
}

export async function getTenant(id: string): Promise<Tenant> {
  return api.get<Tenant>(`/api/platform/tenants/${id}`);
}

export async function createTenant(payload: CreateTenantPayload): Promise<Tenant> {
  return api.post<Tenant>("/api/platform/tenants", payload);
}

export async function updateTenant(id: string, payload: CreateTenantPayload): Promise<Tenant> {
  return api.put<Tenant>(`/api/platform/tenants/${id}`, payload);
}

export async function deleteTenant(id: string): Promise<null> {
  return api.delete<null>(`/api/platform/tenants/${id}`);
}

export async function createSubscription(
  tenantId: string,
  payload: SubscriptionPayload,
): Promise<Subscription> {
  return api.post<Subscription>(`/api/platform/tenants/${tenantId}/subscription`, payload);
}

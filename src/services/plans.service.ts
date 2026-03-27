import type { CreatePlanPayload, Plan } from "@/api/api-response";
import { api } from "@/api/axios-instance";

export async function listPlans(): Promise<Plan[]> {
  return api.get<Plan[]>("/api/platform/plans");
}

export async function getPlan(id: string): Promise<Plan> {
  return api.get<Plan>(`/api/platform/plans/${id}`);
}

export async function createPlan(payload: CreatePlanPayload): Promise<Plan> {
  return api.post<Plan>("/api/platform/plans", payload);
}

export async function updatePlan(id: string, payload: CreatePlanPayload): Promise<Plan> {
  return api.put<Plan>(`/api/platform/plans/${id}`, payload);
}

export async function deletePlan(id: string): Promise<null> {
  return api.delete<null>(`/api/platform/plans/${id}`);
}

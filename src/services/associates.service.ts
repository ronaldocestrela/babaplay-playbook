import type { Associate, CreateAssociatePayload } from "@/api/api-response";
import { api } from "@/api/axios-instance";

export async function listAssociates(): Promise<Associate[]> {
  return api.get<Associate[]>("/api/associates");
}

export async function getAssociate(id: string): Promise<Associate> {
  return api.get<Associate>(`/api/associates/${id}`);
}

export async function createAssociate(payload: CreateAssociatePayload): Promise<Associate> {
  return api.post<Associate>("/api/associates", payload);
}

export async function updateAssociate(
  id: string,
  payload: CreateAssociatePayload,
): Promise<Associate> {
  return api.put<Associate>(`/api/associates/${id}`, payload);
}

import type { Association, UpsertAssociationPayload } from "@/api/api-response";
import { api } from "@/api/axios-instance";

export async function listAssociations(): Promise<Association[]> {
  return api.get<Association[]>("/api/associations");
}

export async function getAssociation(id: string): Promise<Association> {
  return api.get<Association>(`/api/associations/${id}`);
}

export async function upsertAssociation(payload: UpsertAssociationPayload): Promise<Association> {
  return api.post<Association>("/api/associations", payload);
}

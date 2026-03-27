import { api } from "@/api/axios-instance";

export async function listRoles(): Promise<string[]> {
  return api.get<string[]>("/api/roles");
}

export async function assignRole(userId: string, roleName: string): Promise<null> {
  return api.post<null>(`/api/roles/users/${userId}/assign/${encodeURIComponent(roleName)}`);
}

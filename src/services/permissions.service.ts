import type { Permission } from "@/api/api-response";
import { api } from "@/api/axios-instance";

export async function listPermissions(): Promise<Permission[]> {
  return api.get<Permission[]>("/api/permissions");
}

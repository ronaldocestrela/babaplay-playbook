import type { Category, CreateCategoryPayload } from "@/api/api-response";
import { api } from "@/api/axios-instance";

export async function listCategories(): Promise<Category[]> {
  return api.get<Category[]>("/api/categories");
}

export async function createCategory(payload: CreateCategoryPayload): Promise<Category> {
  return api.post<Category>("/api/categories", payload);
}

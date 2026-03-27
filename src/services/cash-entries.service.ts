import type { CashEntry, CreateCashEntryPayload } from "@/api/api-response";
import { api } from "@/api/axios-instance";

export async function listCashEntries(): Promise<CashEntry[]> {
  return api.get<CashEntry[]>("/api/CashEntries");
}

export async function createCashEntry(payload: CreateCashEntryPayload): Promise<CashEntry> {
  return api.post<CashEntry>("/api/CashEntries", payload);
}

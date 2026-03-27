import type { CheckIn, CheckInSession, CreateCheckInPayload } from "@/api/api-response";
import { api } from "@/api/axios-instance";

export async function createSession(): Promise<CheckInSession> {
  return api.post<CheckInSession>("/api/checkins/sessions");
}

export async function createCheckIn(payload: CreateCheckInPayload): Promise<CheckIn> {
  return api.post<CheckIn>("/api/checkins", payload);
}

export async function listSessionCheckIns(sessionId: string): Promise<CheckIn[]> {
  return api.get<CheckIn[]>(`/api/checkins/sessions/${sessionId}`);
}

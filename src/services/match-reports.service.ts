import type {
  MatchReport,
  UpsertMatchReportPayload,
} from "@/api/api-response";
import { api, type ApiRequestConfig } from "@/api/axios-instance";

export async function getMatchReportBySession(
  sessionId: string,
  config?: ApiRequestConfig,
): Promise<MatchReport> {
  return api.get<MatchReport>(`/api/matchreports/sessions/${encodeURIComponent(sessionId)}`, config);
}

export async function upsertMatchReport(
  sessionId: string,
  payload: UpsertMatchReportPayload,
): Promise<MatchReport> {
  return api.put<MatchReport>(`/api/matchreports/sessions/${encodeURIComponent(sessionId)}`, payload);
}

export async function finalizeMatchReport(sessionId: string): Promise<MatchReport> {
  return api.post<MatchReport>(`/api/matchreports/sessions/${encodeURIComponent(sessionId)}/finalize`);
}
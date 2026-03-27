import type { GenerateTeamsPayload, Team } from "@/api/api-response";
import { api } from "@/api/axios-instance";

export async function generateTeams(payload: GenerateTeamsPayload): Promise<Team[]> {
  return api.post<Team[]>("/api/teams/generate", payload);
}

export async function listTeamsBySession(sessionId: string): Promise<Team[]> {
  return api.get<Team[]>(`/api/teams/by-session/${sessionId}`);
}

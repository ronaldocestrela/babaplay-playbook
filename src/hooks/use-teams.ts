import * as teamsService from "@/services/teams.service";
import type { GenerateTeamsPayload } from "@/api/api-response";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const teamKeys = {
  bySession: (sessionId: string) => ["teams", "session", sessionId] as const,
};

export function useGenerateTeams() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateTeamsPayload) => teamsService.generateTeams(payload),
    onSuccess: (_data, vars) => {
      toast.success("Equipas geradas com sucesso");
      void qc.invalidateQueries({ queryKey: teamKeys.bySession(vars.sessionId) });
    },
  });
}

export function useTeamsBySession(sessionId: string | undefined) {
  return useQuery({
    queryKey: teamKeys.bySession(sessionId ?? ""),
    queryFn: () => teamsService.listTeamsBySession(sessionId!),
    enabled: Boolean(sessionId),
  });
}

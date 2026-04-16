import type { MatchReportStatus, UpsertMatchReportPayload } from "@/api/api-response";
import { MATCH_REPORT_STATUS } from "@/api/api-response";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as matchReportsService from "@/services/match-reports.service";

export const matchReportKeys = {
  bySession: (sessionId: string) => ["match-reports", "session", sessionId] as const,
};

export function canEditMatchReport(status: MatchReportStatus | undefined, roles: string[]): boolean {
  return status !== MATCH_REPORT_STATUS.Finalized || roles.includes("Admin");
}

export function useMatchReport(sessionId: string | undefined) {
  return useQuery({
    queryKey: matchReportKeys.bySession(sessionId ?? ""),
    queryFn: () =>
      matchReportsService.getMatchReportBySession(sessionId!, {
        skipErrorToast: true,
      }),
    enabled: Boolean(sessionId),
    retry: false,
  });
}

export function useUpsertMatchReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: string; payload: UpsertMatchReportPayload }) =>
      matchReportsService.upsertMatchReport(sessionId, payload),
    onSuccess: (_data, vars) => {
      toast.success("Súmula salva com sucesso");
      void qc.invalidateQueries({ queryKey: matchReportKeys.bySession(vars.sessionId) });
    },
  });
}

export function useFinalizeMatchReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => matchReportsService.finalizeMatchReport(sessionId),
    onSuccess: (_data, sessionId) => {
      toast.success("Súmula finalizada");
      void qc.invalidateQueries({ queryKey: matchReportKeys.bySession(sessionId) });
    },
  });
}
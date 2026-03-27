import * as checkinsService from "@/services/checkins.service";
import type { CreateCheckInPayload } from "@/api/api-response";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const checkInKeys = {
  session: (sessionId: string) => ["checkins", "session", sessionId] as const,
};

export function useCreateCheckInSession() {
  return useMutation({
    mutationFn: () => checkinsService.createSession(),
    onSuccess: () => {
      toast.success("Sessão de check-in aberta");
    },
  });
}

export function useCreateCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCheckInPayload) => checkinsService.createCheckIn(payload),
    onSuccess: (_data, vars) => {
      toast.success("Check-in registado com sucesso");
      void qc.invalidateQueries({ queryKey: checkInKeys.session(vars.sessionId) });
    },
  });
}

export function useSessionCheckIns(sessionId: string | undefined) {
  return useQuery({
    queryKey: checkInKeys.session(sessionId ?? ""),
    queryFn: () => checkinsService.listSessionCheckIns(sessionId!),
    enabled: Boolean(sessionId),
  });
}

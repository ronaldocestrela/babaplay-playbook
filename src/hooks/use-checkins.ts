import * as checkinsService from "@/services/checkins.service";
import type { CreateCheckInPayload } from "@/api/api-response";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type CreateCheckInWithOwnershipPayload = CreateCheckInPayload & {
  currentUserId: string | null;
  associateOwnerUserId: string | null;
};

export function canCreateOwnCheckIn(
  currentUserId: string | null,
  associateOwnerUserId: string | null,
): boolean {
  if (!currentUserId || !associateOwnerUserId) return false;
  return currentUserId === associateOwnerUserId;
}

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
    mutationFn: ({
      sessionId,
      associateId,
      currentUserId,
      associateOwnerUserId,
    }: CreateCheckInWithOwnershipPayload) => {
      if (!canCreateOwnCheckIn(currentUserId, associateOwnerUserId)) {
        throw new Error("Nao autorizado: voce so pode fazer check-in para si.");
      }

      return checkinsService.createCheckIn({ sessionId, associateId });
    },
    onSuccess: (_data, vars) => {
      toast.success("Check-in registado com sucesso");
      void qc.invalidateQueries({ queryKey: checkInKeys.session(vars.sessionId) });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel registrar o check-in.";
      toast.error(message);
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

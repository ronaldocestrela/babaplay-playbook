import * as membershipsService from "@/services/memberships.service";
import type { CreateMembershipPayload, MembershipPaymentPayload } from "@/api/api-response";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const membershipKeys = {
  byAssociate: (associateId: string) => ["memberships", "associate", associateId] as const,
};

export function useMembershipsByAssociate(associateId: string | undefined) {
  return useQuery({
    queryKey: membershipKeys.byAssociate(associateId ?? ""),
    queryFn: () => membershipsService.listMembershipsByAssociate(associateId!),
    enabled: Boolean(associateId),
  });
}

export function useCreateMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMembershipPayload) =>
      membershipsService.createMembership(payload),
    onSuccess: (_data, vars) => {
      toast.success("Mensalidade criada com sucesso");
      void qc.invalidateQueries({ queryKey: membershipKeys.byAssociate(vars.associateId) });
    },
  });
}

export function useAddMembershipPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      membershipId,
      payload,
      associateId,
    }: {
      membershipId: string;
      payload: MembershipPaymentPayload;
      associateId: string;
    }) => membershipsService.addMembershipPayment(membershipId, payload),
    onSuccess: (_data, vars) => {
      toast.success("Pagamento registado com sucesso");
      void qc.invalidateQueries({ queryKey: membershipKeys.byAssociate(vars.associateId) });
    },
  });
}

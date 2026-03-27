import * as plansService from "@/services/plans.service";
import type { CreatePlanPayload } from "@/api/api-response";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const planKeys = {
  all: ["plans"] as const,
  detail: (id: string) => ["plans", id] as const,
};

export function usePlans() {
  return useQuery({
    queryKey: planKeys.all,
    queryFn: plansService.listPlans,
  });
}

export function usePlan(id: string | undefined) {
  return useQuery({
    queryKey: planKeys.detail(id ?? ""),
    queryFn: () => plansService.getPlan(id!),
    enabled: Boolean(id),
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlanPayload) => plansService.createPlan(payload),
    onSuccess: () => {
      toast.success("Plano criado com sucesso");
      void qc.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreatePlanPayload }) =>
      plansService.updatePlan(id, payload),
    onSuccess: (_data, vars) => {
      toast.success("Plano atualizado com sucesso");
      void qc.invalidateQueries({ queryKey: planKeys.all });
      void qc.invalidateQueries({ queryKey: planKeys.detail(vars.id) });
    },
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plansService.deletePlan(id),
    onSuccess: () => {
      toast.success("Plano removido com sucesso");
      void qc.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}

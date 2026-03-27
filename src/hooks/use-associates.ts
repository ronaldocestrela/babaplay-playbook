import * as associatesService from "@/services/associates.service";
import type {
  CreateAssociatePayload,
  UpdateAssociateActivePayload,
  UpdateAssociatePayload,
} from "@/api/api-response";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const associateKeys = {
  all: ["associates"] as const,
  detail: (id: string) => ["associates", id] as const,
};

export function useAssociates() {
  return useQuery({
    queryKey: associateKeys.all,
    queryFn: associatesService.listAssociates,
  });
}

export function useAssociate(id: string | undefined) {
  return useQuery({
    queryKey: associateKeys.detail(id ?? ""),
    queryFn: () => associatesService.getAssociate(id!),
    enabled: Boolean(id),
  });
}

export function useCreateAssociate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssociatePayload) => associatesService.createAssociate(payload),
    onSuccess: () => {
      toast.success("Associado criado com sucesso");
      void qc.invalidateQueries({ queryKey: associateKeys.all });
    },
  });
}

export function useUpdateAssociate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAssociatePayload }) =>
      associatesService.updateAssociate(id, payload),
    onSuccess: (_data, vars) => {
      toast.success("Associado atualizado com sucesso");
      void qc.invalidateQueries({ queryKey: associateKeys.all });
      void qc.invalidateQueries({ queryKey: associateKeys.detail(vars.id) });
    },
  });
}

export function useSetAssociateActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAssociateActivePayload }) =>
      associatesService.setAssociateActive(id, payload),
    onSuccess: (_data, vars) => {
      toast.success(vars.payload.isActive ? "Associado ativado" : "Associado desativado");
      void qc.invalidateQueries({ queryKey: associateKeys.all });
      void qc.invalidateQueries({ queryKey: associateKeys.detail(vars.id) });
    },
  });
}

import * as associationsService from "@/services/associations.service";
import type { UpsertAssociationPayload } from "@/api/api-response";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const associationKeys = {
  all: ["associations"] as const,
  detail: (id: string) => ["associations", id] as const,
};

export function useAssociations() {
  return useQuery({
    queryKey: associationKeys.all,
    queryFn: associationsService.listAssociations,
  });
}

export function useAssociation(id: string | undefined) {
  return useQuery({
    queryKey: associationKeys.detail(id ?? ""),
    queryFn: () => associationsService.getAssociation(id!),
    enabled: Boolean(id),
  });
}

export function useUpsertAssociation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertAssociationPayload) =>
      associationsService.upsertAssociation(payload),
    onSuccess: () => {
      toast.success("Associação guardada com sucesso");
      void qc.invalidateQueries({ queryKey: associationKeys.all });
    },
  });
}

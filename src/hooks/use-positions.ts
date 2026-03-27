import * as positionsService from "@/services/positions.service";
import type { CreatePositionPayload, UpdatePositionPayload } from "@/api/api-response";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const positionKeys = {
  all: ["positions"] as const,
  detail: (id: string) => ["positions", id] as const,
};

export function usePositions() {
  return useQuery({
    queryKey: positionKeys.all,
    queryFn: positionsService.listPositions,
  });
}

export function usePosition(id: string | undefined) {
  return useQuery({
    queryKey: positionKeys.detail(id ?? ""),
    queryFn: () => positionsService.getPosition(id!),
    enabled: Boolean(id),
  });
}

export function useCreatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePositionPayload) => positionsService.createPosition(payload),
    onSuccess: () => {
      toast.success("Posição criada com sucesso");
      void qc.invalidateQueries({ queryKey: positionKeys.all });
    },
  });
}

export function useUpdatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePositionPayload }) =>
      positionsService.updatePosition(id, payload),
    onSuccess: (_data, vars) => {
      toast.success("Posição atualizada com sucesso");
      void qc.invalidateQueries({ queryKey: positionKeys.all });
      void qc.invalidateQueries({ queryKey: positionKeys.detail(vars.id) });
    },
  });
}

export function useDeletePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => positionsService.deletePosition(id),
    onSuccess: () => {
      toast.success("Posição removida com sucesso");
      void qc.invalidateQueries({ queryKey: positionKeys.all });
    },
  });
}

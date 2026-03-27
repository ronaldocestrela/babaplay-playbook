import * as positionsService from "@/services/positions.service";
import type { CreatePositionPayload } from "@/api/api-response";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const positionKeys = {
  all: ["positions"] as const,
};

export function usePositions() {
  return useQuery({
    queryKey: positionKeys.all,
    queryFn: positionsService.listPositions,
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

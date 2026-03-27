import * as cashEntriesService from "@/services/cash-entries.service";
import type { CreateCashEntryPayload } from "@/api/api-response";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const cashEntryKeys = {
  all: ["cashEntries"] as const,
};

export function useCashEntries() {
  return useQuery({
    queryKey: cashEntryKeys.all,
    queryFn: cashEntriesService.listCashEntries,
  });
}

export function useCreateCashEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCashEntryPayload) =>
      cashEntriesService.createCashEntry(payload),
    onSuccess: () => {
      toast.success("Movimento de caixa registado");
      void qc.invalidateQueries({ queryKey: cashEntryKeys.all });
    },
  });
}

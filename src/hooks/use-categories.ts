import * as categoriesService from "@/services/categories.service";
import type { CreateCategoryPayload } from "@/api/api-response";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cashEntryKeys } from "@/hooks/use-cash-entries";

export const categoryKeys = {
  all: ["categories"] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: categoriesService.listCategories,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoriesService.createCategory(payload),
    onSuccess: () => {
      toast.success("Categoria criada com sucesso");
      void qc.invalidateQueries({ queryKey: categoryKeys.all });
      void qc.invalidateQueries({ queryKey: cashEntryKeys.all });
    },
  });
}

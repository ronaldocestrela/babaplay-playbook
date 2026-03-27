import * as rolesService from "@/services/roles.service";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const roleKeys = {
  all: ["roles"] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.all,
    queryFn: rolesService.listRoles,
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      rolesService.assignRole(userId, roleName),
    onSuccess: () => {
      toast.success("Role atribuída com sucesso");
      void qc.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

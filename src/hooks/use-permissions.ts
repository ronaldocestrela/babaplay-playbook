import * as permissionsService from "@/services/permissions.service";
import { useQuery } from "@tanstack/react-query";

export const permissionKeys = {
  all: ["permissions"] as const,
};

export function usePermissions() {
  return useQuery({
    queryKey: permissionKeys.all,
    queryFn: permissionsService.listPermissions,
  });
}

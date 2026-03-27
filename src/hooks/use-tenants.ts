import * as tenantsService from "@/services/tenants.service";
import type { CreateTenantPayload, SubscriptionPayload } from "@/api/api-response";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const tenantKeys = {
  all: ["tenants"] as const,
  detail: (id: string) => ["tenants", id] as const,
};

export function useTenants() {
  return useQuery({
    queryKey: tenantKeys.all,
    queryFn: tenantsService.listTenants,
  });
}

export function useTenant(id: string | undefined) {
  return useQuery({
    queryKey: tenantKeys.detail(id ?? ""),
    queryFn: () => tenantsService.getTenant(id!),
    enabled: Boolean(id),
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTenantPayload) => tenantsService.createTenant(payload),
    onSuccess: () => {
      toast.success("Tenant criado com sucesso");
      void qc.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateTenantPayload }) =>
      tenantsService.updateTenant(id, payload),
    onSuccess: (_data, vars) => {
      toast.success("Tenant atualizado com sucesso");
      void qc.invalidateQueries({ queryKey: tenantKeys.all });
      void qc.invalidateQueries({ queryKey: tenantKeys.detail(vars.id) });
    },
  });
}

export function useDeleteTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tenantsService.deleteTenant(id),
    onSuccess: () => {
      toast.success("Tenant removido com sucesso");
      void qc.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      tenantId,
      payload,
    }: {
      tenantId: string;
      payload: SubscriptionPayload;
    }) => tenantsService.createSubscription(tenantId, payload),
    onSuccess: (_data, vars) => {
      toast.success("Subscrição criada com sucesso");
      void qc.invalidateQueries({ queryKey: tenantKeys.detail(vars.tenantId) });
      void qc.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

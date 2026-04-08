import { useAuth } from "@/contexts/auth-context";
import type { LoginPayload, RegisterPayload, RegisterWithInvitationPayload } from "@/api/api-response";
import { toast } from "@/components/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export function useLogin() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: () => {
      toast.success("Login efetuado com sucesso");
    },
  });
}

/**
 * Registo via `POST /api/auth/register`.
 * Respostas 400 (validação, Identity, sincronização com Associate) são tratadas pelo interceptor em
 * `axios-instance.ts`: extrai `error` / `errors[]` do envelope e mostra `toast.error`.
 */
export function useRegister() {
  const { register } = useAuth();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: () => {
      toast.success("Conta criada com sucesso");
    },
  });
}

/**
 * Registo via `POST /api/auth/register-with-invitation` (convite de associado).
 * Requer `X-Tenant-Subdomain` (ex.: query `?tenant=` no link do convite).
 */
export function useRegisterWithInvitation() {
  const { registerWithInvitation } = useAuth();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: RegisterWithInvitationPayload) => registerWithInvitation(payload),
    onSuccess: () => {
      toast.success("Conta criada com sucesso");
      void navigate("/dashboard");
    },
  });
}
